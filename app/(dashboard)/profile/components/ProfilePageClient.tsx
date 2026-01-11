"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api, { UserResponse } from "@/lib/api";
import {
  ProfileService,
  ProfilePictureService,
  FileHubProfilePictureService,
} from "@/lib/api/v2";
import ImageCropModal from "@/app/(dashboard)/supervisors/components/ImageCropModal";
import { useImageCropStore } from "@/app/(dashboard)/supervisors/store/useImageCropStore";
import useFormErrors from "@/hooks/useFormErrors";
import User from "@/icons/User";
import Pencil from "@/icons/Pencil";
import Check from "@/icons/Check";
import X from "@/icons/X";
import LockClosed from "@/icons/LockClosed";
import { useToastStore } from "../../store/useToastStore";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface ProfilePageClientProps {
  user: UserResponse;
  locale: Locale;
  language: string;
}

export default function ProfilePageClient({
  user,
  locale,
  language,
}: ProfilePageClientProps) {
  const { openCropModal, croppedImageFile, croppedImageUrl } =
    useImageCropStore();
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "username",
    "email",
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const { addToast } = useToastStore();
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize profile picture URL from user data
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (user && user.profilePicture) {
        const profilePictureUrl =
          await FileHubProfilePictureService.getMyProfilePicture().then(
            (data) => data.signedUrl
          );
        setProfilePictureUrl(profilePictureUrl);
      }
    };
    fetchProfilePic();
  }, [user]);

  // Update profile picture URL when cropped image changes
  useEffect(() => {
    if (croppedImageUrl) {
      setProfilePictureUrl(croppedImageUrl);
    }
  }, [croppedImageUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      openCropModal(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setProfilePicture(croppedFile);
  };

  const handleUpdateProfilePicture = async () => {
    if (!croppedImageFile && !profilePicture) return;

    setUploadingPicture(true);
    try {
      const file = croppedImageFile || profilePicture!;

      // Extract file extension from the file name
      const fileExtension = file.name.split(".").pop()?.toLowerCase() as
        | "avif"
        | "webp"
        | "png"
        | "jpeg"
        | "jpg";

      // Validate file extension
      if (!["avif", "webp", "png", "jpeg", "jpg"].includes(fileExtension)) {
        const { locale: storeLocale } = useLocaleStore.getState();
        addToast({
          message:
            storeLocale?.profile?.toasts?.invalidFileType ||
            "Invalid file type. Please upload an image file.",
          type: "error",
        });
        return;
      }

      // Request a signed PUT URL from the backend
      const { signedUrl } =
        await FileHubProfilePictureService.generateUploadUrl({
          fileExtension,
        });

      // Upload the file directly to the signed URL using PUT
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Clear the cropped image
      setProfilePicture(null);

      // Show success message
      const { locale: storeLocale } = useLocaleStore.getState();
      addToast({
        message:
          storeLocale?.profile?.toasts?.pictureUpdated ||
          "Profile picture updated successfully!",
        type: "success",
      });

      // Reload the page to refresh session
      window.location.reload();
    } catch (err: any) {
      const { locale: storeLocale } = useLocaleStore.getState();
      addToast({
        message:
          err?.response?.data?.message ||
          storeLocale?.profile?.toasts?.pictureUpdateFailed ||
          "Failed to update profile picture. Please try again.",
        type: "error",
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email) {
      const { locale: storeLocale } = useLocaleStore.getState();
      setRootError(
        storeLocale?.profile?.errors?.nameAndEmailRequired ||
          "Name and email are required"
      );
      setLoading(false);
      return;
    }

    try {
      await ProfileService.updateProfile({
        name: formData.name,
        email: formData.email,
      });

      // Exit edit mode
      setIsEditMode(false);

      // Show success message
      const { locale: storeLocale } = useLocaleStore.getState();
      addToast({
        message:
          storeLocale?.profile?.toasts?.profileUpdated ||
          "Profile updated successfully!",
        type: "success",
      });

      // Reload the page to refresh session
      window.location.reload();
    } catch (err: any) {
      if (err?.response?.data?.data?.details) {
        setErrors(err?.response?.data?.data?.details);
      } else {
        const { locale: storeLocale } = useLocaleStore.getState();
        setRootError(
          err?.response?.data?.message ||
            storeLocale?.profile?.toasts?.updateFailed ||
            "Failed to update profile. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({
      name: user.name || "",
      email: user.email || "",
    });
    clearErrors();
  };

  const handleSendPasswordResetOTP = async () => {
    setSendingOtp(true);
    try {
      const result = await ProfileService.sendPasswordResetOTP();
      setOtpSent(true);
      const { locale: storeLocale } = useLocaleStore.getState();
      addToast({
        message:
          result.message ||
          storeLocale?.profile?.toasts?.otpSent ||
          "OTP sent to your email successfully!",
        type: "success",
      });
    } catch (err: any) {
      const { locale: storeLocale } = useLocaleStore.getState();
      addToast({
        message:
          err?.response?.data?.message ||
          storeLocale?.profile?.toasts?.otpSendFailed ||
          "Failed to send OTP. Please try again.",
        type: "error",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handlePasswordResetInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordResetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const { locale: storeLocale } = useLocaleStore.getState();
    if (
      !passwordResetData.code ||
      !passwordResetData.newPassword ||
      !passwordResetData.confirmPassword
    ) {
      addToast({
        message:
          storeLocale?.profile?.toasts?.fillAllFields ||
          "Please fill in all fields",
        type: "error",
      });
      return;
    }

    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      addToast({
        message:
          storeLocale?.profile?.toasts?.passwordsDoNotMatch ||
          "Passwords do not match",
        type: "error",
      });
      return;
    }

    if (passwordResetData.newPassword.length < 4) {
      addToast({
        message:
          storeLocale?.profile?.toasts?.passwordTooShort ||
          "Password must be at least 4 characters long",
        type: "error",
      });
      return;
    }

    setResettingPassword(true);
    try {
      const result = await ProfileService.verifyPasswordResetOTP({
        code: passwordResetData.code,
        newPassword: passwordResetData.newPassword,
      });

      addToast({
        message:
          result.message ||
          storeLocale?.profile?.toasts?.passwordReset ||
          "Password reset successfully!",
        type: "success",
      });

      // Reset form and state
      setShowPasswordReset(false);
      setOtpSent(false);
      setPasswordResetData({
        code: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      if (err.message === "invalid_otp") {
        addToast({
          message:
            storeLocale?.profile?.toasts?.invalidOtp ||
            "Invalid OTP. Please try again.",
          type: "error",
        });
        return;
      }
      addToast({
        message:
          err?.response?.data?.message ||
          storeLocale?.profile?.toasts?.passwordResetFailed ||
          "Failed to reset password. Please try again.",
        type: "error",
      });
      console.log("error", err);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false);
    setOtpSent(false);
    setPasswordResetData({
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-6 space-y-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
            >
              <User className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-2xl font-bold text-slate-800"
              >
                {locale.profile.pageHeader.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-sm text-slate-600"
              >
                {locale.profile.pageHeader.description}
              </motion.p>
            </div>
          </div>
          {!isEditMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {locale.profile.editButton}
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
          className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6 lg:col-span-1"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.7, ease: "backOut" }}
              className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <User className="w-4 h-4 text-blue-600" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="text-lg font-semibold text-slate-800"
            >
              {locale.profile.profilePicture.title}
            </motion.h2>
          </motion.div>

          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9, ease: "backOut" }}
              className="relative w-40 h-40"
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-blue-100">
                  <User className="w-20 h-20 text-blue-400" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="w-full space-y-3"
            >
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                htmlFor="profilePictureInput"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                {locale.profile.profilePicture.changePicture}
              </motion.label>
              <input
                type="file"
                id="profilePictureInput"
                name="profilePicture"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <AnimatePresence>
                {(profilePicture || croppedImageFile) && (
                  <motion.button
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateProfilePicture}
                    disabled={uploadingPicture}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadingPicture ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </motion.svg>
                        {locale.profile.profilePicture.uploading}
                      </span>
                    ) : (
                      locale.profile.profilePicture.uploadNewPicture
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* Profile Information Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
          className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6 lg:col-span-2"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.8, ease: "backOut" }}
              className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </motion.svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="text-lg font-semibold text-slate-800"
            >
              {locale.profile.profileInformation.title}
            </motion.h2>
          </motion.div>

          {isEditMode ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              onSubmit={handleSubmit}
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
                    <div className="flex items-center gap-2">
                      <svg
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
                      </svg>
                      <span>{errors.root}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {[
                {
                  id: "name",
                  name: "name",
                  label: locale.profile.profileInformation.fields.fullName,
                  type: "text",
                  placeholder:
                    locale.profile.profileInformation.placeholders.fullName,
                  required: true,
                },
                {
                  id: "email",
                  name: "email",
                  label: locale.profile.profileInformation.fields.email,
                  type: "email",
                  placeholder:
                    locale.profile.profileInformation.placeholders.email,
                  required: true,
                },
              ].map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                >
                  <motion.label
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                    htmlFor={field.id}
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    {field.label} *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    type={field.type}
                    id={field.id}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    placeholder={field.placeholder}
                    required={field.required}
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
                transition={{ duration: 0.4, delay: 1.5 }}
                className="flex gap-3 pt-4"
              >
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </motion.svg>
                      {locale.profile.profileInformation.saving}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {locale.profile.profileInformation.saveChanges}
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  {locale.profile.profileInformation.cancel}
                </motion.button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: locale.profile.profileInformation.fields.fullName,
                    value: user.name,
                  },
                  {
                    label: locale.profile.profileInformation.fields.email,
                    value: user.email,
                  },
                  {
                    label: locale.profile.profileInformation.fields.role,
                    value: user.role,
                  },
                  {
                    label: locale.profile.profileInformation.fields.jobTitle,
                    value: user.jobTitle,
                  },
                ].map((field, index) => (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    className="p-3 bg-slate-50 rounded-xl"
                  >
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      {field.label}
                    </p>
                    <p className="text-sm text-slate-900">{field.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Departments/Sub-departments */}
              {user.departmentNames && user.departmentNames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.5 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="p-3 bg-slate-50 rounded-xl"
                >
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    {locale.profile.profileInformation.fields.departments}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.departmentNames.map((dept, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 1.6 + index * 0.1,
                          ease: "backOut",
                        }}
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {dept}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Permissions */}
              {user.permissions && user.permissions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.6 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="p-3 bg-slate-50 rounded-xl"
                >
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    {locale.profile.profileInformation.fields.permissions}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((perm, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 1.7 + index * 0.1,
                          ease: "backOut",
                        }}
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                        className="px-2 py-1 capitalize bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {perm.replace(/_/g, " ").toLowerCase()}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Password Reset Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        whileHover={{
          y: -2,
          transition: { duration: 0.2 },
        }}
        className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.9, ease: "backOut" }}
            className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center"
          >
            <LockClosed className="w-4 h-4 text-purple-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="text-lg font-semibold text-slate-800"
          >
            {locale.profile.passwordSecurity.title}
          </motion.h2>
        </motion.div>

        {!showPasswordReset ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-600">
              {locale.profile.passwordSecurity.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPasswordReset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <LockClosed className="w-4 h-4" />
              {locale.profile.passwordSecurity.resetPassword}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {!otpSent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    {locale.profile.passwordSecurity.sendOtp.hint}
                  </p>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendPasswordResetOTP}
                    disabled={sendingOtp}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {sendingOtp ? (
                      <>
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </motion.svg>
                        {locale.profile.passwordSecurity.sendOtp.sending}
                      </>
                    ) : (
                      locale.profile.passwordSecurity.sendOtp.title
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelPasswordReset}
                    disabled={sendingOtp}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locale.profile.profileInformation.cancel}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePasswordReset}
                className="space-y-6"
              >
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800">
                    {locale.profile.passwordSecurity.resetForm.otpSent}
                  </p>
                </div>

                {[
                  {
                    id: "code",
                    name: "code",
                    label: locale.profile.passwordSecurity.resetForm.otpCode,
                    type: "text",
                    placeholder:
                      locale.profile.passwordSecurity.resetForm.placeholders
                        .otpCode,
                    required: true,
                  },
                  {
                    id: "newPassword",
                    name: "newPassword",
                    label:
                      locale.profile.passwordSecurity.resetForm.newPassword,
                    type: "password",
                    placeholder:
                      locale.profile.passwordSecurity.resetForm.placeholders
                        .newPassword,
                    required: true,
                    minLength: 4,
                  },
                  {
                    id: "confirmPassword",
                    name: "confirmPassword",
                    label:
                      locale.profile.passwordSecurity.resetForm.confirmPassword,
                    type: "password",
                    placeholder:
                      locale.profile.passwordSecurity.resetForm.placeholders
                        .confirmPassword,
                    required: true,
                    minLength: 4,
                  },
                ].map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <label
                      htmlFor={field.id}
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      {field.label} *
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      value={
                        passwordResetData[
                          field.name as keyof typeof passwordResetData
                        ]
                      }
                      onChange={handlePasswordResetInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-slate-50/50"
                      placeholder={field.placeholder}
                      required={field.required}
                      minLength={field.minLength}
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex gap-3 pt-4"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(147, 51, 234, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={resettingPassword}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {resettingPassword ? (
                      <>
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </motion.svg>
                        {locale.profile.passwordSecurity.resetForm.resetting}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {locale.profile.passwordSecurity.resetForm.reset}
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCancelPasswordReset}
                    disabled={resettingPassword}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {locale.profile.profileInformation.cancel}
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Image Crop Modal */}
      <ImageCropModal onCropComplete={handleCropComplete} />
    </motion.div>
  );
}
