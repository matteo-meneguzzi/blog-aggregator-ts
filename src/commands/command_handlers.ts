import { readConfig, setUser } from "../config";
import { createFeed, createFeedFollow, getFeedFollowsForUser, getFeeds } from "../db/queries/feeds";
import { createUser, deleteAllUsers, getUser, getUsers } from "../db/queries/users";
import { printFeed, User } from "../helpers";
import { fetchFeed } from "../rss_feed";

export async function handlerLogin (cmdName: string, ...args: string[])
{
    const username = args[0];
    if (!username)
    {
        throw new Error("No username provided")
    }
    const userInDb = await getUser(username)
    if (!userInDb)
    {
        throw new Error(`User "${ username }" not found in the database`);
    }
    setUser(userInDb.name)
    console.log(`User ${ username } correctly logged in`);
}

export async function handlerRegister (cmdName: string, ...args: string[])
{
    const username = args[0];
    if (!username)
    {
        throw new Error("No username provided")
    } else
    {
        try
        {

            const result = await createUser(username)
            if (result)
            {
                setUser(username)
                const config = readConfig();
                if (config.currentUserName === username)
                {
                    console.log(`User ${ username } correctly logged in`);
                }
            }
        } catch (error)
        {
            if (error instanceof Error)
            {
                throw new Error(error.message);
            } else
            {
                throw new Error(`unexpected error creating user ${ username }, ${ error }`)
            }
        }
    }
}

export async function handlerReset (cmdName: string)
{
    try
    {
        const result = await deleteAllUsers()
    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error deleting users, ${ error }`)
        }
    }
}

export async function handlerListUsers (cmdName: string)
{
    const config = readConfig();
    try
    {
        const users = await getUsers()
        users.forEach(user =>
        {
            console.log(`- '${ user.name === config.currentUserName ?
                user.name + " (current)"
                : user.name }'`);
        })
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

export async function handlerAggregate (cmdName: string)
{
    try
    {
        const feedURL = 'https://www.wagslane.dev/index.xml';
        const feedData = await fetchFeed(feedURL)
        const feedDataStr = JSON.stringify(feedData, null, 2);

        console.log(feedDataStr);

        /*         console.log(`- '${ feed.channel.item[0].title }'`)
                console.log(`- '${ feed.channel.item[0].description }'`)
         */
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