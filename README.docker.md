# Docker Setup for Infina PFA Backend

This guide explains how to run the Infina Personal Finance Advisor backend using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git repository cloned

## Configuration

1. Create a `.env` file in the project root directory:

```
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/infina_pfa?schema=public

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=infina_pfa

# App
PORT=3000
```

Replace `your_supabase_url` and `your_supabase_anon_key` with your actual Supabase credentials.

## Running the Application

### Development Mode

For development with hot-reload:

```bash
docker-compose up
```

### Production Mode

For production deployment:

```bash
docker-compose -f docker-compose.yml up -d
```

The API will be available at http://localhost:3000.

## Database Migrations

To run Prisma migrations inside the Docker container:

```bash
docker-compose exec api npm run prisma:migrate
```

## Accessing Prisma Studio

To access Prisma Studio for database management:

```bash
docker-compose exec api npm run prisma:studio
```

Prisma Studio will be available at http://localhost:5555.

## Stopping the Application

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```
