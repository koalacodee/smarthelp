"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfilePictureService, EmployeeService } from "@/lib/api/v2";
import { useRouter } from "next/navigation";
import ImageCropModal from "@/app/(dashboard)/supervisors/components/ImageCropModal";
import { useImageCropStore } from "@/app/(dashboard)/supervisors/store/useImageCropStore";
import useFormErrors from "@/hooks/useFormErrors";

interface EmployeeRegistrationFormProps {
  invitation: any;
  token: string;
}

export default function EmployeeRegistrationForm({
  invitation,
  token,
}: EmployeeRegistrationFormProps) {
  const router = useRouter();
  const { openCropModal, croppedImageFile } = useImageCropStore();
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "username",
    "password",
    "confirmPassword",
  ]);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Open crop modal instead of directly setting the file
      openCropModal(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setProfilePicture(croppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    // Validation
    if (!formData.name || !formData.username || !formData.password) {
      setRootError("Name, username and password are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRootError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      setRootError("Password must be at least 4 characters long");
      setLoading(false);
      return;
    }

    try {
      // Debug: Log invitation object

      // Prepare completion data
      const completionData = {
        token: token,
        username: formData.username,
        name: formData.name,
        password: formData.password,
      };

      // Complete the invitation
      const result = await EmployeeService.completeEmployeeInvitation({
        ...completionData,
        uploadProfilePicture: !!(profilePicture || croppedImageFile),
      });

      if (result.uploadKey && (profilePicture || croppedImageFile)) {
        await ProfilePictureService.upload({
          uploadKey: result.uploadKey,
          file: croppedImageFile || profilePicture!,
        });
      }

      // Redirect to success page or login
      router.push("/");
    } catch (err: any) {
      if (err?.response?.data?.data?.details) {
        setErrors(err?.response?.data?.data?.details);
      } else {
        setRootError(
          err?.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
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
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </motion.svg>
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-2xl font-bold text-slate-800"
            >
              Complete Your Registration
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-sm text-slate-600"
            >
              Set up your employee account to get started
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Invitation Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
          className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
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
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </motion.svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="text-lg font-semibold text-slate-800"
            >
              Invitation Details
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  label: "Full Name",
                  value: invitation.fullName,
                  type: "text",
                },
                { label: "Email", value: invitation.email, type: "text" },
                {
                  label: "Job Title",
                  value: invitation.jobTitle,
                  type: "text",
                },
                {
                  label: "Employee ID",
                  value: invitation.employeeId,
                  type: "text",
                  conditional: true,
                },
                {
                  label: "Supervisor",
                  value: invitation.supervisorName,
                  type: "text",
                },
              ].map((field, index) =>
                field.conditional ? (
                  invitation.employeeId && (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      className="p-3 bg-slate-50 rounded-xl"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                        className="text-xs font-medium text-slate-500 mb-1"
                      >
                        {field.label}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                        className="text-sm text-slate-900"
                      >
                        {field.value}
                      </motion.p>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-3 bg-slate-50 rounded-xl"
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                      className="text-xs font-medium text-slate-500 mb-1"
                    >
                      {field.label}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                      className="text-sm text-slate-900"
                    >
                      {field.value}
                    </motion.p>
                  </motion.div>
                )
              )}

              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.4 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="p-3 bg-slate-50 rounded-xl"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.5 }}
                  className="text-xs font-medium text-slate-500 mb-1"
                >
                  Sub-Departments
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.6 }}
                  className="flex flex-wrap gap-1 mt-1"
                >
                  {invitation.subDepartmentNames.map(
                    (dept: string, index: number) => (
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
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {dept}
                      </motion.span>
                    )
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.8 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="p-3 bg-slate-50 rounded-xl"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.9 }}
                  className="text-xs font-medium text-slate-500 mb-1"
                >
                  Permissions
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 2.0 }}
                  className="flex flex-wrap gap-1 mt-1"
                >
                  {invitation.permissions.map((perm: string, index: number) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 2.1 + index * 0.1,
                        ease: "backOut",
                      }}
                      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                      className="px-2 py-1 capitalize bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {perm.replace(/_/g, " ").toLocaleLowerCase()}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
          className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </motion.svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="text-lg font-semibold text-slate-800"
            >
              Account Setup
            </motion.h2>
          </motion.div>

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
                id: "name",
                name: "name",
                label: "Full Name",
                type: "text",
                placeholder: "Enter your full name",
                required: true,
              },
              {
                id: "username",
                name: "username",
                label: "Username",
                type: "text",
                placeholder: "Choose a username",
                required: true,
              },
              {
                id: "password",
                name: "password",
                label: "Password",
                type: "password",
                placeholder: "Create a password",
                required: true,
                minLength: 6,
              },
              {
                id: "confirmPassword",
                name: "confirmPassword",
                label: "Confirm Password",
                type: "password",
                placeholder: "Confirm your password",
                required: true,
                minLength: 6,
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
                  minLength={field.minLength}
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.5 }}
            >
              <motion.label
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.6 }}
                htmlFor="profilePicture"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Profile Picture (Optional)
              </motion.label>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.7 }}
                className="relative"
              >
                <motion.input
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  }}
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </motion.div>
              <AnimatePresence>
                {(profilePicture || croppedImageFile) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl"
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
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4"
                        />
                      </motion.svg>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="text-sm text-green-700"
                      >
                        Selected: {(croppedImageFile || profilePicture)?.name}
                        {croppedImageFile && " (cropped to square)"}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.8 }}
              className="pt-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center gap-2"
                  >
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
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      Completing Registration...
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Complete Registration
                  </motion.span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>

      {/* Image Crop Modal */}
      <ImageCropModal onCropComplete={handleCropComplete} />
    </motion.div>
  );
}
