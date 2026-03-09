# Dental Clinic Management System with AI Assistant

A comprehensive dental clinic management system built with TypeScript, Express, and Sequelize ORM. This system integrates AI assistants to enhance patient care and streamline clinic operations.

The system provides a production-ready environment with robust features for patient management, appointment scheduling, treatment tracking, and AI-powered assistance. Built on a modern tech stack with enterprise-grade security and scalability.

## Docker Development Setup

The project uses Docker Compose for development. To run the application:

```bash
# Start all services (without Adminer)
docker compose up

# Start all services including Adminer (development only)
docker compose --profile dev up
```

### Services

-   Backend API: http://localhost:3000
-   Backend swagger doc: http://localhost:3000/api/v1/docs
-   MySQL Database: localhost:3306
-   Redis: localhost:6379
-   Adminer (Database UI): http://localhost:82 (development only)

### Database Access

When using Adminer or MySQL Workbench, use these credentials:

-   System: MySQL
-   Server: db
-   Username: root
-   Password: admin123
-   Database: aidentally

## Manual Installation

Install the dependencies:

```bash
pnpm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server environment
NODE_ENV=development
PORT=3000

# MySQL Database configuration
DB_HOST=db
DB_USER=root
DB_PASS=admin123
DB_NAME=aidentally

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_EXPIRATION_MINUTES=5
JWT_REFRESH_EXPIRATION_DAYS=30

# Logging Configuration
LOG_FOLDER=logs/
LOG_FILE=%DATE%-app-log.log
LOG_LEVEL=error

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USE_PASSWORD=no
REDIS_PASSWORD=123456
```

## Database Commands

### Migration Commands

```bash
# Check migration status
pnpm run db:migrate:status

# Run all pending migrations
pnpm run db:migrate

# Run a specific migration
pnpm run db:migrate:one -- <migration-name>

# Undo last migration
pnpm run db:migrate:undo

# Undo a specific migration
pnpm run db:migrate:undo:one -- <migration-name>

# Undo all migrations
pnpm run db:migrate:undo:all
```

### Seeder Commands

```bash
# Run all seeders
pnpm run db:seed

# Run a specific seeder
pnpm run db:seed:one -- <seeder-name>

# Undo all seeders
pnpm run db:seed:undo
```

### Database Reset

```bash
# Reset database (undo all migrations, run migrations, run seeders)
pnpm run db:reset
```

## Features

-   **ECMAScript Modules (ESM)**
-   **ORM**: [Sequelize](https://sequelize.org/) orm for object data modeling
-   **Migration and Seed**: DB migration and Seed using [Sequelize-CLI](https://github.com/sequelize/cli)
-   **Authentication and authorization**: using [passport](http://www.passportjs.org) with username-based authentication
-   **Error handling**: centralized error handling
-   **Validation**: request data validation using [Zod](https://zod.dev/)
-   **Logging**: using [winston](https://github.com/winstonjs/winston)
-   **Testing**: unit tests using [Vitest](https://vitest.dev/)
-   **Caching**: Caching using [Redis](https://redis.io/)
-   **Bidirectional Communication**: using [Socket.io](https://socket.io/)
-   **Job scheduler**: with [Node-cron](https://www.npmjs.com/package/node-cron)
-   **Dependency management**: with [pnpm](https://pnpm.io/)
-   **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv)
-   **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
-   **Docker support**
-   **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
-   **Fast Compilation**: with [Rollup](https://rollupjs.org/)
-   **TypeScript**: Full TypeScript support with strict type checking

## API Documentation

The API documentation is available at `/api/v1/docs` when running the application. Here are the main endpoints:

## Development

Running locally:

```bash
pnpm run dev
```

Running in production:

```bash
pnpm run start
```

Testing:

```bash
# run all tests
pnpm test

# run tests in watch mode
pnpm test:watch

# run tests in CI environment
pnpm test:ci
```

## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--dao\            # Data Access Object for models
 	|--contract\		# Contracts for all dao
 	|--implementation 	# Implementation of the contracts
 |--db\             # Migrations and Seed files
 |--models\         # Sequelize models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
  	|--contract\		# Contracts for all service
 	|--implementation 	# Implementation of the contracts and unit test files
 |--helper\         # Helper classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--cronJobs.ts     # Job Scheduler
 |--index.ts        # App entry point
```

## License

[MIT](LICENSE)
