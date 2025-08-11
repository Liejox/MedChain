# MedChain - Decentralized Healthcare Platform

## Overview

MedChain is a full-stack decentralized healthcare web application that leverages Decentralized Identity (DID) and Verifiable Credentials (VCs) to create a secure, streamlined platform for healthcare document management and patient care coordination. The application features a **DID-first authentication system** with Google OAuth and traditional login as fallback methods. It supports patient and doctor roles with comprehensive credential management, featuring pre-loaded sample data for John Doe (did:example:patient123) including medical history, appointments, prescriptions, and verifiable credentials.

## Recent Changes (January 2025)

- **DID-First Authentication System**: Primary authentication via DID identifiers with wallet connection simulation
- **Google OAuth Fallback**: Secondary authentication method with proper OAuth flow setup
- **Traditional Login Fallback**: Username/password authentication as tertiary option
- **Comprehensive Sample Data**: Pre-loaded John Doe with 6 detailed medical credentials (checkups, blood tests, prescriptions, appointments, vaccinations)
- **Enhanced DID Profile Management**: Complete DID document viewing, key management, and identity verification
- **Improved Glassmorphism UI**: Modern healthcare-themed design with enhanced user experience

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based page access
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface elements
- **Styling**: Tailwind CSS with custom healthcare-themed color palette and glassmorphism design system
- **State Management**: TanStack React Query for server state management and custom React hooks for local state
- **Real-time Communication**: WebSocket integration for live notifications and updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based authentication middleware
- **File Upload**: Multer middleware for handling medical document uploads with type validation and size limits
- **Real-time Features**: WebSocket server for push notifications and live updates
- **Authentication**: JWT-based authentication with support for traditional login and DID-based authentication

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database provider
- **Schema Design**: 
  - Users table with role-based access (patient, doctor, admin)
  - Role-specific tables (patients, doctors) with detailed profiles
  - Medical documents with access control and sharing permissions
  - Appointments with scheduling and status management
  - Verifiable credentials with issuer/holder relationships
  - Notifications system for real-time updates

### Authentication & Authorization
- **DID-First Authentication**: Primary login using Decentralized Identity (DID) identifiers with simulated wallet connection
- **Google OAuth Fallback**: Secondary authentication via Google OAuth2 for users preferring traditional social login
- **Traditional Auth Fallback**: Tertiary username/password authentication with bcrypt hashing and JWT tokens
- **DID Integration**: Complete Decentralized Identity system with DID document generation, key management, and credential verification
- **Role-Based Access**: Two-tier permission system (patient/doctor) with route protection
- **Session Management**: JWT tokens with middleware-based verification across all authentication methods

### File Management
- **Upload Handling**: Secure file upload with type validation (images, PDFs, documents)
- **Storage**: Local file system storage with organized directory structure
- **Access Control**: Permission-based document sharing with privacy levels

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database client
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Node.js web application framework
- **jsonwebtoken**: JWT implementation for authentication
- **bcrypt**: Password hashing library
- **multer**: File upload middleware
- **ws**: WebSocket library for real-time communication

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight React router
- **react-hook-form**: Form validation and management
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and schema management tools

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment with integrated deployment
- **WebSocket Server**: Real-time communication infrastructure for notifications