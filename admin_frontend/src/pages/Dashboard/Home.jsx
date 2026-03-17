import React, { useState, useEffect } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import TopSellingCategories from "../../components/ecommerce/TopSellingCategories";
import TopCustomers from "../../components/ecommerce/TopCustomers";
import PageMeta from "../../components/common/PageMeta";
import { FaSpinner } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    customersCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    recentOrders: [],
    allOrders: [],
    outOfStockCount: 0,
    total3DDesigns: 0,
    categorySales: [],
    topCustomers: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const totalCustomers = usersSnapshot.size;

        let allOrders = [];
        let revenue = 0;
        let total3DDesignsCount = 0;

        await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            try {
              const designsRef = collection(
                db,
                "users",
                userDoc.id,
                "savedDesigns"
              );
              const designsSnap = await getDocs(designsRef);
              total3DDesignsCount += designsSnap.size;

              const ordersRef = collection(db, "users", userDoc.id, "orders");
              const ordersSnap = await getDocs(ordersRef);

              ordersSnap.docs.forEach((orderDoc) => {
                const orderData = orderDoc.data();
                allOrders.push({
                  id: orderDoc.id,
                  userId: userDoc.id,
                  customerName: userDoc.data().firstName
                    ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
                    : userDoc.data().name || "Unknown User",
                  ...orderData,
                });

                const orderTotal =
                  parseFloat(orderData.totalAmount) ||
                  parseFloat(orderData.totalPrice) ||
                  parseFloat(
                    orderData.total?.toString().replace(/[^0-9.-]+/g, "")
                  ) ||
                  0;

                revenue += orderTotal;
              });
            } catch (err) {
              console.log(`Error fetching data for user ${userDoc.id}:`, err);
            }
          })
        );

        const productsRef = collection(db, "products");
        const productsSnap = await getDocs(productsRef);
        let outOfStock = 0;
        productsSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (
            data.stock <= 0 ||
            data.quantity <= 0 ||
            data.status === "Out of Stock"
          ) {
            outOfStock++;
          }
        });

        const categoryCounts = {};
        allOrders.forEach((order) => {
          const items = order.items || order.cartItems || [];
          items.forEach((item) => {
            let rawCat = item.category || "Other";
            let cat = "Other";
            if (Array.isArray(rawCat)) {
              cat = rawCat[0];
            } else if (typeof rawCat === "string") {
              cat = rawCat.split(",")[0].trim();
            }
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          });
        });

        const topCategories = Object.keys(categoryCounts)
          .map((key) => ({
            name: key,
            count: categoryCounts[key],
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const customerTotals = {};
        allOrders.forEach((order) => {
          const name = order.customerName || "Guest User";
          const total =
            parseFloat(order.totalAmount) ||
            parseFloat(order.totalPrice) ||
            parseFloat(order.total?.toString().replace(/[^0-9.-]+/g, "")) ||
            0;
          if (customerTotals[name]) {
            customerTotals[name] += total;
          } else {
            customerTotals[name] = total;
          }
        });
        const topCustomersList = Object.keys(customerTotals)
          .map((name) => ({
            name: name,
            total: customerTotals[name],
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 4);

        allOrders.sort(
          (a, b) =>
            new Date(
              b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0
            ) -
            new Date(
              a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0
            )
        );

        setDashboardData({
          customersCount: totalCustomers,
          ordersCount: allOrders.length,
          totalRevenue: revenue,
          recentOrders: allOrders.slice(0, 6),
          allOrders: allOrders,
          outOfStockCount: outOfStock,
          total3DDesigns: total3DDesignsCount,
          categorySales: topCategories,
          topCustomers: topCustomersList,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Furnisy - Admin Dashboard" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <EcommerceMetrics data={dashboardData} />
          <MonthlySalesChart data={dashboardData} />
          <StatisticsChart data={dashboardData} />
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <MonthlyTarget data={dashboardData} />
          <TopSellingCategories data={dashboardData} />

          <TopCustomers data={dashboardData} />
        </div>

        <div className="col-span-12">
          <RecentOrders orders={dashboardData.recentOrders} />
        </div>
      </div>
    </>
  );
}
