import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session } from "../types";
export function useSessions(activeTab: string) {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const supabase = createClient();
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        try {
          const payload = JSON.parse(atob(session.access_token.split(".")[1]));
          setCurrentSessionId(payload.session_id);
        } catch (e) {
          console.error("Could not parse session ID");
        }
      }
      const { data, error } = await supabase.rpc("get_my_sessions");
      if (error) throw error;
      if (data) {
        setActiveSessions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [supabase]);
  useEffect(() => {
    if (activeTab === "security") {
      loadSessions();
    }
  }, [activeTab, loadSessions]);
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.rpc("delete_my_session", { session_id: sessionId });
      if (error) throw error;
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      return { success: true };
    } catch (error: any) {
      console.error("Error revoking session:", error);
      return { success: false, error: error.message };
    }
  };
  const handleLogoutAllOtherDevices = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      await loadSessions();
      return { success: true };
    } catch (error: any) {
      console.error("Error logging out of other devices:", error);
      return { success: false, error: error.message };
    }
  };
  return {
    activeSessions,
    isLoadingSessions,
    currentSessionId,
    loadSessions,
    handleRevokeSession,
    handleLogoutAllOtherDevices,
  };
}
