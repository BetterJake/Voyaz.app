"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
}

export async function deleteAccountAction() {
  const supabase = await createClient();

  // Call the delete_user RPC
  const { error: rpcError } = await supabase.rpc("delete_user");
  if (rpcError) {
    throw new Error(rpcError.message);
  }

  // Sign out locally on the server to clear cookies
  await supabase.auth.signOut();

  return redirect("/login");
}
