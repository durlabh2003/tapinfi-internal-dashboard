import { supabaseServer } from "./supabaseServer";

export async function logAudit(
  user: string,
  action: string,
  entity: string
) {
  await supabaseServer.from("audit_logs").insert({
    user_email: user,
    action_type: action,
    entity,
  });
}
