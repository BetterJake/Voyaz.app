"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoBanOutline } from "react-icons/io5";
import { createClient } from "@/utils/supabase/client";
import { useSocialActions } from "@/features/social/hooks/useSocialActions";

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface BlockedSectionProps {
  userId: string;
}

export function BlockedSection({ userId }: BlockedSectionProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const socialActions = useSocialActions({
    currentUserId: userId,
    targetUserId: "",
  });

  const fetchBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blocks")
        .select(
          `
          id,
          blocked_id,
          created_at,
          profiles:blocked_id (
            username,
            avatar_url
          )
        `
        )
        .eq("blocker_id", userId);
      if (error) throw error;
      setBlockedUsers((data as any[]) || []);
    } catch (err) {
      console.error("Error fetching blocked users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [userId]);

  const handleUnblock = async (blockId: string, blockedUserId: string) => {
    try {
      // Optimistic update
      setBlockedUsers((prev) => prev.filter((u) => u.id !== blockId));
      await socialActions.unblockUser(blockedUserId);
    } catch (err) {
      console.error("Failed to unblock:", err);
      fetchBlockedUsers();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-2">
          Blocked Users
        </h2>
        <p className="text-gray-500 font-medium">
          Manage accounts you&apos;ve blocked. Blocked users cannot see your profile or interact
          with you.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
              Loading blocked list...
            </p>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
              <IoBanOutline size={40} />
            </div>
            <div>
              <p className="text-gray-900 font-black uppercase tracking-tight">No blocked users</p>
              <p className="text-gray-500 text-sm font-medium">
                Your block list is currently empty.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {blockedUsers.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shadow-inner">
                      {user.profiles?.avatar_url ? (
                        <img
                          src={user.profiles.avatar_url}
                          alt={user.profiles.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-black">
                          {user.profiles?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-black uppercase tracking-tight leading-none mb-1">
                        {user.profiles?.username || "Unknown User"}
                      </h4>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Blocked on {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id, user.blocked_id)}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/50 transition-all shadow-sm active:scale-95"
                  >
                    Unblock
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
