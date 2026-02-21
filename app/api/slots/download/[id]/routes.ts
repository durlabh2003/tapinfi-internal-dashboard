import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slotId = Number(params.id);

    if (!slotId) {
      return NextResponse.json(
        { message: "Invalid Slot ID" },
        { status: 400 }
      );
    }

    /* =========================
       Fetch Slot From DB
    ========================== */

    const slot = await prisma.campaignSlot.findUnique({
      where: { slot_id: slotId },
    });

    if (!slot) {
      return NextResponse.json(
        { message: "Slot not found" },
        { status: 404 }
      );
    }

    /* =========================
       Generate Excel Dynamically
    ========================== */

    const formattedData = slot.tuple_of_values.map(
      (value: string, index: number) => ({
        Serial_No: index + 1,
        Slot_ID: slot.slot_id,
        Campaign_Type: slot.campaign_type,
        Value: value,
        Created_At: slot.created_at.toLocaleString(),
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SlotData");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const fileName = `slot_${slot.slot_id}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (err: any) {
    console.error("Slot Download Error:", err);

    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
