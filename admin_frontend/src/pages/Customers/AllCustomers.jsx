import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { FaSpinner } from "react-icons/fa";

// Firebase Imports
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const AllCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomersAndOrders = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);

        const fetchedCustomers = await Promise.all(
          usersSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            let joined = "N/A";
            if (data.createdAt) {
              const date = data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt);
              joined = date.toLocaleDateString("en-CA");
            }

            const fullName =
              data.firstName && data.lastName
                ? `${data.firstName} ${data.lastName}`
                : data.name || "Unknown User";

            const profileImg =
              data.photoURL ||
              data.avatar ||
              data.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName
              )}&background=random&color=fff`;

            let userOrderCount = 0;
            try {
              const userOrdersRef = collection(
                db,
                "users",
                docSnap.id,
                "orders"
              );
              const userOrdersSnap = await getDocs(userOrdersRef);
              userOrderCount = userOrdersSnap.size;
            } catch (err) {
              console.log(`Error fetching orders for user ${docSnap.id}:`, err);
            }

            return {
              id: docSnap.id,
              name: fullName,
              email: data.email || "N/A",
              phone: data.phone || "N/A",
              joinedDate: joined,
              totalOrders: data.totalOrders || userOrderCount,
              image: profileImg,
            };
          })
        );

        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersAndOrders();
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            All Customers
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[80px]"
                  >
                    Profile
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
                    Email Address
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Joined Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Total Orders
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan="6"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-2xl text-gray-400" />
                        <span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan="6"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No customers found in the database.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="px-5 py-3 text-start">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                          <img
                            src={customer.image}
                            alt={customer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {customer.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {customer.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {customer.phone}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {customer.joinedDate}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span className="bg-gray-100 text-black px-3 py-1 rounded-full text-1xl font-bold">
                          {customer.totalOrders}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllCustomers;
