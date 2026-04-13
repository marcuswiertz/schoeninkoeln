import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const logoFiles: Record<string, string> = {
  "von-lupin": "VonLupinLogo.jpg",
  "a-natural-difference": "ANDLogo.png",
  "i-m-naturkosmetik": "IundMLogo.jpg"
};

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const fileName = logoFiles[slug];

  if (!fileName) {
    return new NextResponse("Logo nicht gefunden.", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "Logos", fileName);

  try {
    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": fileName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch {
    return new NextResponse("Logo konnte nicht geladen werden.", { status: 500 });
  }
}
