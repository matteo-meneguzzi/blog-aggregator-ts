import { db } from '..';
import { feeds } from '../schema';
import { eq } from "drizzle-orm";
import { Feed } from '../../helpers';

export async function createFeed (name: string, url: string, user_id: string):
    Promise<Feed>  
{

    const [result] = await db.insert(feeds).values({ name, url, user_id }).returning();
    return result;
}

export async function getFeedName (name: string): Promise<Feed>
{
    const [result] = await db.select().from(feeds).where(eq(feeds.name, name))
    return result;
}

export async function getFeeds (): Promise<Feed[]>
{
    const result = await db.select().from(feeds)
    return result;
}

export async function deleteAllFeeds (): Promise<void>
{
    await db.delete(feeds);
}