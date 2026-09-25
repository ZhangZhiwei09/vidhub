import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const videoStatusEnum = pgEnum('video_status', ['pending', 'approved', 'rejected'])
export const sexEnum = pgEnum('sex', ['unknown', 'male', 'female'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  account: varchar('account', { length: 64 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  username: varchar('username', { length: 32 }).notNull(),
  avatar: text('avatar').default(''),
  sign: text('sign').default(''),
  sex: sexEnum('sex').default('unknown').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  cover: text('cover').default(''),
  url: text('url').notNull(),
  description: text('description').default(''),
  uid: integer('uid')
    .notNull()
    .references(() => users.id),
  partitionId: integer('partition_id').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  status: videoStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const videoMappings = pgTable('video_mappings', {
  id: serial('id').primaryKey(),
  hash: varchar('hash', { length: 64 }).notNull().unique(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const archives = pgTable(
  'archives',
  {
    id: serial('id').primaryKey(),
    uid: integer('uid')
      .notNull()
      .references(() => users.id),
    vid: integer('vid')
      .notNull()
      .references(() => videos.id),
    isLike: boolean('is_like').default(false).notNull(),
    isCollect: boolean('is_collect').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('archives_uid_vid_uidx').on(t.uid, t.vid)],
)

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  vid: integer('vid')
    .notNull()
    .references(() => videos.id),
  uid: integer('uid')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  replyId: integer('reply_id'),
  target: integer('target'),
  readStatus: boolean('read_status').default(false).notNull(),
  type: varchar('type', { length: 32 }).default('comment').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const danmakus = pgTable('danmakus', {
  id: serial('id').primaryKey(),
  vid: integer('vid')
    .notNull()
    .references(() => videos.id),
  uid: integer('uid')
    .notNull()
    .references(() => users.id),
  color: varchar('color', { length: 32 }).default('#ffffff').notNull(),
  text: text('text').notNull(),
  time: integer('time').default(0).notNull(),
  type: integer('type').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const follows = pgTable(
  'follows',
  {
    id: serial('id').primaryKey(),
    uid: integer('uid')
      .notNull()
      .references(() => users.id),
    followId: integer('follow_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('follows_uid_follow_uidx').on(t.uid, t.followId)],
)

export const lives = pgTable('lives', {
  id: serial('id').primaryKey(),
  uid: integer('uid')
    .notNull()
    .references(() => users.id)
    .unique(),
  title: varchar('title', { length: 200 }).default('').notNull(),
  publicUrl: text('public_url').default('').notNull(),
  playUrl: text('play_url').default('').notNull(),
  cover: text('cover').default(''),
  status: integer('status').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  fromId: integer('from_id')
    .notNull()
    .references(() => users.id),
  toId: integer('to_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  readStatus: boolean('read_status').default(false).notNull(),
  type: varchar('type', { length: 32 }).default('private').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  toId: integer('to_id')
    .notNull()
    .references(() => users.id),
  fromId: integer('from_id').references(() => users.id),
  type: varchar('type', { length: 32 }).notNull(),
  content: text('content').default(''),
  readStatus: boolean('read_status').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})