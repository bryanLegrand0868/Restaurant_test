# Restaurant Delivery Application

This is a restaurant delivery application with:
- NextJS TypeScript backend (API)
- Angular TypeScript frontend (Mobile app & Admin panel)

## Project Structure

```
restaurant-delivery-app/
├── backend/              # Next.js TypeScript backend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic services
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Database ORM
│   └── package.json      # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── app/          # App components
    │   │   ├── admin/    # Admin panel components
    │   │   ├── user/     # User app components
    │   │   ├── shared/   # Shared components
    │   │   └── core/     # Core services and models
    │   ├── assets/       # Static assets
    │   └── environments/ # Environment configurations
    └── package.json      # Frontend dependencies
```

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn package manager
- MongoDB (or alternative database)

## Setup Instructions

### Installation

1. Install Node.js from [https://nodejs.org/](https://nodejs.org/)

2. Backend setup:
```bash
cd backend
npm install
npm run dev
```

3. Frontend setup:
```bash
cd frontend
npm install -g @angular/cli
npm install
ng serve
```

### Configuration

- Create `.env` files in both backend and frontend folders following the provided examples
- Set up a MongoDB database or your preferred database system
- Configure authentication providers if using social login

## Features

- **User-Facing Mobile App:**
  - Menu browsing & customization
  - Order management
  - User profile management

- **Admin Panel:**
  - Real-time order monitoring
  - Menu management
  - Analytics dashboard
  - Role-based access control

## Technology Stack

- **Backend:** Next.js with TypeScript, Prisma ORM, MongoDB
- **Frontend:** Angular with TypeScript, Angular Material
- **Authentication:** JWT, OAuth
- **Real-time Updates:** WebSockets or Server-Sent Events
