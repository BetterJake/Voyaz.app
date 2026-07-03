"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IoCheckmarkCircleOutline, IoAlertCircleOutline } from "react-icons/io5";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { createClient } from "@/utils/supabase/client";
export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Auth session missing! Please use the link from your email.");
      }
      setSessionChecked(true);
    };
    checkSession();
  }, [supabase]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = formData.password;
    const isPasswordValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!isPasswordValid) {
      setError("Password must meet all security requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.updateUser({
      password: formData.password,
    });
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // We sign out to clear the temporary recovery session
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 3000);
    }
  };
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full space-y-8"
      >
        <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">New Password</h2>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-green-50 p-6 text-center border border-green-100 space-y-4"
          >
            <IoCheckmarkCircleOutline className="mx-auto text-4xl text-green-500" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-green-900">Password Updated!</h3>
              <p className="text-sm text-green-700">Redirecting to login...</p>
            </div>
          </motion.div>
        ) : !sessionChecked ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                <IoAlertCircleOutline size={20} className="shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-3">
              <Input
                label="New Password"
                type="password"
                showToggle
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                maxLength={100}
              />
              <PasswordStrength password={formData.password} />
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              showToggle
              placeholder="********"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              maxLength={100}
            />
            <Button
              type="submit"
              isLoading={loading}
              disabled={
                !formData.password ||
                formData.password !== formData.confirmPassword ||
                formData.password.length < 8 ||
                !/[A-Z]/.test(formData.password) ||
                !/[0-9]/.test(formData.password) ||
                !/[^A-Za-z0-9]/.test(formData.password)
              }
            >
              Update Password
            </Button>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
}
