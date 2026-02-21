import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({
      success: true,
    });
  }

  const token = crypto
    .randomBytes(32)
    .toString("hex");

  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetExpires: expiry,
    },
  });

  await sendResetEmail(email, token);

  return NextResponse.json({
    success: true,
  });
}
