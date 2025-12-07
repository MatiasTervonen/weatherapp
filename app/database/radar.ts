"use server";

import { supabaseClient } from "@/utils/supabase/supabaseClient";

export async function getRadar() {
  const { data, error } = await supabaseClient
    .from("radar_frames")
    .select("ts, path, coords")
    .order("ts", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error("Error fetching radar frames");
  }

  const radarData = data
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    .map((item) => ({
      ...item,
      path: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/radar_images/${item.path}`,
    }));

  return radarData;
}
