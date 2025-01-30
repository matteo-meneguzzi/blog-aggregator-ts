import { feeds, users, feedFollows } from "../db/schema";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferSelect;

export async function printFeed (feed: Feed, user: User): Promise<void>
{
    console.log(`* ID:            ${ feed.id }`);
    console.log(`* Created:       ${ feed.createdAt }`);
    console.log(`* Updated:       ${ feed.updatedAt }`);
    console.log(`* Last fetched:  ${ feed.lastFetchedAt }`);
    console.log(`* name:          ${ feed.name }`);
    console.log(`* URL:           ${ feed.url }`);
    console.log(`* User:          ${ user.name }`);
}


export function parseDuration (durationStr: string): number
{
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if (!match) throw new Error("Invalid format. Use a number followed by ms, s, m or h.");

    if (match.length !== 3) throw new Error("Invalid format. Use a number followed by ms, s, m or h.");

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}

export function updateDuration (userInput: string): string
{
    const defaultDuration = "0h0m0s0ms"
    const unitsOrder = ["ms", "s", "m", "h"];
    const unitRegex = /(\d+)(ms|s|m|h)/;  // Regex to match value and unit in the input string

    const match = userInput.match(unitRegex);
    if (match)
    {
        const value = match[1];  // The numeric value (e.g., "1")
        const unit = match[2];   // The unit (e.g., "m")

        const userUnitIndex = unitsOrder.indexOf(unit);

        // Build the updated duration by including the user's unit and smaller units
        let updatedDuration = "";
        for (let i = userUnitIndex; i >= 0; i--)
        {
            const currentUnit = unitsOrder[i];
            // Set the value to the provided value for the user's unit, and 0 for the others
            updatedDuration += currentUnit === unit ? `${ value }${ currentUnit }` : `0${ currentUnit }`;
        }

        return updatedDuration;  // Return the formatted string with the relevant units
    }

    return defaultDuration;  // If no valid input, return the default duration
}