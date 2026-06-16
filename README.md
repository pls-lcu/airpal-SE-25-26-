# AirPal

Airport management system — Deliverable 3, Software Engineering course (25/26).

AirPal is a REST API backend that models the passenger experience of an airport: account creation, flight search, ticket booking, online check-in, and support features.

## Tech stack

- **NestJS 11** — backend framework
- **Prisma 7** — ORM / database client
- **PostgreSQL** — database (tested with v18 via pgAdmin 4)
- **JWT** — authentication (Bearer tokens)
- **bcrypt** — password hashing

## Prerequisites

- Node.js 20+
- PostgreSQL running locally with a database called `airpal`

## Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create your .env file from the example
cp .env.example .env
# Then edit .env and fill in your DATABASE_URL and JWT_SECRET

# 3. Push the schema to the database
npx prisma db push

# 4. Generate the Prisma client
npx prisma generate

# 5. Seed the database with sample flights
npm run db:seed

# 6. Start the development server
npm run start:dev
```

The API is available at `http://localhost:3000/api`.

## API endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create a new passenger account | — |
| GET | `/api/auth/verify?token=` | Verify email address | — |
| POST | `/api/auth/login` | Login and receive a JWT | — |
| POST | `/api/auth/logout` | Logout (client drops the token) | JWT |
| POST | `/api/auth/password-reset/request` | Request a reset link via email | — |
| POST | `/api/auth/password-reset/request-authenticated` | Request a reset link (logged in) | JWT |
| POST | `/api/auth/password-reset/confirm` | Set a new password using the reset token | — |

### Flights

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/flights` | Search flights (`?origin=`, `?destination=`, `?date=`) | — |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Book a flight | JWT |
| GET | `/api/bookings` | List my bookings | JWT |
| PATCH | `/api/bookings/:id` | Modify seat selection | JWT |
| DELETE | `/api/bookings/:id` | Cancel a booking | JWT |

### Check-in

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/check-in/:ticketId` | Online check-in for a ticket | JWT |

### Reports & Support

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reports/bugs` | Submit a bug report | JWT |
| POST | `/api/reports/support` | Open a customer support ticket | JWT |
| POST | `/api/reports/assistance` | Request special assistance | JWT |
| POST | `/api/reports/lost-items` | File a lost item report | JWT |

## Password rules

Passwords must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.

## Notes

- Email sending, payment processing, and external scheduling/pricing engines are all **stubbed** — they log to the console instead of calling real external services.
- Airline manager use cases (flight scheduling, pricing, crew assignment) are out of scope and not implemented.
- The seeded flights use IATA codes: `MXP` (Milan), `FCO` (Rome), `LHR` (London), `JFK` (New York).
