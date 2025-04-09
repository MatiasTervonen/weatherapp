import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    revalidatePath("/"); // Revalidate the root path

    await fetch(`${process.env.BASE_URL}/?force-revalidate=${secret}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'cron-revalidate',
        },
      });

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { message: "Error revalidating", error },
      { status: 500 }
    );
  }
}
