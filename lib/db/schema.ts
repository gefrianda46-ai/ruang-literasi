import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  username: text('username').unique(),
  displayUsername: text('displayUsername'),
  role: text('role').notNull().default('mahasiswa'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const reading = pgTable('reading', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  filePath: text('filePath').notNull(),
  fileName: text('fileName').notNull(),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const question = pgTable('question', {
  id: serial('id').primaryKey(),
  readingId: integer('readingId').notNull(),
  category: text('category').notNull(),
  prompt: text('prompt').notNull(),
  keywords: jsonb('keywords').$type<string[]>().notNull().default([]),
  position: integer('position').notNull().default(0),
})

export const submission = pgTable('submission', {
  id: serial('id').primaryKey(),
  readingId: integer('readingId').notNull(),
  userId: text('userId').notNull(),
  totalPoints: numeric('totalPoints').notNull().default('0'),
  maxPoints: integer('maxPoints').notNull().default(0),
  score: numeric('score').notNull().default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const answer = pgTable('answer', {
  id: serial('id').primaryKey(),
  submissionId: integer('submissionId').notNull(),
  questionId: integer('questionId').notNull(),
  answerText: text('answerText').notNull(),
  matchedKeywords: jsonb('matchedKeywords').$type<string[]>().notNull().default([]),
  points: numeric('points').notNull().default('0'),
})
