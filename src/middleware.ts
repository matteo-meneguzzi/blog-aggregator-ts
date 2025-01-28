import { CommandHandler } from "./commands/commands";
import { readConfig } from "./config";
import { getUser } from "./db/queries/users";
import { User } from "./helpers";

type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export function middlewareLoggedIn (handler: UserCommandHandler): CommandHandler
{
    return async function (cmdName: string, ...args: string[]): Promise<void>
    {
        const config = readConfig();
        const currentUser = config.currentUserName
        if (currentUser === "" || !currentUser)
        {
            throw new Error(`No user is currently logged in`);
        }
        const user = await getUser(currentUser)
        if (!user)
        {
            throw new Error(`User "${ currentUser }" not found in the database`);
        }

        await handler(cmdName, user, ...args);
    };
}
