import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { FaSpinner } from "react-icons/fa";

// Firebase Imports
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const SavedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllSavedDesigns = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        let allDesigns = [];

        await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const fullName =
              userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData.name || "Unknown User";

            try {
              const designsRef = collection(
                db,
                "users",
                userDoc.id,
                "savedDesigns"
              );
              const designsSnap = await getDocs(designsRef);

              designsSnap.docs.forEach((designDoc) => {
                const designData = designDoc.data();
                allDesigns.push({
                  id: designDoc.id,
                  userId: userDoc.id,
                  customerName: fullName,
                  designName: designData.name || "Untitled Design",
                  dateSaved: designData.date || "N/A",
                  totalPrice: designData.totalPrice || 0,
                  fullDesignObject: designData,
                });
              });
            } catch (err) {
              console.log(
                `Error fetching designs for user ${userDoc.id}:`,
                err
              );
            }
          })
        );

        allDesigns.sort(
          (a, b) => new Date(b.dateSaved) - new Date(a.dateSaved)
        );

        setRooms(allDesigns);
      } catch (error) {
        console.error("Error fetching all saved rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSavedDesigns();
  }, []);

  const handleViewDesignIn3D = (room) => {
    const userPanelUrl = "http://localhost:5173";
    const url = `${userPanelUrl}/room-designer?uid=${room.userId}&did=${room.id}`;
    window.location.href = url;
  };
  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            User Saved Rooms
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
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
                    Design Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Date Saved
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Total Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan="4"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-2xl text-gray-400" />
                        <span>Loading saved designs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan="4"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No saved rooms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={`${room.userId}-${room.id}`}>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {room.customerName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-black font-semibold dark:text-gray-400">
                        {room.designName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[12px] font-medium">
                          {room.dateSaved}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${parseFloat(room.totalPrice).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleViewDesignIn3D(room)}
                        >
                          View Design in 3D
                        </Button>
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

export default SavedRooms;
