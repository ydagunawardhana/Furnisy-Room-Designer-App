import React, { createContext, useState, useContext, useEffect } from "react";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("furnisy_wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("furnisy_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const clearWishlist = () => setWishlistItems([]);

  const toggleWishlist = (product) => {
    const existing = wishlistItems.find((item) => item.id == product.id);

    if (existing) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Removed from Favorites!
            </span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    } else {
      setWishlistItems((prev) => [...prev, { ...product, inStock: true }]);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">Added to Favorites!</span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    }
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <ErrorIcon size={20} className="text-red-400" />
          <span className="text-[14px] font-medium">
            Removed from Favorites!
          </span>
        </div>
      ),
      { position: "top-right", duration: 2000 }
    );
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
