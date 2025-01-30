import { relations } from "drizzle-orm";
import { foreignKey, pgTable, primaryKey, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
    feed_follows: many(feedFollows),
}));

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    lastFetchedAt: timestamp("last_fetched_at")
        .$onUpdate(() => new Date()),
});

export const feedsRelations = relations(feeds, ({ many }) => ({
    feed_follows: many(feedFollows),
}));

export const feedFollows = pgTable(
    'feed_follows',
    {
        id: uuid('id').primaryKey().defaultRandom().notNull(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        feedId: uuid('feed_id')
            .notNull()
            .references(() => feeds.id, { onDelete: 'cascade' }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    },
    (t) => [{
        unq: unique().on(t.userId, t.feedId)
    }],
);

export const usersToFeedsRelations = relations(feedFollows, ({ one }) => ({
    feed: one(feeds, {
        fields: [feedFollows.feedId],
        references: [feeds.id],
    }),
    user: one(users, {
        fields: [feedFollows.userId],
        references: [users.id],
    }),
}));