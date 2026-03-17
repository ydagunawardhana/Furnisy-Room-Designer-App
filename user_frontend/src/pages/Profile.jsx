import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import HeaderImage from "../assets/header_img.png";
import Footer from "../components/Footer";
import {
  FaUser,
  FaBoxOpen,
  FaPaintBrush,
  FaSignOutAlt,
  FaInstagram,
  FaArrowRight,
  FaTimes,
  FaPlus,
  FaEllipsisH,
  FaRegCalendar,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import {
  MdArchive,
  MdCancel,
  MdOutlineDriveFileRenameOutline,
  MdUnarchive,
} from "react-icons/md";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import startRoomImg from "../assets/startroom2.jpg";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { FaCamera } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [savedDesignsCount, setSavedDesignsCount] = useState(0);
  const [savedDesignsList, setSavedDesignsList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingDesignId, setEditingDesignId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [designToDelete, setDesignToDelete] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const { clearCart, savedAddresses, saveAddress, deleteAddress } = useCart();
  const { clearWishlist } = useWishlist();
  const { clearCompare } = useCompare();
  const [orders, setOrders] = useState([]);
  const [showArchivedOrders, setShowArchivedOrders] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Rename Function
  const saveRename = async (id) => {
    if (editingName.trim() !== "" && user) {
      try {
        const designRef = doc(
          db,
          "users",
          user.uid,
          "savedDesigns",
          id.toString()
        );
        await updateDoc(designRef, { name: editingName.trim() });

        const updatedDesigns = savedDesignsList.map((d) =>
          d.id === id ? { ...d, name: editingName.trim() } : d
        );
        setSavedDesignsList(updatedDesigns);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "toast-enter" : "toast-exit"
              } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3`}
            >
              <CheckmarkIcon />
              <span className="text-[14px] font-medium">
                Design renamed successfully!
              </span>
            </div>
          ),
          { position: "top-right", duration: 2000 }
        );
      } catch (error) {
        console.error("Error updating design name: ", error);
      }
    }
    setEditingDesignId(null);
  };

  // Delete Function
  const confirmDelete = async () => {
    if (!designToDelete || !user) return;
    try {
      const designRef = doc(
        db,
        "users",
        user.uid,
        "savedDesigns",
        designToDelete.id.toString()
      );
      await deleteDoc(designRef);

      const updatedDesigns = savedDesignsList.filter(
        (d) => d.id !== designToDelete.id
      );
      setSavedDesignsList(updatedDesigns);
      setSavedDesignsCount(updatedDesigns.length);
      setDesignToDelete(null);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3`}
          >
            <ErrorIcon />
            <span className="text-[14px] font-medium">Design removed!</span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    } catch (error) {
      console.error("Error deleting design: ", error);
    }
  };

  // Firebase User
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Firestore User
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || currentUser.displayName || "",
            email: currentUser.email || "",
            phone: data.phone || "",
          });
        } else {
          setUserData((prev) => ({
            ...prev,
            email: currentUser.email,
            name: currentUser.displayName || "",
          }));
        }

        // Firebase Saved Designs
        try {
          const designsRef = collection(
            db,
            "users",
            currentUser.uid,
            "savedDesigns"
          );
          const designsSnap = await getDocs(designsRef);
          setSavedDesignsCount(designsSnap.size);

          const dList = designsSnap.docs.map((doc) => doc.data());
          dList.sort((a, b) => b.id - a.id);
          setSavedDesignsList(dList);
        } catch (error) {
          console.error("Error fetching designs count: ", error);
          setSavedDesignsCount(0);
        }

        try {
          const ordersRef = collection(db, "users", currentUser.uid, "orders");
          onSnapshot(ordersRef, (snapshot) => {
            const ordersList = [];
            snapshot.forEach((doc) => {
              ordersList.push({ id: doc.id, ...doc.data() });
            });

            ordersList.sort((a, b) => b.createdAt - a.createdAt);
            setOrders(ordersList);
          });
        } catch (error) {
          console.error("Error fetching live orders: ", error);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // ImgBB Profile Picture Upload Function
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Upload to ImgBB
      const formData = new FormData();
      formData.append("image", file);

      const imgbbApiKey = "714ffa9ca6f167058702c8b37ac27191";

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        const photoURL = data.data.display_url;

        await updateProfile(user, { photoURL });

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { photoURL }, { merge: true });

        setUser({ ...user, photoURL });

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "toast-enter" : "toast-exit"
              } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
            >
              <CheckmarkIcon size={20} className="text-green-400" />
              <span className="text-[14px] font-medium">
                Profile picture updated!
              </span>
            </div>
          ),
          { position: "top-right", duration: 3000 }
        );
      } else {
        throw new Error("ImgBB Upload Failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Failed to update picture.
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    } finally {
      setIsUploadingImage(false);
    }
  };
  // Profile Update Function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        name: userData.name,
        phone: userData.phone,
      });

      if (user.displayName !== userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              Profile updated successfully!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    } catch (error) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Failed to update profile!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    }
  };

  // Context Address Save
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const addressData = {
      id: currentAddress?.id || Date.now().toString(),
      type: formData.get("type") || "Home",
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      street: formData.get("street"),
      city: formData.get("city"),
      zip: formData.get("zip"),
    };

    await saveAddress(addressData);
    setIsAddressModalOpen(false);
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <CheckmarkIcon size={20} className="text-green-400" />
          <span className="text-[14px] font-medium">
            {currentAddress
              ? "Address updated successfully!"
              : "Address saved successfully!"}
          </span>
        </div>
      ),
      { position: "top-right", duration: 3000 }
    );
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
  };

  // Cancel Order Function
  const handleCancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "users", user.uid, "orders", orderId);
      await updateDoc(orderRef, { status: "Cancelled" });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
      );

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              Order Cancelled Successfully!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    } catch (error) {
      console.error("Error canceling order: ", error);
    }
  };

  // Archive Order Function
  const handleArchiveOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "users", user.uid, "orders", orderId);
      await updateDoc(orderRef, { archived: true });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, archived: true } : o))
      );

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">Order Archived!</span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    } catch (error) {
      console.error("Error archiving order: ", error);
    }
  };

  // Unarchive Order Function
  const handleUnarchiveOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "users", user.uid, "orders", orderId);
      await updateDoc(orderRef, { archived: false });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, archived: false } : o))
      );

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              Order Restored to List!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    } catch (error) {
      console.error("Error unarchiving order: ", error);
    }
  };

  // Logout Function
  const handleLogout = async () => {
    clearCart();
    clearWishlist();
    clearCompare();

    localStorage.removeItem("furnisy_cart");
    localStorage.removeItem("furnisy_wishlist");
    localStorage.removeItem("furnisy_compare");

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <CheckmarkIcon size={20} className="text-green-400" />
          <span className="text-[14px] font-medium">
            Logged out successfully!
          </span>
        </div>
      ),
      { position: "top-right", duration: 2000 }
    );
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayedOrders = orders.filter((o) =>
    showArchivedOrders ? o.archived : !o.archived
  );

  return (
    <div className="min-h-screen bg-white font-inter w-full">
      {/* Toast Animation Styles */}
      <style>
        {`
          @keyframes slideInFromRight { 0% { transform: translateX(150%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
          @keyframes slideOutToRight { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(150%); opacity: 0; } }
          .toast-enter { animation: slideInFromRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .toast-exit { animation: slideOutToRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        `}
      </style>

      {/* Page Banner Section */}
      <div
        className="w-full h-[250px] relative flex flex-col items-center justify-center text-white"
        style={{
          backgroundImage: `url(${HeaderImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col items-center gap-3 mt-4">
          <h1 className="text-3xl md:text-[36.4px] font-light capitalize tracking-wide">
            My Profile
          </h1>
          <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
            <Link
              to="/"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <span className="text-white">Profile</span>
          </div>
        </div>
      </div>

      {/* Profile Content Section */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-4 py-16 flex flex-col md:flex-row gap-10">
        {/* Sidebar Menu */}
        <div className="w-full md:w-[30%] lg:w-[25%] flex flex-col gap-2">
          <div className="bg-[#f1f1f1] p-6 rounded-xl flex flex-col items-center mb-2">
            <div className="relative mb-3 group">
              {/* Uploading Spinner or Image/Initial */}
              {isUploadingImage ? (
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-200 border-4 border-white shadow-md">
                  <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#1a1a19] text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md">
                  {userData.name
                    ? userData.name.charAt(0).toUpperCase()
                    : userData.email.charAt(0).toUpperCase()}
                </div>
              )}

              <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors z-10">
                <FaCamera className="text-gray-700 w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                />
              </label>
            </div>

            <h3 className="font-bold text-gray-900 text-[19px]">
              {userData.name || "User"}
            </h3>
            <p className="text-[13px] text-gray-500 font-medium">
              {userData.email}
            </p>
          </div>

          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-lg font-medium text-[16px] transition-all ${
              activeTab === "account"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-zinc-200"
            }`}
          >
            <FaUser size={18} /> Account Details
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-lg font-medium text-[16px] transition-all ${
              activeTab === "addresses"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-zinc-200"
            }`}
          >
            <FaMapMarkerAlt size={18} /> My Addresses
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-lg font-medium text-[16px] transition-all ${
              activeTab === "orders"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-zinc-200"
            }`}
          >
            <FaBoxOpen size={19} /> My Orders
          </button>

          <button
            onClick={() => setActiveTab("designs")}
            className={`flex items-center justify-between px-5 py-3.5 rounded-lg font-medium text-[16px] transition-all ${
              activeTab === "designs"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <FaPaintBrush size={19} /> Saved Designs
            </div>
            {savedDesignsCount > 0 && (
              <span className="bg-zinc-200 text-black px-2 py-0.5 rounded-full text-[12px] font-bold">
                {savedDesignsCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3.5 rounded-lg font-medium text-[16px] text-red-600 hover:bg-red-50  transition-all"
          >
            <FaSignOutAlt size={19} /> Logout
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-[70%] lg:w-[75%]">
          {/* Account Details Tab */}
          {activeTab === "account" && (
            <div className="animate-fade-up">
              <h2 className="text-[26px] font-semibold text-gray-900 mb-6">
                Account Details
              </h2>
              <form onSubmit={handleUpdateProfile} className="bg-white p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-[15px] font-medium text-gray-800 mb-2">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-md border-2 border-zinc-400  focus:border-black outline-none transition-all text-[15px]"
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-[15px] font-medium text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={userData.email}
                      className="w-full px-4 py-3.5 rounded-md border-2 border-zinc-400 bg-gray-50 text-gray-500 outline-none cursor-not-allowed text-[15px]"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  {/* Phone */}
                  <div className="max-w-md">
                    <label className="block text-[15px] font-medium text-gray-800 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+94 7X XXX XXXX"
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData({ ...userData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-md border-2 border-zinc-400 focus:border-black outline-none transition-all text-[15px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#1a1a19] text-white px-8 py-3 rounded-md font-semibold text-[16px] hover:bg-white hover:text-black transition-colors 
                  shadow-sm border-2 border-black"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* My Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-[26px] font-semibold text-gray-900">
                  My Addresses
                </h2>
                <button
                  onClick={() => {
                    setCurrentAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="bg-[#111] text-white px-5 py-2.5 rounded-md font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-white hover:text-black border-2 border-black transition-colors"
                >
                  <FaPlus size={12} /> Add New Address
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-zinc-400 rounded-xl bg-gray-50/50">
                  <FaMapMarkerAlt size={50} className="text-gray-300 mb-3" />
                  <p className="text-[17px] text-gray-500 font-medium">
                    No addresses saved yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border-2 border-zinc-200 rounded-lg p-6 relative bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="bg-black text-white px-3 py-1 rounded-full text-[13px] font-bold mb-4 inline-block">
                        {addr.type}
                      </span>
                      <h3 className="font-bold text-[17px] text-gray-900 mb-1.5">
                        {addr.firstName} {addr.lastName}
                      </h3>
                      <p className="text-[15px] text-gray-600 mb-1 font-normal">
                        {addr.street}, {addr.city}
                      </p>
                      <p className="text-[15px] text-gray-600 mb-2">
                        {addr.country} - {addr.zip}
                      </p>
                      <p className="text-[15px] text-gray-600 mb-5 font-medium">
                        Phone: {addr.phone}
                      </p>

                      <div className="flex gap-4 border-t-2 border-zinc-200 pt-4">
                        <button
                          onClick={() => {
                            setCurrentAddress(addr);
                            setIsAddressModalOpen(true);
                          }}
                          className="text-black hover:text-black hover:bg-zinc-200 rounded-md px-3 py-1 flex items-center gap-2 text-[14px] font-semibold transition-colors"
                        >
                          <FaEdit size={17} /> Edit
                        </button>
                        <div className="w-[2px] h-8 bg-zinc-300"></div>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-600 hover:text-red-600 hover:bg-zinc-200 rounded-md px-3 py-1 flex items-center gap-2 text-[14px] font-semibold transition-colors"
                        >
                          <FaTrash size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="animate-fade-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[26px] font-semibold text-gray-900">
                  {showArchivedOrders ? "Archived Orders" : "My Orders"}
                </h2>

                {(orders.some((o) => o.archived) || showArchivedOrders) && (
                  <button
                    onClick={() => setShowArchivedOrders(!showArchivedOrders)}
                    className="text-[14px] font-bold text-white bg-black  hover:bg-white hover:text-black rounded-lg px-5 py-3 border-2  flex items-center transition-colors gap-1"
                  >
                    {showArchivedOrders
                      ? "View Active Orders"
                      : "View Archived Orders"}
                  </button>
                )}
              </div>

              {displayedOrders.length === 0 ? (
                <div className="animate-fade-up flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-zinc-400 rounded-xl bg-gray-50/50">
                  <FaBoxOpen size={50} className="text-gray-300 mb-3" />
                  <h3 className="text-[19px] font-semibold text-gray-800">
                    {showArchivedOrders
                      ? "No archived orders found"
                      : "No orders yet"}
                  </h3>
                  <p className="text-[14px] text-gray-500 mt-1 font-medium opacity-70">
                    {showArchivedOrders
                      ? "You haven't archived any orders."
                      : "Looks like you haven't made any orders yet."}
                  </p>
                  {!showArchivedOrders && (
                    <Link
                      to="/shop"
                      className="mt-5 border-2 border-black bg-[#111] text-white px-8 py-2.5 rounded-full font-semibold hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                      Start Shopping
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {displayedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border-2 border-zinc-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      {/* Order Details Header */}
                      <div className="flex flex-wrap justify-between items-center border-b-2 border-zinc-100 pb-4 mb-4 gap-4">
                        <div>
                          <span className="text-gray-500 text-[13px] font-medium block mb-1">
                            Order ID
                          </span>
                          <span className="text-black font-bold text-[15px]">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[13px] font-medium block mb-1">
                            Date
                          </span>
                          <span className="text-black font-semibold text-[14px]">
                            {order.dateString}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[13px] font-medium block mb-1">
                            Total Amount
                          </span>
                          <span className="text-black font-bold text-[15px]">
                            ${order.total?.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[13px] font-medium block mb-1">
                            Payment Method
                          </span>
                          <span className="text-black font-semibold text-[14px] uppercase">
                            {order.paymentMethod === "cod"
                              ? "Cash on Delivery"
                              : order.paymentMethod === "Stripe" ||
                                order.paymentMethod === "stripe" ||
                                order.paymentMethod === "paypal"
                              ? "Stripe Payment"
                              : "Bank Transfer"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${
                              order.status === "Processing"
                                ? "bg-orange-100 text-orange-600"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Items List */}
                      <div className="flex flex-col gap-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 border border-zinc-200 rounded-md flex items-center justify-center shrink-0">
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-[80%] h-[80%] object-contain mix-blend-multiply"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[15px] font-semibold text-gray-800 line-clamp-1">
                                {item.name}
                              </h4>
                              <p className="text-[13px] text-gray-500 font-medium mt-0.5">
                                Qty: {item.quantity} | {item.color} |{" "}
                                {item.material}
                              </p>
                            </div>
                            <div className="text-[15px] font-bold text-gray-900">
                              $
                              {(
                                parseFloat(item.price.replace("$", "")) *
                                item.quantity
                              ).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Buttons (Cancel & Archive / Unarchive) */}
                      <div className="flex justify-end gap-4 mt-6 pt-4 border-t-2 border-zinc-100">
                        {showArchivedOrders ? (
                          <button
                            onClick={() => handleUnarchiveOrder(order.id)}
                            className="flex items-center gap-1.5 text-[15px] font-bold text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors"
                          >
                            <MdUnarchive size={21} /> Restore to Orders
                          </button>
                        ) : (
                          <>
                            {order.status === "Processing" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="flex items-center gap-1.5 text-[15px] font-bold text-red-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-md transition-colors"
                              >
                                <MdCancel size={21} /> Cancel Order
                              </button>
                            )}
                            <button
                              onClick={() => handleArchiveOrder(order.id)}
                              className="flex items-center gap-1.5 text-[15px] font-bold text-gray-500 hover:text-black hover:bg-zinc-200 px-4 py-2 rounded-md transition-colors"
                            >
                              <MdArchive size={21} /> Archive
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Designs Tab */}
          {activeTab === "designs" && (
            <div className="animate-fade-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[26px] font-semibold text-gray-900">
                  My Saved Designs
                </h2>

                {savedDesignsList.length > 0 && (
                  <button
                    onClick={() => setIsSavedModalOpen(true)}
                    className="text-[15px] font-semibold text-white bg-black hover:text-black hover:bg-white rounded-lg px-5 py-3 border-2 flex items-center gap-1.5 transition-colors"
                  >
                    View & Edit all <FaArrowRight size={15} />
                  </button>
                )}
              </div>

              {savedDesignsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-zinc-400 rounded-xl bg-gray-50/50">
                  <FaPaintBrush size={50} className="text-gray-300 mb-4" />
                  <h3 className="text-[19px] font-semibold text-gray-800">
                    No designs yet
                  </h3>
                  <p className="text-[14px] text-gray-500 mt-1 font-medium opacity-80 text-center max-w-sm">
                    You haven't saved any custom room designs yet. Start
                    building your dream space!
                  </p>
                  <button
                    onClick={() => navigate("/designideas")}
                    className="mt-6 border-2 border-black bg-[#111] text-white px-8 py-2.5 rounded-full font-semibold hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    Start Designing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {savedDesignsList.slice(0, 4).map((design) => (
                    <div
                      key={design.id}
                      onClick={() => {
                        setIsPreparing(true);
                        setTimeout(() => {
                          navigate("/room-designer", {
                            state: { loadDesign: design },
                          });
                        }, 3000);
                      }}
                      className="border-2 border-zinc-200 rounded-xl p-4 flex gap-4 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer group"
                    >
                      <div className="w-24 h-24 bg-zinc-100 rounded-lg overflow-hidden shrink-0 relative">
                        <img
                          src={design.image}
                          alt="design"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <h4 className="font-bold text-gray-900 text-[16px] truncate">
                          {design.name || "Untitled Design"}
                        </h4>
                        <p className="text-[13px] text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                          {design.date}
                        </p>
                        <p className="text-[15px] font-bold text-black mt-2">
                          ${design.totalPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Subscription Section */}
      <div className="w-full bg-[#f2f2f2] py-20 px-8 md:px-16 lg:px-24 font-inter  border-gray-200">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-[55%] text-center lg:text-left">
            <h2 className="text-[38px] md:text-[48px] lg:text-[52.4px] font-semibold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              Subscribe to our newsletter <br className="hidden md:block" />
              and Grab 30% OFF
            </h2>
            <p className="text-[15px] text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-extralight">
              We believe in keeping you at the forefront of innovation
              information, and inspiration. That's why we invite you to.
            </p>
          </div>

          <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
            <div
              className="relative w-full max-w-[550px] bg-white rounded-full border border-gray-900 p-2 flex items-center shadow-sm focus-within:border-black 
                  focus-within:ring-1 focus-within:ring-black transition-all duration-300"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent outline-none px-6 text-[15px] text-gray-800 placeholder-gray-400"
              />

              <button
                className="bg-[#1a1a19] text-white hover:text-[#1a1a19] border-2 border-[#1a1a19] font-semibold px-1 md:px-8 py-3 rounded-full
                     hover:bg-transparent transition-all active:scale-95 whitespace-nowrap shadow-md cursor-pointer"
              >
                Subscribe now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Furniture Gallery Section */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-24 bg-white font-inter">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl md:text-[34px] font-medium text-gray-900 tracking-tight">
              Furniture Gallery
            </h2>

            {/* Follow Button */}
            <button
              className="flex items-center gap-2.5 bg-gray-900 text-white px-6 py-3 rounded-[10px] bg-[#1a1a19] hover:bg-transparent
                  hover:text-[#1a1a19] border-2 border-[#1a1a19] active:scale-95 shadow-md group cursor-pointer"
            >
              <FaInstagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[16px] md:text-[16px] font-medium">
                Follow
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                id: 1,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-1.webp&w=1920&q=75",
              },
              {
                id: 2,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-2.webp&w=1920&q=75",
              },
              {
                id: 3,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-3.webp&w=1920&q=75",
              },
              {
                id: 4,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-4.webp&w=1920&q=75",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="relative w-full aspect-square md:aspect-[4/5] rounded-[15px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-shadow"
              >
                <img
                  src={item.img}
                  alt={`Gallery Image ${item.id}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100"
                >
                  <FaInstagram className="text-white text-4xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* Animation Styles */}
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(4px); }
          }
          @keyframes modalPopUp {
            0% { opacity: 0; transform: scale(0.92) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-bg {
            animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-modal-box {
            animation: modalPopUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      {/* Address Modal Pop-up */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-bg">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-modal-box">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-black bg-gray-100 hover:bg-zinc-200 p-2 rounded-full transition-colors"
            >
              <FaTimes size={17} />
            </button>
            <h3 className="text-[24px] font-bold text-gray-900 mb-6 border-b-2 border-zinc-100 pb-4">
              {currentAddress ? "Edit Address" : "Add New Address"}
            </h3>

            <form onSubmit={handleSaveAddress} className="flex flex-col gap-5">
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  name="type"
                  defaultValue={currentAddress?.type || "Home"}
                  className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black cursor-pointer"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    defaultValue={currentAddress?.firstName || ""}
                    className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    defaultValue={currentAddress?.lastName || ""}
                    className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={currentAddress?.email || ""}
                    className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={currentAddress?.phone || ""}
                    className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  defaultValue={currentAddress?.street || ""}
                  placeholder="House number and street name"
                  className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Town / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    defaultValue={currentAddress?.city || ""}
                    className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zip"
                    required
                    defaultValue={currentAddress?.zip || ""}
                    className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  defaultValue={currentAddress?.country || "Sri Lanka"}
                  className="w-full border-2 border-zinc-300 rounded-md p-3 outline-none focus:border-black cursor-pointer"
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="USA">United States (USA)</option>
                  <option value="UK">United Kingdom (UK)</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 border-2 border-black bg-[#111] text-white py-3.5 rounded-md font-bold text-[16px] hover:bg-white hover:text-black transition-colors shadow-md"
              >
                {currentAddress ? "Update Address" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Saved Designs Popup Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-modal-bg">
          <div className="bg-[#f5f5f5] md:w-[180vh] h-[80vh] md:h-[85vh] rounded-[15px] shadow-2xl overflow-hidden flex flex-col relative animate-modal-box">
            <button
              onClick={() => setIsSavedModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-zinc-300 hover:bg-yellow-300 transition-colors z-10 text-gray-600"
            >
              <FaTimes size={18} />
            </button>

            <div className="p-10 md:p-20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
              <h2 className="text-[28px] md:text-[35px] font-bold text-[#333] tracking-tight">
                Select a design to Edit or create a new one
              </h2>
              <button
                onClick={() => navigate("/build-room")}
                className="bg-[#111] text-white px-6 py-3.5 rounded-full font-semibold flex items-center gap-2.5 hover:bg-white hover:text-black border-2 transition-colors shadow-md mr-12 md:mr-0"
              >
                <FaPlus size={14} /> Create a new design
              </button>
            </div>

            <div className="px-8 md:px-20 pb-10 pt-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 rounded-t-[15px]">
                {savedDesignsList.map((design, index) => (
                  <div
                    key={design.id}
                    className="bg-white shadow-md hover:shadow-xl rounded-2xl transition-all duration-300 cursor-pointer relative group"
                    onClick={() => {
                      setIsPreparing(true);
                      setTimeout(() => {
                        navigate("/room-designer", {
                          state: { loadDesign: design },
                        });
                      }, 3000);
                    }}
                  >
                    <div className="aspect-[4/3] bg-zinc-200 relative overflow-hidden flex items-center justify-center rounded-t-[15px]">
                      <img
                        src={design.image || startRoomImg}
                        alt="Saved Room"
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="text-white flex items-center gap-2 text-[15px] md:text-[17px] font-bold tracking-wide">
                          <FaPaintBrush size={17} /> Design this room
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex justify-between items-start bg-white rounded-b-[15px]">
                      <div className="flex-1 pr-3">
                        {editingDesignId === design.id ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => saveRename(design.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(design.id);
                              if (e.key === "Escape") setEditingDesignId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-gray-900 text-[16px] mb-1.5 border-b-2 border-black outline-none bg-transparent w-full pb-0.5"
                          />
                        ) : (
                          <h3 className="font-bold text-gray-900 text-[16px] mb-1.5 truncate">
                            {design.name || `Untitled Design ${index + 1}`}
                          </h3>
                        )}
                        <div className="flex items-center gap-2 text-gray-500 text-[14px] font-semibold">
                          <FaRegCalendar size={15} />{" "}
                          {design.date || "Just now"}
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === design.id ? null : design.id
                            );
                          }}
                          className="text-gray-400 hover:text-black p-2 rounded-full hover:bg-zinc-100 transition-colors"
                        >
                          <FaEllipsisH size={18} />
                        </button>

                        {openMenuId === design.id && (
                          <div className="absolute right-0 top-10 mt-1 w-32 bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-fade-in">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDesignId(design.id);
                                setEditingName(
                                  design.name || `Untitled Design ${index + 1}`
                                );
                                setOpenMenuId(null);
                              }}
                              className="flex items-center justify-center gap-2 w-full text-left px-4 py-2.5 text-[14px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                            >
                              <MdOutlineDriveFileRenameOutline size={23} />{" "}
                              Rename
                            </button>
                            <div className="h-[2px] w-full bg-gray-100"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDesignToDelete(design);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center justify-center gap-2 w-full text-left px-4 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <IoMdRemoveCircleOutline size={23} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {designToDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-[420px] p-7 pt-9 relative shadow-2xl animate-fade-up">
            <button
              onClick={() => setDesignToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-zinc-300 rounded-full transition-colors"
            >
              <FaTimes size={18} />
            </button>
            <h3 className="text-[22px] font-bold text-gray-900 mb-2">
              Delete this design?
            </h3>
            <p className="text-[14px] text-gray-600 mb-8">
              Are you sure? You won't be able to access it again.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDesignToDelete(null)}
                className="flex-1 border-2 border-black rounded-full py-3 text-[14px] font-bold text-black hover:bg-black hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-[#e00251] rounded-full py-3 text-[14px] font-bold text-white hover:bg-[#c00245] transition-colors flex items-center justify-center gap-2"
              >
                <FaExclamationTriangle size={15} /> Delete design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen Overlay */}
      {isPreparing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99999] flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white px-16 py-12 rounded-lg shadow-2xl flex flex-col items-center animate-fade-up">
            <h3 className="text-[17px] font-bold text-gray-800 mb-6">
              Preparing your room ...
            </h3>

            <div className="w-4 h-4 bg-zinc-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
