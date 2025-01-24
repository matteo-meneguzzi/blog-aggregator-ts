export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>

export function registerCommand (registry: CommandsRegistry, cmdName: string, handler: CommandHandler)
{
    registry[cmdName] = handler
}

export async function runCommand (registry: CommandsRegistry, cmdName: string, ...args: string[])
{
    const commandHandler = registry[cmdName]
    if (!commandHandler)
    {
        throw new Error(`Unknown command: ${ cmdName }`);
    }
    await commandHandler(cmdName, ...args);
}