import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const {
      channel,
      interval,
      duration,
      dataType,
      label,
      user,
      requiredCount, // <-- new: optional direct count
    } = await req.json();

    // Determine how many contacts to pull
    let required: number;

    if (requiredCount !== undefined && requiredCount !== null) {
      // Direct count mode
      required = Math.floor(Number(requiredCount));
      if (!required || required <= 0) {
        return NextResponse.json(
          { success: false, message: "Required count must be a positive number." },
          { status: 400 }
        );
      }
    } else {
      // Legacy duration/interval mode
      if (!interval || !duration) {
        return NextResponse.json(
          { success: false, message: "Provide either a required count or valid interval/duration values." },
          { status: 400 }
        );
      }
      required = Math.floor(duration / interval);
      if (required <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid interval/duration values — calculated count is 0." },
          { status: 400 }
        );
      }
    }

    const model =
      channel === "WhatsApp"
        ? prisma.whatsappContact
        : prisma.emailContact;

    const valueField =
      channel === "WhatsApp"
        ? "contact_number"
        : "email_id";

    /* =========================
       STEP 1 — Build Filter
    ========================== */

    const where: any = {};

    if (dataType === "New") {
      where.slot_array = {
        equals: [],
      };
    }

    if (dataType === "Old") {
      where.slot_array = {
        isEmpty: false,
      };
    }

    if (label) {
      where.labels = {
        has: label,
      };
    }

    /* =========================
       STEP 2 — Fetch Records
    ========================== */

    const selected = await model.findMany({
      where,
      take: required,
    });

    if (selected.length < required) {
      return NextResponse.json(
        {
          success: false,
          message: `Required: ${required}, Available: ${selected.length}`,
        },
        { status: 400 }
      );
    }

    const values = selected.map((record: any) =>
      record[valueField]
    );

    /* =========================
       STEP 3 — TRANSACTION SAFE
    ========================== */

    const slot = await prisma.$transaction(async (tx) => {
      const newSlot = await tx.campaignSlot.create({
        data: {
          campaign_type: channel,
          generated_by: user || "internal",
          count: required,
          label_associated: label ? [label] : [],
          tuple_of_values: values,
        },
      });

      for (const record of selected) {
        await tx[
          channel === "WhatsApp"
            ? "whatsappContact"
            : "emailContact"
        ].update({
          where: { id: record.id },
          data: {
            slot_array: [...record.slot_array, newSlot.slot_id],
          },
        });
      }

      return newSlot;
    });

    /* =========================
       STEP 4 — Generate Excel
    ========================== */

    const formattedData = values.map(
      (value: string, index: number) => ({
        Serial_No: index + 1,
        Slot_ID: slot.slot_id,
        Campaign_Type: channel,
        Value: value,
        Created_At: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "medium",
        }),
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
    console.error("Run Campaign Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
