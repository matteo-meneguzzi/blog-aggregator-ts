import { db } from '..';
import { feedFollows, feeds, posts, users } from '../schema';
import { eq, desc } from "drizzle-orm";
import { Post } from '../../helpers';

export async function createPost (feedId: string, title: string, url: string, publishedAt: Date, description?: string):
    Promise<Post | Record<string, string> | void> 
{
    try
    {
        const [result] = await db.insert(posts).values({ feedId, title, url, description, publishedAt }).returning();
        console.log("🚀 ~ created post:", result)
        return result;
    } catch (error)
    {
        if (error instanceof Error)
        {
            if (error.message.includes("duplicate"))
            {
                console.log(`Duplicate post URL detected: ${ url }`);
                return { error: "duplicate_entry" }; // Makes the response meaningful
            }
            console.error(error); // Log unexpected errors
        } else
        {
            throw new Error(`unexpected error handling follow operation, ${ error }`)
        }
    }

}

type getPostsForUserResponse = Post & {
    feedName: string
}
export async function getPostsForUser (userId: string, limit: number):
    Promise<getPostsForUserResponse[]>  
{
    const result = await db.select({
        id: posts.id,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        title: posts.title,
        url: posts.url,
        description: posts.description,
        publishedAt: posts.publishedAt,
        feedId: posts.feedId,
        feedName: feeds.name,
    }).from(posts).innerJoin(feeds, eq(posts.feedId, feeds.id))
        .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
        .orderBy(desc(posts.publishedAt)).limit(limit).where(eq(feedFollows.userId, userId));

    return result;
}