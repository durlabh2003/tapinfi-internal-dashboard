import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

const CHUNK_SIZE = 10000;

export async function POST(req: Request) {
  try {
    const { channel, values } = await req.json();

    if (!values || !Array.isArray(values)) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const isWhatsapp = channel === "WhatsApp";

    const model = isWhatsapp
      ? prisma.whatsappContact
      : prisma.emailContact;

    const field = isWhatsapp
      ? "contact_number"
      : "email_id";

    /* =========================
       CLEAN & VALIDATE
    ========================== */

    const cleaned = values.map((v: any) => {
      let str = String(v || "").trim();
      str = str.replace(/^(\+91|91)/, "");
      str = str.replace(/\D/g, "");
      return str;
    });

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const value of cleaned) {
      if (isWhatsapp) {
        if (value.length === 10) valid.push(value);
        else invalid.push(value);
      } else {
        // Basic email validation
        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) valid.push(value);
        else invalid.push(value);
      }
    }

    /* =========================
       INSERT IN CHUNKS
    ========================== */

    let totalInserted = 0;

    for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
      const batch = valid
        .slice(i, i + CHUNK_SIZE)
        .map((value) => ({
          [field]: value,
          slot_array: [],
          labels: [],
        }));

      const result = await model.createMany({
        data: batch,
        skipDuplicates: true,
      });

      totalInserted += result.count;
    }

    const duplicates = valid.length - totalInserted;

    /* =========================
       GENERATE FAILED FILE (if needed)
    ========================== */

    let failedFileBuffer: Buffer | null = null;

    if (invalid.length > 0) {
      const failedList = invalid.map((v) => ({
        value: v,
        reason: "Invalid Format",
      }));

      const worksheet =
        XLSX.utils.json_to_sheet(failedList);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "FailedContacts"
      );

      failedFileBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
    }

    /* =========================
       RETURN RESPONSE
    ========================== */

    return NextResponse.json({
      success: true,
      totalReceived: values.length,
      valid: valid.length,
      inserted: totalInserted,
      duplicates,
      invalid: invalid.length,
      failedFile:
        failedFileBuffer
          ? failedFileBuffer.toString("base64")
          : null,
    });

  } catch (err: any) {
    console.error("Upload API error:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
