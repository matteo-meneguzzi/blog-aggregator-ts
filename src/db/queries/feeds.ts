import { db } from '..';
import { feed_follows, feeds, users } from '../schema';
import { and, eq } from "drizzle-orm";
import { Feed, User } from '../../helpers';

export async function createFeed (name: string, url: string):
    Promise<Feed>  
{

    const [result] = await db.insert(feeds).values({ name, url }).returning();
    return result;
}

export async function getFeedName (name: string): Promise<Feed>
{
    const [result] = await db.select().from(feeds).where(eq(feeds.name, name))
    return result;
}

export async function getFeeds (): Promise<{ name: string | null; url: string | null; userName: string | null; }[]>
{
    const result: { name: string | null; url: string | null; userName: string | null; }[] = await db.select({ name: feeds.name, url: feeds.url, userName: users.name }).from(feed_follows)
        .leftJoin(feeds, eq(feed_follows.feedId, feeds.id))
        .leftJoin(users, eq(feed_follows.userId, users.id));
    return result;
}

export async function deleteAllFeeds (): Promise<void>
{
    await db.delete(feeds);
}

export async function createFeedFollow (url: string, userId: string):
    Promise<{ followId: string; createdAt: Date; updatedAt: Date; userId: string; feedId: string; userName: string | null; feedName: string | null; }>  
{
    const [feedResult] = await db.select().from(feeds).where(eq(feeds.url, url))
    console.log("🚀 ~ feedResult:", feedResult)
    console.log("🚀 ~ userId:", userId)
    await db.insert(feed_follows).values({ feedId: feedResult.id, userId });
    const [followResult] = await db.select({
        followId: feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        userId: feed_follows.userId,
        feedId: feed_follows.feedId,
        userName: users.name,
        feedName: feeds.name
    }).from(feed_follows)
        .innerJoin(users, eq(feed_follows.userId, users.id))
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id)).where(eq(feeds.url, url));

    console.log("🚀 ~ followResult:", followResult)

    return followResult;
}

export async function deleteFeedFollow (url: string, userId: string):
    Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        feedId: string;
    }>  
{
    const [feedResult] = await db.select().from(feeds).where(eq(feeds.url, url))
    console.log("🚀 ~ feedResult:", feedResult)
    console.log("🚀 ~ userId:", userId)
    const [deletedFollow] = await db.delete(feed_follows).where(and(eq(feed_follows.feedId, feedResult.id), eq(feed_follows.userId, userId))).returning();
    console.log("🚀Successfully deleted follow:", deletedFollow)

    return deletedFollow;
}

export async function getFeedFollowsForUser (userId: string):
    Promise<{ followId: string; createdAt: Date; updatedAt: Date; userId: string; feedId: string; userName: string | null; feedName: string | null; }[]>  
{
    const result = await db.select({
        followId: feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        userId: feed_follows.userId,
        userName: users.name,
        feedId: feed_follows.feedId,
        feedName: feeds.name
    }).from(feed_follows)
        .innerJoin(users, eq(feed_follows.userId, users.id))
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id)).where(eq(users.id, userId));

    return result;
}
