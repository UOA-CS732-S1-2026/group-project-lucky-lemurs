# Lucky Lemurs API Contract

Base URL for local development:

```txt
http://localhost:3000
```

Protected endpoints require:

```txt
Authorization: Bearer <accessToken>
```

All request and response fields use `camelCase`. All IDs are strings. Dates are ISO
strings. Questions returned before answering do not include `correctOptionId`.

## Frontend Flow

Recommended page/API order:

```txt
Register page            -> POST /auth/register
Login page               -> POST /auth/login
Mode selection page      -> GET /quiz/modes
Building selection page  -> GET /buildings
Ranked quiz page         -> POST /quiz/ranked/start
Building quiz page       -> POST /quiz/building/start
Answer interaction       -> POST /quiz/sessions/:sessionId/answers
Result page              -> POST /quiz/sessions/:sessionId/finish
Leaderboard page         -> GET /leaderboard?mode=ranked&period=all
Profile page             -> GET /users/me and GET /users/me/progress
```

## Auth

### POST /auth/register

Token required: no

Request:

```json
{
  "username": "Alice",
  "email": "alice@aucklanduni.ac.nz",
  "password": "Password123"
}
```

Response:

```json
{
  "user": {
    "id": "user_001",
    "username": "Alice",
    "email": "alice@aucklanduni.ac.nz",
    "avatarUrl": "/images/avatars/default.png",
    "totalScore": 0
  },
  "accessToken": "jwt_token_here"
}
```

### POST /auth/login

Token required: no

Request:

```json
{
  "email": "alice@aucklanduni.ac.nz",
  "password": "Password123"
}
```

Response:

```json
{
  "user": {
    "id": "user_001",
    "username": "Alice",
    "email": "alice@aucklanduni.ac.nz",
    "avatarUrl": "/images/avatars/default.png",
    "totalScore": 0
  },
  "accessToken": "jwt_token_here"
}
```

### POST /auth/logout

Token required: no

Response:

```json
{
  "message": "Logged out successfully"
}
```

Logout is client-side for MVP: remove the stored token.

## User

### GET /users/me

Token required: yes

Response:

```json
{
  "id": "user_001",
  "username": "Alice",
  "email": "alice@aucklanduni.ac.nz",
  "avatarUrl": "/images/avatars/default.png",
  "totalScore": 860,
  "rank": 5,
  "completedBuildingCount": 2,
  "accuracy": 0.78
}
```

### PATCH /users/me

Token required: yes

Request:

```json
{
  "username": "AliceNew",
  "avatarUrl": "/images/avatars/avatar-02.png"
}
```

Response:

```json
{
  "id": "user_001",
  "username": "AliceNew",
  "email": "alice@aucklanduni.ac.nz",
  "avatarUrl": "/images/avatars/avatar-02.png"
}
```

### GET /users/me/progress

Token required: yes

Response:

```json
{
  "userId": "user_001",
  "buildingProgress": [
    {
      "buildingId": "oggb",
      "isUnlocked": true,
      "isCompleted": true,
      "bestScore": 100,
      "correctCount": 10,
      "totalQuestions": 10,
      "lastPlayedAt": "2026-05-04T10:00:00.000Z"
    }
  ]
}
```

## Modes And Buildings

### GET /quiz/modes

Token required: yes

Response:

```json
{
  "modes": [
    {
      "id": "building",
      "name": "Building Challenge",
      "description": "Answer questions based on a selected UOA building.",
      "requiresBuilding": true
    },
    {
      "id": "ranked",
      "name": "Ranked Mode",
      "description": "Answer 20 questions within 60 seconds and compete on the leaderboard.",
      "requiresBuilding": false,
      "questionLimit": 20,
      "timeLimitSeconds": 60
    }
  ]
}
```

### GET /buildings

Token required: yes

Response:

```json
{
  "buildings": [
    {
      "id": "oggb",
      "name": "Owen G Glenn Building",
      "shortName": "OGGB",
      "description": "A major building for the University of Auckland Business School.",
      "location": "12 Grafton Road",
      "imageUrl": "/images/buildings/oggb-cover.jpg",
      "unlockOrder": 1,
      "questionCount": 10,
      "isUnlocked": true,
      "isCompleted": false
    }
  ]
}
```

### GET /buildings/:buildingId

Token required: yes

Response:

```json
{
  "id": "oggb",
  "name": "Owen G Glenn Building",
  "shortName": "OGGB",
  "description": "A major building for the University of Auckland Business School.",
  "location": "12 Grafton Road",
  "imageUrl": "/images/buildings/oggb-cover.jpg",
  "unlockOrder": 1,
  "questionCount": 10,
  "isUnlocked": true,
  "isCompleted": false
}
```

## Quiz

### POST /quiz/ranked/start

Token required: yes

Request:

```json
{}
```

Response:

