import CreatePromotionForm from "./components/CreatePromotionForm";

export default function Page() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800">
          Create New Promotion
        </h3>
        <CreatePromotionForm />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Manage Promotions
        </h3>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-slate-500 uppercase text-sm font-medium">
            Global Promotion Display Strategy
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            Control how promotional pop-ups are shown to customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center">
              <input
                id="promo-show-once"
                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                type="radio"
                defaultValue="show-once"
                defaultChecked
                name="promo-strategy"
              />
              <label
                htmlFor="promo-show-once"
                className="ml-3 block text-sm font-medium text-slate-700"
              >
                Show Once Per Visit
                <span className="block text-xs text-slate-500">
                  Appears once and is dismissed until the next visit.
                </span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="promo-show-always"
                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                type="radio"
                defaultValue="show-always"
                name="promo-strategy"
              />
              <label
                htmlFor="promo-show-always"
                className="ml-3 block text-sm font-medium text-slate-700"
              >
                Show On Every Page Load
                <span className="block text-xs text-slate-500">
                  Reappears on every page navigation.
                </span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-center text-slate-500 italic py-8">
            No promotions have been created yet.
          </p>
        </div>
      </div>
    </div>
  );
}
