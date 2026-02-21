import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { oldPassword, newPassword } =
    await req.json();

  const token =
    req.headers.get("cookie")?.split("token=")[1];

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const decoded: any = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  const valid = await bcrypt.compare(
    oldPassword,
    user.password
  );

  if (!valid) {
    return NextResponse.json(
      { message: "Wrong old password" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({
    success: true,
  });
}
