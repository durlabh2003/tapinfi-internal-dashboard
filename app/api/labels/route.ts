import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { channel, value, label, user } =
      await req.json();

    const model =
      channel === "WhatsApp"
        ? prisma.whatsappContact
        : prisma.emailContact;

    const field =
      channel === "WhatsApp"
        ? "contact_number"
        : "email_id";

    const existing = await model.findUnique({
      where: {
        [field]: value,
      },
      select: {
        labels: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    const updatedLabels = Array.from(
      new Set([...(existing.labels || []), label])
    );

    await model.update({
      where: {
        [field]: value,
      },
      data: {
        labels: updatedLabels,
      },
    });

    // Log Audit
    await prisma.auditLog.create({
      data: {
        user: user || "internal",
        action: "ADD_LABEL",
        entity: value,
      },
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
