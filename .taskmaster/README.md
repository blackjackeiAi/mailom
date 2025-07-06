# Task Master Configuration

This directory contains Task Master configuration for the Mailom project.

## Overview

Mailom is a Next.js application for managing tree cost data with Prisma database integration.

## Available Tasks

### Development
- `start` - Start development server
- `build` - Build the application
- `lint` - Run ESLint
- `seed` - Seed the database
- `import-excel` - Import Excel data

### Database
- `migrate` - Run database migrations
- `generate` - Generate Prisma client
- `studio` - Open Prisma Studio
- `reset` - Reset database

### Deployment
- `build` - Build for production
- `start` - Start production server

## Workflows

### Setup Workflow
Runs the complete setup process:
1. Install dependencies
2. Generate Prisma client
3. Run migrations
4. Seed database

### Deploy Workflow
Prepares for deployment:
1. Build application
2. Deploy migrations

## Project Structure

```
mailom/
├── src/app/          # Next.js app directory
├── prisma/           # Database schema and migrations
├── scripts/          # Data import scripts
├── public/           # Static assets
└── .taskmaster/      # Task Master configuration
```

## Usage

Use Task Master commands to manage the project efficiently:

- Development: `task-master run development:start`
- Database setup: `task-master run workflow:setup`
- Production build: `task-master run workflow:deploy`