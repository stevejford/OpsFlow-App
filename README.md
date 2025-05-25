# OpsFlow-App

## Description
OpsFlow is a comprehensive operations management system designed to handle employee records, license tracking, website logins, file uploads, task assignment, and emergency contact information.

## Features
- Employee Profiles Management
- License Tracking with Expiry Alerts
- Induction Management and Tracking
- Credentials Vault (Secure Password Storage)
- Task Management (Asana-style)
- Document Upload System
- Administrative Dashboard
- Search & Reporting Capabilities

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- PostgreSQL database (We recommend Neon for hosting)

### Installation

1. Clone the repository
```bash
git clone https://github.com/stevejford/OpsFlow-App.git
cd OpsFlow-App
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your database credentials and other configuration.

4. Set up the database
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack
- Next.js (React Framework)
- TypeScript
- TailwindCSS
- PostgreSQL Database (Neon)
- Font Awesome for icons
- UploadThing for File Uploads

## Development Roadmap
See [taskroadmap.md](./taskroadmap.md) for the detailed development plan.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
