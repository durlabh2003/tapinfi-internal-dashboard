import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

    const fileName = `slot_${slotId}.xlsx`;

    const { data, error } = await supabaseServer.storage
      .from("slot-files")
      .download(fileName);

    if (error || !data) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
