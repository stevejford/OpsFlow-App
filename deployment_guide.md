# Deployment Guide - Document Management System

## Deployment Strategy Overview

The deployment strategy for our document management system follows a progressive approach that starts with development environment setup and scales through staging to production deployment. Understanding this deployment pipeline will help you configure secure, reliable environments that support both development iteration and production stability.

Our deployment architecture leverages the Next.js platform capabilities while integrating with external services like Clerk for authentication, UploadThing for file storage, and database hosting through Neon. This approach provides enterprise-scale reliability while maintaining development simplicity and cost efficiency for smaller deployments.

The security-first deployment approach includes comprehensive environment isolation, secret management, and monitoring capabilities that ensure production data remains protected while providing developers with realistic testing environments. Each deployment tier includes appropriate security controls and monitoring capabilities that match the sensitivity of data and operations at that level.

Environment configuration management follows Infrastructure as Code principles where deployment configurations are version-controlled and reproducible across different environments. This approach prevents configuration drift and ensures that development, staging, and production environments maintain consistency while allowing appropriate customization for each deployment tier.

## Development Environment Setup

The development environment setup provides developers with a complete, functional document management system that operates independently of production resources while maintaining feature parity for testing and development purposes.

### Local Development Prerequisites

Before setting up the local development environment, ensure that your development machine has the required software and access to necessary external services. The local setup requires Node.js 18 or later, PostgreSQL for database operations, and access to external services for complete functionality testing.

```bash
# Check Node.js version (should be 18 or later)
node --version

# Check npm version (should be 8 or later)
npm --version

# Install PostgreSQL locally (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PostgreSQL (Windows)
# Download and install from https://www.postgresql.org/download/windows/
```

The local PostgreSQL setup requires creating a development database and user with appropriate permissions for running database migrations and tests. This local database should remain isolated from any staging or production data to prevent accidental data corruption during development.

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create development database and user
CREATE DATABASE opsflow_docs_dev;
CREATE USER opsflow_dev WITH PASSWORD 'dev_password_here';
GRANT ALL PRIVILEGES ON DATABASE opsflow_docs_dev TO opsflow_dev;

-- Enable required extensions
\c opsflow_docs_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search
```

### Environment Configuration

Environment configuration for local development requires setting up environment variables that connect to development services while maintaining security isolation from production systems. The configuration includes database connections, external service API keys, and feature flags that control development-specific functionality.

```bash
# Create .env.local file in project root
touch .env.local

# Add the following environment variables:
```

```env
# Database Configuration
DATABASE_URL="postgresql://opsflow_dev:dev_password_here@localhost:5432/opsflow_docs_dev"
DIRECT_URL="postgresql://opsflow_dev:dev_password_here@localhost:5432/opsflow_docs_dev"

# Authentication (Clerk Development Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_dev_key_here"
CLERK_SECRET_KEY="sk_test_your_dev_secret_here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/documents"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/documents"

# File Upload (UploadThing Development)
UPLOADTHING_SECRET="sk_live_your_uploadthing_dev_secret"
UPLOADTHING_APP_ID="your_dev_app_id"

# AI Integration (OpenAI Development)
OPENAI_API_KEY="sk-your_openai_dev_key"
OPENAI_ORGANIZATION="org-your_dev_org_id"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_local_auth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Feature Flags for Development
ENABLE_AI_FEATURES="true"
ENABLE_SEMANTIC_SEARCH="true"
ENABLE_EXTERNAL_SHARING="true"
ENABLE_DEBUG_LOGGING="true"

# Security Configuration (Development)
SHARE_LINK_SECRET="dev_share_link_secret_change_in_production"
ENCRYPTION_KEY="dev_encryption_key_32_chars_long!"

# Redis (for caching - optional in development)
REDIS_URL="redis://localhost:6379"

# Email Configuration (for notifications - optional)
EMAIL_FROM="dev@localhost"
SMTP_HOST="localhost"
SMTP_PORT="1025" # Use mailhog or similar for dev email testing
```

The development environment configuration includes debug settings and feature flags that enable additional logging and development tools while maintaining security practices that prepare code for production deployment.

### Database Migration and Seeding

Database setup for development includes running initial migrations to create the document management schema and optionally seeding the database with test data that supports development and testing activities.

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: Seed database with development data
npx prisma db seed
```

