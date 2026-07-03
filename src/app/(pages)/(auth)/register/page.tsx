"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoAlertCircleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Honeypot } from "@/components/auth/Honeypot";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
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
    const { data, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    const isExistingUser =
      data.user &&
      (!data.user.identities ||
        data.user.identities.length === 0 ||
        !data.user.identities.some((id) => id.provider === "email") ||
        new Date().getTime() - new Date(data.user.created_at).getTime() > 10000);

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
    } else if (isExistingUser) {
      if (!data.user?.email_confirmed_at) {
        setError(
          "An account with this email already exists, but it's not confirmed yet. Please check your email for the confirmation link."
        );
      } else {
        setError(
          "An account with this email already exists. Please try signing in or use a different provider."
        );
      }
      setLoading(false);
    } else if (data.session) {
      // Email confirmation is disabled in Supabase: signUp already returned an
      // active session, so send the user straight into onboarding instead of
      // showing a "check your email" screen for an email that never arrives.
      router.push("/onboarding");
      router.refresh();
    } else {
      setSuccess(true);
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
        <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">Get Started!</h2>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-green-50 p-6 text-center border border-green-100 space-y-4"
            >
              <IoCheckmarkCircleOutline className="mx-auto text-4xl text-green-500" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-green-900">Registration Successful!</h3>
                <p className="text-sm text-green-700">
                  Please check your email to confirm your account.
                </p>
              </div>
              <Button variant="ghost" className="w-auto px-0">
                <Link href="/login">Go to Sign In</Link>
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Honeypot value={honeypot} onChange={setHoneypot} />
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  <IoAlertCircleOutline size={20} className="shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Emily"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  maxLength={50}
                />
                <Input
                  label="Last Name"
                  placeholder="Carter"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="emily.carter@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                maxLength={255}
              />
              <div className="space-y-3">
                <Input
                  label="Password"
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
                label="Confirm Password"
                type="password"
                showToggle
                placeholder="********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                maxLength={100}
              />
              <Checkbox
                label={
                  <>
                    I agree to the processing of{" "}
                    <span className="font-semibold text-primary">Personal data</span>
                  </>
                }
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                required
              />
              <Button
                type="submit"
                isLoading={loading}
                disabled={
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
                  !formData.password ||
                  formData.password !== formData.confirmPassword ||
                  !formData.agreeToTerms ||
                  formData.password.length < 8 ||
                  !/[A-Z]/.test(formData.password) ||
                  !/[0-9]/.test(formData.password) ||
                  !/[^A-Za-z0-9]/.test(formData.password)
                }
              >
                Sign up
              </Button>
            </form>
          )}
        </AnimatePresence>
        <SocialAuth label="Sign up with Google" />
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
