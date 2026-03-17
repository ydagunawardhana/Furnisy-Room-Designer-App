import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { PencilIcon, TrashBinIcon, PlusIcon } from "../../icons";
import toast from "react-hot-toast";
import { TiPlus } from "react-icons/ti";

// Firebase Imports
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

const Categories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catSnapshot = await getDocs(collection(db, "categories"));
        const prodSnapshot = await getDocs(collection(db, "products"));

        const allProducts = prodSnapshot.docs.map((doc) => doc.data());

        const fetchedCategories = catSnapshot.docs.map((docSnap) => {
          const catData = docSnap.data();

          const count = allProducts.filter((p) => {
            if (Array.isArray(p.category)) {
              return p.category.some(
                (c) => c.toLowerCase() === catData.name?.toLowerCase()
              );
            }
            return p.category?.toLowerCase() === catData.name?.toLowerCase();
          }).length;

          return {
            id: docSnap.id,
            name: catData.name,
            productCount: count,
          };
        });

        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = (id) => {
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
                Delete Category?
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
                  toast.loading("Deleting category...", { id: "deleteCat" });

                  await deleteDoc(doc(db, "categories", id));

                  setCategories((prev) => prev.filter((c) => c.id !== id));
                  toast.success("Category deleted successfully!", {
                    id: "deleteCat",
                  });
                } catch (error) {
                  console.error("Error deleting category:", error);
                  toast.error("Failed to delete category.", {
                    id: "deleteCat",
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
      { duration: Infinity, position: "top-center" }
    );
  };

  // Edit Modal
  const handleEdit = (id) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setSelectedCategory(category);
      setEditName(category.name);
      setIsEditModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (selectedCategory && editName.trim()) {
      setSaving(true);
      try {
        toast.loading("Updating category...", { id: "updateCat" });

        const catRef = doc(db, "categories", selectedCategory.id);
        await updateDoc(catRef, {
          name: editName.trim(),
        });

        setCategories(
          categories.map((c) =>
            c.id === selectedCategory.id ? { ...c, name: editName.trim() } : c
          )
        );

        toast.success("Category updated successfully!", { id: "updateCat" });
        handleCloseModal();
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category.", { id: "updateCat" });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    setEditName("");
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Categories
          </h1>
          <Button
            size="sm"
            startIcon={<TiPlus className="size-5" />}
            onClick={() => navigate("/categories/add")}
          >
            Add New Category
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Category Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    No. of products
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan="3"
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan="3"
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      No categories found. Click 'Add New Category' to create
                      one.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {category.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start align-middle">
                        <span className="inline-block bg-slate-100 border border-slate-200 text-slate-800 px-4 py-1.5 rounded-full text-[13.5px] font-bold ">
                          {category.productCount}{" "}
                          <span className="text-slate-500 font-medium ml-1">
                            Products
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category.id)}
                            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                          >
                            <TrashBinIcon className="size-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        className="max-w-[450px] p-6 sm:p-8"
      >
        <div className="flex flex-col">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Edit Category
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                type="text"
                id="categoryName"
                placeholder="Enter category name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-8">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCloseModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Categories;
