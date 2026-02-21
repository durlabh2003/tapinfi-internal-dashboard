import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(logs);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}
