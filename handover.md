# OpsFlow Project Handover Document

## Project Overview

OpsFlow is a Next.js application designed to manage employee operations, including employee records, licenses, credentials, tasks, and documents. The application follows a phase-based roadmap and is built with the following tech stack:

- **Frontend**: Next.js 14.2.3 with App Router, React 18.3.1, TypeScript, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL hosted on Neon
- **Authentication**: Clerk
- **Package Manager**: Bun

## Current Status

### Completed Features

1. **Database Setup**
   - PostgreSQL database set up on Neon
   - Prisma schema designed and implemented with models for Employee, License, Credential, Task, Document, etc.
   - Database connection configured in `.env` file

2. **Authentication**
   - Clerk integration for authentication
   - Sign-in/sign-up functionality in the navigation bar
   - Middleware configured for protected routes

3. **Task Management**
   - Task listing page with filtering capabilities
   - Task creation form with fields for title, description, status, priority, due date, assignee, and file attachments
   - Task detail view with status tracking
   - Task editing functionality

4. **UI Components**
   - Basic UI components created for buttons, cards, inputs, selects, etc.
   - Navigation component with Clerk authentication integration

### In Progress / Pending Features

1. **Role-based Access Control**
   - Not yet implemented
   - Needs to be integrated with Clerk authentication

2. **Employee Management**
   - Basic UI exists but not connected to the database
   - CRUD operations need to be implemented

3. **License Management**
   - Not yet implemented

4. **Credentials Vault**
   - Not yet implemented

5. **Infrastructure**
   - CI/CD pipeline not yet configured
   - Logging and monitoring not yet implemented

## Project Structure

```
OpsFlow/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── tasks/          # Task management pages
│   │   ├── employees/      # Employee management pages
│   │   ├── layout.tsx      # Root layout with ClerkProvider
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable components
│   │   ├── ui/             # UI components (button, card, etc.)
│   │   └── navigation.tsx  # Navigation bar with Clerk auth
│   ├── lib/                # Utility functions
│   └── middleware.ts       # Clerk middleware for auth
├── .env                    # Environment variables
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── roadmap.md              # Project roadmap
```

## Key Files and Components

1. **Database Configuration**
   - `.env`: Contains the Neon PostgreSQL connection string and Clerk API keys
   - `prisma/schema.prisma`: Defines the database schema

2. **Authentication**
   - `src/middleware.ts`: Configures Clerk middleware for authentication
   - `src/app/layout.tsx`: Wraps the application with ClerkProvider
   - `src/components/navigation.tsx`: Contains the sign-in/sign-up buttons

3. **Task Management**
   - `src/app/tasks/page.tsx`: Main tasks listing page
   - `src/app/tasks/components/task-list.tsx`: Displays the list of tasks
   - `src/app/tasks/components/task-filters.tsx`: Filters for tasks
   - `src/app/tasks/components/task-form.tsx`: Form for creating/editing tasks
   - `src/app/tasks/create/page.tsx`: Page for creating a new task
   - `src/app/tasks/[id]/page.tsx`: Task detail page
   - `src/app/tasks/[id]/edit/page.tsx`: Task edit page

## Known Issues and Challenges

1. **UI Component Dependencies**
   - The UI components require additional dependencies that need to be installed:
     - `class-variance-authority`
     - `react-day-picker`
     - Radix UI components (`@radix-ui/react-label`, `@radix-ui/react-select`, etc.)

2. **Data Fetching**
   - Currently using mock data for tasks and employees
   - Need to implement actual data fetching from the database using Prisma

3. **Next.js Version**
   - Recently upgraded from Next.js 13.4.18 to 14.2.3 to support Clerk
   - May need to adjust code for compatibility with the newer version

## Next Steps

1. **Install Missing Dependencies**
   - Run `bun add class-variance-authority react-day-picker @radix-ui/react-label @radix-ui/react-select @radix-ui/react-radio-group @radix-ui/react-popover`

2. **Implement Employee Management**
   - Connect the employee listing page to the database
   - Implement CRUD operations for employees
   - Create employee profile pages

3. **Implement Role-based Access Control**
   - Integrate with Clerk for role management
   - Add permission checks to protected routes and actions

4. **Implement License Management**
   - Create license tracking system
   - Set up expiry alerts
   - Implement license document storage

5. **Implement Credentials Vault**
   - Create secure credential storage
   - Implement encryption for sensitive data
   - Set up access logging

## Development Environment Setup

1. **Prerequisites**
   - Node.js (recommended: v18+)
   - Bun package manager
   - PostgreSQL (hosted on Neon, no local installation needed)

2. **Getting Started**
   - Clone the repository
   - Run `bun install` to install dependencies
   - Ensure `.env` file is properly configured with:
     - `DATABASE_URL` for Neon PostgreSQL
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for Clerk
   - Run `bunx prisma generate` to generate Prisma client
   - Run `bun dev` to start the development server

## Important Notes

1. **Package Manager**
   - The project uses Bun instead of npm/yarn/pnpm
   - Always use `bun` commands for package management

2. **Next.js App Router**
   - The project uses the App Router structure, not the Pages Router
   - Components that use client-side hooks need the "use client" directive

3. **Authentication**
   - Clerk is used for authentication
   - The middleware.ts file should not be modified without careful consideration

4. **Database**
   - Any schema changes should be made in the schema.prisma file
   - After changes, run `bunx prisma db push` to update the database

5. **UI Components**
   - The project uses a custom UI component library in src/components/ui
   - These components follow a similar pattern to shadcn/ui

Good luck with the continued development of OpsFlow!
