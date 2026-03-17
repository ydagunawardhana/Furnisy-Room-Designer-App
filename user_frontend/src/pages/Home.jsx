import React, { useEffect, useRef, useState } from "react";
import HeroSlider from "../components/HeroSlider";
import category01 from "../assets/Category_BedRoom.webp";
import category02 from "../assets/Category_LivingRoom.webp";
import category03 from "../assets/Category_Office.webp";
import category04 from "../assets/Category_Accessories.webp";
import category05 from "../assets/Category_KitchenAccessories.webp";
import category06 from "../assets/Category_Decorations.jpg";
import bedIcon from "../assets/bedimg.jpg";
import startRoomImg from "../assets/startroom2.jpg";
import customizableRoomImg from "../assets/Customizableroom.png";
import savedRoomImg from "../assets/savedroom.png";
import Adsimg from "../assets/Adsimg.webp";
import {
  FaShoppingCart,
  FaRegHeart,
  FaExchangeAlt,
  FaRegEye,
  FaCheck,
  FaStar,
  FaInstagram,
  FaHeart,
  FaEllipsisH,
  FaRegCalendar,
  FaPaintBrush,
  FaTimes,
  FaPlus,
  FaExclamationTriangle,
  FaRegUser,
} from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Footer from "../components/Footer";
import ProductModal from "../components/ProductModal";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { TiArrowShuffle } from "react-icons/ti";
import Product3DModal from "../components/Product3DModal";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeTab, setActiveTab] = useState("Best Sellers");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [view3DProduct, setView3DProduct] = useState(null);

  const { toggleWishlist, wishlistItems } = useWishlist();
  const { toggleCompare, compareItems } = useCompare();
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const categoryRef = useRef(null);
  const timeoutRef = useRef(null);
  const [editingDesignId, setEditingDesignId] = useState(null);
  const [designToDelete, setDesignToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [user, setUser] = useState(null);

  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetchedProducts = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setProductsList(fetchedProducts);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Data Fetch
  useEffect(() => {
    const fetchDesigns = async () => {
      if (isSavedModalOpen && user) {
        try {
          const designsRef = collection(db, "users", user.uid, "savedDesigns");
          const snapshot = await getDocs(designsRef);
          const designsList = snapshot.docs.map((doc) => doc.data());

          designsList.sort((a, b) => b.id - a.id);
          setSavedDesigns(designsList);
        } catch (error) {
          console.error("Error fetching designs: ", error);
        }
      }
    };

    fetchDesigns();
  }, [isSavedModalOpen, user]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

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

        const updatedDesigns = savedDesigns.map((d) =>
          d.id === id ? { ...d, name: editingName.trim() } : d
        );
        setSavedDesigns(updatedDesigns);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "toast-enter" : "toast-exit"
              } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3`}
            >
              <div className="shrink-0">
                <CheckmarkIcon />
              </div>
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

      const updatedDesigns = savedDesigns.filter(
        (d) => d.id !== designToDelete.id
      );
      setSavedDesigns(updatedDesigns);
      setDesignToDelete(null);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3`}
          >
            <div className="shrink-0">
              <ErrorIcon />
            </div>
            <span className="text-[14px] font-medium">Design removed!</span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    } catch (error) {
      console.error("Error deleting design: ", error);
    }
  };

  const scrollLeft = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Top Collections Slider References and Functions
  const topCollectionRef = useRef(null);

  const scrollTCLeft = () => {
    if (topCollectionRef.current) {
      topCollectionRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollTCRight = () => {
    if (topCollectionRef.current) {
      topCollectionRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  let sortedForTabs = [...productsList];

  if (activeTab === "New Arrivals") {
    sortedForTabs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (activeTab === "Best Sellers") {
    sortedForTabs.sort((a, b) => {
      const priceA = parseFloat(
        String(a.price || "0").replace(/[^0-9.-]+/g, "")
      );
      const priceB = parseFloat(
        String(b.price || "0").replace(/[^0-9.-]+/g, "")
      );
      return priceA - priceB;
    });
  } else if (activeTab === "Featured") {
    sortedForTabs.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  const filteredFeaturedProducts = sortedForTabs.slice(0, 10);

  return (
    <div className="w-full">
      {/* --- Hero Slider Section --- */}
      <HeroSlider />

      {/* --- Shop by Category Section --- */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-24 bg-white font-inter relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[34px] font-medium text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-700 text-[17px] font-light">
            Discover everything you need through the categories!
          </p>
        </div>
        {/* Slider Container with Arrows */}
        <div className="relative w-full group">
          {/* Left Side Scroll */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-5 z-10 bg-white shadow-md hover:bg-black hover:text-white rounded-full p-3 
            text-gray-600 transition-all opacity-0 group-hover:opacity-100 focus:outline-none hidden md:block"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>

          {/* Right Side Scroll*/}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-5 z-10 bg-white shadow-md hover:bg-black hover:text-white rounded-full p-3 
            text-gray-600 transition-all opacity-0 group-hover:opacity-100 focus:outline-none hidden md:block"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>

          <div
            ref={categoryRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Bed Room */}
            <div
              className="flex-none w-[220px] lg:w-[320px] snap-start flex flex-col items-center cursor-pointer group/card"
              onClick={() => navigate("/shop")}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={category01}
                  alt="Bed Room"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-gray-800 font-medium text-[18px] ">
                Bed Room
              </h3>
            </div>

            {/* Living Room */}
            <div
              className="flex-none w-[220px] lg:w-[320px] snap-start flex flex-col items-center cursor-pointer group/card"
              onClick={() => navigate("/shop")}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={category02}
                  alt="Living Room"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-gray-800 font-medium text-[18px] relative group">
                Living Room
              </h3>
            </div>

            {/* Office */}
            <div
              className="flex-none w-[220px] lg:w-[320px] snap-start flex flex-col items-center cursor-pointer group/card"
              onClick={() => navigate("/shop")}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={category03}
                  alt="Office"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-gray-800 font-medium text-[18px]">Office</h3>
            </div>

            {/* Accessories */}
            <div
              className="flex-none w-[220px] lg:w-[320px] snap-start flex flex-col items-center cursor-pointer group/card"
              onClick={() => navigate("/shop")}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={category04}
                  alt="Accessories"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-gray-800 font-medium text-[18px]">
                Accessories
              </h3>
            </div>

            {/* Kitchen Accessories */}
            <div
              className="flex-none w-[220px] lg:w-[320px] snap-start flex flex-col items-center cursor-pointer group/card"
              onClick={() => navigate("/shop")}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={category05}
                  alt="Kitchen Accessories"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-gray-800 font-medium text-[18px]">
                Kitchen Accessories
              </h3>
            </div>

            {/* Decorations*/}
            <div
              className="flex-none w-[220px] lg:w-[320px] snap-start flex flex-col items-center cursor-pointer group/card"
              onClick={() => navigate("/shop")}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={category06}
                  alt="Kitchen Accessories"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-gray-800 font-medium text-[18px]">
                Decorations
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- Design in a Room Section --- */}
      <div className="w-full bg-[#f2f2f2] py-16 px-8 md:px-16 lg:px-24 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-[80px] h-[80px] bg-white rounded-[55px] flex items-center justify-center shadow-sm shrink-0">
              <img
                src={bedIcon}
                alt="Bed Icon"
                className="w-[50px] object-contain"
              />
            </div>

            <div>
              <p className="text-gray-800 text-[15px] md:text-base mb-1">
                It looks like you were exploring Furnitures
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-[32px] font-semibold text-gray-900 tracking-tight">
                Get started below to try Design in a room
              </h2>
            </div>
          </div>

          <button className="border-2 border-zinc-400 rounded-full px-6 py-3 text-sm font-semibold w-max hover:bg-black hover:text-white transition-colors">
            Learn more
          </button>
        </div>
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Quick Start */}
          <div className="bg-white flex flex-col h-full rounded-b-xl rounded-t-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[16/10] bg-gray-200 overflow-hidden">
              <img
                src={startRoomImg}
                alt="Quick start room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded text-[14px] font-semibold text-gray-800 shadow-sm border-2 border-zinc-400">
                Quick start
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-[1.4] cursor-pointer group">
                <span className="pb-1 bg-gradient-to-r from-black to-black bg-[length:0%_3px] bg-no-repeat bg-left-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
                  Choose a room to test furnishing ideas now
                </span>
              </h3>

              <button
                onClick={() =>
                  navigate("/designideas", {
                    state: { scrollTo: "empty-rooms-section" },
                  })
                }
                className="mt-auto border-2 border-zinc-400 rounded-full px-6 py-2.5 text-[15px] font-semibold w-max hover:bg-black hover:text-white transition-colors"
              >
                Choose a room
              </button>
            </div>
          </div>

          {/* Card 2: Customizable */}
          <div className="bg-white flex flex-col h-full rounded-b-xl rounded-t-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[16/10] bg-gray-200 overflow-hidden">
              <img
                src={customizableRoomImg}
                alt="Build a room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded text-[14px] font-semibold text-gray-800 shadow-sm border-2 border-zinc-400">
                Customizable
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-[1.4] cursor-pointer group">
                <span className="pb-1 bg-gradient-to-r from-black to-black bg-[length:0%_3px] bg-no-repeat bg-left-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
                  Build a room to plan your layout
                </span>
              </h3>
              <Link
                to="/build-room"
                className="mt-auto border-2 border-zinc-400 rounded-full px-6 py-2.5 text-[15px] font-semibold w-max hover:bg-black hover:text-white transition-colors"
              >
                Build a room
              </Link>
            </div>
          </div>

          {/* Card 3: Most personalized */}
          <div className="bg-white flex flex-col h-full rounded-b-xl rounded-t-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[16/10] bg-gray-200 overflow-hidden">
              <img
                src={savedRoomImg}
                alt="Manage saved layouts"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded text-[14px] font-semibold text-gray-800 shadow-sm border-2 border-zinc-400">
                Most personalized
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-[1.4] cursor-pointer group">
                <span className="pb-1 bg-gradient-to-r from-black to-black bg-[length:0%_3px] bg-no-repeat bg-left-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
                  Manage your saved layouts and continue designing
                </span>
              </h3>
              <button
                onClick={() => setIsSavedModalOpen(true)}
                className="mt-auto border-2 border-zinc-400 rounded-full px-6 py-2.5 text-[15px] font-semibold w-max hover:bg-black hover:text-white transition-colors"
              >
                My Saved Rooms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Featured Products Section --- */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-52 bg-white font-inter">
        <div className="mb-10">
          <h2 className="text-3xl md:text-[34px] font-medium text-gray-800 mb-2">
            Featured Products
          </h2>
          <p className="text-gray-700 text-[16px]">
            Explore the best of Furnisy Featured Collection.
          </p>
        </div>

        {/* Tabs & View All */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-gray-200 pb-2 gap-4">
          <div className="flex items-center gap-8 text-[17px]">
            {/* Best Sellers Button */}
            <button
              onClick={() => setActiveTab("Best Sellers")}
              className={`pb-2 -mb-[10px] transition-all duration-300 ${
                activeTab === "Best Sellers"
                  ? "text-gray-900 font-medium border-b-2 border-gray-900"
                  : "text-gray-500 font-medium border-b-2 border-transparent hover:text-gray-900"
              }`}
            >
              Best Sellers
            </button>

            {/* New Arrivals Button */}
            <button
              onClick={() => setActiveTab("New Arrivals")}
              className={`pb-2 -mb-[10px] transition-all duration-300 ${
                activeTab === "New Arrivals"
                  ? "text-gray-900 font-medium border-b-2 border-gray-900"
                  : "text-gray-500 font-medium border-b-2 border-transparent hover:text-gray-900"
              }`}
            >
              New Arrivals
            </button>

            {/* Featured Button */}
            <button
              onClick={() => setActiveTab("Featured")}
              className={`pb-2 -mb-[10px] transition-all duration-300 ${
                activeTab === "Featured"
                  ? "text-gray-900 font-medium border-b-2 border-gray-900"
                  : "text-gray-500 font-medium border-b-2 border-transparent hover:text-gray-900"
              }`}
            >
              Featured
            </button>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="relative group font-medium text-[17px] text-black hover:text-zinc-700 hover:opacity-70 transition-opacity"
          >
            View All
            <span className="absolute left-0 bottom-0 w-full h-[3px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
          </button>
        </div>

        {/* --- Premium Fade-Up Animation Style --- */}
        <style>{`
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0; 
          }
        `}</style>

        <div
          key={activeTab}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {filteredFeaturedProducts.map((product, index) => {
            const isInWishlist = wishlistItems.some(
              (item) => item.id == product.id
            );

            const isInCompare = compareItems.some(
              (item) => item.id == product.id
            );
            return (
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                key={product.id}
                className="flex flex-col group cursor-pointer animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative w-full aspect-[4/5] bg-[#f5f5f5] rounded-2xl overflow-hidden mb-4 shadow-sm">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {product.badge && (
                    <div
                      className={`absolute top-4 left-4 text-white text-[13px] font-medium px-3 py-1 rounded-md ${
                        typeof product.badge === "object"
                          ? product.badge.color
                          : "bg-black"
                      }`}
                    >
                      {typeof product.badge === "object"
                        ? product.badge.text
                        : product.badge}
                    </div>
                  )}

                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 
                translate-y-4 group-hover:translate-y-0"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        addToCart(product, 1, "Standard Wood", "Coral");
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      <FaShoppingCart />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      {isInWishlist ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      {isInCompare ? (
                        <TiArrowShuffle className="text-red-500 w-6 h-6 font-medium" />
                      ) : (
                        <FaExchangeAlt />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setView3DProduct(null);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      <FaRegEye />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[17px] text-gray-900 font-medium mb-1 capitalize">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[16px]">
                    {product.oldPrice && (
                      <span className="text-gray-400 line-through">
                        {product.oldPrice}
                      </span>
                    )}
                    <span className="text-gray-400 font-light">
                      {product.price}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Be Inspired Ads Section --- */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-52 bg-white font-inter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="w-[600px] h-[400px] md:h-[600px] lg:h-[700px] rounded-xl overflow-hidden shadow-sm group">
            <img
              src={Adsimg}
              alt="Be Inspired Living Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="flex flex-col gap-1 px-6">
            <h2 className="text-4xl md:text-5xl lg:text-[54px] font-light text-gray-900 mb-8 leading-tight">
              Be Inspired...
            </h2>

            {/* Paragraph*/}
            <p className="text-lg text-gray-500 leading-relaxed mb-28 max-w-xl font-light">
              Are you planning on redecorating your living room or freshening
              things up a bit? Find soft furnishings to create a brand-new look
              in no time, or discover your next vibe for a complete refresh...
            </p>

            {/* List */}
            <div className="flex flex-col gap-5 mb-16 text-[17px] text-gray-800">
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-900">
                  <FaCheck className="w-3 h-3" />
                </span>
                <span className="font-medium">
                  Effortless browsing experience
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-900">
                  <FaCheck className="w-3 h-3" />
                </span>
                <span className="font-medium">
                  Access to the finest 5% of designers for your living space
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-900">
                  <FaCheck className="w-3 h-3" />
                </span>
                <span className="font-medium">
                  Secure payment options for peace of mind
                </span>
              </div>
            </div>

            <button className="group bg-[#1a1a19] text-white hover:bg-white hover:text-[#1a1a19] border-2 border-[#1a1a19] px-8 py-4 rounded-[10px] font-medium text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-sm w-max">
              Shop Living Room
              <svg
                className="w-5 h-5 transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-1 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- Top Collections Section --- */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-52 bg-[#f2f2f2] font-inter">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-gray-200 gap-4">
          <div>
            <h2 className="text-3xl md:text-[34px] font-medium text-gray-800 mb-2">
              Top Collections
            </h2>
            <p className="text-gray-700 text-[16.5px]">
              Explore the best of Furnisy Top Collection.
            </p>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="relative group font-medium text-[17px] text-gray-900 hover:text-black hover:opacity-70 transition-opacity"
          >
            View All Collections
            <span className="absolute left-0 bottom-0 w-full h-[3px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
          </button>
        </div>

        {/* Products Slider Area */}
        <div className="relative w-full group/slider">
          <button
            onClick={scrollTCLeft}
            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-5 z-10 bg-white shadow-md hover:bg-black hover:text-white rounded-full 
            p-3 text-gray-600 transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>

          <button
            onClick={scrollTCRight}
            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-5 z-10 bg-white shadow-md hover:bg-black hover:text-white rounded-full 
            p-3 text-gray-600 transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>

          <div
            ref={topCollectionRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {productsList.slice(0, 10).map((product) => {
              const isInWishlist = wishlistItems.some(
                (item) => item.id == product.id
              );

              const isInCompare = compareItems.some(
                (item) => item.id == product.id
              );
              return (
                <div
                  onClick={() => navigate(`/product/${product.id}`)}
                  key={product.id}
                  className="flex-none w-[260px] lg:w-[300px] snap-start flex flex-col group/card cursor-pointer bg-[#f1f1f1]  rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full aspect-[4/5] bg-[#f8f8f8] rounded-lg overflow-hidden mb-5">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />

                    {product.badge && (
                      <div
                        className={`absolute top-4 left-4 text-white text-[13px] font-medium px-3 py-1 rounded-md ${
                          typeof product.badge === "object"
                            ? product.badge.color
                            : "bg-black"
                        }`}
                      >
                        {typeof product.badge === "object"
                          ? product.badge.text
                          : product.badge}
                      </div>
                    )}

                    <div
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-500 
                    translate-y-4 group-hover/card:translate-y-0"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          addToCart(product, 1, "Standard Wood", "Coral");
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                      >
                        <FaShoppingCart />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                      >
                        {isInWishlist ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(product);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                      >
                        {isInCompare ? (
                          <TiArrowShuffle className="text-red-500 w-6 h-6 font-medium" />
                        ) : (
                          <FaExchangeAlt />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                          setView3DProduct(null);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                      >
                        <FaRegEye />
                      </button>
                    </div>
                  </div>

                  <div className="px-1 pb-2">
                    <h3 className="text-[16px] text-gray-900 font-medium mb-1 capitalize">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[15.5px]">
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through">
                          {product.oldPrice}
                        </span>
                      )}
                      <span className="text-gray-700 font-light">
                        {product.price}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Video Gallery Slider Section --- */}
      <div className="w-full py-16 bg-white font-inter relative group/video-slider overflow-hidden">
        <button
          className="video-prev-btn absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:bg-black hover:text-white rounded-full 
        p-4 text-gray-700 transition-all opacity-0 group-hover/video-slider:opacity-100 focus:outline-none hidden md:block cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>

        <button
          className="video-next-btn absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:bg-black hover:text-white rounded-full 
        p-4 text-gray-700 transition-all opacity-0 group-hover/video-slider:opacity-100 focus:outline-none hidden md:block cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>

        {/* Swiper Slider */}
        <Swiper
          onSwiper={setSwiperInstance}
          modules={[Navigation]}
          loop={true}
          centeredSlides={true}
          spaceBetween={30}
          slidesPerView={1.6}
          breakpoints={{
            768: { slidesPerView: 1.5 },
            1024: { slidesPerView: 1.7 },
          }}
          navigation={{
            prevEl: ".video-prev-btn",
            nextEl: ".video-next-btn",
          }}
          className="w-full"
          onInit={(swiper) => {
            setTimeout(() => {
              const activeSlide = swiper?.slides?.[swiper?.activeIndex];
              const activeVideo = activeSlide?.querySelector(".gallery-video");
              if (activeVideo) activeVideo.play().catch((e) => console.log(e));
            }, 100);
          }}
          onSlideChange={(swiper) => {
            const allVideos = document.querySelectorAll(".gallery-video");
            allVideos.forEach((vid) => {
              vid.pause();
              vid.currentTime = 0;
            });

            const activeSlide = swiper?.slides?.[swiper?.activeIndex];
            const activeVideo = activeSlide?.querySelector(".gallery-video");
            if (activeVideo) activeVideo.play().catch((e) => console.log(e));
          }}
        >
          {[
            {
              id: 1,
              url: "/videos/living-room-1.mp4",
            },
            {
              id: 2,
              url: "/videos/living-room-2.mp4",
            },
            {
              id: 3,
              url: "/videos/living-room-5.mp4",
            },
            {
              id: 4,
              url: "/videos/living-room-3.mp4",
            },
            {
              id: 5,
              url: "/videos/living-room-4.mp4",
            },
          ].map((item, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-transform">
                <video
                  className="gallery-video w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  poster={item.thumbnail}
                  muted
                  playsInline
                  onEnded={() => {
                    if (swiperInstance) {
                      swiperInstance.slideNext();
                    }
                  }}
                >
                  <source src={item.url} type="video/mp4" />
                </video>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- News & Blogs Section --- */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-52 bg-[#f2f2f2] font-inter">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl md:text-[34px] font-medium text-gray-800">
            News & Blogs
          </h2>

          <div className="flex gap-3  md:flex">
            <button
              className="blog-prev-btn w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-600
             hover:bg-black hover:text-white hover:border-black transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <button
              className="blog-next-btn w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-600
             hover:bg-black hover:text-white hover:border-black transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Blog Swiper Slider */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1.1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation={{
            prevEl: ".blog-prev-btn",
            nextEl: ".blog-next-btn",
          }}
          className="w-full pb-4"
        >
          {[
            {
              id: 1,
              date: "20 Jan 2025",
              category: "Office Furniture",
              author: "Anna Maria",
              title:
                "Comfortable Chairs Can Help You Create Your Own Home Office Oasis",
              desc: "Make your database provisioning cloud-native using our database generation. Make your database provisioning cloud-native",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fblog%2Fblog-1.webp&w=1920&q=75",
            },
            {
              id: 2,
              date: "14 Aug 2025",
              category: "Office Furniture",
              author: "Anna Maria",
              title:
                "The Ultimate Guide to Choosing a Perfect Furniture for Your Home.",
              desc: "Make your database provisioning cloud-native using our database generation. Make your database provisioning cloud-native",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fblog%2Fblog-2.webp&w=1920&q=75",
            },
            {
              id: 3,
              date: "18 Aug 2025",
              category: "Office Furniture",
              author: "Anna Maria",
              title:
                "The Ultimate Guide to Choosing a Perfect Furniture for Your Home.",
              desc: "Make your database provisioning cloud-native using our database generation. Make your database provisioning cloud-native",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fblog%2Fblog-3.webp&w=1920&q=75",
            },
            {
              id: 4,
              date: "22 Aug 2025",
              category: "Living Room",
              author: "John Doe",
              title: "Top 5 Sofa Trends to Watch Out For in This Year.",
              desc: "Make your database provisioning cloud-native using our database generation. Make your database provisioning cloud-native",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fblog%2Fblog-4.webp&w=1920&q=75",
            },
          ].map((blog) => (
            <SwiperSlide key={blog.id}>
              <div
                className="bg-[#f2f2f2] rounded-[16px] p-4 shadow-sm cursor-pointer transition-all duration-300 
              hover:shadow-[0_20px_25px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 group h-full flex flex-col"
              >
                <div className="w-full aspect-[4/3] rounded-[10px] overflow-hidden mb-6 bg-gray-100">
                  <img
                    src={blog.img}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[13px] font-light text-gray-500 mb-5  border-gray-200 rounded-full px-4 py-1.5 w-max">
                  <span>{blog.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  <span>{blog.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  <span>by {blog.author}</span>
                </div>

                <h3 className="text-[20px] md:text-[22px] font-medium text-gray-600 leading-snug mb-3 group-hover:text-gray-600 transition-colors">
                  {blog.title}
                </h3>

                <p className="text-[14px] text-gray-200 leading-relaxed line-clamp-2 mt-auto font-extralight">
                  {blog.desc}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Review Section (What People Are Saying) --- */}
      <div className="w-full py-20 bg-white font-inter text-center">
        <h2 className="text-3xl md:text-[40px] font-light text-gray-900 mb-12 tracking-tight">
          What People Are Saying
        </h2>

        {/* Testimonial Slider */}
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          className="w-full max-w-5xl mx-auto pb-16 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:rounded-full 
          [&_.swiper-pagination-bullet]:bg-gray-300 [&_.swiper-pagination-bullet-active]:w-5 [&_.swiper-pagination-bullet-active]:bg-gray-800 
          [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300"
        >
          {[
            {
              id: 1,
              name: "Smith Rok",
              role: "Founder, Focus",
              image:
                "https://furnisy.vercel.app/images/home-1/testimonial/user-1.webp",
              quote:
                "Furnisy made furnishing my new apartment a breeze! Their online selection is huge, and the website is so easy to navigate. I found the perfect sofa and dining table at great prices. The whole process, from ordering to delivery, was seamless.",
            },
            {
              id: 2,
              name: "Sarah Jenkins",
              role: "Interior Designer",
              image:
                "https://furnisy.vercel.app/images/home-1/testimonial/user-2.webp",
              quote:
                "As a designer, I am always looking for high-quality, modern pieces for my clients. Furnisy never disappoints. The craftsmanship is excellent, and their customer service team goes above and beyond to ensure everything is perfect.",
            },
            {
              id: 3,
              name: "David Chen",
              role: "Homeowner",
              image:
                "https://furnisy.vercel.app/images/home-1/testimonial/user-1.webp",
              quote:
                "I was hesitant to buy furniture online without seeing it first, but Furnisy's detailed photos and reviews gave me confidence. The bed frame I ordered is incredibly sturdy and looks exactly like the pictures. Highly recommend!",
            },
          ].map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="flex flex-col items-center px-6 md:px-12 pb-16">
                <div className="flex text-[#FABB05] gap-1.5 mb-8 text-[20px]">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                <p className="text-[20px] md:text-[28px] leading-[1.6] text-gray-500 max-w-4xl font-light mb-10">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 ">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-[54px] h-[54px] rounded-full object-cover shadow-sm"
                  />
                  <div className="text-left">
                    <h4 className="text-[15px] font-medium text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Newsletter Subscription Section --- */}
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

      {/* --- Furniture Gallery Section --- */}
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

      {/* --- Footer Section --- */}
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

      {/* --- Quick View Modal Component --- */}
      {quickViewProduct && (
        <ProductModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpen3D={() => {
            setView3DProduct(quickViewProduct);
            setQuickViewProduct(null);
          }}
        />
      )}

      {/* --- 3D View Modal --- */}
      {view3DProduct && (
        <Product3DModal
          product={view3DProduct}
          isOpen={true}
          onClose={() => setView3DProduct(null)}
        />
      )}

      {/* Saved Designs Popup Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-modal-bg">
          <div className="bg-[#f5f5f5]  md:w-[180vh] h-[80vh] md:h-[85vh] rounded-[15px] shadow-2xl overflow-hidden flex flex-col relative animate-modal-box">
            {/* Close Button */}
            <button
              onClick={() => setIsSavedModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-zinc-300 hover:bg-yellow-300 
                    transition-colors z-10 text-gray-600"
            >
              <FaTimes size={18} />
            </button>

            {/* Modal Header */}
            <div className="p-20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 ">
              <h2 className="text-[35px] font-bold text-[#333] tracking-tight">
                Select a design to Edit or create a new one
              </h2>
              <button
                onClick={() => navigate("/build-room")}
                className="bg-[#111] text-white px-6 py-3.5 rounded-full font-semibold flex items-center gap-2.5 hover:bg-white hover:text-black border-2 
                      transition-colors shadow-md mr-12 md:mr-0"
              >
                <FaPlus size={14} /> Create a new design
              </button>
            </div>

            {/* Saved Designs Grid */}
            <div className="p-20 pt-4 overflow-y-auto custom-scrollbar flex-1">
              {!user ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-90 animate-fade-up">
                  <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <FaRegUser size={35} className="text-zinc-500" />
                  </div>
                  <h3 className="text-[22px] font-bold text-gray-800 mb-2">
                    Log in to view your designs
                  </h3>
                  <p className="text-[15px] font-medium text-zinc-600 opacity-70 mb-8 text-center max-w-md leading-relaxed">
                    You need to be logged into your account to save, edit, and
                    access your custom room layouts across all your devices.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-[#111] text-white px-8 py-3.5 rounded-full font-bold text-[15px] hover:bg-white hover:text-black border-2 border-[#111] transition-colors shadow-md"
                  >
                    Log In / Register
                  </button>
                </div>
              ) : savedDesigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-70">
                  <FaPaintBrush size={50} className="mb-4 text-zinc-300" />
                  <p className="text-[18px] font-medium text-gray-600">
                    No saved designs found yet.
                  </p>
                  <p className="text-[14px] mt-1">
                    Start by creating a new design!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 rounded-t-[15px]">
                  {savedDesigns.map((design, index) => (
                    <div
                      key={design.id}
                      className="bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative group"
                      onClick={() => {
                        setIsPreparing(true);
                        setTimeout(() => {
                          navigate("/room-designer", {
                            state: { loadDesign: design },
                          });
                        }, 3000);
                      }}
                    >
                      {/* Thumbnail Placeholder */}
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

                      {/* Details */}
                      <div className="p-5 flex justify-between items-start bg-white">
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
                                if (e.key === "Escape")
                                  setEditingDesignId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-gray-900 text-[16px] mb-1.5 border-b-2 border-black outline-none bg-transparent w-full pb-0.5"
                            />
                          ) : (
                            <h3 className="font-bold text-gray-900 text-[16px] mb-1.5">
                              {design.name || `Untitled Design ${index + 1}`}
                            </h3>
                          )}
                          <div className="flex items-center gap-2 text-gray-500 text-[14px] font-semibold">
                            <FaRegCalendar size={15} />{" "}
                            {design.date || "Just now"}
                          </div>
                        </div>
                        {/* Dropdown Menu */}
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

                          {/* Options */}
                          {openMenuId === design.id && (
                            <div className="absolute right-0 top-10 mt-1 w-32 bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-fade-in">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setEditingDesignId(design.id);
                                  setEditingName(
                                    design.name ||
                                      `Untitled Design ${index + 1}`
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center justify-center gap-2 w-full text-left px-4 py-2.5 text-[14px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                              >
                                <MdOutlineDriveFileRenameOutline size={23} />
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
                                <IoMdRemoveCircleOutline size={23} />
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/*  Loading Screen Overlay (Preparing your room) */}
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

export default Home;
