import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, insertPatientSchema, insertDoctorSchema, 
  insertVerifiableCredentialSchema, insertDidProfileSchema, 
  type HealthcareCredentialType, type W3CVerifiableCredential 
} from "@shared/schema";
import jwt from "jsonwebtoken";
import { createHealthcareVC, sampleHealthcareData, verifyVCSignature, isVCExpired } from "./did-utils";

const JWT_SECRET = process.env.JWT_SECRET || "did-healthcare-secret-key";

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

// WebSocket notification helper
let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();

async function sendNotification(userId: string, notification: any) {
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
    metadata: notification.metadata
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      clients.set(userId, ws);
      console.log(`WebSocket client connected for user: ${userId}`);
    }

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`WebSocket client disconnected for user: ${userId}`);
      }
    });
  });

  // DID Authentication Routes
  app.post('/api/auth/did-register', async (req, res) => {
    try {
      const { name, email, role, specialty, licenseNumber } = req.body;
      
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' });
      }

      let result;
      if (role === 'patient') {
        result = await storage.registerPatientWithDID(name, email);
      } else if (role === 'doctor') {
        if (!specialty || !licenseNumber) {
          return res.status(400).json({ error: 'Specialty and license number required for doctors' });
        }
        result = await storage.registerDoctorWithDID(name, email, specialty, licenseNumber);
      } else {
        return res.status(400).json({ error: 'Invalid role. Must be patient or doctor' });
      }

      const token = jwt.sign({ userId: result.user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'DID registration successful',
        user: result.user,
        didIdentifier: result.user.didIdentifier,
        token,
        didDocument: result.didProfile.didDocument
      });
    } catch (error: any) {
      console.error('DID registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/did-login', async (req, res) => {
    try {
      const { didIdentifier } = req.body;
      
      if (!didIdentifier) {
        return res.status(400).json({ error: 'DID identifier is required' });
      }

      const user = await storage.getUserByDID(didIdentifier);
      if (!user) {
        return res.status(401).json({ error: 'DID not found. Please register first.' });
      }

      const didProfile = await storage.getDidProfile(didIdentifier);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'DID authentication successful',
        user,
        token,
        didDocument: didProfile?.didDocument
      });
    } catch (error: any) {
      console.error('DID login error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Protected routes
  app.get('/api/me', authenticateToken, async (req: any, res) => {
    const didProfile = await storage.getDidProfile(req.user.didIdentifier);
    res.json({ 
      ...req.user, 
      didDocument: didProfile?.didDocument 
    });
  });

  app.get('/api/dashboard/stats', authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verifiable Credential Routes
  app.get('/api/credentials', authenticateToken, async (req: any, res) => {
    try {
      let credentials: any[] = [];
      if (req.user.role === 'patient') {
        credentials = await storage.getCredentialsBySubjectDID(req.user.didIdentifier);
      } else if (req.user.role === 'doctor') {
        credentials = await storage.getCredentialsByIssuerDID(req.user.didIdentifier);
      }
      res.json(credentials);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/credentials/issue', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: 'Only doctors can issue credentials' });
      }

      const { patientDid, credentialType, customData } = req.body;

      if (!patientDid || !credentialType) {
        return res.status(400).json({ error: 'Patient DID and credential type are required' });
      }

      // Validate credential type
      const validTypes: HealthcareCredentialType[] = [
        'HealthCheckupCredential',
        'BloodTestCredential',
        'VaccinationCredential',
        'AppointmentCredential'
      ];

      if (!validTypes.includes(credentialType)) {
        return res.status(400).json({ error: 'Invalid credential type' });
      }

      // Get patient info for credential
      const patient = await storage.getPatientByDID(patientDid);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const patientUser = await storage.getUserByDID(patientDid);
      const patientName = `${patientUser?.firstName} ${patientUser?.lastName}`;

      // Generate healthcare data
      const healthcareData = customData || sampleHealthcareData[credentialType](patientName);

      // Create W3C VC
      const vcData = createHealthcareVC(
        req.user.didIdentifier,
        patientDid,
        credentialType,
        healthcareData
      );

      // Store in database
      const credential = await storage.createVerifiableCredential({
        issuerDid: req.user.didIdentifier,
        subjectDid: patientDid,
        credentialType,
        vcData,
        proofSignature: vcData.proof.jws,
        issuanceDate: new Date(vcData.issuanceDate),
        expirationDate: vcData.expirationDate ? new Date(vcData.expirationDate) : undefined
      });

      // Send notification to patient
      if (patientUser) {
        await sendNotification(patientUser.id, {
          title: 'New Credential Issued',
          message: `You have received a new ${credentialType.replace('Credential', '')} credential`,
          type: 'success',
          metadata: { credentialId: credential.id, credentialType }
        });
      }

      res.json({
        message: 'Credential issued successfully',
        credential,
        vcData
      });
    } catch (error: any) {
      console.error('Credential issuance error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/credentials/verify', async (req, res) => {
    try {
      const { vcData } = req.body;

      if (!vcData) {
        return res.status(400).json({ error: 'VC data is required' });
      }

      // Parse VC if it's a string
      let vc: W3CVerifiableCredential;
      try {
        vc = typeof vcData === 'string' ? JSON.parse(vcData) : vcData;
      } catch {
        return res.status(400).json({ error: 'Invalid VC JSON format' });
      }

      // Verify signature
      const isSignatureValid = verifyVCSignature(vc);
      
      // Check expiration
      const isExpired = isVCExpired(vc);
      
      // Check if credential exists in our database
      const credentials = await storage.getCredentialsBySubjectDID(vc.credentialSubject.id);
      const existsInDB = credentials.some(cred => 
        JSON.stringify(cred.vcData) === JSON.stringify(vc)
      );

      const verification = {
        isValid: isSignatureValid && !isExpired && existsInDB,
        signature: isSignatureValid ? 'valid' : 'invalid',
        expired: isExpired,
        existsInDatabase: existsInDB,
        issuer: vc.issuer,
        subject: vc.credentialSubject.id,
        issuanceDate: vc.issuanceDate,
        expirationDate: vc.expirationDate,
        credentialType: vc.type[1] || 'Unknown'
      };

      res.json({
        message: 'Credential verification completed',
        verification,
        vcData: vc
      });
    } catch (error: any) {
      console.error('Credential verification error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/credentials/:id', authenticateToken, async (req: any, res) => {
    try {
      const credential = await storage.getVerifiableCredential(req.params.id);
      
      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      // Check access - users can only view their own credentials
      const hasAccess = 
        credential.subjectDid === req.user.didIdentifier || 
        credential.issuerDid === req.user.didIdentifier ||
        req.user.role === 'admin';

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(credential);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/credentials/:id/revoke', authenticateToken, async (req: any, res) => {
    try {
      const credential = await storage.getVerifiableCredential(req.params.id);
      
      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      // Only issuer can revoke
      if (credential.issuerDid !== req.user.didIdentifier) {
        return res.status(403).json({ error: 'Only the issuer can revoke this credential' });
      }

      await storage.revokeCredential(req.params.id);

      res.json({ message: 'Credential revoked successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DID Profile Routes
  app.get('/api/did/profile/:did', async (req, res) => {
    try {
      const didProfile = await storage.getDidProfile(req.params.did);
      
      if (!didProfile) {
        return res.status(404).json({ error: 'DID profile not found' });
      }

      // Return public DID document
      res.json({
        didIdentifier: didProfile.didIdentifier,
        didDocument: didProfile.didDocument,
        method: didProfile.method,
        publicKey: didProfile.publicKey
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Demo data endpoint for testing
  app.get('/api/demo/sample-credentials', (req, res) => {
    const sampleVCs = {
      HealthCheckupCredential: sampleHealthcareData.HealthCheckupCredential("John Doe"),
      BloodTestCredential: sampleHealthcareData.BloodTestCredential("John Doe"),
      VaccinationCredential: sampleHealthcareData.VaccinationCredential("John Doe"),
      AppointmentCredential: sampleHealthcareData.AppointmentCredential("John Doe")
    };
    res.json(sampleVCs);
  });

  return httpServer;
}