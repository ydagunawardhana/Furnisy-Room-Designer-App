import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { TiPlus } from "react-icons/ti";

// Firebase Imports
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const fetchedProducts = [];
        snapshot.forEach((doc) => {
          fetchedProducts.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setProducts(fetchedProducts);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = (productId) => {
    // Confirm Toast Box
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-fade-up" : "animate-fade-down"
          } bg-white p-5 rounded-xl shadow-2xl border border-gray-100 min-w-[300px]`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-[16px]">
                Delete Product?
              </h3>
              <p className="text-gray-500 text-[13px] mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-[14px] font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  toast.loading("Deleting product...", { id: "deleteToast" });

                  const productsRef = collection(db, "products");
                  const q = query(
                    productsRef,
                    where("id", "==", Number(productId))
                  );
                  const snapshot = await getDocs(q);

                  if (!snapshot.empty) {
                    const documentId = snapshot.docs[0].id;
                    await deleteDoc(doc(db, "products", documentId));

                    setProducts((prevProducts) =>
                      prevProducts.filter((p) => p.id !== productId)
                    );

                    toast.success("Product deleted successfully!", {
                      id: "deleteToast",
                    });
                  } else {
                    await deleteDoc(doc(db, "products", String(productId)));
                    setProducts((prevProducts) =>
                      prevProducts.filter((p) => p.id !== productId)
                    );
                    toast.success("Product deleted successfully!", {
                      id: "deleteToast",
                    });
                  }
                } catch (error) {
                  console.error("Error deleting product:", error);
                  toast.error("Failed to delete product.", {
                    id: "deleteToast",
                  });
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-[14px] font-semibold hover:bg-red-600 transition-colors"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            All Products
          </h1>
          <Button
            size="sm"
            startIcon={<TiPlus className="size-4.5 " />}
            onClick={() => navigate("/products/add")}
          >
            Add New Product
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center p-10 text-gray-500 font-medium">
                No products found. Click "Add New Product" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Image
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Product Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Category
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Stock Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 font-bold text-gray-600 text-start text-theme-xs uppercase tracking-wider"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {products.map((product) => {
                    const categoryText = Array.isArray(product.category)
                      ? product.category.join(", ")
                      : product.category || "N/A";

                    return (
                      <TableRow
                        key={product.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="px-5 py-3 text-start">
                          <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                            {product.img ? (
                              <img
                                src={product.img}
                                alt={product.name}
                                className="w-full h-full object-cover mix-blend-multiply"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">
                                NO IMG
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-bold text-[15px] text-gray-900 line-clamp-2">
                            {product.name}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 font-medium text-[13px]">
                          {categoryText}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start font-black text-gray-900 text-[15px]">
                          {product.price}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color="success">
                            In Stock
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/products/edit/${product.id}`}
                              className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors"
                            >
                              <PencilIcon className="size-5" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                            >
                              <TrashBinIcon className="size-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllProducts;
