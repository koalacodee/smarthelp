import { useMemo, useState } from "react";

export default function useFormErrors(fieldList: string[]) {
  const [localErrors, setLocalErrors] = useState<
    { field: string; message: string }[]
  >([]);

  const errors = useMemo(() => {
    return localErrors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {} as Record<string, string>);
  }, [localErrors]);

  const setErrors = (errors: { field: string; message: string }[]) => {
    errors.forEach((err) => {
      if (fieldList.includes(err.field)) {
        // Field-specific error
        setLocalErrors((prev) => [...prev, err]);
      } else {
        // General error - only add if no root error exists
        if (!localErrors.find((e) => e.field === "root")) {
          setLocalErrors((prev) => [
            ...prev,
            { field: "root", message: err.message },
          ]);
        }
      }
    });
  };

  const getErrorForField = (field: string) => {
    return localErrors.find((e) => e.field === field)?.message;
  };

  const setErrorForField = (field: string, message: string) => {
    setLocalErrors((prev) => [
      ...prev.filter((e) => e.field !== field),
      { field, message },
    ]);
  };

  const setRootError = (message: string) => {
    setLocalErrors((prev) => [
      ...prev.filter((e) => e.field !== "root"),
      { field: "root", message },
    ]);
  };

  const clearErrors = () => {
    setLocalErrors([]);
  };

  return {
    errors,
    setErrors,
    getErrorForField,
    setErrorForField,
    clearErrors,
    setRootError,
  };
}
