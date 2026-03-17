import React from "react";

export default function TopCustomers({ data }) {
  const topCustomers = data?.topCustomers || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Customers
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {topCustomers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No customers yet.
          </p>
        ) : (
          topCustomers.map((customer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-3">
                {/* Profile Initial Logo */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-500">Top Buyer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  ${customer.total.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
