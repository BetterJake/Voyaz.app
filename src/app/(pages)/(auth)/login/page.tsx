"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IoAlertCircleOutline } from "react-icons/io5";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { Honeypot } from "@/components/auth/Honeypot";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/profile");
      }
    };
    checkUser();
  }, [supabase, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  };
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full space-y-8"
      >
        <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Honeypot value={honeypot} onChange={setHoneypot} />
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              <IoAlertCircleOutline size={20} className="shrink-0" />
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="emily.carter@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            maxLength={255}
          />
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-primary">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              showToggle
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              maxLength={100}
            />
          </div>
          <Button
            type="submit"
            isLoading={loading}
            disabled={
              !formData.email ||
              !formData.password ||
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
            }
          >
            Sign in
          </Button>
        </form>
        <SocialAuth label="Sign in with Google" />
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:underline underline-offset-4"
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
