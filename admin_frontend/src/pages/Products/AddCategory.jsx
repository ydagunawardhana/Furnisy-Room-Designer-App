import React, { useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase Imports
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Please enter a category name!");
      return;
    }

    setLoading(true);
    try {
      toast.loading("Saving category...", { id: "addCategory" });

      await addDoc(collection(db, "categories"), {
        name: categoryName.trim(),
        createdAt: new Date().getTime(),
      });

      toast.success("Category added successfully!", { id: "addCategory" });
      navigate("/categories");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category.", { id: "addCategory" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Add New Category
          </h1>
          <Link
            to="/categories"
            className="text-sm text-gray-500 hover:text-brand-500 font-semibold"
          >
            &larr; Back to List
          </Link>
        </div>

        <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddCategory;
