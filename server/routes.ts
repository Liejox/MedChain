import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertPatientSchema, insertDoctorSchema, insertAppointmentSchema, insertDocumentSchema, insertCredentialSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads/documents";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // Helper function to send notifications
  const sendNotification = async (userId: string, notification: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
    
    // Also save to database
    await storage.createNotification({
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      metadata: notification.metadata,
    });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        didIdentifier: `did:medchain:${Date.now()}`, // Mock DID
      });

      // Create role-specific profile
      if (userData.role === 'patient') {
        await storage.createPatient({ userId: user.id });
      } else if (userData.role === 'doctor') {
        await storage.createDoctor({
          userId: user.id,
          specialty: req.body.specialty || 'General Medicine',
          licenseNumber: req.body.licenseNumber || `LIC${Date.now()}`,
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/did-login', async (req, res) => {
    try {
      const { didIdentifier } = req.body;
      
      const user = await storage.getUserByUsername(didIdentifier) || await storage.getUserByEmail(didIdentifier);
      if (!user) {
        return res.status(401).json({ error: 'DID not found' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Protected routes
  app.get('/api/me', authenticateToken, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  app.get('/api/dashboard/stats', authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Appointment routes
  app.get('/api/appointments', authenticateToken, async (req: any, res) => {
    try {
      let appointments: any[] = [];
      if (req.user.role === 'patient') {
        const patient = await storage.getPatientByUserId(req.user.id);
        appointments = patient ? await storage.getAppointmentsByPatient(patient.id) : [];
      } else if (req.user.role === 'doctor') {
        const doctor = await storage.getDoctorByUserId(req.user.id);
        appointments = doctor ? await storage.getAppointmentsByDoctor(doctor.id) : [];
      } else {
        appointments = [];
      }
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/appointments', authenticateToken, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send notification to doctor
      await sendNotification(appointmentData.doctorId, {
        title: 'New Appointment',
        message: 'You have a new appointment scheduled',
        type: 'info',
        metadata: { appointmentId: appointment.id }
      });

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Document routes
  app.get('/api/documents', authenticateToken, async (req: any, res) => {
    try {
      let documents: any[] = [];
      if (req.user.role === 'patient') {
        const patient = await storage.getPatientByUserId(req.user.id);
        documents = patient ? await storage.getDocumentsByPatient(patient.id) : [];
      } else if (req.user.role === 'doctor') {
        const doctor = await storage.getDoctorByUserId(req.user.id);
        documents = doctor ? await storage.getDocumentsByDoctor(doctor.id) : [];
      } else {
        documents = [];
      }
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/documents', authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const documentData = {
        ...req.body,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };

      const document = await storage.createDocument(documentData);
      
      // Send notification
      await sendNotification(req.body.patientId, {
        title: 'New Document',
        message: 'A new medical document has been added to your records',
        type: 'info',
        metadata: { documentId: document.id }
      });

      res.json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Credential routes
  app.get('/api/credentials', authenticateToken, async (req: any, res) => {
    try {
      let credentials: any[] = [];
      if (req.user.role === 'patient') {
        const patient = await storage.getPatientByUserId(req.user.id);
        credentials = patient ? await storage.getCredentialsByPatient(patient.id) : [];
      } else if (req.user.role === 'doctor') {
        const doctor = await storage.getDoctorByUserId(req.user.id);
        credentials = doctor ? await storage.getCredentialsByDoctor(doctor.id) : [];
      } else {
        credentials = [];
      }
      res.json(credentials);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/credentials', authenticateToken, async (req: any, res) => {
    try {
      const credentialData = insertCredentialSchema.parse(req.body);
      
      // Generate mock VC hash
      const vcHash = `vc:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
      
      const credential = await storage.createCredential({
        ...credentialData,
        vcHash,
      });
      
      // Send notification to patient
      await sendNotification(credentialData.holderId, {
        title: 'New Credential Issued',
        message: `You have received a new ${credentialData.type} credential`,
        type: 'success',
        metadata: { credentialId: credential.id }
      });

      res.json(credential);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Notification routes
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Doctors list for appointments
  app.get('/api/doctors', authenticateToken, async (req: any, res) => {
    try {
      const doctors = await storage.getApprovedDoctors();
      res.json(doctors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
