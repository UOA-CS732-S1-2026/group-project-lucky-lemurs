# Lucky Lemurs Backend

NestJS API for the UOA campus quiz game MVP.

## Local Setup

```bash
npm install
copy .env.example .env
```

Edit `.env` for local MongoDB:

```txt
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/lucky-lemurs
JWT_SECRET=replace-with-a-long-random-secret
```

Start MongoDB locally, then seed the starter buildings and questions:

```bash
npm run seed
npm run start:dev
```

The API runs at `http://localhost:3000`.

## Shared Atlas Setup

For team integration, create one shared MongoDB Atlas database named
`lucky-lemurs`. Use these collections:

```txt
users
buildings
questions
quizsessions
userbuildingprogresses
```

Do not commit the Atlas connection string. Share it in the team chat and set it in
each member's local `.env`:

```txt
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/lucky-lemurs
```

After changing `MONGODB_URI`, run:

```bash
npm run seed
npm run start:dev
```

## Seed Data And Images

Seed files live in:

```txt
src/seeds/buildings.seed.json
src/seeds/questions.seed.json
```

Building and question images live in the frontend public folder:

```txt
../client/public/images/buildings/
```

The backend stores only image paths such as:

```txt
/images/buildings/oggb-cover.jpg
/images/buildings/oggb-01.jpg
```

Keep `buildingId` in `questions.seed.json` exactly the same as the matching
building `id` in `buildings.seed.json`.

## MVP API

Full request and response examples for frontend handoff are in
[`docs/api-contract.md`](docs/api-contract.md).

Auth:

```txt
POST /auth/register
POST /auth/login
POST /auth/logout
```

User:

```txt
GET   /users/me
PATCH /users/me
GET   /users/me/progress
```

Buildings and quiz:

```txt
GET  /buildings
GET  /buildings/:buildingId
GET  /quiz/modes
POST /quiz/ranked/start
POST /quiz/building/start
POST /quiz/sessions/:sessionId/answers
POST /quiz/sessions/:sessionId/finish
```

Leaderboard:

```txt
GET /leaderboard?mode=ranked&period=all
```

Protected endpoints require:

```txt
Authorization: Bearer <accessToken>
```

Questions returned to the frontend do not include `correctOptionId`. Answers are scored by the backend one question at a time.

## Verification

```bash
npm run build
npm test
```

Before handing the backend to the frontend, run the manual smoke flow documented in
`docs/api-contract.md`: register, login, start ranked mode, submit answers, finish
the session, check leaderboard, start building mode, submit a wrong answer, finish,
and check progress.
