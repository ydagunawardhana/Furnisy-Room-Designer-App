import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  collectionGroup,
  getDocs,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const ordersQuery = collectionGroup(db, "orders");

    const unsubscribe = onSnapshot(
      ordersQuery,
      (querySnapshot) => {
        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id,
            ref: doc.ref,
            ...doc.data(),
          });
        });

        fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching live orders:", error);
        toast.error("Failed to load live orders!");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus, orderRef) => {
    try {
      await updateDoc(orderRef, { status: newStatus });
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status!");
    }
  };

  const toggleExpand = (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            All Orders
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center p-10 text-gray-500 font-medium">
                No orders found in the database.
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Order ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Customer Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Total
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Method
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      {/* Main Row */}
                      <TableRow>
                        <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400 font-medium whitespace-nowrap">
                          {order.dateString || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-800 font-medium text-theme-sm dark:text-gray-400">
                          {order.shippingAddress?.firstName || "Customer"}{" "}
                          {order.shippingAddress?.lastName || ""}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-800 font-bold text-theme-sm dark:text-gray-400">
                          ${order.total?.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400 uppercase">
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : order.paymentMethod}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <select
                            value={order.status || "Processing"}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value,
                                order.ref
                              )
                            }
                            className={`h-9 px-3 py-1 text-sm font-bold border rounded-lg focus:outline-none cursor-pointer
                            ${
                              order.status === "Processing"
                                ? "border-orange-200 text-orange-600 bg-orange-50"
                                : ""
                            }
                            ${
                              order.status === "Shipped"
                                ? "border-blue-200 text-blue-600 bg-blue-50"
                                : ""
                            }
                            ${
                              order.status === "Delivered"
                                ? "border-green-200 text-green-600 bg-green-50"
                                : ""
                            }
                            ${
                              order.status === "Cancelled"
                                ? "border-red-200 text-red-600 bg-red-50"
                                : ""
                            }
                          `}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </TableCell>

                        {/* View Items Button Cell */}
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md"
                          >
                            Items
                            {expandedOrderId === order.id ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M5 15l7-7 7-7"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            )}
                          </button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedOrderId === order.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0 border-b-0">
                            <div className="p-5 m-4 mt-1 bg-gray-50 border border-gray-200 rounded-xl shadow-inner dark:bg-gray-800/50 dark:border-gray-700">
                              <h4 className="font-bold text-gray-800 mb-4 text-[15px] dark:text-white">
                                Ordered Products ({order.items?.length || 0})
                              </h4>

                              {/* Items Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                                {order.items?.map((item, idx) => {
                                  const itemPrice = parseFloat(
                                    String(item.price).replace(/[^0-9.-]+/g, "")
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700"
                                    >
                                      <div className="w-14 h-14 bg-gray-50 rounded-md flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                                        <img
                                          src={item.img}
                                          alt={item.name}
                                          className="w-[85%] h-[85%] object-contain mix-blend-multiply dark:mix-blend-normal"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h5
                                          className="text-[14px] font-bold text-gray-800  dark:text-white"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </h5>
                                        <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                                          Qty:{" "}
                                          <span className="text-black font-bold">
                                            {item.quantity}
                                          </span>{" "}
                                          | {item.color}
                                        </p>
                                      </div>
                                      <div className="text-[14px] font-bold text-gray-900 dark:text-white pr-2">
                                        $
                                        {(itemPrice * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Shipping & Contact Details */}
                              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-10">
                                <div>
                                  <span className="text-[12px] text-gray-500 font-medium block mb-1 uppercase tracking-wider">
                                    Shipping Address
                                  </span>
                                  <span className="text-[14px] font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                                      ></path>
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      ></path>
                                    </svg>
                                    {order.shippingAddress?.street},{" "}
                                    {order.shippingAddress?.city},{" "}
                                    {order.shippingAddress?.zip} (
                                    {order.shippingAddress?.country})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[12px] text-gray-500 font-medium block mb-1 uppercase tracking-wider">
                                    Contact Phone
                                  </span>
                                  <span className="text-[14px] font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      ></path>
                                    </svg>
                                    {order.shippingAddress?.phone || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllOrders;
