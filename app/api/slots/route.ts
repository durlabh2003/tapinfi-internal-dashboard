import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slots = await prisma.campaignSlot.findMany({
      orderBy: {
        slot_id: "desc",
      },
    });

    return NextResponse.json(slots);

  } catch (err) {
    console.error("Slots API Error:", err);
    return NextResponse.json([]);
  }
}
