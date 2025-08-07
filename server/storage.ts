import { 
  users, patients, doctors, verifiableCredentials, notifications, didProfiles,
  type User, type InsertUser, type Patient, type InsertPatient, 
  type Doctor, type InsertDoctor, type VerifiableCredential, type InsertVerifiableCredential,
  type Notification, type InsertNotification, type DidProfile, type InsertDidProfile,
  type HealthcareCredentialType, type W3CVerifiableCredential
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
import { generateDID, generateKeyPair, createDIDDocument, createHealthcareVC, sampleHealthcareData } from "./did-utils";

export interface IStorage {
  // DID User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByDID(didIdentifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // DID Profile operations
  getDidProfile(didIdentifier: string): Promise<DidProfile | undefined>;
  createDidProfile(profile: InsertDidProfile): Promise<DidProfile>;
  updateDidProfile(did: string, updates: Partial<DidProfile>): Promise<DidProfile>;

  // Patient operations
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  getPatientByDID(didIdentifier: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>): Promise<Patient>;

  // Doctor operations
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  getDoctorByDID(didIdentifier: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor>;
  getApprovedDoctors(): Promise<Doctor[]>;

  // Verifiable Credential operations
  getVerifiableCredential(id: string): Promise<VerifiableCredential | undefined>;
  getCredentialsBySubjectDID(subjectDid: string): Promise<VerifiableCredential[]>;
  getCredentialsByIssuerDID(issuerDid: string): Promise<VerifiableCredential[]>;
  createVerifiableCredential(credential: InsertVerifiableCredential): Promise<VerifiableCredential>;
  updateVerifiableCredential(id: string, updates: Partial<VerifiableCredential>): Promise<VerifiableCredential>;
  revokeCredential(id: string): Promise<void>;

  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(userId: string, role: string): Promise<any>;

  // DID Registration helpers
  registerPatientWithDID(name: string, email: string, medicalData?: any): Promise<{ user: User, patient: Patient, didProfile: DidProfile }>;
  registerDoctorWithDID(name: string, email: string, specialty: string, licenseNumber: string): Promise<{ user: User, doctor: Doctor, didProfile: DidProfile }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDID(didIdentifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.didIdentifier, didIdentifier));
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

  async getDidProfile(didIdentifier: string): Promise<DidProfile | undefined> {
    const [profile] = await db.select().from(didProfiles).where(eq(didProfiles.didIdentifier, didIdentifier));
    return profile || undefined;
  }

  async createDidProfile(insertProfile: InsertDidProfile): Promise<DidProfile> {
    const [profile] = await db.insert(didProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateDidProfile(did: string, updates: Partial<DidProfile>): Promise<DidProfile> {
    const [profile] = await db.update(didProfiles).set(updates).where(eq(didProfiles.didIdentifier, did)).returning();
    return profile;
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient || undefined;
  }

  async getPatientByDID(didIdentifier: string): Promise<Patient | undefined> {
    const user = await this.getUserByDID(didIdentifier);
    if (!user) return undefined;
    return await this.getPatientByUserId(user.id);
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

  async getDoctorByDID(didIdentifier: string): Promise<Doctor | undefined> {
    const user = await this.getUserByDID(didIdentifier);
    if (!user) return undefined;
    return await this.getDoctorByUserId(user.id);
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

  async getVerifiableCredential(id: string): Promise<VerifiableCredential | undefined> {
    const [credential] = await db.select().from(verifiableCredentials).where(eq(verifiableCredentials.id, id));
    return credential || undefined;
  }

  async getCredentialsBySubjectDID(subjectDid: string): Promise<VerifiableCredential[]> {
    return await db.select().from(verifiableCredentials)
      .where(eq(verifiableCredentials.subjectDid, subjectDid))
      .orderBy(desc(verifiableCredentials.issuanceDate));
  }

  async getCredentialsByIssuerDID(issuerDid: string): Promise<VerifiableCredential[]> {
    return await db.select().from(verifiableCredentials)
      .where(eq(verifiableCredentials.issuerDid, issuerDid))
      .orderBy(desc(verifiableCredentials.issuanceDate));
  }

  async createVerifiableCredential(insertCredential: InsertVerifiableCredential): Promise<VerifiableCredential> {
    const [credential] = await db.insert(verifiableCredentials).values(insertCredential).returning();
    return credential;
  }

  async updateVerifiableCredential(id: string, updates: Partial<VerifiableCredential>): Promise<VerifiableCredential> {
    const [credential] = await db.update(verifiableCredentials).set(updates).where(eq(verifiableCredentials.id, id)).returning();
    return credential;
  }

  async revokeCredential(id: string): Promise<void> {
    await db.update(verifiableCredentials)
      .set({ isRevoked: true, status: 'revoked' })
      .where(eq(verifiableCredentials.id, id));
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
    const user = await this.getUser(userId);
    if (!user) return {};

    if (role === 'patient') {
      const patient = await this.getPatientByUserId(userId);
      if (!patient) return {};

      const credentialCount = await db.select({ count: count() })
        .from(verifiableCredentials)
        .where(eq(verifiableCredentials.subjectDid, user.didIdentifier));

      return {
        totalCredentials: credentialCount[0]?.count || 0,
        didIdentifier: user.didIdentifier,
        verifiedCredentials: credentialCount[0]?.count || 0,
      };
    } else if (role === 'doctor') {
      const doctor = await this.getDoctorByUserId(userId);
      if (!doctor) return {};

      const issuedCount = await db.select({ count: count() })
        .from(verifiableCredentials)
        .where(eq(verifiableCredentials.issuerDid, user.didIdentifier));

      const patientCount = await db.select({ count: count() })
        .from(verifiableCredentials)
        .where(eq(verifiableCredentials.issuerDid, user.didIdentifier));

      return {
        credentialsIssued: issuedCount[0]?.count || 0,
        totalPatients: patientCount[0]?.count || 0,
        didIdentifier: user.didIdentifier,
      };
    } else if (role === 'admin') {
      const userCount = await db.select({ count: count() }).from(users);
      const credentialCount = await db.select({ count: count() }).from(verifiableCredentials);

      return {
        totalUsers: userCount[0]?.count || 0,
        totalCredentials: credentialCount[0]?.count || 0,
        activeCredentials: credentialCount[0]?.count || 0,
      };
    }

    return {};
  }

  async registerPatientWithDID(name: string, email: string, medicalData?: any): Promise<{ user: User, patient: Patient, didProfile: DidProfile }> {
    const { privateKey, publicKey } = generateKeyPair();
    const didIdentifier = generateDID('patient', name);
    const didDocument = createDIDDocument(didIdentifier, publicKey);

    // Create DID profile
    const didProfile = await this.createDidProfile({
      didIdentifier,
      method: 'example',
      didDocument,
      publicKey,
      privateKeyEncrypted: privateKey,
      metadata: { createdFor: 'patient', email }
    });

    // Create user with DID
    const user = await this.createUser({
      didIdentifier,
      role: 'patient',
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ')[1] || '',
      publicKey,
      didDocument,
      isVerified: true
    });

    // Create patient profile
    const patient = await this.createPatient({
      userId: user.id,
      medicalHistory: medicalData || {}
    });

    return { user, patient, didProfile };
  }

  async registerDoctorWithDID(name: string, email: string, specialty: string, licenseNumber: string): Promise<{ user: User, doctor: Doctor, didProfile: DidProfile }> {
    const { privateKey, publicKey } = generateKeyPair();
    const didIdentifier = generateDID('doctor', name);
    const didDocument = createDIDDocument(didIdentifier, publicKey);

    // Create DID profile
    const didProfile = await this.createDidProfile({
      didIdentifier,
      method: 'example',
      didDocument,
      publicKey,
      privateKeyEncrypted: privateKey,
      metadata: { createdFor: 'doctor', email, specialty, licenseNumber }
    });

    // Create user with DID
    const user = await this.createUser({
      didIdentifier,
      role: 'doctor',
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ')[1] || '',
      publicKey,
      didDocument,
      isVerified: true
    });

    // Create doctor profile
    const doctor = await this.createDoctor({
      userId: user.id,
      specialty,
      licenseNumber,
      isApproved: true
    });

    return { user, doctor, didProfile };
  }
}

export const storage = new DatabaseStorage();