import { 
  users, patients, doctors, appointments, documents, credentials, notifications,
  type User, type InsertUser, type Patient, type InsertPatient, 
  type Doctor, type InsertDoctor, type Appointment, type InsertAppointment,
  type Document, type InsertDocument, type Credential, type InsertCredential,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Patient operations
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>): Promise<Patient>;

  // Doctor operations
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor>;
  getApprovedDoctors(): Promise<Doctor[]>;

  // Appointment operations
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;

  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByPatient(patientId: string): Promise<Document[]>;
  getDocumentsByDoctor(doctorId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;

  // Credential operations
  getCredential(id: string): Promise<Credential | undefined>;
  getCredentialsByPatient(patientId: string): Promise<Credential[]>;
  getCredentialsByDoctor(doctorId: string): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  updateCredential(id: string, updates: Partial<Credential>): Promise<Credential>;

  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(userId: string, role: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const [patient] = await db.update(patients).set(updates).where(eq(patients.id, id)).returning();
    return patient;
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor || undefined;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(insertDoctor).returning();
    return doctor;
  }

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    const [doctor] = await db.update(doctors).set(updates).where(eq(doctors.id, id)).returning();
    return doctor;
  }

  async getApprovedDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors).where(eq(doctors.isApproved, true));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.scheduledAt));
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.doctorId, doctorId)).orderBy(desc(appointments.scheduledAt));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByPatient(patientId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.patientId, patientId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByDoctor(doctorId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.doctorId, doctorId)).orderBy(desc(documents.createdAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const [document] = await db.update(documents).set(updates).where(eq(documents.id, id)).returning();
    return document;
  }

  async getCredential(id: string): Promise<Credential | undefined> {
    const [credential] = await db.select().from(credentials).where(eq(credentials.id, id));
    return credential || undefined;
  }

  async getCredentialsByPatient(patientId: string): Promise<Credential[]> {
    return await db.select().from(credentials).where(eq(credentials.holderId, patientId)).orderBy(desc(credentials.issuedAt));
  }

  async getCredentialsByDoctor(doctorId: string): Promise<Credential[]> {
    return await db.select().from(credentials).where(eq(credentials.issuerId, doctorId)).orderBy(desc(credentials.issuedAt));
  }

  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const [credential] = await db.insert(credentials).values(insertCredential).returning();
    return credential;
  }

  async updateCredential(id: string, updates: Partial<Credential>): Promise<Credential> {
    const [credential] = await db.update(credentials).set(updates).where(eq(credentials.id, id)).returning();
    return credential;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async getDashboardStats(userId: string, role: string): Promise<any> {
    if (role === 'patient') {
      const patient = await this.getPatientByUserId(userId);
      if (!patient) return {};

      const appointmentCount = await db.select({ count: count() }).from(appointments).where(eq(appointments.patientId, patient.id));
      const documentCount = await db.select({ count: count() }).from(documents).where(eq(documents.patientId, patient.id));
      const credentialCount = await db.select({ count: count() }).from(credentials).where(eq(credentials.holderId, patient.id));

      return {
        totalAppointments: appointmentCount[0]?.count || 0,
        totalDocuments: documentCount[0]?.count || 0,
        totalCredentials: credentialCount[0]?.count || 0,
      };
    } else if (role === 'doctor') {
      const doctor = await this.getDoctorByUserId(userId);
      if (!doctor) return {};

      const patientCount = await db.select({ count: count() }).from(appointments).where(eq(appointments.doctorId, doctor.id));
      const appointmentCount = await db.select({ count: count() }).from(appointments).where(eq(appointments.doctorId, doctor.id));
      const credentialCount = await db.select({ count: count() }).from(credentials).where(eq(credentials.issuerId, doctor.id));

      return {
        totalPatients: patientCount[0]?.count || 0,
        totalAppointments: appointmentCount[0]?.count || 0,
        credentialsIssued: credentialCount[0]?.count || 0,
      };
    } else if (role === 'admin') {
      const userCount = await db.select({ count: count() }).from(users);
      const doctorCount = await db.select({ count: count() }).from(doctors);
      const patientCount = await db.select({ count: count() }).from(patients);

      return {
        totalUsers: userCount[0]?.count || 0,
        totalDoctors: doctorCount[0]?.count || 0,
        totalPatients: patientCount[0]?.count || 0,
      };
    }

    return {};
  }
}

export const storage = new DatabaseStorage();
