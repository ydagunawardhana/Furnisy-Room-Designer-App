import React, { useState } from "react";
import {
  FaCouch,
  FaBed,
  FaBaby,
  FaDesktop,
  FaUtensils,
  FaPaintBrush,
} from "react-icons/fa";
import fRoom1 from "../assets/Furnishedroom_1.jpeg";
import fRoom2 from "../assets/Furnishedroom_2.jpeg";
import fRoom3 from "../assets/Furnishedroom_3.jpeg";
import fRoom4 from "../assets/Furnishedroom_4.jpeg";
import fRoom5 from "../assets/Furnishedroom_5.jpeg";
import fRoom6 from "../assets/Furnishedroom_6.jpeg";
import fRoom7 from "../assets/Furnishedroom_7.jpeg";
import fRoom8 from "../assets/Furnishedroom_8.jpeg";

const DesignFurnishedRooms = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const rooms = [
    {
      id: 1,
      name: "Contemporary living lounge",
      size: "172 sq ft",
      category: "Living room",
      img: fRoom1,
    },
    {
      id: 2,
      name: "Modern playful workspace",
      size: "247 sq ft",
      category: "Office",
      img: fRoom2,
    },
    {
      id: 3,
      name: "Playful living oasis",
      size: "247 sq ft",
      category: "Living room",
      img: fRoom3,
    },
    {
      id: 4,
      name: "Scandinavian folklore bedroom",
      size: "247 sq ft",
      category: "Bedroom",
      img: fRoom4,
    },
    {
      id: 5,
      name: "Vintage kids room",
      size: "226 sq ft",
      category: "Children's room",
      img: fRoom5,
    },
    {
      id: 6,
      name: "Flexible modern bedroom",
      size: "226 sq ft",
      category: "Bedroom",
      img: fRoom6,
    },
    {
      id: 7,
      name: "Calm Scandinavian bedroom",
      size: "258 sq ft",
      category: "Bedroom",
      img: fRoom7,
    },
    {
      id: 8,
      name: "Minimalist dining setup",
      size: "180 sq ft",
      category: "Dining room",
      img: fRoom8,
    },
  ];

  // Category Buttons
  const categories = [
    { name: "All", icon: null },
    { name: "Living room", icon: <FaCouch size={20} /> },
    { name: "Bedroom", icon: <FaBed size={20} /> },
    { name: "Children's room", icon: <FaBaby size={20} /> },
    { name: "Office", icon: <FaDesktop size={20} /> },
    { name: "Dining room", icon: <FaUtensils size={20} /> },
  ];

  // Active category
  const filteredRooms =
    activeCategory === "All"
      ? rooms
      : rooms.filter((room) => room.category === activeCategory);

  return (
    <section className="w-full py-5 px-6 md:px-12 lg:px-20 max-w-[1750px] mx-auto mb-10">
      {/* Title */}
      <h2 className="text-3xl md:text-[34px] font-medium text-gray-900 tracking-tight mb-10">
        Furnished rooms
      </h2>

      {/* --- Filters and Toggles Row --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-4 px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-300 border ${
                activeCategory === cat.name
                  ? "bg-white border-black border-2 text-black shadow-md"
                  : "bg-gray-50 border-2 border-zinc-200 text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Fully furnished / Semi-furnished Toggle */}
        <div className="flex items-center border-2 border-zinc-300 rounded-md overflow-hidden bg-white">
          <button className="px-4 py-2 text-[14px] font-semibold bg-white text-black border-r-2 border-zinc-300 shadow-md">
            Fully-furnished
          </button>
          <button className="px-4 py-2 text-[14px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            Semi-furnished
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div
        key={activeCategory}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
      >
        {filteredRooms.map((room, index) => (
          <div
            key={room.id}
            className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-400 border-2 border-zinc-200 animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-full aspect-[2/1] overflow-hidden bg-gray-100 relative">
              <img
                src={room.img}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="text-white flex items-center gap-2 text-[15px] md:text-[17px] font-bold tracking-wide">
                  <FaPaintBrush size={17} /> Design this room
                </div>
              </div>
            </div>

            {/* විස්තර කොටස */}
            <div className="p-4 flex flex-col gap-1 bg-white">
              <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-zinc-500 transition-colors">
                {room.name}
              </h3>
              <p className="text-[13px] text-zinc-500 font-semibold">
                {room.size}
              </p>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="col-span-full py-10 text-center text-black">
            No rooms available in this category yet.
          </div>
        )}
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
    </section>
  );
};

export default DesignFurnishedRooms;
