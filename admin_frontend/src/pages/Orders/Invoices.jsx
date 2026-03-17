import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

// Firebase Imports
import { collectionGroup, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebase Orders (Invoices)
  useEffect(() => {
    const ordersQuery = collectionGroup(db, "orders");

    const unsubscribe = onSnapshot(
      ordersQuery,
      (querySnapshot) => {
        const fetchedInvoices = [];
        querySnapshot.forEach((doc) => {
          fetchedInvoices.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        fetchedInvoices.sort((a, b) => b.createdAt - a.createdAt);
        setInvoices(fetchedInvoices);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching live invoices:", error);
        toast.error("Failed to load live invoices!");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getPaymentStatus = (order) => {
    if (order.paymentMethod === "stripe") return "Paid";
    if (order.status === "Delivered") return "Paid";
    return "Pending";
  };

  const formatPaymentMethod = (method) => {
    if (method === "cod") return "Cash on Delivery";
    if (method === "stripe") return "Stripe (Credit Card)";
    if (method === "bank") return "Bank Transfer";
    return method || "N/A";
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Invoices & Payments
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center p-10 text-gray-500 font-medium">
                No invoices or payments found.
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Order ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Customer Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Total Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Payment Method
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Payment Status
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {invoices.map((invoice) => {
                    // Customer
                    const fName =
                      invoice.shippingAddress?.firstName ||
                      invoice.firstName ||
                      "Customer";
                    const lName =
                      invoice.shippingAddress?.lastName ||
                      invoice.lastName ||
                      "";

                    // Status
                    const paymentStatus = getPaymentStatus(invoice);

                    return (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="px-5 py-4 text-start font-bold text-gray-900 text-[14px]">
                          #{invoice.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 text-[14px] font-medium whitespace-nowrap">
                          {invoice.dateString || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-800 font-semibold text-[14px]">
                          {fName} {lName}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-900 font-black text-[15px]">
                          ${invoice.total?.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-600 font-medium text-[13px] uppercase tracking-wide">
                          {formatPaymentMethod(invoice.paymentMethod)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            size="sm"
                            color={
                              paymentStatus === "Paid" ? "success" : "warning"
                            }
                          >
                            {paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoices;
