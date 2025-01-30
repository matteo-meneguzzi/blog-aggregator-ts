import { db } from '..';
import { feedFollows, feeds, users } from '../schema';
import { and, eq, asc, sql } from "drizzle-orm";
import { Feed, FeedFollow, User } from '../../helpers';

export async function createFeed (name: string, url: string):
    Promise<Feed>  
{

    const [result] = await db.insert(feeds).values({ name, url }).returning();
    console.log("🚀 ~ result:", result)
    return result;
}

export async function getFeedName (name: string): Promise<Feed>
{
    const [result] = await db.select().from(feeds).where(eq(feeds.name, name))
    return result;
}

export async function getFeeds (): Promise<{ name: string | null; url: string | null; userName: string | null; }[]>
{
    const result = await db.select({ name: feeds.name, url: feeds.url, userName: users.name }).from(feedFollows)
        .leftJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .leftJoin(users, eq(feedFollows.userId, users.id));
    return result;
}

export async function deleteAllFeeds (): Promise<void>
{
    await db.delete(feeds);
}

type FeedFollowResponse = Omit<FeedFollow, "id"> & {
    followId: FeedFollow["id"], userName: string, feedName: string
}

export async function createFeedFollow (url: string, userId: string):
    Promise<FeedFollowResponse>  
{
    const [feedResult] = await db.select().from(feeds).where(eq(feeds.url, url))

    await db.insert(feedFollows).values({ feedId: feedResult.id, userId });
    const [followResult] = await db.select({
        followId: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        userId: feedFollows.userId,
        feedId: feedFollows.feedId,
        userName: users.name,
        feedName: feeds.name
    }).from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id)).where(eq(feeds.url, url));

    return followResult;
}

export async function deleteFeedFollow (url: string, userId: string):
    Promise<FeedFollow>  
{
    const [feedResult] = await db.select().from(feeds).where(eq(feeds.url, url))

    const [deletedFollow] = await db.delete(feedFollows).where(and(eq(feedFollows.feedId, feedResult.id), eq(feedFollows.userId, userId))).returning();

    return deletedFollow;
}

export async function getFeedFollowsForUser (userId: string):
    Promise<FeedFollowResponse[]>  
{
    const result = await db.select({
        followId: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        userId: feedFollows.userId,
        userName: users.name,
        feedId: feedFollows.feedId,
        feedName: feeds.name
    }).from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id)).where(eq(users.id, userId));

    return result;
}

export async function markFeedFetched (feedId: string):
    Promise<Feed>  
{
    const now = new Date();
    const nowToDate = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);


    const [updatedFeed] = await db.update(feeds)
        .set({ lastFetchedAt: nowToDate })
        .where(eq(feeds.id, feedId))
        .returning();

    return updatedFeed
}

export async function getNextFeedToFetch ():
    Promise<Feed>  
{
    const [feedToFetch] = await db.execute(sql`select * from ${ feeds } order by ${ feeds.lastFetchedAt } asc nulls first`)

    console.log("🚀 ~ feedToFetch:", feedToFetch)
    return feedToFetch as Feed
}   