import { db } from '..';
import { User } from '../../helpers';
import { users } from '../schema';
import { eq } from "drizzle-orm";

export async function createUser (name: string):
    Promise<User>  
{

    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUserName (name: string): Promise<{ id: string; name: string; createdAt: Date; updatedAt: Date; }>
{
    const [result] = await db.select().from(users).where(eq(users.name, name))
    return result;
}

export async function getUsers (): Promise<{ id: string; name: string; createdAt: Date; updatedAt: Date; }[]>
{
    const result = await db.select().from(users)
    return result;
}

export async function deleteAllUsers (): Promise<void>
{
    await db.delete(users);
}