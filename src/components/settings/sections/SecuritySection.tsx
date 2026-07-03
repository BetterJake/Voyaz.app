import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoLogoGoogle,
  IoLaptopOutline,
  IoPhonePortraitOutline,
  IoGlobeOutline,
  IoLogOutOutline,
  IoWarningOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Session } from "../types";
import { parseUserAgent } from "../utils/user-agent";
interface SecuritySectionProps {
  email: string;
  isGoogleOAuth: boolean;
  activeSessions: Session[];
  isLoadingSessions: boolean;
  currentSessionId: string | null;
  loadSessions: () => void;
  handleRevokeSession: (id: string) => void;
  handleLogoutAllOtherDevices: () => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  deleteConfirmValue: string;
  setDeleteConfirmValue: (val: string) => void;
  isDeleting: boolean;
  handleDeleteAccount: () => void;
}
export function SecuritySection({
  email,
  isGoogleOAuth,
  activeSessions,
  isLoadingSessions,
  currentSessionId,
  loadSessions,
  handleRevokeSession,
  handleLogoutAllOtherDevices,
  showDeleteConfirm,
  setShowDeleteConfirm,
  deleteConfirmValue,
  setDeleteConfirmValue,
  isDeleting,
  handleDeleteAccount,
}: SecuritySectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
          Security & Authentication
        </h2>
        {isGoogleOAuth ? (
          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mb-8">
            <div className="bg-gray-50 p-3 rounded-full text-gray-900 shrink-0">
              <IoLogoGoogle className="text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Connected with Google</h3>
              <p className="text-sm text-gray-500 mb-4">
                Signed in using {email}. Security managed by Google.
              </p>
              <a
                href="https://myaccount.google.com/connections"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full py-2.5 font-bold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 w-full sm:w-auto px-6"
              >
                Manage Connection
              </a>
            </div>
          </div>
        ) : (
          <form className="space-y-5 mb-8">
            <Input label="Current Password" type="password" placeholder="••••••••" showToggle />
            <Input label="New Password" type="password" placeholder="••••••••" showToggle />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" showToggle />
            <div className="pt-4">
              <Button type="button" className="w-full sm:w-auto px-8">
                Update Password
              </Button>
            </div>
          </form>
        )}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Active Sessions</h3>
              <p className="text-sm text-gray-500">Manage signed-in devices.</p>
            </div>
            <Button onClick={loadSessions} variant="ghost" className="w-10 h-10 p-0 text-gray-500">
              <IoGlobeOutline className={`text-xl ${isLoadingSessions ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="space-y-4 mb-6">
            {activeSessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              const { os, browser, isMobile } = parseUserAgent(session.user_agent);
              return (
                <div
                  key={session.id}
                  className={`flex flex-col sm:flex-row items-center sm:items-start justify-between p-4 rounded-2xl border ${isCurrent ? "border-primary/30 bg-primary/5" : "border-gray-200 bg-white"}`}
                >
                  <div className="flex items-start gap-4 mb-4 sm:mb-0 text-center sm:text-left">
                    <div
                      className={`p-3 rounded-full ${isCurrent ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                      {isMobile ? (
                        <IoPhonePortraitOutline className="text-xl" />
                      ) : (
                        <IoLaptopOutline className="text-xl" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">
                          {os} ({browser})
                        </h4>
                        {isCurrent && (
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        IP: {session.ip || "Unknown"}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      onClick={() => handleRevokeSession(session.id)}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            onClick={handleLogoutAllOtherDevices}
            variant="outline"
            className="w-full sm:w-fit px-10 whitespace-nowrap"
          >
            Log out of all other devices
          </Button>
        </div>
      </div>
      <div className="bg-red-50 rounded-3xl border border-red-100 p-5 sm:p-8">
        <div className="flex items-center gap-3 text-red-600 mb-2">
          <IoWarningOutline className="text-2xl" />
          <h2 className="text-2xl font-bold">Danger Zone</h2>
        </div>
        <p className="text-red-800/80 mb-6 font-medium">
          Permanently delete your account. This cannot be undone.
        </p>
        <AnimatePresence mode="wait">
          {showDeleteConfirm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-1"
            >
              <p className="text-sm text-red-600 font-bold">Type &quot;DELETE&quot; to confirm.</p>
              <Input
                placeholder="DELETE"
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                error=" "
              />
              <div className="flex items-start gap-3 p-4 bg-red-100/50 rounded-2xl border border-red-200 mt-2 mb-4">
                <IoWarningOutline className="text-red-600 text-lg shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-900 font-bold leading-relaxed uppercase tracking-wider">
                  All your trips will be deleted and deactivated, even if other participants are
                  using them.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  disabled={deleteConfirmValue !== "DELETE"}
                  isLoading={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAccount}
                >
                  Confirm Deletion
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button
              className="bg-red-600 hover:bg-red-700 gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <IoTrashOutline className="text-lg" /> Delete Account
            </Button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