The database seeding process creates realistic test data including user accounts, folder structures, and sample documents that enable comprehensive testing of document management functionality without requiring manual data creation for each development session.

```typescript
// prisma/seed.ts - Development data seeding
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development database...');

  // Create test users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dev.local' },
    update: {},
    create: {
      email: 'admin@dev.local',
      name: 'Admin User',
      role: 'ADMIN',
      clerkId: 'dev_admin_clerk_id'
    }
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@dev.local' },
    update: {},
    create: {
      email: 'user@dev.local',
      name: 'Regular User',
      role: 'USER',
      clerkId: 'dev_user_clerk_id'
    }
  });

  // Create sample folder structure
  const rootFolder = await prisma.folder.create({
    data: {
      name: 'Company Documents',
      description: 'Root folder for all company documents',
      path: '/Company Documents',
      createdBy: adminUser.id
    }
  });

  const hrFolder = await prisma.folder.create({
    data: {
      name: 'Human Resources',
      description: 'HR policies and documents',
      parentId: rootFolder.id,
      path: '/Company Documents/Human Resources',
      createdBy: adminUser.id
    }
  });

  const projectsFolder = await prisma.folder.create({
    data: {
      name: 'Projects',
      description: 'Project documentation and files',
      parentId: rootFolder.id,
      path: '/Company Documents/Projects',
      createdBy: adminUser.id
    }
  });

  // Create sample permissions
  await prisma.permission.createMany({
    data: [
      {
        userId: adminUser.id,
        folderId: rootFolder.id,
        accessLevel: 'ADMIN',
        grantedBy: adminUser.id
      },
      {
        userId: regularUser.id,
        folderId: projectsFolder.id,
        accessLevel: 'WRITE',
        grantedBy: adminUser.id
      },
      {
        userId: regularUser.id,
        folderId: hrFolder.id,
        accessLevel: 'READ',
        grantedBy: adminUser.id
      }
    ]
  });

  // Create sample documents
  const sampleDoc = await prisma.document.create({
    data: {
      filename: 'employee-handbook.pdf',
      originalName: 'Employee Handbook 2024.pdf',
      folderId: hrFolder.id,
      uploadThingKey: 'dev_sample_file_key',
      mimeType: 'application/pdf',
      fileSize: 1024000,
      extractedText: 'This is a sample employee handbook containing company policies, procedures, and guidelines for all employees.',
      uploadedBy: adminUser.id
    }
  });

  console.log('✅ Development database seeded successfully');
  console.log(`👤 Admin user: admin@dev.local`);
  console.log(`👤 Regular user: user@dev.local`);
  console.log(`📁 Created ${await prisma.folder.count()} folders`);
  console.log(`📄 Created ${await prisma.document.count()} documents`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Development Server Startup

Starting the development server requires coordination between the Next.js application server, database connections, and external service integrations to provide a complete development environment.

```bash
# Start development server
npm run dev

# Alternative: Start with debug logging
DEBUG=opsflow:* npm run dev

# Start with specific port (if 3000 is in use)
npm run dev -- --port 3001

