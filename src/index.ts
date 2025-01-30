import { argv } from "process";
import { handlerAggregate, handlerAddFeed, handlerListFeeds, handlerListFollows, handlerFollow, handlerUnfollow, handlerBrowse } from "./commands/feed_handlers";
import { CommandsRegistry, registerCommand, runCommand } from "./commands/commands";
import { middlewareLoggedIn } from "./middleware";
import { handlerLogin, handlerRegister, handlerReset, handlerListUsers } from "./commands/user_handlers ";

async function main ()
{
    const commandsRegistry: CommandsRegistry = {}
    registerCommand(commandsRegistry, "login", handlerLogin)
    registerCommand(commandsRegistry, "register", handlerRegister)
    registerCommand(commandsRegistry, "reset", handlerReset)
    registerCommand(commandsRegistry, "users", handlerListUsers)
    registerCommand(commandsRegistry, "agg", handlerAggregate)
    registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed))
    registerCommand(commandsRegistry, "feeds", handlerListFeeds)
    registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow))
    registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow))
    registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerListFollows))
    registerCommand(commandsRegistry, "browse", middlewareLoggedIn(handlerBrowse))

    const args = argv.slice(2);
    if (args.length < 1)
    {
        console.log('usage: cli <command> [args...]');
        process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    try
    {
        await runCommand(commandsRegistry, cmdName, ...cmdArgs);
        console.log(`Command ${ cmdName } executed correctly`);
    } catch (err)
    {
        if (err instanceof Error)
        {
            console.error(`Error while running command ${ cmdName }: ${ err.message }`);
        } else
        {
            console.error(`Error while running command ${ cmdName }: ${ err }`);
        }
        process.exit(1);
    }
    process.exit(0);
}

main();