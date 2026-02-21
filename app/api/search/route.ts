import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json(
        { message: "Query is required" },
        { status: 400 }
      );
    }

    const q = query.trim();
    const slotIdNum = parseInt(q, 10);

    // Search WhatsApp contacts by contact number or label
    const whatsapp = await prisma.whatsappContact.findMany({
      where: {
        OR: [
          { contact_number: { contains: q, mode: "insensitive" } },
          { labels: { has: q } },
        ],
      },
      take: 50,
    });

    // Search Email contacts by email or label
    const email = await prisma.emailContact.findMany({
      where: {
        OR: [
          { email_id: { contains: q, mode: "insensitive" } },
          { labels: { has: q } },
        ],
      },
      take: 50,
    });

    // Search Campaign Slots by slot ID (if numeric) or label
    const slot = await prisma.campaignSlot.findMany({
      where: {
        OR: [
          ...(!isNaN(slotIdNum) ? [{ slot_id: slotIdNum }] : []),
          { label_associated: { has: q } },
          { generated_by: { contains: q, mode: "insensitive" } },
          { campaign_type: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    });

    return NextResponse.json({ whatsapp, email, slot });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
