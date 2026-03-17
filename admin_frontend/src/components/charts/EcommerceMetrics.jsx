import { BoxIconLine, GroupIcon } from "../../icons";
import {
  MdOutlineViewInAr,
  MdWarning,
  MdAttachMoney,
  MdShowChart,
} from "react-icons/md";

export default function EcommerceMetrics({ data }) {
  const customers = data?.customersCount || 0;
  const orders = data?.ordersCount || 0;
  const revenue = data?.totalRevenue || 0;
  const outOfStock = data?.outOfStockCount || 0;
  const savedDesigns = data?.total3DDesigns || 0;

  const aov = orders > 0 ? (revenue / orders).toFixed(2) : "0.00";

  const formatCurrency = (amount) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {/* Total Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <MdAttachMoney className="text-green-600 size-7" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(revenue)}
            </h4>
          </div>
        </div>
      </div>

      {/* Total Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <BoxIconLine className="text-blue-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {orders}
            </h4>
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30">
          <MdShowChart className="text-purple-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Order Value
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ${aov}
            </h4>
          </div>
        </div>
      </div>

      {/* Total Customers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {customers}
            </h4>
          </div>
        </div>
      </div>

      {/* 3D Designs Saved */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-zinc-100 rounded-xl dark:bg-zinc-800">
          <MdOutlineViewInAr className="text-zinc-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              3D Designs Saved
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {savedDesigns}
            </h4>
          </div>
        </div>
      </div>

      {/* Out of Stock Alerts */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/50">
          <MdWarning className="text-red-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              Out of Stock Alerts
            </span>
            <h4 className="mt-2 font-bold text-red-700 text-title-sm dark:text-red-400">
              {outOfStock} Products
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
