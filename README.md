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

## Project Goals

The project is designed around the agreed user goal of helping University of Auckland students explore campus buildings through a quiz-based learning experience. The main user tasks supported by the prototype are:

- Create an account and securely log in
- Browse campus buildings and track unlocked/completed content
- Attempt quizzes for specific buildings
- Play a ranked quiz mode for timed competition
- Review completed quiz results and progress
- Compare ranked performance through the leaderboard

## Design and User Experience

Lucky Lemurs focuses on a clear student-facing flow: authentication, mode selection, quiz play, results, review, and leaderboard comparison. The product design prioritises simple navigation, visible progress, immediate quiz feedback, and replay/retry behaviour so users can understand what to do next without needing extra instructions.

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: NestJS, TypeScript, Mongoose, Passport JWT, bcrypt
- Database: MongoDB, either local MongoDB or MongoDB Atlas
- Quality checks: Jest and Supertest scripts for backend testing, ESLint for frontend and backend linting

The project also applies further learning beyond the base course material by using JWT-based authentication, NestJS modules/services/controllers, MongoDB Atlas-compatible configuration, seeded backend data, static backend asset serving, and API contract documentation.

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

## Run Locally

Follow these steps to run the application on your own machine.

### 1. Start MongoDB

Use either a local MongoDB server or a MongoDB Atlas connection string. The backend reads the database URL from `server/.env`.

### 2. Start the Backend

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

If the database is empty, load the starter campus data:

```bash
npm run seed
```

This command writes or updates the starter buildings and questions in the MongoDB database configured by `server/.env`.

Start the API:

```bash
npm run start:dev
```

The backend runs at:

```txt
http://localhost:3000
```

### 3. Start the Frontend

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

Then open:

```txt
http://localhost:5173
```

## Testing and Quality Checks

These checks are not required to start the app, but they should be run before marking, submission, or deployment.

### Backend Automated Tests

Backend automated tests are written with Jest. The current test coverage includes basic controller/service tests for the app, authentication, and user service setup. The backend also keeps the default Supertest e2e test under `server/test`.

Run backend unit tests:

```bash
cd server
npm test
```

Run backend tests with a coverage report:

```bash
cd server
npm run test:cov
```

Run the backend e2e test script:

```bash
cd server
npm run test:e2e
```

### Build and Lint Checks

Backend checks:

```bash
cd server
npm run build         # Check the NestJS production build
npm run lint          # Run backend linting
```

Frontend checks:

```bash
cd client
npm run build         # Check the Vite production build
npm run lint          # Run frontend linting
```

The frontend currently does not include a dedicated automated test script. Its main verification commands are `npm run build`, `npm run lint`, and the manual smoke test below.

### Manual Smoke Test

After starting both the backend and frontend, test the main user journey:

1. Register a new account.
2. Log in with the registered account.
3. Confirm protected pages cannot be accessed when logged out.
4. Open the quiz mode and building selection flow.
5. Start ranked mode, submit answers, finish the session, and check the leaderboard.
6. Start a building quiz and submit a wrong answer to confirm retry-later behaviour.
7. Finish a building quiz and check the result, progress, achievements, and review pages.
8. Refresh the browser and confirm the logged-in session and API calls still behave as expected.

The backend smoke-test API flow is also listed in `server/docs/api-contract.md`.

## Production Build

For local development and marking, use the `Run Locally` steps above. For deployment or production-style verification, build each part first.

Backend production build and run:

```bash
cd server
npm run build
npm run start:prod
```

Frontend production build:

```bash
cd client
npm run build
npm run preview
```

`npm run preview` serves the built frontend locally so the production bundle can be checked before deployment. In a hosted deployment, the frontend host serves the generated `dist` files and the backend host should run the compiled NestJS app with the required environment variables.

## Deployment

The deployed frontend is available at:

```txt
https://campus-game-front.onrender.com/
```

The frontend is configured to call the deployed backend API through its environment configuration. Backend secrets and database credentials should be configured in the hosting platform, not committed to Git.

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

The seed script uses upsert behaviour based on each item's `id`, so it writes new records and updates matching existing records rather than clearing the whole database. Keep each question's `buildingId` aligned with a matching building `id`.

## Project Management

Weekly meeting minutes, task breakdowns, and team member responsibilities should be recorded in the GitHub Wiki before submission. The Wiki should include:

- Weekly meeting notes
- Tasks assigned to each team member
- Progress updates and blockers
- Changes to project scope or requirements
- Evidence of how user requirements from the proposal were implemented

## Version Control Workflow

The team should use regular, fine-grained commits and a feature-branch workflow. Work should be split into focused branches for areas such as frontend pages, backend API features, authentication, quiz logic, seed data, testing, and deployment. Each team member should commit regularly to demonstrate their own contribution.
