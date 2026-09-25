CREATE TYPE "public"."sex" AS ENUM('unknown', 'male', 'female');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."video_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "archives" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"vid" integer NOT NULL,
	"is_like" boolean DEFAULT false NOT NULL,
	"is_collect" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_id" integer NOT NULL,
	"to_id" integer NOT NULL,
	"content" text NOT NULL,
	"read_status" boolean DEFAULT false NOT NULL,
	"type" varchar(32) DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"vid" integer NOT NULL,
	"uid" integer NOT NULL,
	"content" text NOT NULL,
	"reply_id" integer,
	"target" integer,
	"read_status" boolean DEFAULT false NOT NULL,
	"type" varchar(32) DEFAULT 'comment' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "danmakus" (
	"id" serial PRIMARY KEY NOT NULL,
	"vid" integer NOT NULL,
	"uid" integer NOT NULL,
	"color" varchar(32) DEFAULT '#ffffff' NOT NULL,
	"text" text NOT NULL,
	"time" integer DEFAULT 0 NOT NULL,
	"type" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"follow_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lives" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"title" varchar(200) DEFAULT '' NOT NULL,
	"public_url" text DEFAULT '' NOT NULL,
	"play_url" text DEFAULT '' NOT NULL,
	"cover" text DEFAULT '',
	"status" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lives_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_id" integer NOT NULL,
	"from_id" integer,
	"type" varchar(32) NOT NULL,
	"content" text DEFAULT '',
	"read_status" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"account" varchar(64) NOT NULL,
	"password_hash" text NOT NULL,
	"username" varchar(32) NOT NULL,
	"avatar" text DEFAULT '',
	"sign" text DEFAULT '',
	"sex" "sex" DEFAULT 'unknown' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_account_unique" UNIQUE("account")
);
--> statement-breakpoint
CREATE TABLE "video_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" varchar(64) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"cover" text DEFAULT '',
	"url" text NOT NULL,
	"description" text DEFAULT '',
	"uid" integer NOT NULL,
	"partition_id" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"status" "video_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "archives" ADD CONSTRAINT "archives_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archives" ADD CONSTRAINT "archives_vid_videos_id_fk" FOREIGN KEY ("vid") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_from_id_users_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_to_id_users_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_vid_videos_id_fk" FOREIGN KEY ("vid") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "danmakus" ADD CONSTRAINT "danmakus_vid_videos_id_fk" FOREIGN KEY ("vid") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "danmakus" ADD CONSTRAINT "danmakus_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follow_id_users_id_fk" FOREIGN KEY ("follow_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lives" ADD CONSTRAINT "lives_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_to_id_users_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_id_users_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "archives_uid_vid_uidx" ON "archives" USING btree ("uid","vid");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_uid_follow_uidx" ON "follows" USING btree ("uid","follow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "video_mappings_hash_uidx" ON "video_mappings" USING btree ("hash");