# Start with turbo for faster builds
npm run dev:turbo
```

The development server includes hot reloading for both frontend and backend code changes, enabling rapid iteration during development. The server also includes development-specific debugging tools and error reporting that provide detailed information about issues during development.

Development server monitoring includes console logging for database queries, API requests, and external service calls that help developers understand system behavior and troubleshoot issues during development.

## Staging Environment Deployment

The staging environment provides a production-like environment for testing complete functionality while maintaining isolation from production data and users. This environment serves as the final validation step before production deployment and includes comprehensive monitoring and testing capabilities.

### Staging Infrastructure Setup

Staging infrastructure mirrors production architecture while using scaled-down resources that provide cost efficiency while maintaining functional parity. The staging environment includes separate database instances, file storage, and external service configurations that prevent any interference with production operations.

```yaml
# docker-compose.staging.yml - Staging environment configuration
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.staging
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${STAGING_DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${STAGING_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${STAGING_CLERK_SECRET_KEY}
      - UPLOADTHING_SECRET=${STAGING_UPLOADTHING_SECRET}
      - OPENAI_API_KEY=${STAGING_OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: opsflow_docs_staging
      POSTGRES_USER: ${STAGING_DB_USER}
      POSTGRES_PASSWORD: ${STAGING_DB_PASSWORD}
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_staging_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/staging.conf:/etc/nginx/nginx.conf
      - ./ssl/staging:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_staging_data:
  redis_staging_data:
```

The staging Docker configuration includes production-like reverse proxy setup, SSL termination, and resource limits that mirror production deployment patterns while remaining suitable for testing and validation activities.

### Staging Deployment Pipeline

The staging deployment pipeline automates the process of building, testing, and deploying code changes to the staging environment while including comprehensive validation steps that ensure deployment quality.

```yaml
# .github/workflows/staging-deploy.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run type-check
        
      - name: Run unit tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level moderate
        
      - name: Run dependency vulnerability scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          
      - name: Run SAST scan
        uses: github/codeql-action/analyze@v2
        with:
          languages: typescript, javascript

  build-and-deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.STAGING_CLERK_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.STAGING_APP_URL }}
          
      - name: Build Docker image
        run: |
          docker build -t opsflow-docs:staging -f Dockerfile.staging .
          
      - name: Deploy to staging
        run: |
          # Deploy using your preferred method (docker-compose, k8s, cloud platform)
          docker-compose -f docker-compose.staging.yml up -d
          
      - name: Run database migrations
        run: |
          docker-compose -f docker-compose.staging.yml exec -T app npx prisma migrate deploy
          
      - name: Run smoke tests
        run: |
          # Wait for application to be ready
          sleep 30
          npm run test:smoke -- --baseUrl=${{ secrets.STAGING_APP_URL }}
          
      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: success()
        
      - name: Notify deployment failure
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: failure()
```

The staging deployment pipeline includes comprehensive testing, security scanning, and validation steps that ensure only high-quality, secure code reaches the staging environment. This thorough validation process helps prevent issues from reaching production while providing confidence in deployment quality.

### Staging Environment Monitoring

Staging environment monitoring provides visibility into application performance, error rates, and system behavior under realistic load conditions while serving as a testing ground for monitoring configurations that will be used in production.

```typescript
// lib/monitoring/staging.ts - Staging-specific monitoring configuration
import { createLogger, format, transports } from 'winston';
import { performance } from 'perf_hooks';

// Staging logger configuration
export const stagingLogger = createLogger({
  level: 'debug', // More verbose logging in staging
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    format.colorize()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: 'logs/staging-error.log', 
      level: 'error' 
    }),
    new transports.File({ 
      filename: 'logs/staging-combined.log' 
    })
  ]
});

// Performance monitoring for staging
export class StagingPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTiming(operation: string): string {
    const timingId = `${operation}_${Date.now()}_${Math.random()}`;
    performance.mark(`${timingId}_start`);
    return timingId;
  }
  
  endTiming(timingId: string, operation: string): number {
    performance.mark(`${timingId}_end`);
    performance.measure(timingId, `${timingId}_start`, `${timingId}_end`);
    
    const measure = performance.getEntriesByName(timingId)[0];
    const duration = measure.duration;
    
    // Track metrics for analysis
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
    
    // Log performance data
    stagingLogger.info('Performance metric', {
      operation,
      duration,
      timingId
    });
    
    // Clean up performance entries
    performance.clearMarks(`${timingId}_start`);
    performance.clearMarks(`${timingId}_end`);
    performance.clearMeasures(timingId);
    
    return duration;
  }
  
  getMetrics(operation: string): { avg: number; min: number; max: number; count: number } {
    const measurements = this.metrics.get(operation) || [];
    if (measurements.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    return {
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    };
  }
}

