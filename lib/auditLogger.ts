import { prisma } from "./prisma";

export async function logAudit(
  user: string,
  action: string,
  entity: string
) {
  await prisma.auditLog.create({
    data: {
      user_email: user,
      action_type: action,
      entity,
    },
  });
}
