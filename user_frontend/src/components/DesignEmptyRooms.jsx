import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaPaintBrush } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import designroom1 from "../assets/Neutral_standard_room.jpeg";
import designroom2 from "../assets/Bright_spacious_room.jpeg";
import designroom3 from "../assets/Open_spacious_room.jpeg";
import designroom4 from "../assets/Cozy_contemporary_room.jpeg";
import designroom5 from "../assets/Cool_brushed_room.jpeg";
import designroom6 from "../assets/Peaceful_hideaway_room.jpeg";
import designroom7 from "../assets/Refreshing_oasis_room.jpeg";
import designroom8 from "../assets/Sunny_natural_room.jpeg";
import designroom9 from "../assets/Designroom_8.jpg";

const DesignEmptyRooms = () => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const [isPreparing, setIsPreparing] = useState(false);

  const rooms = [
    {
      id: 1,
      name: "Neutral standard",
      size: "247 sq ft",
      img: designroom1,
      roomData: {
        wallColor: "#c6a693",
        floorStyle: "/pictures/Honey_pine_floor.jpg",
        vertices: [
          [0, 0],
          [480, 0],
          [480, 465],
          [0, 465],
        ],
        placedItems: [
          {
            id: "door-1",
            wallIndex: 0,
            localX: 80,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },
          {
            id: "window-1",
            wallIndex: 3,
            localX: -130,
            itemDef: {
              model: "/models/windows/Sliding_Window.glb",
              width: 120,
              height: 100,
              elevation: 70,
              scale: [5, 5, 1],
              zOffset: 6,
            },
          },
        ],
      },
    },

    {
      id: 2,
      name: "Bright spacious",
      size: "215 sq ft",
      img: designroom2,
      roomData: {
        wallColor: "#6d8c61",
        floorStyle: "/pictures/Plush_grey_carpet_floor.jpg",

        vertices: [
          [0, 86],
          [362.5, 86],
          [460, 0],
          [557.5, 86],
          [557.5, 578.5],
          [432.5, 578.5],
          [432.5, 511],
          [0, 511],
        ],

        placedItems: [
          {
            id: "door-2",
            wallIndex: 2,
            localX: 0,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },

          {
            id: "french-door-1",
            wallIndex: 0,
            localX: -90,
            itemDef: {
              model: "/models/doors/French_Double_Door.glb",
              width: 130,
              height: 190,
              elevation: 105,
              scale: [1, 1, 1],
            },
          },

          {
            id: "french-door-2",
            wallIndex: 0,
            localX: 90,
            itemDef: {
              model: "/models/doors/French_Double_Door.glb",
              width: 130,
              height: 190,
              elevation: 105,
              scale: [1, 1, 1],
            },
          },
        ],
      },
    },

    {
      id: 3,
      name: "Open spacious",
      size: "473 sq ft",
      img: designroom3,
      roomData: {
        wallColor: "#bfa58a",
        floorStyle: "/pictures/Marble_tile_floor.webp",

        vertices: [
          [0, 0],
          [847.5, 0],
          [847.5, 502.5],
          [0, 502.5],
        ],

        placedItems: [
          {
            id: "door-3",
            wallIndex: 0,
            localX: 330,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
              zOffset: 6,
            },
          },

          {
            id: "window-1",
            wallIndex: 0,
            localX: -130,
            itemDef: {
              model: "/models/windows/Sliding_Window.glb",
              width: 120,
              height: 100,
              elevation: 70,
              scale: [5, 5, 1],
              zOffset: 6,
            },
          },

          {
            id: "french-door-3a",
            wallIndex: 3,
            localX: -100,
            itemDef: {
              model: "/models/doors/French_Double_Door.glb",
              width: 130,
              height: 190,
              elevation: 105,
              scale: [1, 1, 1],
              zOffset: 6,
            },
          },

          {
            id: "french-door-3b",
            wallIndex: 3,
            localX: 100,
            itemDef: {
              model: "/models/doors/French_Double_Door.glb",
              width: 130,
              height: 190,
              elevation: 105,
              scale: [1, 1, 1],
              zOffset: 6,
            },
          },
        ],
      },
    },

    {
      id: 4,
      name: "Cozy contemporary",
      size: "165 sq ft",
      img: designroom4,
      roomData: {
        wallColor: "#dcd3cb",
        floorStyle: "/pictures/Saxony_beige_carpet_floor.webp",

        vertices: [
          [0, 0],
          [462.5, 0],
          [462.5, 360],
          [405, 360],
          [405, 330],
          [0, 330],
        ],

        placedItems: [
          {
            id: "door-4",
            wallIndex: 5,
            localX: 20,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },

          {
            id: "large-window-4",
            wallIndex: 0,
            localX: 0,
            itemDef: {
              model: "/models/doors/Glass_Double_Door.glb",
              width: 250,
              height: 120,
              elevation: 30,
              scale: [1, 1, 1],
            },
          },
        ],
      },
    },

    {
      id: 5,
      name: "Refreshing oasis",
      size: "195 sq ft",
      img: designroom5,
      roomData: {
        wallColor: "#7e9c9f",
        floorStyle: "/pictures/Ash_grey_floor.jpg",

        vertices: [
          [0, 0],
          [450, 0],
          [450, 390],
          [0, 390],
        ],

        placedItems: [
          {
            id: "door-5",
            wallIndex: 0,
            localX: 110,
            itemDef: {
              model: "/models/doors/Glass_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },
          {
            id: "window-5",
            wallIndex: 3,
            localX: -120,
            itemDef: {
              model: "/models/windows/Sliding_Window.glb",
              width: 120,
              height: 100,
              elevation: 80,
              scale: [4.5, 4.5, 1],
              zOffset: 6,
            },
          },
        ],
      },
    },

    {
      id: 6,
      name: "Peaceful hideaway",
      size: "207 sq ft",
      img: designroom6,
      roomData: {
        wallColor: "#674f63",
        floorStyle: "/pictures/Beige_tile_floor.avif",

        vertices: [
          [0, 0],
          [350, 0],
          [350, 59],
          [480, 59],
          [480, 361],
          [350, 361],
          [350, 420],
          [0, 420],
        ],

        placedItems: [
          {
            id: "window-6",
            wallIndex: 7,
            localX: 0,
            itemDef: {
              model: "/models/windows/Sliding_Window.glb",
              width: 120,
              height: 100,
              elevation: 80,
              scale: [4.5, 4.5, 1],
              zOffset: 6,
            },
          },

          {
            id: "door-6a",
            wallIndex: 3,
            localX: 0,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },

          {
            id: "door-6b",
            wallIndex: 4,
            localX: 0,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },

          {
            id: "door-6c",
            wallIndex: 2,
            localX: 0,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
            },
          },
        ],
      },
    },

    {
      id: 7,
      name: "Refreshing oasis",
      size: "228 sq ft",
      img: designroom7,
      roomData: {
        wallColor: "#4e7364",
        floorStyle: "/pictures/Glossy_tile_floor.webp",

        vertices: [
          [0, 0],
          [452.5, 0],
          [452.5, 452.5],
          [0, 452.5],
        ],

        placedItems: [
          {
            id: "door-7",
            wallIndex: 0,
            localX: 100,
            itemDef: {
              model: "/models/doors/French_Double_Door.glb",
              width: 90,
              height: 210,
              elevation: 105,
              scale: [1, 1, 1],
              zOffset: 6,
            },
          },

          {
            id: "sliding-door-7",
            wallIndex: 3,
            localX: -100,
            itemDef: {
              model: "/models/windows/Sliding_Window.glb",
              width: 250,
              height: 200,
              elevation: 90,
              scale: [6.5, 5, 1],
              zOffset: 6,
            },
          },
        ],
      },
    },

    {
      id: 8,
      name: "Sunny natural",
      size: "196 sq ft",
      img: designroom8,
      roomData: {
        wallColor: "#6c4127",
        floorStyle: "/pictures/Cherry_oak_floor.jpg",

        vertices: [
          [0, 0],
          [460, 0],
          [460, 385],
          [0, 385],
        ],

        placedItems: [
          {
            id: "window-8",
            wallIndex: 0,
            localX: 120,
            itemDef: {
              model: "/models/windows/Sliding_Window.glb",
              width: 120,
              height: 100,
              elevation: 80,
              scale: [4.5, 4.5, 1],
              zOffset: 6,
            },
          },
          // 2. තනි දොර - 12' 10" වම් බිත්තියේ (wallIndex: 3)
          {
            id: "door-8",
            wallIndex: 3,
            localX: -80,
            itemDef: {
              model: "/models/doors/Single_Panel_Door.glb",
              width: 90,
              height: 210,
              elevation: 0,
              scale: [1, 1, 1],
              zOffset: 6,
            },
          },
        ],
      },
    },
    
    { id: 9, name: "Modern studio", size: "210 sq ft", img: designroom9 },
    { id: 10, name: "Minimalist layout", size: "190 sq ft", img: designroom9 },
    { id: 11, name: "Rustic charm", size: "280 sq ft", img: designroom9 },
    { id: 12, name: "Urban loft", size: "350 sq ft", img: designroom9 },
  ];

  const firstEightRooms = rooms.slice(0, 8);
  const lastFourRooms = rooms.slice(8, 12);

  return (
    <section
      id="empty-rooms-section"
      className="w-full py-16 px-6 md:px-12 lg:px-20 max-w-[1750px] mx-auto"
    >
      {/* Top Text Section  */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-[34px] font-medium text-gray-900 tracking-tight mb-2">
          Empty Rooms
        </h2>
        <p className="text-gray-500 text-[16px] mb-5">
          Furnisy Creativ is free for everyone. Log in or sign up to save and
          share designs.
        </p>
      </div>

      {/*  Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {firstEightRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => {
              if (room.roomData) {
                setIsPreparing(true);

                setTimeout(() => {
                  navigate("/room-designer", {
                    state: { roomData: room.roomData },
                  });
                }, 3000);
              } else {
                alert("Room data is not configured yet!");
              }
            }}
            className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-400 border-2 border-zinc-200"
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

            <div className="p-4 flex flex-col gap-1 bg-white">
              <h3 className="text-[16px] font-bold text-black group-hover:text-zinc-500 transition-colors">
                {room.name}
              </h3>
              <p className="text-[13px] text-zinc-500 font-semibold">
                {room.size}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-700 ease-in-out ${
          showAll
            ? "grid-rows-[1fr] opacity-100 mt-6 md:mt-8"
            : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {lastFourRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  if (room.roomData) {
                    setIsPreparing(true);

                    setTimeout(() => {
                      navigate("/room-designer", {
                        state: { roomData: room.roomData },
                      });
                    }, 3000);
                  } else {
                    alert("Room data is not configured yet!");
                  }
                }}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-400 border-2 border-zinc-200"
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

                <div className="p-4 flex flex-col gap-1 bg-white">
                  <h3 className="text-[16px] font-bold text-black group-hover:text-zinc-500 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-[13px] text-zinc-500 font-semibold">
                    {room.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-zinc-400 text-gray-700 text-[15px] font-semibold hover:bg-black
         hover:text-white hover:border-gray-400 transition-all shadow-sm"
        >
          {showAll ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          {showAll ? "View less" : "View all"}
        </button>
      </div>

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

export default DesignEmptyRooms;
