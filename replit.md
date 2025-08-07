# MedChain - Decentralized Healthcare Platform

## Overview

MedChain is a full-stack decentralized healthcare web application that leverages Decentralized Identity (DID) and Verifiable Credentials (VCs) to create a secure, streamlined platform for healthcare document management and patient care coordination. The application supports three distinct user roles - patients, doctors, and administrators - each with tailored dashboards and functionality for managing medical records, scheduling appointments, and issuing/verifying medical credentials.

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
- **Traditional Auth**: Email/password with bcrypt hashing and JWT tokens
- **DID Integration**: Decentralized Identity authentication for enhanced security
- **Role-Based Access**: Three-tier permission system (patient/doctor/admin) with route protection
- **Session Management**: JWT tokens with middleware-based verification

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