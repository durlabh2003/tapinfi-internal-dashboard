import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { slotId, values } = await req.json();

    const slotIdNumber = Number(slotId);

    if (!slotIdNumber || !Array.isArray(values)) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    /* =========================
       STEP 1 — Fetch Slot
    ========================== */

    const slot = await prisma.campaignSlot.findUnique({
      where: { slot_id: slotIdNumber },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 }
      );
    }

    const isWhatsapp =
      slot.campaign_type === "WhatsApp";

    const model = isWhatsapp
      ? prisma.whatsappContact
      : prisma.emailContact;

    const field = isWhatsapp
      ? "contact_number"
      : "email_id";

    /* =========================
       STEP 2 — Transaction Safe
    ========================== */

    await prisma.$transaction(async (tx) => {

      // Remove slotId from each failed contact
      for (const value of values) {

        const record = await tx[
          isWhatsapp
            ? "whatsappContact"
            : "emailContact"
        ].findUnique({
          where: { [field]: value },
        });

        if (!record) continue;

        const updatedSlots =
          record.slot_array.filter(
            (s: number) => s !== slotIdNumber
          );

        await tx[
          isWhatsapp
            ? "whatsappContact"
            : "emailContact"
        ].update({
          where: { id: record.id },
          data: { slot_array: updatedSlots },
        });
      }

      // Update slot tuple_of_values
      const updatedTuple =
        slot.tuple_of_values.filter(
          (v: string) => !values.includes(v)
        );

      await tx.campaignSlot.update({
        where: { slot_id: slotIdNumber },
        data: {
          tuple_of_values: updatedTuple,
          count: updatedTuple.length,
        },
      });
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Report Failed Error:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
