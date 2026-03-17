import React from "react";
import Chart from "react-apexcharts";

export default function TopSellingCategories({ data }) {
  const categories = data?.categorySales || [];

  const labels =
    categories.length > 0 ? categories.map((c) => c.name) : ["No Data"];
  const series = categories.length > 0 ? categories.map((c) => c.count) : [1];

  const options = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF", "#00C271", "#FFB020", "#F04438", "#9B51E0"],
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: { show: true, fontSize: "14px", color: "#6B7280" },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
              color: "#111827",
              formatter: (val) => `${val}`,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Top Category",
              fontSize: "14px",
              color: "#6B7280",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ["#ffffff"] },
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit, sans-serif",
      markers: { radius: 12 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: { formatter: (val) => `${val} Items` },
      style: { fontSize: "13px", fontFamily: "Outfit, sans-serif" },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Top Selling Categories
      </h3>
      <div className="flex justify-center items-center h-[320px]">
        <Chart
          options={options}
          series={series}
          type="donut"
          height={320}
          width="100%"
        />
      </div>
    </div>
  );
}
