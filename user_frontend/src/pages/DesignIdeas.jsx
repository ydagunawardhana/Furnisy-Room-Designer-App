import React, { useEffect, useRef, useState } from "react";
import {
  FaInstagram,
  FaPaintBrush,
  FaPause,
  FaPlay,
  FaTimes,
  FaPlus,
  FaEllipsisH,
  FaRegCalendar,
  FaExclamationTriangle,
  FaRegUser,
} from "react-icons/fa";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import bedIcon from "../assets/bedimg.jpg";
import startRoomImg from "../assets/startroom2.jpg";
import customizableRoomImg from "../assets/Customizableroom.png";
import savedRoomImg from "../assets/savedroom.png";
import DesignEmptyRooms from "../components/DesignEmptyRooms";
import DesignFurnishedRooms from "../components/DesignFurnishedRooms";
import Footer from "../components/Footer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const DesignIdeas = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [designToDelete, setDesignToDelete] = useState(null);
  const [editingDesignId, setEditingDesignId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.openSavedModal) {
        setIsSavedModalOpen(true);

        window.history.replaceState({}, document.title);
      }

      if (location.state.scrollTo === "empty-rooms-section") {
        setTimeout(() => {
          const section = document.getElementById("empty-rooms-section");
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          window.history.replaceState({}, document.title);
        }, 500);
      }
    }
  }, [location]);

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

  //  Delete Function
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

  // Play / Pause Function
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowButton(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowButton(false);
    }, 2000);
  };

  // Scroll Function
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Design Tips Data
  const tips = [
    {
      id: 1,
      text: "Tis the season to make your home merry & bright",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      text: "Colorful dorm room ideas that you'll be happy to call home",
      img: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      text: "Scandinavian folklore style is the secret ingredient for your cozy holiday",
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 4,
      text: "Unique dorm room ideas that are too cool for school",
      img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 5,
      text: "A thoughtful home office makeover for better productivity",
      img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 6,
      text: "A guest room makeover you have to see to believe",
      img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=400",
    },
  ];

  const duplicatedTips = [...tips, ...tips];

  return (
    <section className="w-full ">
      {/* Header Section */}
      <div className="relative w-full flex flex-col lg:flex-row items-center py-12 px-6 md:px-12 lg:px-20 max-w-[1750px] mx-auto mt-10 lg:mt-1 mb-6">
        <div
          className="w-full lg:w-[73%] ml-auto relative h-[5450px] md:h-[500px] lg:h-[700px] rounded-[10px] overflow-hidden shadow-md"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Video Section */}
          <video
            ref={videoRef}
            src="/videos/Designideas_1.mp4"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            autoPlay
            loop
            muted
            playsInline
          />

          <button
            onClick={togglePlay}
            className={`absolute bottom-2 left-7 -translate-x-1 -translate-y-2 w-2 h-2 md:w-9 md:h-9 bg-zinc-300 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl z-20 cursor-pointer
          ${showButton ? "opacity-100 visible" : "opacity-0 invisible scale-90"}
            `}
          >
            {isPlaying ? (
              <FaPause size={13} className="text-black" />
            ) : (
              <FaPlay size={13} className="text-black" />
            )}
          </button>

          <div
            className={`absolute inset-0 bg-black/15 transition-opacity duration-500 pointer-events-none ${
              isPlaying ? "opacity-0" : "opacity-100"
            }`}
          ></div>
        </div>
        <div
          className="w-[90%] md:w-[80%] lg:w-[480px] xl:w-[500px] bg-white p-8 md:p-12 
                        relative z-10 -mt-20 lg:mt-0 lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 
                     "
        >
          {/* Logo / Small Title Area */}
          <div className="flex items-center gap-3 text-zinc-600 mb-10 font-bold text-[26px] tracking-wide">
            <div className="p-3 bg-zinc-200 rounded-full">
              <FaPaintBrush size={22} />
            </div>
            <span>Furnisy Creativ</span>
          </div>

          {/* Main Title */}
          <div className="relative group">
            <h2 className="text-[32px] md:text-[40px] leading-[1.3] font-bold text-gray-900 mb-10 tracking-tight cursor-pointer group">
              <span className="pb-1 bg-gradient-to-r from-gray to-zinc-400 bg-[length:0%_3px] bg-no-repeat bg-left-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
                Design your perfect space with Furnisy Creativ
              </span>
            </h2>

            {/* Description */}
            <p className="text-[16px] text-gray-600 leading-[1.7] mb-10 font-light">
              Visualize, plan, and create the home of your dreams. See how
              Furnisy furniture looks together in your space before you buy.
            </p>

            {/* Action Button */}
            <button
              onClick={() => scrollToSection("design-rooms-section")}
              className="border-2 border-black bg-[#111] text-white  text-[15px]  hover:bg-white hover:text-black transition-colors duration-500 px-8 py-3 rounded-md font-bold  
          active:scale-95 shadow-md"
            >
              Start Designing
            </button>
          </div>
        </div>
      </div>

      {/* --- Design in a Room Section --- */}
      <div
        id="design-rooms-section"
        className="w-full bg-[#f2f2f2] py-16 px-8 md:px-16 lg:px-24 "
      >
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
                onClick={() => scrollToSection("empty-rooms-section")}
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

      {/* Empty Rooms Section */}
      <DesignEmptyRooms />

      {/* Furnished Rooms Section */}
      <DesignFurnishedRooms />

      {/* Design Tips Section */}
      <div className="w-full py-10 px-6 md:px-12 lg:px-20 max-w-[1900px] mx-auto overflow-hidden mb-5">
        {/* Auto-scroll */}
        <style>
          {`
          @keyframes infinite-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-infinite-scroll {
            animation: infinite-scroll 40s linear infinite;
            width: max-content;
          }
          .animate-infinite-scroll:hover {
            animation-play-state: paused;
          }
        `}
        </style>

        <div className="flex justify-between items-center mb-10">
          <h2 className="text-[28px] md:text-[34px] font-medium text-gray-900 tracking-tight">
            Furnisy Creativ Design Tips
          </h2>
          <button className="px-5 py-2 border-2 border-zinc-400 rounded-full text-[14px] font-semibold text-gray-800 hover:border-black hover:text-white hover:bg-black transition-colors">
            Read more
          </button>
        </div>

        {/* Slider Container */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-8 animate-infinite-scroll">
            {duplicatedTips.map((tip, index) => (
              <div
                key={index}
                className="w-[290px] md:w-[400px] flex-shrink-0 cursor-pointer group flex flex-col"
              >
                {/* Image Box */}
                <div className="w-full aspect-[4/3] overflow-hidden rounded-lg mb-6 bg-gray-100 shadow-md">
                  <img
                    src={tip.img}
                    alt="design tip"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <p className="text-[14px] text-black leading-[1.7] font-light group-hover:text-black transition-colors flex-grow group">
                  <span className="pb-1 bg-gradient-to-r from-black to-black bg-[length:0%_2px] bg-no-repeat bg-left-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                    {tip.text}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
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
    </section>
  );
};

export default DesignIdeas;
