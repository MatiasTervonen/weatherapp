import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

interface WarningData {
  time: string;
  title: string;
  description: string;
}

// Define the expected structure of the parsed JSON response
interface RSSFeed {
  rss: {
    channel: {
      item: RSSItem | RSSItem[]; // Handle both single and multiple warnings
    };
  };
}

interface RSSItem {
  pubDate: string;
  title: string;
  description: string;
  link: string;
}

export async function GET() {
  try {
    const url = "https://alerts.fmi.fi/cap/feed/rss_en-GB.rss";

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData: RSSFeed = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    // Ensure `item` is treated as an array (for consistent mapping)
    const items: RSSItem[] = Array.isArray(jsonData.rss.channel.item)
      ? jsonData.rss.channel.item
      : [jsonData.rss.channel.item];

    // Extract warnings into structured data
    const warnings: WarningData[] = items.map((item: RSSItem) => ({
      time: item.pubDate,
      title: item.title,
      description: item.description,
      link: item.link,
    }));

    return NextResponse.json(warnings);
  } catch (error) {
    console.error("Error fetching warning data:", error);
    return NextResponse.json(
      { error: "Failed to fetch warnings" },
      { status: 500 }
    );
  }
}
