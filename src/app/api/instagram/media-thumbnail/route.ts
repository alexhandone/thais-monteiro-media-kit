import { NextResponse } from "next/server";

import { graphGet } from "@/lib/instagram/client";

type MediaAssetResponse = {
  thumbnail_url?: string | null;
  media_url?: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaId = searchParams.get("id");

  if (!mediaId || !/^\d+$/.test(mediaId)) {
    return NextResponse.json({ error: "Invalid media id." }, { status: 400 });
  }

  try {
    const media = await graphGet<MediaAssetResponse>(mediaId, {
      fields: "thumbnail_url,media_url",
    });
    const imageUrl = media.thumbnail_url ?? media.media_url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Media thumbnail unavailable." },
        { status: 404 },
      );
    }

    const response = NextResponse.redirect(imageUrl, 307);
    response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=1800");
    return response;
  } catch (error) {
    console.error("Unable to load Instagram media thumbnail", error);
    return NextResponse.json(
      { error: "Unable to load media thumbnail." },
      { status: 502 },
    );
  }
}
