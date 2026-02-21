import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const hashed = await bcrypt.hash(
    "Admin@123",
    10
  );

  await prisma.user.create({
    data: {
      email: "durlabhdaryani70@gmail.com",
      password: hashed,
      role: "Durlabh@12",
    },
  });

  console.log("Admin created.");
}

main();
