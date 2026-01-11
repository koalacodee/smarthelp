import { getLocale } from "@/locales/helpers";

export default async function AccessDeniedPage() {
  const locale = await getLocale();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="relative w-full max-w-lg mx-auto">
        {/* Gradient border card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 p-[2px] shadow-2xl">
          <div className="h-full w-full rounded-2xl bg-white/95 ">
            <div className="p-8 sm:p-10">
              {/* Animated icon */}
              <div className="relative mb-6 flex justify-center">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-orange-500 blur-xl" />
                  {/* Icon container */}
                  <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center shadow-lg ring-4 ring-red-100/50">
                    <svg
                      className="w-12 h-12 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 bg-clip-text text-transparent">
                {locale.accessDenied.title}
              </h1>

              {/* Description */}
              <p className="text-center text-slate-600 mb-8 text-base sm:text-lg">
                {locale.accessDenied.description}
              </p>

              {/* Help text */}
              <p className="text-center text-sm text-slate-500">
                {locale.accessDenied.helpText}
              </p>

              {/* Decorative elements */}
              <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
