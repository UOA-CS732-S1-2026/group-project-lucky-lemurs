export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export enum QuizMode {
  Ranked = 'ranked',
  Building = 'building',
  LocalMultiplayer = 'local_multiplayer',
}

export enum SessionStatus {
  Active = 'active',
  Finished = 'finished',
  Expired = 'expired',
}

export enum QuestionCategory {
  History = 'history',
  Location = 'location',
  Building = 'building',
  Facility = 'facility',
  StudentLife = 'student_life',
  Culture = 'culture',
  Food = 'food',
  People = 'people',
}

export enum QuestionDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}
