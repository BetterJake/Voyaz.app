"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IoArrowBackOutline, IoMailOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Honeypot } from "@/components/auth/Honeypot";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setIsSubmitted(true);
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full space-y-8"
      >
        <Link
          href="/login"
          className="group flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-primary"
        >
          <IoArrowBackOutline className="transition-transform group-hover:-translate-x-1" />
          Back to Sign In
        </Link>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">
            Forgot Password?
          </h2>
          <p className="text-gray-500">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Honeypot value={honeypot} onChange={setHoneypot} />
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}
            <Input
              label="Email Address"
              type="email"
              icon={<IoMailOutline />}
              placeholder="emily.carter@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
            <Button
              type="submit"
              isLoading={loading}
              disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-green-50 p-8 text-center border border-green-100 space-y-4"
          >
            <IoCheckmarkCircleOutline className="mx-auto text-4xl text-green-500" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-500">
                We&apos;ve sent a link to{" "}
                <span className="font-semibold text-gray-900">{email}</span>.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setIsSubmitted(false)}>
              Didn&apos;t receive it? Try again
            </Button>
          </motion.div>
        )}
      </motion.div>
    </AuthLayout>
  );
}
