import React from "react";
import PageMeta from "../components/common/PageMeta";

const Support = () => {
  return (
    <>
      <PageMeta
        title="Support | Admin Dashboard"
        description="Contact support for assistance."
      />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Support
        </h1>
        <div className="max-w-md p-6 bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:bg-white/[0.03] dark:border-white/[0.05]">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Need Help?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            If you encounter any issues or have questions regarding the system, please reach out to our administration team.
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/[0.05]">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Contact Admin Support at:
            </p>
            <a
              href="mailto:admin@mindaura.com"
              className="text-brand-500 hover:underline font-semibold mt-1 block"
            >
              admin@mindaura.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
