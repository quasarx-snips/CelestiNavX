# CelestiNav - Offline Survival Navigation System

## Overview

CelestiNav is an offline survival navigation system that combines solar positioning calculations with AI-powered weather analysis. The application helps users determine their location using celestial navigation when GPS is unavailable, while providing comprehensive weather analysis through smartphone camera-based sky observation. Built for emergency situations, it features secure authentication, offline data persistence, and multiple navigation methods including GPS fallback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom dark theme optimized for outdoor use
- **State Management**: React Query for server state management with offline capabilities
- **Mobile-First Design**: Responsive layout with touch-optimized controls and full-screen camera integration

### Backend Architecture
- **Framework**: Flask with Python for mathematical calculations and API endpoints
- **Database ORM**: SQLAlchemy for database operations with model definitions
- **Authentication**: Custom Replit Auth integration with JWT tokens and OAuth2 flow
- **Solar Calculations**: PySOLAR library for accurate celestial positioning with SciPy optimization
- **Session Management**: Server-side session storage with database persistence

### Core Features
- **Solar Navigation**: Calculate latitude/longitude from sun position using device orientation
- **GPS Integration**: Fallback positioning with high-accuracy GPS when available  
- **Camera-Based Weather Analysis**: Multi-directional sky photography for weather pattern recognition
- **Offline Data Persistence**: IndexedDB for client-side storage with backend synchronization
- **Emergency SOS System**: Quick access emergency protocols and signal broadcasting

### Database Schema
- **Users**: Authentication data with profile information and relationships
- **Measurements**: Solar calculation results with accuracy metrics and environmental conditions
- **WeatherReadings**: Sky images with AI analysis results and confidence scores
- **AuthSessions**: Secure session management for authentication persistence
- **UserSessions**: Activity tracking and measurement grouping

### Authentication Flow
- **OAuth Integration**: Replit Auth with CSRF protection using state/nonce verification
- **JWT Processing**: Token validation with cryptographic verification
- **Session Security**: Secure session storage with automatic expiration
- **Route Protection**: Decorator-based authentication middleware for API endpoints

## External Dependencies

### Third-Party Services
- **Replit Auth**: OAuth2 authentication provider for secure user login
- **Replit Hosting**: Primary deployment platform with environment-based configuration

### JavaScript Libraries  
- **React Query**: Server state management with caching and offline support
- **Lucide React**: Icon library for consistent UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Python Libraries
- **PySOLAR**: Solar position calculations for celestial navigation
- **SciPy**: Mathematical optimization for position triangulation
- **Flask-SQLAlchemy**: Database ORM for data persistence
- **PyJWT**: JSON Web Token processing for authentication
- **Cryptography**: Secure key handling and encryption operations

### Browser APIs
- **MediaDevices API**: Camera access for sky photography
- **Geolocation API**: GPS positioning when available
- **DeviceOrientationEvent**: Device compass and tilt measurements
- **IndexedDB**: Client-side data storage for offline functionality

### Development Tools
- **TypeScript**: Type checking and IDE support
- **Vite**: Development server with hot module replacement
- **PostCSS**: CSS processing with Autoprefixer
- **Flask-Migrate**: Database schema migrations