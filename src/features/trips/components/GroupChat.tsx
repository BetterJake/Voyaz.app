"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAblyContext } from "@/context/AblyContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  IoSend,
  IoChatbubbleOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { notifyNewMessage } from "@/features/social/api/notifications";
interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  text: string;
  timestamp: number;
}
interface GroupChatProps {
  tripId: string;
  tripTitle: string;
}
export function GroupChat({ tripId, tripTitle }: GroupChatProps) {
  const { realtime } = useAblyContext();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<{
    displayName: string;
    avatarUrl: string;
  }>({
    displayName: "Traveler",
    avatarUrl: "",
  });
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, username, avatar_url")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;
        const finalName =
          [data?.first_name, data?.last_name].filter(Boolean).join(" ") ||
          data?.username ||
          ((user as any).user_metadata?.first_name && (user as any).user_metadata?.last_name)
            ? `${(user as any).user_metadata.first_name} ${(user as any).user_metadata.last_name}`
            : (user as any).user_metadata?.username ||
              (user as any).user_metadata?.full_name ||
              "Traveler";
        setProfile({
          displayName: finalName,
          avatarUrl: data?.avatar_url || (user as any).user_metadata?.avatar_url || "",
        });
      } catch (err) {
        console.warn("Profile fetch failed, using metadata fallback:", err);
        const metadataName =
          (user as any).user_metadata?.first_name && (user as any).user_metadata?.last_name
            ? `${(user as any).user_metadata.first_name} ${(user as any).user_metadata.last_name}`
            : (user as any).user_metadata?.username ||
              (user as any).user_metadata?.full_name ||
              "Traveler";
        setProfile({
          displayName: metadataName,
          avatarUrl: (user as any).user_metadata?.avatar_url || "",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user, supabase]);
  useEffect(() => {
    if (!realtime || !tripId || !user) return;
    const channelName = `trip-chat-${tripId}`;
    const channel = realtime.channels.get(channelName);
    channelRef.current = channel;
    channel.on("failed", () => setError("Connection failed."));
    channel.on("attached", () => setError(null));
    try {
      channel.subscribe("message", (msg: any) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.data.id)) return prev;
          return [...prev, msg.data];
        });
      });
    } catch (err) {
      setError("Subscription failed.");
    }
    return () => {
      channel.unsubscribe();
      channel.off();
    };
  }, [realtime, tripId, user]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !channelRef.current || !user || error) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender_id: user.id,
      sender_name: profile.displayName,
      sender_avatar: profile.avatarUrl,
      text: inputValue,
      timestamp: Date.now(),
    };
    try {
      channelRef.current.publish("message", newMessage);
      setInputValue("");
      notifyNewMessage(tripId, tripTitle, inputValue);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };
  return (
    <div className="fixed bottom-6 right-6 z-[200]" id="group-chat-root">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-black uppercase tracking-tight text-sm flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="text-blue-400" /> {tripTitle}
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Voyaz Group Chat
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <IoChatbubbleOutline size={16} />
              </button>
            </div>
            <div className="bg-blue-50 py-1 flex items-center justify-center border-b border-blue-100/50">
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">
                Voyaz Premium Network Active
              </span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-rose-500 p-8">
                  <IoAlertCircleOutline size={40} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <IoChatbubbleOutline size={40} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    No messages yet.
                    <br />
                    Start the journey!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} items-end`}
                    >
                      <div className="shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 shadow-sm ${isMe ? "border-blue-100" : "border-gray-50"}`}
                        >
                          <img
                            src={
                              msg.sender_avatar ||
                              `https://ui-avatars.com/api/?name=${msg.sender_name}&background=random`
                            }
                            alt={msg.sender_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://ui-avatars.com/api/?name=${msg.sender_name}&background=random`;
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}
                      >
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 mx-1">
                          {isMe ? "You" : msg.sender_name}
                        </span>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-[13px] font-bold shadow-sm break-words w-full ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-900 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={sendMessage}
              className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isProfileLoading ? "Loading identity..." : "Message group..."}
                disabled={!!error || isProfileLoading}
                className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-blue-400 transition-all disabled:opacity-50 shadow-inner"
              />
              <button
                type="submit"
                disabled={!!error || !inputValue.trim() || isProfileLoading}
                className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all disabled:opacity-50"
              >
                <IoSend size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        data-lenis-prevent
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`hidden w-16 h-16 rounded-full items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-gray-900 rotate-180" : "bg-blue-600"
        } text-white`}
      >
        <div className="relative">
          <IoChatbubbleOutline size={28} />
          {error && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
