import React, { createContext, useState, useContext, useEffect } from "react";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const savedCompare = localStorage.getItem("furnisy_compare");
      return savedCompare ? JSON.parse(savedCompare) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("furnisy_compare", JSON.stringify(compareItems));
  }, [compareItems]);

  const clearCompare = () => setCompareItems([]);

  const toggleCompare = (product) => {
    const existing = compareItems.find((item) => item.id == product.id);

    if (existing) {
      setCompareItems((prev) => prev.filter((item) => item.id != product.id));
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Removed from Compare!
            </span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    } else {
      if (compareItems.length >= 4) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "toast-enter" : "toast-exit"
              } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
            >
              <ErrorIcon size={20} className="text-red-400" />
              <span className="text-[14px] font-medium">
                You can only compare up to 4 items!
              </span>
            </div>
          ),
          { position: "top-right", duration: 3000 }
        );
        return;
      }

      setCompareItems((prev) => [
        ...prev,
        { ...product, inStock: product.inStock !== false },
      ]);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">Added to Compare!</span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    }
  };

  const removeFromCompare = (id) => {
    setCompareItems((prev) => prev.filter((item) => item.id != id));
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <ErrorIcon size={20} className="text-red-400" />
          <span className="text-[14px] font-medium">Removed from Compare!</span>
        </div>
      ),
      { position: "top-right", duration: 2000 }
    );
  };

  return (
    <CompareContext.Provider
      value={{ compareItems, toggleCompare, removeFromCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
