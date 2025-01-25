import { getUserName } from "../db/queries/users";
import { feeds, users } from "../db/schema";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;


export async function printFeed (feed: Feed, user: User): Promise<void>
{
    console.log(`* ID:            ${ feed.id }`);
    console.log(`* Created:       ${ feed.createdAt }`);
    console.log(`* Updated:       ${ feed.updatedAt }`);
    console.log(`* name:          ${ feed.name }`);
    console.log(`* URL:           ${ feed.url }`);
    console.log(`* User:          ${ user.name }`);
}