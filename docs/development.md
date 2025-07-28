# Development Commands

This document outlines the available npm scripts and commands for development, testing, and maintenance.

## Development Commands

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugging enabled
npm run build             # Build the application
npm run start:prod        # Start production build
```

## Testing Commands

```bash
# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Run tests with coverage
```

## Code Quality Commands

```bash
# Code Quality
npm run lint             # Lint and fix TypeScript files
npm run format           # Format code with Prettier
```

## Database Commands

```bash
# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## Development Notes

- Always run `npm run prisma:generate` after pulling database schema changes
- Use `npm run test:watch` during development for continuous testing
- Run `npm run lint` before committing changes
- Use `npm run prisma:studio` to visually inspect and manage database data