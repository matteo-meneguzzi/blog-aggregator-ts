import { createFeed, createFeedFollow, deleteFeedFollow, getFeedFollowsForUser, getFeeds, getNextFeedToFetch, markFeedFetched } from "../db/queries/feeds";
import { createPost, getPostsForUser } from "../db/queries/posts";
import { parseDuration, parseExternalDate, printFeed, updateDuration, User } from "../helpers";
import { fetchFeed } from "../rss_feed";

export async function handlerAggregate (cmdName: string, ...args: string[])
{
    if (args.length !== 1)
    {
        throw new Error(`usage: ${ cmdName } <time_between_reqs>`);
    }

    const timeBetweenRequests = args[0]
    const numericDuration = parseDuration(timeBetweenRequests)
    const currentDuration = updateDuration(timeBetweenRequests)
    console.log("Collecting feeds every ", currentDuration);

    try
    {
        await scrapeFeeds()

        const interval = setInterval(scrapeFeeds, numericDuration);

        await new Promise<void>((resolve) =>
        {
            process.on('SIGINT', () =>
            {
                console.log('Shutting down feed aggregator...');
                clearInterval(interval);
                resolve();
            });
        });
    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error listing users, ${ error }`)
        }
    }
}

export async function handlerAddFeed (cmdName: string, user: User, ...args: string[])
{
    if (args.length !== 2)
    {
        throw new Error(`usage: ${ cmdName } <feed_name> <url>`);
    }

    const feedName = args[0];
    const url = args[1];
    if (!feedName)
    {
        throw new Error(`No feed name provided`);
    }
    if (!url)
    {
        throw new Error(`No feed url provided`);
    }

    try
    {
        const feed = await createFeed(feedName, url);
        if (!feed)
        {
            throw new Error(`Failed to create feed`);
        }

        console.log('Feed created successfully:');
        printFeed(feed, user);

        const follow = await createFeedFollow(url, user.id);
        if (!follow)
        {
            throw new Error(`Failed to create follow`);
        }

        console.log(`Successfully added feed "${ feed.name }" and followed it as user "${ user.name }"`);

    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error creating feed, ${ error }`)
        }
    }
}

export async function handlerListFeeds (cmdName: string)
{
    try
    {

        const feeds = await getFeeds()
        if (feeds.length === 0)
        {
            console.log(`No feeds found.`);
            return;
        }

        const feedDataStr = JSON.stringify(feeds, null, 2);

        console.log(feedDataStr);
    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error listing feeds, ${ error }`)
        }
    }
}

export async function handlerFollow (cmdName: string, user: User, ...args: string[])
{
    if (args.length !== 1)
    {
        throw new Error(`usage: ${ cmdName } <url>`);
    }

    const url = args[0];

    try
    {
        const follow = await createFeedFollow(url, user.id);
        if (!follow)
        {
            throw new Error(`Failed to create follow`);
        }

        console.log('Follow created successfully:');
        console.log(follow.feedName);
        console.log(follow.userName);
    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error handling follow operation, ${ error }`)
        }
    }
}

export async function handlerUnfollow (cmdName: string, user: User, ...args: string[])
{
    if (args.length !== 1)
    {
        throw new Error(`usage: ${ cmdName } <url>`);
    }

    const url = args[0];

    try
    {
        const result = await deleteFeedFollow(url, user.id);
        if (!result)
        {
            throw new Error(`Failed to create follow`);
        }
        console.log("Successfully deleted follow:", result)

    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error handling follow operation, ${ error }`)
        }
    }
}

export async function handlerListFollows (cmdName: string, user: User)
{
    try
    {
        const follows = await getFeedFollowsForUser(user.id)
        if (follows.length === 0)
        {
            console.log(`No feeds found.`);
            return;
        }

        follows.forEach(follow => console.log("Feed name: " + follow.feedName))

    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error listing follows, ${ error }`)
        }
    }
}

export async function scrapeFeeds ()
{
    try
    {
        const nextFeed = await getNextFeedToFetch()
        if (!nextFeed)
        {
            throw new Error(`Failed to fetch next feed`);
        }
        console.log("Successfully fetched next feed:", nextFeed)
        const updatedFeed = await markFeedFetched(nextFeed.id)
        if (!updatedFeed)
        {
            throw new Error(`Failed to update next feed`);
        }
        console.log("Successfully updated next feed:", updatedFeed)

        const feedData = await fetchFeed(nextFeed.url)
        const feedDataStr = JSON.stringify(feedData, null, 2);

        console.log(feedDataStr);

        feedData.channel.item.forEach(item =>
        {
            try
            {
                createPost(nextFeed.id, item.title, item.link, new Date(item.pubDate), item.description)
            } catch (error)
            {
                if (error instanceof Error)
                {
                    if (error.message.includes("duplicate"))
                    {
                        return
                    }
                    console.log(error);

                } else
                {
                    throw new Error(`unexpected error handling follow operation, ${ error }`)
                }
            }
        })
    } catch (error)
    {
        if (error instanceof Error)
        {
            throw error;
        } else
        {
            throw new Error(`unexpected error handling scraping feeds, ${ error }`)
        }
    }
}

export async function handlerBrowse (cmdName: string, user: User, ...args: string[])
{
    let limit = 2;
    if (args.length > 1)
    {
        throw new Error(`usage: ${ cmdName } [limit]`);
    }

    if (args.length === 1)
    {
        limit = parseInt(args[0]);
    }

    try
    {
        const posts = await getPostsForUser(user.id, limit)
        if (posts.length === 0)
        {
            console.log(`No posts found.`);
            return;
        }

        console.log(`Found ${ posts.length } posts for user ${ user.name }`);
        for (let post of posts)
        {
            console.log(`${ post.publishedAt } from ${ post.feedName }`);
            console.log(`--- ${ post.title } ---`);
            console.log(`    ${ post.description }`);
            console.log(`Link: ${ post.url }`);
            console.log(`=====================================`);
        }

    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error listing follows, ${ error }`)
        }
    }
}