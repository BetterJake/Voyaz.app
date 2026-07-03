import React, { ChangeEvent } from "react";
import { IoPersonOutline } from "react-icons/io5";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { SocialListState } from "../types";
interface SocialModalsProps {
  username: string;
  isOwner: boolean;
  isBlockModalOpen: boolean;
  setIsBlockModalOpen: (open: boolean) => void;
  confirmBlock: () => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportReason: string;
  setReportReason: (reason: string) => void;
  submitReport: () => void;
  socialListModal: SocialListState;
  setSocialListModal: React.Dispatch<React.SetStateAction<SocialListState>>;
  onListAction: (userId: string, type: "unfriend" | "unfollow") => void;
}
export function SocialModals({
  username,
  isOwner,
  isBlockModalOpen,
  setIsBlockModalOpen,
  confirmBlock,
  isReportModalOpen,
  setIsReportModalOpen,
  reportReason,
  setReportReason,
  submitReport,
  socialListModal,
  setSocialListModal,
  onListAction,
}: SocialModalsProps) {
  return (
    <>
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Block User"
      >
        <div className="space-y-6">
          <p className="text-gray-500 font-medium">
            Are you sure you want to block{" "}
            <span className="text-gray-900 font-bold">@{username}</span>? This will also
            automatically unfriend and unfollow them. This action cannot be undone.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={confirmBlock}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
            >
              Block User
            </button>
            <button
              onClick={() => setIsBlockModalOpen(false)}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Profile"
      >
        <div className="space-y-6">
          <p className="text-gray-500 font-medium">Why are you reporting this profile?</p>
          <TextArea
            placeholder="Describe the issue..."
            value={reportReason}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReportReason(e.target.value)}
            rows={4}
          />
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={submitReport}
              disabled={!reportReason.trim()}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
            <button
              onClick={() => {
                setIsReportModalOpen(false);
                setReportReason("");
              }}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={socialListModal.isOpen}
        onClose={() => setSocialListModal((prev: SocialListState) => ({ ...prev, isOpen: false }))}
        title={socialListModal.title}
      >
        <div className="min-h-[300px] flex flex-col">
          {socialListModal.isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Loading list...
              </p>
            </div>
          ) : socialListModal.users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <IoPersonOutline className="text-2xl text-gray-300" />
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-gray-900">
                No one here yet
              </p>
              <p className="text-gray-500 text-sm font-medium">Start connecting!</p>
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {socialListModal.users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group relative"
                >
                  <Link
                    href={`/profile/${u.id}`}
                    onClick={() =>
                      setSocialListModal((prev: SocialListState) => ({ ...prev, isOpen: false }))
                    }
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                      <img
                        src={
                          u.avatar_url ||
                          `https://ui-avatars.com/api/?name=${u.username}&background=random`
                        }
                        alt={u.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-black uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                        @{u.username}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Travel Enthusiast
                      </p>
                    </div>
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() =>
                        onListAction(
                          u.id,
                          socialListModal.title === "Friends" ? "unfriend" : "unfollow"
                        )
                      }
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      {socialListModal.title === "Friends" ? "Unfriend" : "Unfollow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
