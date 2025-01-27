import { db } from '..';
import { feeds, users } from '../schema';
import { eq } from "drizzle-orm";
import { Feed, User } from '../../helpers';

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

export async function getFeeds (): Promise<{ name: string; url: string; user_name: string | null; }[]>
{
    const result: { name: string; url: string; user_name: string | null; }[] = await db.select({ name: feeds.name, url: feeds.url, user_name: users.name }).from(feeds).leftJoin(users, eq(feeds.user_id, users.id));
    return result;
}

export async function deleteAllFeeds (): Promise<void>
{
    await db.delete(feeds);
}