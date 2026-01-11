"use client";
import useFormErrors from "@/hooks/useFormErrors";
import Ticket from "@/icons/Ticket";
import { PasswordResetService } from "@/lib/api/v2";
import { setCookie } from "@/lib/api/cookies";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface PasswordResetFormProps {
  locale: Locale;
  language: string;
}

export default function PasswordResetForm({ locale, language }: PasswordResetFormProps) {
  const { setLocale } = useLocaleStore();
  const storeLocale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

  if (!storeLocale) return null;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();
  const passwordResetService = PasswordResetService;

  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "email",
    "code",
    "newPassword",
    "confirmPassword",
  ]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const response = await passwordResetService.sendResetPasswordCode({
        email,
      });
      setSuccessMessage(response.message);
      setStep("reset");
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(storeLocale.passwordReset.errors.sendCodeFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setErrors([
        { field: "confirmPassword", message: storeLocale.passwordReset.errors.passwordsDoNotMatch },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await passwordResetService.resetPassword({
        code,
        newPassword,
      });

      setCookie("accessToken", response.accessToken);
      setSuccessMessage(storeLocale.passwordReset.success.resetSuccess);

      // Redirect after a short delay

      router.push("/");
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(storeLocale.passwordReset.errors.resetFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    clearErrors();
    setSuccessMessage("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] bg-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-4 h-4 text-white"
              >
                <Ticket className="h-4 w-4" />
              </motion.div>
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-2xl font-bold text-slate-800"
              >
                {storeLocale.passwordReset.header.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-sm text-slate-600"
              >
                {step === "email"
                  ? storeLocale.passwordReset.header.description.email
                  : storeLocale.passwordReset.header.description.reset}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <motion.svg
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                    ease: "backOut",
                  }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </motion.svg>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {successMessage}
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
          className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.6, ease: "backOut" }}
              className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </motion.svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-lg font-semibold text-slate-800"
            >
              {step === "email" ? storeLocale.passwordReset.form.emailStep.title : storeLocale.passwordReset.form.resetStep.title}
            </motion.h2>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleEmailSubmit}
                className="space-y-6"
              >
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.svg
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.2,
                            ease: "backOut",
                          }}
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </motion.svg>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          {errors.root}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <motion.label
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    {storeLocale.passwordReset.form.emailStep.fields.email.label} *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    placeholder={storeLocale.passwordReset.form.emailStep.fields.email.placeholder}
                    required
                    autoComplete="email"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mt-1 text-sm text-red-700"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  className="pt-4"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoading ? storeLocale.passwordReset.form.emailStep.buttons.sending : storeLocale.passwordReset.form.emailStep.buttons.send}
                    </motion.span>
                  </motion.button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                onSubmit={handlePasswordReset}
                className="space-y-6"
              >
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.svg
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.2,
                            ease: "backOut",
                          }}
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </motion.svg>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          {errors.root}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {[
                  {
                    id: "code",
                    name: "code",
                    label: "Reset Code",
                    type: "text",
                    placeholder: "Enter the code from your email",
                    required: true,
                    value: code,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      setCode(e.target.value),
                  },
                  {
                    id: "newPassword",
                    name: "newPassword",
                    label: "New Password",
                    type: "password",
                    placeholder: "Enter your new password",
                    required: true,
                    value: newPassword,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword(e.target.value),
                  },
                  {
                    id: "confirmPassword",
                    name: "confirmPassword",
                    label: "Confirm Password",
                    type: "password",
                    placeholder: "Confirm your new password",
                    required: true,
                    value: confirmPassword,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value),
                  },
                ].map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  >
                    <motion.label
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                      htmlFor={field.id}
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      {field.label} *
                    </motion.label>
                    <motion.input
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                      }}
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                      placeholder={field.placeholder}
                      required={field.required}
                      autoComplete={
                        field.type === "password" ? "new-password" : "off"
                      }
                    />
                    {errors[field.name as keyof typeof errors] && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-1 text-sm text-red-700"
                      >
                        {errors[field.name as keyof typeof errors]}
                      </motion.p>
                    )}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  className="pt-4 space-y-3"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoading ? storeLocale.passwordReset.form.resetStep.buttons.resetting : storeLocale.passwordReset.form.resetStep.buttons.reset}
                    </motion.span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleBackToEmail}
                    className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:ring-offset-2 transition-all duration-200"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {storeLocale.passwordReset.form.resetStep.buttons.backToEmail}
                    </motion.span>
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200 hover:underline"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                {storeLocale.passwordReset.backToLogin}
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