// Health check endpoint for staging
export async function stagingHealthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks = {
    database: await checkDatabaseConnection(),
    uploadthing: await checkUploadThingConnection(),
    openai: await checkOpenAIConnection(),
    redis: await checkRedisConnection()
  };
  
  const allHealthy = Object.values(checks).every(check => check);
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  };
}
```

Staging monitoring includes detailed performance metrics, error tracking, and health checks that provide comprehensive visibility into system behavior while serving as a proving ground for production monitoring configurations.

## Production Deployment

Production deployment requires enterprise-grade infrastructure, security controls, and operational procedures that ensure reliable, secure service for organizational users while maintaining high availability and performance standards.

### Production Infrastructure Architecture

Production infrastructure follows cloud-native architecture principles with redundancy, scalability, and security controls that meet enterprise operational requirements. The production deployment includes multiple availability zones, automated backup systems, and comprehensive monitoring capabilities.

```yaml
# infrastructure/production/docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: opsflow-docs:${IMAGE_TAG}
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${PROD_DATABASE_URL}
      - REDIS_URL=${PROD_REDIS_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${PROD_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${PROD_CLERK_SECRET_KEY}
      - UPLOADTHING_SECRET=${PROD_UPLOADTHING_SECRET}
      - OPENAI_API_KEY=${PROD_OPENAI_API_KEY}
      - SHARE_LINK_SECRET=${PROD_SHARE_LINK_SECRET}
      - ENCRYPTION_KEY=${PROD_ENCRYPTION_KEY}
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/prod:/etc/ssl/certs:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - app
    networks:
      - app-network
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis-prod-data:/data
    networks:
      - app-network
    deploy:
      restart_policy:
        condition: on-failure

  postgres-backup:
    image: postgres:15
    environment:
      PGPASSWORD: ${PROD_DB_PASSWORD}
    volumes:
      - ./scripts/backup.sh:/backup.sh:ro
      - postgres-backups:/backups
    command: /bin/bash -c "chmod +x /backup.sh && /backup.sh"
    networks:
      - app-network
    deploy:
      restart_policy:
        condition: on-failure

networks:
  app-network:
    driver: overlay
    attachable: true

volumes:
  redis-prod-data:
  postgres-backups:
  nginx-logs:
```

Production infrastructure configuration includes comprehensive resource limits, health checks, and backup systems that ensure reliable operation under production load conditions while providing disaster recovery capabilities.

### Production Security Configuration

Production security configuration implements enterprise-grade security controls including encryption, access controls, and monitoring capabilities that protect organizational data while meeting compliance requirements.

```nginx
# nginx/prod.conf - Production nginx configuration
events {
    worker_connections 1024;
}

http {
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Hide nginx version
    server_tokens off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Logging
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;
    
    upstream app {
        least_conn;
        server app:3000 max_fails=3 fail_timeout=30s;
        server app:3000 max_fails=3 fail_timeout=30s;
        server app:3000 max_fails=3 fail_timeout=30s;
    }
    
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            limit_req_status 429;
            
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeout configuration
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Authentication endpoints with stricter rate limiting
        location ~ ^/api/(auth|sign-in|sign-up) {
            limit_req zone=login burst=10 nodelay;
            limit_req_status 429;
            
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # File upload endpoints
        location /api/upload {
            limit_req zone=upload burst=5 nodelay;
            limit_req_status 429;
            
            client_max_body_size 100M;
            proxy_request_buffering off;
            
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 10s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }
        
        # Static files
        location /_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://app;
        }
        
        # All other requests
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
```

The production nginx configuration includes comprehensive security headers, rate limiting, SSL termination, and load balancing capabilities that provide enterprise-grade security and performance for production deployments.

### Production Deployment Pipeline

The production deployment pipeline includes comprehensive validation, approval processes, and rollback capabilities that ensure reliable, secure production deployments while maintaining service availability during deployment operations.

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true
        type: string

jobs:
  validate-release:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      
    steps:
      - uses: actions/checkout@v4
      
      - name: Extract version
        id: version
        run: |
          if [ "${{ github.event_name }}" = "push" ]; then
            VERSION=${GITHUB_REF#refs/tags/}
          else
            VERSION=${{ github.event.inputs.version }}
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          
      - name: Validate version format
        run: |
          if [[ ! "${{ steps.version.outputs.version }}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Invalid version format: ${{ steps.version.outputs.version }}"
            exit 1
          fi

  security-validation:
    runs-on: ubuntu-latest
    needs: validate-release
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.validate-release.outputs.version }}
          
      - name: Security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          
      - name: Container security scan
        run: |
          docker build -t opsflow-docs:security-scan .
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            -v $PWD:/workspace \
            aquasec/trivy image opsflow-docs:security-scan

  staging-validation:
    runs-on: ubuntu-latest
    needs: validate-release
    
    steps:
      - name: Deploy to staging
        run: |
          # Deploy specific version to staging for validation
          curl -X POST "${{ secrets.STAGING_DEPLOY_WEBHOOK }}" \
            -H "Authorization: Bearer ${{ secrets.STAGING_DEPLOY_TOKEN }}" \
            -d "version=${{ needs.validate-release.outputs.version }}"
            
      - name: Wait for staging deployment
        run: sleep 120
        
      - name: Run staging validation tests
        run: |
          npm ci
          npm run test:staging-validation
        env:
          STAGING_URL: ${{ secrets.STAGING_URL }}

  production-deploy:
    runs-on: ubuntu-latest
    needs: [validate-release, security-validation, staging-validation]
    environment: production
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.validate-release.outputs.version }}
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build production image
        run: |
          docker build -t opsflow-docs:${{ needs.validate-release.outputs.version }} .
          docker tag opsflow-docs:${{ needs.validate-release.outputs.version }} opsflow-docs:latest
          
      - name: Push to container registry
        run: |
          echo "${{ secrets.CONTAINER_REGISTRY_PASSWORD }}" | docker login ${{ secrets.CONTAINER_REGISTRY_URL }} -u "${{ secrets.CONTAINER_REGISTRY_USER }}" --password-stdin
          docker push opsflow-docs:${{ needs.validate-release.outputs.version }}
          docker push opsflow-docs:latest
          
      - name: Create database backup
        run: |
          curl -X POST "${{ secrets.BACKUP_WEBHOOK }}" \
            -H "Authorization: Bearer ${{ secrets.BACKUP_TOKEN }}" \
            -d "type=pre-deployment&version=${{ needs.validate-release.outputs.version }}"
            
      - name: Deploy to production
        run: |
          # Blue-green deployment strategy
          curl -X POST "${{ secrets.PROD_DEPLOY_WEBHOOK }}" \
            -H "Authorization: Bearer ${{ secrets.PROD_DEPLOY_TOKEN }}" \
            -d "version=${{ needs.validate-release.outputs.version }}&strategy=blue-green"
            
      - name: Wait for deployment completion
        run: |
          timeout 600 bash -c 'until curl -f "${{ secrets.PROD_HEALTH_CHECK_URL }}"; do sleep 10; done'
          
      - name: Run production smoke tests
        run: |
          npm run test:production-smoke
        env:
          PRODUCTION_URL: ${{ secrets.PRODUCTION_URL }}
          
      - name: Complete blue-green deployment
        run: |
          curl -X POST "${{ secrets.PROD_DEPLOY_WEBHOOK }}" \
            -H "Authorization: Bearer ${{ secrets.PROD_DEPLOY_TOKEN }}" \
            -d "action=complete-switch&version=${{ needs.validate-release.outputs.version }}"
            
      - name: Notify successful deployment
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#production-deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: version,commit,author,took
        if: success()

  rollback:
    runs-on: ubuntu-latest
    needs: [validate-release, production-deploy]
    if: failure()
    
    steps:
      - name: Initiate rollback
        run: |
          curl -X POST "${{ secrets.PROD_DEPLOY_WEBHOOK }}" \
            -H "Authorization: Bearer ${{ secrets.PROD_DEPLOY_TOKEN }}" \
            -d "action=rollback&version=${{ needs.validate-release.outputs.version }}"
            
      - name: Notify rollback
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: '#production-deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: version,commit,author
```

The production deployment pipeline includes comprehensive validation, approval gates, and automated rollback capabilities that ensure reliable production deployments while maintaining service availability and data integrity throughout the deployment process.