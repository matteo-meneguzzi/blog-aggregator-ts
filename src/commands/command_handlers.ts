import { readConfig, setUser } from "../config";
import { createUser, deleteAllUsers, getUserName, getUsers } from "../db/queries/users";
import { fetchFeed } from "../rss_feed";

export async function handlerLogin (cmdName: string, ...args: string[])
{
    const username = args[0];
    if (!username)
    {
        throw new Error("No username provided")
    }
    const userInDb = await getUserName(username)
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

export async function handlerReset (cmdName: string, ...args: string[])
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

export async function handlerListUsers (cmdName: string, ...args: string[])
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

export async function handlerAggregate (cmdName: string, ...args: string[])
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