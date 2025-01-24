import { RSSFeed, RSSItem } from "./types";
import { XMLParser } from "fast-xml-parser";

export async function fetchFeed (feedURL: string): Promise<RSSFeed>
{
    try
    {
        const response = await fetch(feedURL, {
            headers: {
                "User-Agent": "gator"
            }
        });

        if (!response.ok)
        {
            throw new Error(`failed to fetch feed: ${ response.status } ${ response.statusText }`);
        }

        const textFeed = await response.text()

        const xmlParser = new XMLParser();

        const jsConvertedXML = xmlParser.parse(textFeed);
        const rssFeed = jsConvertedXML.rss

        if (!isRSSFeed(rssFeed))
        {
            throw new Error(`fetched data is not coherent: ${ rssFeed }`);
        }

        const { title, link, description, item } = rssFeed.channel

        const actualRssFeed: RSSFeed = {
            channel: {
                title,
                link,
                description,
                item: []
            }
        }

        item.forEach((rssItem: any) =>
        {
            {
                if (isRSSItem(rssItem))
                {
                    actualRssFeed.channel.item.push(rssItem)
                }
            }
        })

        return actualRssFeed
    } catch (error)
    {
        if (error instanceof Error)
        {
            throw new Error(error.message);
        } else
        {
            throw new Error(`unexpected error fetching rss feed, ${ error }`)
        }
    }

}

export function isRSSItem (obj: any): obj is RSSItem
{
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.title === "string" &&
        typeof obj.link === "string" &&
        typeof obj.description === "string" &&
        typeof obj.pubDate === "string"
    );
}

export function isRSSFeed (obj: any): obj is RSSFeed
{
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.channel === "object" &&
        typeof obj.channel.title === "string" &&
        typeof obj.channel.link === "string" &&
        typeof obj.channel.description === "string" &&
        Array.isArray(obj.channel.item)
    );
}
