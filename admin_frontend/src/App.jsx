import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AllProducts from "./pages/Products/AllProducts";
import AddProduct from "./pages/Products/AddProduct";
import Categories from "./pages/Products/Categories";
import AddCategory from "./pages/Products/AddCategory";
import EditProduct from "./pages/Products/EditProduct";
import AllOrders from "./pages/Orders/AllOrders";
import Invoices from "./pages/Orders/Invoices";
import AllCustomers from "./pages/Customers/AllCustomers";
import SavedRooms from "./pages/Customers/SavedRooms";
import Support from "./pages/Support";
import Settings from "./pages/Settings/Settings";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 95,
        }}
      />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />

            {/* Products */}
            <Route path="/products" element={<AllProducts />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/add" element={<AddCategory />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />

            {/* Orders */}
            <Route path="/orders" element={<AllOrders />} />
            <Route path="/orders/invoices" element={<Invoices />} />

            {/* Customers */}
            <Route path="/customers" element={<AllCustomers />} />
            <Route path="/customers/saved-rooms" element={<SavedRooms />} />

            {/* Support */}
            <Route path="/support" element={<Support />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
