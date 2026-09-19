import { Navigate } from "react-router-dom";

function CustomerRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not a customer
  if (!user || user.role !== "user") {
    return <Navigate to="/" replace />;
  }

  // Authenticated customer
  return children;
}

export default CustomerRoute;