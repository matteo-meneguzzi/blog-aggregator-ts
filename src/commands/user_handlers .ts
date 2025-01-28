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
