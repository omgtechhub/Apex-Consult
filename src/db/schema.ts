import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  decimal,
  serial,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Contacts / Leads ─────────────────────────────────────────────────────────
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  service: varchar("service", { length: 255 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 50 }),
  service: varchar("service", { length: 255 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  timezone: varchar("timezone", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("unpaid"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  university: varchar("university", { length: 255 }),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  service: varchar("service", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  featured: boolean("featured").default(false),
  approved: boolean("approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: varchar("cover_image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  readTime: integer("read_time"),
  published: boolean("published").default(false),
  featuredAt: timestamp("featured_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  order: integer("order").default(0),
  published: boolean("published").default(true),
});

// ─── Services ─────────────────────────────────────────────────────────────────
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  icon: varchar("icon", { length: 100 }),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceLabel: varchar("price_label", { length: 100 }),
  featured: boolean("featured").default(false),
  order: integer("order").default(0),
});

// ─── Newsletter Subscribers ────────────────────────────────────────────────────
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true),
});

/* ==========================================================================
   Admin / staff area
   --------------------------------------------------------------------------
   Accounts, sessions, and the three interaction surfaces: client message
   threads, blog comments, and testimonial moderation.

   Roles are deliberately a plain varchar rather than a pg enum. Enums require
   a migration to add a value, and role lists grow; the allowed set is enforced
   in `src/lib/auth.ts` where it can be changed without a schema change.
   ========================================================================== */

// ─── Staff accounts ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  /** scrypt hash, stored as `salt:derivedKey` hex. Never a plaintext password. */
  passwordHash: text("password_hash").notNull(),
  /** "admin" | "consultant" */
  role: varchar("role", { length: 32 }).notNull().default("consultant"),
  title: varchar("title", { length: 255 }),
  avatarInitials: varchar("avatar_initials", { length: 4 }),
  /** Suspended accounts keep their history but cannot sign in. */
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Sessions ─────────────────────────────────────────────────────────────────
// Server-side sessions rather than a self-contained JWT: an admin suspending a
// consultant must take effect immediately, and a stateless token cannot be
// revoked before it expires.
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** SHA-256 of the cookie value. A leaked DB must not yield usable cookies. */
  tokenHash: text("token_hash").notNull().unique(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// ─── Staff activity log ───────────────────────────────────────────────────────
// Backs the "admin can monitor each consultant account" requirement: who did
// what, when, against which record.
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id", { length: 100 }),
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Client accounts ──────────────────────────────────────────────────────────
// Separate table from `users`. Staff and clients have different lifecycles and
// permissions, and merging them behind a role flag is how a client eventually
// ends up one bad query away from the admin area.
export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 50 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientSessions = pgTable("client_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// ─── Message threads ──────────────────────────────────────────────────────────
export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  /** Consultant currently handling this thread. Null = unassigned queue. */
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  subject: varchar("subject", { length: 500 }).notNull(),
  service: varchar("service", { length: 255 }),
  /** "open" | "waiting" | "closed" */
  status: varchar("status", { length: 32 }).notNull().default("open"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  /** Exactly one of these is set — enforced in the query layer. */
  authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
  authorClientId: uuid("author_client_id").references(() => clients.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  /** Staff-only note, never shown to the client. */
  internal: boolean("internal").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Blog comments ────────────────────────────────────────────────────────────
// Moderated by admins only, per the brief. Held at `pending` until approved so
// nothing publishes unreviewed.
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }).notNull(),
  body: text("body").notNull(),
  /** "pending" | "approved" | "rejected" */
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
  moderatedAt: timestamp("moderated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
