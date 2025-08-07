import { W3CVerifiableCredential, HealthcareCredentialType } from "@shared/schema";

// Mock DID generator
export function generateDID(type: 'patient' | 'doctor', name: string): string {
  const identifier = name.toLowerCase().replace(/\s+/g, '');
  const randomId = Math.random().toString(36).substr(2, 6);
  return `did:example:${type}${identifier}${randomId}`;
}

// Mock key pair generation
export function generateKeyPair() {
  const privateKey = `ed25519:${Math.random().toString(36).substr(2, 32)}`;
  const publicKey = `ed25519:${Math.random().toString(36).substr(2, 32)}`;
  return { privateKey, publicKey };
}

// Generate DID Document
export function createDIDDocument(did: string, publicKey: string) {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": did,
    "verificationMethod": [{
      "id": `${did}#key-1`,
      "type": "Ed25519VerificationKey2020",
      "controller": did,
      "publicKeyBase58": publicKey
    }],
    "authentication": [`${did}#key-1`],
    "assertionMethod": [`${did}#key-1`],
    "service": [{
      "id": `${did}#healthcare-service`,
      "type": "HealthcareService",
      "serviceEndpoint": "https://healthcare.example.com"
    }]
  };
}

// Create healthcare VC based on type
export function createHealthcareVC(
  issuerDid: string,
  subjectDid: string,
  type: HealthcareCredentialType,
  data: any
): W3CVerifiableCredential {
  const now = new Date().toISOString();
  
  const baseVC: W3CVerifiableCredential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", type],
    "issuer": issuerDid,
    "issuanceDate": now,
    "credentialSubject": {
      "id": subjectDid,
      ...data
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": now,
      "verificationMethod": `${issuerDid}#key-1`,
      "proofPurpose": "assertionMethod",
      "jws": generateMockSignature()
    }
  };

  // Add expiration for certain types
  if (type === "VaccinationCredential") {
    const expiration = new Date();
    expiration.setFullYear(expiration.getFullYear() + 5);
    baseVC.expirationDate = expiration.toISOString();
  }

  return baseVC;
}

// Mock signature generation
function generateMockSignature(): string {
  return `eyJ${Math.random().toString(36).substr(2, 40)}...mockSignature...${Math.random().toString(36).substr(2, 20)}`;
}

// Sample healthcare data generators
export const sampleHealthcareData = {
  HealthCheckupCredential: (patientName: string) => ({
    patientName,
    checkupDate: new Date().toISOString().split('T')[0],
    bloodPressure: "120/80 mmHg",
    heartRate: "72 bpm",
    weight: "70 kg",
    height: "175 cm",
    summary: "Normal vital signs. Patient is in good health.",
    recommendations: ["Continue regular exercise", "Maintain balanced diet"]
  }),
  
  BloodTestCredential: (patientName: string) => ({
    patientName,
    testDate: new Date().toISOString().split('T')[0],
    testType: "Complete Blood Count",
    results: {
      hemoglobin: "14.5 g/dL",
      whiteBloodCells: "6800/μL",
      platelets: "250,000/μL",
      glucose: "95 mg/dL"
    },
    status: "Normal",
    labTechnician: "Lab Tech ID: LT-123"
  }),
  
  VaccinationCredential: (patientName: string) => ({
    patientName,
    vaccineName: "COVID-19 mRNA Vaccine",
    manufacturer: "Pfizer-BioNTech",
    batchNumber: "ABC123",
    vaccinationDate: new Date().toISOString().split('T')[0],
    doseNumber: 1,
    nextDueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    administeredBy: "Dr. Jane Smith",
    location: "City Health Center"
  }),
  
  AppointmentCredential: (patientName: string) => ({
    patientName,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    appointmentType: "Follow-up Consultation",
    duration: "30 minutes",
    location: "Medical Center, Room 205",
    purpose: "Review recent test results and discuss treatment plan",
    instructions: "Please bring previous medical records"
  })
};

// Verify VC signature (mock implementation)
export function verifyVCSignature(vc: W3CVerifiableCredential): boolean {
  // Mock verification - in real implementation, this would verify the cryptographic signature
  return vc.proof && vc.proof.jws && vc.proof.jws.includes('mockSignature');
}

// Check if VC is expired
export function isVCExpired(vc: W3CVerifiableCredential): boolean {
  if (!vc.expirationDate) return false;
  return new Date(vc.expirationDate) < new Date();
}