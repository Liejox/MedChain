import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(), // Traditional username for login
  email: text("email").unique(), // Email for registration
  passwordHash: text("password_hash"), // Hashed password for traditional auth
  didIdentifier: text("did_identifier").notNull().unique(), // Primary DID for auth
  role: text("role").notNull().default("patient"), // patient, doctor, admin
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
  publicKey: text("public_key").notNull(), // Ed25519 public key
  didDocument: json("did_document").notNull(), // Complete DID Document
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  medicalHistory: json("medical_history"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  hospitalAffiliation: text("hospital_affiliation"),
  yearsOfExperience: integer("years_of_experience"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DID Profiles for enhanced DID management
export const didProfiles = pgTable("did_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  didIdentifier: text("did_identifier").notNull().unique(),
  method: text("method").notNull().default("example"), // did method
  didDocument: json("did_document").notNull(),
  publicKey: text("public_key").notNull(),
  privateKeyEncrypted: text("private_key_encrypted"), // Mock encrypted private key
  metadata: json("metadata"), // Additional DID metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verifiableCredentials = pgTable("verifiable_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issuerDid: text("issuer_did").notNull(), // DID of issuer (doctor)
  subjectDid: text("subject_did").notNull(), // DID of subject (patient)
  credentialType: text("credential_type").notNull(), // HealthCheckupCredential, BloodTestCredential, VaccinationCredential, AppointmentCredential
  vcData: json("vc_data").notNull(), // Complete W3C VC JSON-LD
  proofSignature: text("proof_signature").notNull(), // Mock cryptographic proof
  issuanceDate: timestamp("issuance_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  isRevoked: boolean("is_revoked").default(false),
  status: text("status").notNull().default("active"), // active, revoked, expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  notifications: many(notifications),
  didProfile: one(didProfiles, {
    fields: [users.didIdentifier],
    references: [didProfiles.didIdentifier],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  receivedCredentials: many(verifiableCredentials, {
    relationName: "patientCredentials",
  }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  issuedCredentials: many(verifiableCredentials, {
    relationName: "doctorCredentials",
  }),
}));

export const didProfilesRelations = relations(didProfiles, ({ one }) => ({
  user: one(users, {
    fields: [didProfiles.didIdentifier],
    references: [users.didIdentifier],
  }),
}));

export const verifiableCredentialsRelations = relations(verifiableCredentials, ({ one }) => ({
  issuer: one(doctors, {
    fields: [verifiableCredentials.issuerDid],
    references: [doctors.id],
    relationName: "doctorCredentials",
  }),
  subject: one(patients, {
    fields: [verifiableCredentials.subjectDid],
    references: [patients.id],
    relationName: "patientCredentials",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDidProfileSchema = createInsertSchema(didProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerifiableCredentialSchema = createInsertSchema(verifiableCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type DidProfile = typeof didProfiles.$inferSelect;
export type InsertDidProfile = z.infer<typeof insertDidProfileSchema>;
export type VerifiableCredential = typeof verifiableCredentials.$inferSelect;
export type InsertVerifiableCredential = z.infer<typeof insertVerifiableCredentialSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// W3C VC Standard Types
export interface W3CVerifiableCredential {
  "@context": string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
  expirationDate?: string;
}

// Healthcare VC Types
export type HealthcareCredentialType = 
  | "HealthCheckupCredential"
  | "BloodTestCredential" 
  | "VaccinationCredential"
  | "AppointmentCredential";
