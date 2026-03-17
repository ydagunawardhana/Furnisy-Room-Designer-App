import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaSpinner } from "react-icons/fa";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
