import React from "react";
import logo from "../assets/logo.svg";
import paymentImg from "../assets/Payment_img.png";

const Footer = () => {
  return (
    <footer className="w-full bg-[#f1f1f1] pt-16 pb-8  border-gray-100 font-inter text-gray-500">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          <div className="lg:col-span-1">
            <img
              src={logo}
              alt="Furnisy"
              className="h-16 mb-6 object-contain"
            />
            <p className="text-[16px] leading-relaxed text-gray-500 pr-4 font-light">
              Furnisy provides you with the essential pieces to build a stunning
              online store for your furniture business.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium text-gray-900 mb-2">
              Home Decor Solutions
            </h4>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Interior Designer
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Furniture Analytics
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Boutique Furniture Store
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium text-gray-900 mb-2">
              Furnisy
            </h4>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              About Furnisy
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Join Our Team
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Get in Touch
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium text-gray-900 mb-2">
              Resources
            </h4>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Our Customers
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Smart Furniture Finance
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Guides on Furniture Design
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium text-gray-900 mb-2">
              Our Features
            </h4>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Interior Designer
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Furniture Analytics
            </a>
            <a
              href="#"
              className="text-[15px] hover:text-gray-900 transition-colors font-light"
            >
              Boutique Furniture Store
            </a>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200 mb-8 border-b border-zinc-300"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[14.5px]">
          <p>© 2026, All Rights Reserved by Furnisy Furniture</p>
          <div className="flex items-center gap-4">
            <span>We accept</span>
            <img
              src={paymentImg}
              alt="Payment Methods"
              className="h-8 object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