```json
{
  "sessionId": "session_001",
  "mode": "ranked",
  "questionLimit": 20,
  "timeLimitSeconds": 60,
  "startedAt": "2026-05-04T10:00:00.000Z",
  "expiresAt": "2026-05-04T10:01:00.000Z",
  "questions": [
    {
      "id": "q_001",
      "buildingId": "oggb",
      "category": "building",
      "difficulty": "easy",
      "questionText": "What is the main academic focus of the Owen G Glenn Building?",
      "options": [
        { "id": "A", "text": "Business School" },
        { "id": "B", "text": "Engineering workshops" },
        { "id": "C", "text": "Medical simulation labs" },
        { "id": "D", "text": "Music performance studios" }
      ],
      "imageUrl": "/images/buildings/oggb-01.jpg"
    }
  ]
}
```

Frontend rule: ranked mode uses the returned `timeLimitSeconds` and displays the
returned question list. The seed should contain at least 20 active questions for MVP.

### POST /quiz/building/start

Token required: yes

Request:

```json
{
  "buildingId": "oggb"
}
```

Response:

```json
{
  "sessionId": "session_002",
  "mode": "building",
  "building": {
    "id": "oggb",
    "name": "Owen G Glenn Building",
    "shortName": "OGGB",
    "imageUrl": "/images/buildings/oggb-cover.jpg"
  },
  "questions": [
    {
      "id": "q_001",
      "buildingId": "oggb",
      "category": "building",
      "difficulty": "easy",
      "questionText": "What is the main academic focus of the Owen G Glenn Building?",
      "options": [
        { "id": "A", "text": "Business School" },
        { "id": "B", "text": "Engineering workshops" },
        { "id": "C", "text": "Medical simulation labs" },
        { "id": "D", "text": "Music performance studios" }
      ],
      "imageUrl": "/images/buildings/oggb-01.jpg"
    }
  ]
}
```

### POST /quiz/sessions/:sessionId/answers

Token required: yes

Request:

```json
{
  "questionId": "q_001",
  "selectedOptionId": "A",
  "timeSpentSeconds": 5
}
```

Correct response:

```json
{
  "sessionId": "session_001",
  "questionId": "q_001",
  "correct": true,
  "correctOptionId": "A",
  "explanation": "OGGB is mainly associated with the University of Auckland Business School.",
  "scoreDelta": 10,
  "currentScore": 50,
  "correctCount": 5,
  "incorrectCount": 0
}
```

Wrong building-mode response:

```json
{
  "sessionId": "session_002",
  "questionId": "q_001",
  "correct": false,
  "correctOptionId": "A",
  "explanation": "OGGB is mainly associated with the University of Auckland Business School.",
  "scoreDelta": 0,
  "currentScore": 40,
  "correctCount": 4,
  "incorrectCount": 1,
  "retryLater": true
}
```

Frontend rule: if `retryLater` is true, put that question back later in the building
mode queue.

### POST /quiz/sessions/:sessionId/finish

Token required: yes

Request:

```json
{}
```

Ranked response:

```json
{
  "sessionId": "session_001",
  "mode": "ranked",
  "status": "finished",
  "score": 80,
  "correctCount": 8,
  "incorrectCount": 2,
  "totalQuestions": 20,
  "accuracy": 0.8,
  "timeUsedSeconds": 58,
  "rank": 5,
  "finishedAt": "2026-05-04T10:01:00.000Z"
}
```

Building response:

```json
{
  "sessionId": "session_002",
  "mode": "building",
  "status": "finished",
  "buildingId": "oggb",
  "score": 100,
  "correctCount": 10,
  "incorrectCount": 2,
  "totalQuestions": 10,
  "accuracy": 0.83,
  "timeUsedSeconds": 240,
  "rank": null,
  "buildingProgress": {
    "buildingId": "oggb",
    "isCompleted": true,
    "bestScore": 100
  },
  "finishedAt": "2026-05-04T10:10:00.000Z"
}
```

## Leaderboard

### GET /leaderboard?mode=ranked&period=all

Token required: yes

Response:

```json
{
  "mode": "ranked",
  "period": "all",
  "entries": [
    {
      "rank": 1,
      "userId": "user_002",
      "username": "Bob",
      "avatarUrl": "/images/avatars/avatar-01.png",
      "score": 150,
      "accuracy": 0.9,
      "timeUsedSeconds": 55,
      "playedAt": "2026-05-04T10:00:00.000Z"
    }
  ],
  "myRank": {
    "rank": 5,
    "score": 80
  }
}
```

## Error Format

Validation error:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "selectedOptionId must be a string",
  "field": "selectedOptionId"
}
```

Unauthorized:

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized"
}
```

Conflict:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Question has already been answered"
}
```

## Manual Smoke Test

Run this before frontend handoff:

1. `POST /auth/register`
2. `POST /auth/login`
3. Copy `accessToken`
4. `GET /quiz/modes`
5. `GET /buildings`
6. `POST /quiz/ranked/start`
7. Submit one correct and one wrong ranked answer
8. `POST /quiz/sessions/:sessionId/finish`
9. `GET /leaderboard?mode=ranked&period=all`
10. `POST /quiz/building/start`
11. Submit a wrong building answer and confirm `retryLater: true`
12. `POST /quiz/sessions/:sessionId/finish`
13. `GET /users/me/progress`
