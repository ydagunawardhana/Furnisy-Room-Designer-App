import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Pagination, Autoplay } from "swiper/modules";
import slide1 from "../assets/Home_img1.png";
import slide2 from "../assets/Home_img2.jpg";
import slide3 from "../assets/Home_img3.webp";
import slide4 from "../assets/Home_img5.jpg";
import slide5 from "../assets/Home_img4.jpg";
import { Link } from "react-router-dom";

const HeroSlider = () => {
  // Slider data
  const slides = [
    {
      id: 1,
      bg: slide1,
      title1: "Modern & Elegant",
      title2: "Furniture",
      desc: "Showcase your furniture collections most appealing way driving customer engagement and boosting sales.",
    },
    {
      id: 2,
      bg: slide2,
      title1: "Furniture That",
      title2: "Speaks Quality",
      desc: "Explore our collection of chairs and sofas, crafted for comfort and elegance in your home spaces.",
    },
    {
      id: 3,
      bg: slide3,
      title1: "Modern Furniture",
      title2: "for Every Space",
      desc: "Find the perfect balance of style and functionality with our premium modern furniture designs.",
    },
    {
      id: 4,
      bg: slide4,
      title1: "Elevate Your Living Space",
      title2: "",
      desc: "Bring warmth and luxury to your everyday life with our beautifully crafted, premium furniture pieces.",
    },
    {
      id: 5,
      bg: slide5,
      title1: "Sleek & Modern Designs",
      title2: "",
      desc: "Upgrade your home with our minimalist furniture collection. Perfect balance of simplicity, functionality, and ultimate style.",
    },
  ];

  return (
    <div className="w-full relative group">
      {/* Pagination & Text Animation */}
      <style>
        {`
          .swiper-pagination-bullet {
            width: 50px;
            height: 7px;
            border-radius: 5px;
            background-color: #1a1a19;
            opacity: 1;
            transition: all 0.3s ease;
          }
          .swiper-pagination-bullet-active {
            background-color: #ffffff;
            opacity: 1;
            width: 40px;
          }

          .swiper-slide .content-title,
          .swiper-slide .content-desc,
          .swiper-slide .content-btn {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.8s ease-out;
          }

          .swiper-slide-active .content-title {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.3s;
          }
          .swiper-slide-active .content-desc {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.5s;
          }
          .swiper-slide-active .content-btn {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.7s;
          }
        `}
      </style>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="w-full h-[600px] lg:h-[800px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* Background Image */}
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat flex items-center px-8 md:px-16 lg:px-24 font-inter transition-all duration-1000"
              style={{ backgroundImage: `url(${slide.bg})` }}
            >
              <div className="max-w-3xl z-10 px-12">
                <h1 className="content-title text-5xl md:text-6xl lg:text-[80px] font-light text-gray-900 leading-tight mb-6">
                  {slide.title1} <br className="hidden md:block" />{" "}
                  {slide.title2}
                </h1>

                <p className="content-desc text-lg md:text-xl text-gray-700 mb-10 max-w-xl leading-relaxed">
                  {slide.desc}
                </p>

                <Link to="/shop">
                  <button
                    className="content-btn group bg-[#1a1a19] text-white hover:bg-transparent hover:text-[#1a1a19] border-2 border-[#1a1a19] 
                px-8 py-4 rounded-[10px] font-medium text-md flex items-center justify-center gap-3 transition-colors duration-300 shadow-sm min-w-[188px]"
                  >
                    Shop Now
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
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;
