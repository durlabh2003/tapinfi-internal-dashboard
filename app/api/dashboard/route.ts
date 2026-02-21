import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    /* =========================
       WhatsApp Counts
    ========================== */

    const whatsappTotal = await prisma.whatsappContact.count();

    const whatsappUsed = await prisma.whatsappContact.count({
      where: {
        slot_array: {
          isEmpty: false,
        },
      },
    });

    /* =========================
       Email Counts
    ========================== */

    const emailTotal = await prisma.emailContact.count();

    const emailUsed = await prisma.emailContact.count({
      where: {
        slot_array: {
          isEmpty: false,
        },
      },
    });

    /* =========================
       Slot Counts
    ========================== */

    const totalSlots = await prisma.campaignSlot.count();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await prisma.campaignSlot.count({
      where: {
        created_at: {
          gte: todayStart,
        },
      },
    });

    /* =========================
       Recent Slots
    ========================== */

    const recentSlots = await prisma.campaignSlot.findMany({
      select: {
        slot_id: true,
        campaign_type: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 5,
    });

    return NextResponse.json({
      whatsapp: {
        total: whatsappTotal,
        used: whatsappUsed,
        unused: whatsappTotal - whatsappUsed,
      },
      email: {
        total: emailTotal,
        used: emailUsed,
        unused: emailTotal - emailUsed,
      },
      slots: {
        total: totalSlots,
        today: todayCount,
      },
      recentSlots,
    });

  } catch (err) {
    console.error("Dashboard API error:", err);

    return NextResponse.json({
      whatsapp: { total: 0, used: 0, unused: 0 },
      email: { total: 0, used: 0, unused: 0 },
      slots: { total: 0, today: 0 },
      recentSlots: [],
    });
  }
}
