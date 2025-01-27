import { argv } from "process";
import { handlerLogin, handlerRegister, handlerReset, handlerListUsers, handlerAggregate, handlerAddFeed, handlerListFeeds } from "./commands/command_handlers";
import { CommandsRegistry, registerCommand, runCommand } from "./commands/commands";

async function main ()
{
    const commandsRegistry: CommandsRegistry = {}
    registerCommand(commandsRegistry, "login", handlerLogin)
    registerCommand(commandsRegistry, "register", handlerRegister)
    registerCommand(commandsRegistry, "reset", handlerReset)
    registerCommand(commandsRegistry, "users", handlerListUsers)
    registerCommand(commandsRegistry, "agg", handlerAggregate)
    registerCommand(commandsRegistry, "addfeed", handlerAddFeed)
    registerCommand(commandsRegistry, "feeds", handlerListFeeds)

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