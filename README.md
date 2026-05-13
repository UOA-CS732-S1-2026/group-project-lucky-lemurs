# Lucky Lemurs

Lucky Lemurs is a University of Auckland campus quiz game built for the CS732 group project. Players can register, log in, explore campus buildings, answer building-based quiz questions, compete in ranked mode, review completed quizzes, and compare scores on a leaderboard.

![Lucky Lemurs](./Lucky%20Lemurs.png)

## Team

- Zixuan Cuan _(zcua212@aucklanduni.ac.nz)_
- Beier Guo _(bguo434@aucklanduni.ac.nz)_
- Jijia Zhai _(ajhz505@aucklanduni.ac.nz)_
- Zishuo Zhang _(zahz990@aucklanduni.ac.nz)_
- Huzhihao Zhao _(hzha974@aucklanduni.ac.nz)_
- Haiyan Zhao _(hzha369@aucklanduni.ac.nz)_

## Features

- User registration, login, JWT authentication, and protected routes
- Campus building selection with unlock and completion progress
- Building quiz mode with retry-later behavior for incorrect answers
- Ranked quiz mode with timed question sessions
- Score, accuracy, progress, achievement, and result pages
- Leaderboard for ranked quiz performance
- Quiz review pages for completed building quizzes
- Seeded University of Auckland building and question data
- Static image assets served by the backend for avatars and buildings

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: NestJS, TypeScript, Mongoose, Passport JWT, bcrypt
- Database: MongoDB, either local MongoDB or MongoDB Atlas
- Testing: Jest and Supertest for backend tests, ESLint for frontend and backend linting

## Project Structure

```txt
client/                  React + Vite frontend
server/                  NestJS backend API
server/docs/api-contract.md
                         API request and response examples
server/src/seeds/        Starter building and question seed data
server/public/images/    Static backend image assets
Lucky Lemurs.png         Project image used in this README
```

## Prerequisites

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Backend Setup

From the project root:

```bash
cd server
npm install
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

Update `server/.env` if needed:

```txt
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/lucky-lemurs
JWT_SECRET=replace-with-a-long-random-secret
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string. Do not commit real credentials.

Seed the database and start the API:

```bash
npm run seed
npm run start:dev
```

The backend runs at:

```txt
http://localhost:3000
```

## Frontend Setup

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

The frontend usually runs at:

```txt
http://localhost:5173
```

By default, the frontend calls `http://localhost:3000`. To use a different API URL, create `client/.env`:

```txt
VITE_API_URL=http://localhost:3000
```

## Useful Commands

Backend commands:

```bash
cd server
npm run start:dev     # Run the API in watch mode
npm run seed          # Seed buildings and questions
npm run build         # Build the NestJS app
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Run tests with coverage
npm run lint          # Lint and auto-fix backend files
```

Frontend commands:

```bash
cd client
npm run dev           # Run the Vite development server
npm run build         # Build the frontend
npm run preview       # Preview the production build
npm run lint          # Lint frontend files
```

## Testing

Run backend tests:

```bash
cd server
npm test
npm run test:e2e
```

Run frontend checks:

```bash
cd client
npm run lint
npm run build
```

## API Documentation

The full local API contract is documented in:

```txt
server/docs/api-contract.md
```

Most protected endpoints require:

```txt
Authorization: Bearer <accessToken>
```

Main API areas include:

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /buildings`
- `GET /quiz/modes`
- `POST /quiz/ranked/start`
- `POST /quiz/building/start`
- `POST /quiz/sessions/:sessionId/answers`
- `POST /quiz/sessions/:sessionId/finish`
- `GET /leaderboard?mode=ranked&period=all`

## Seed Data

Starter data lives in:

```txt
server/src/seeds/buildings.seed.json
server/src/seeds/questions.seed.json
```

After editing seed data, run:

```bash
cd server
npm run seed
```

Keep each question's `buildingId` aligned with a matching building `id`.

## Manual Smoke Test

After starting both the backend and frontend:

1. Register a new account.
2. Log in.
3. Open the quiz mode/building selection flow.
4. Start ranked mode and submit answers.
5. Finish the session and check the leaderboard.
6. Start a building quiz and submit a wrong answer to confirm retry behavior.
7. Finish the building quiz and check progress or achievements.

The backend smoke-test API flow is also listed in `server/docs/api-contract.md`.
