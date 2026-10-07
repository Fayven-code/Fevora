import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Content from "./Content";
import Register from "./Register";
import Login from "./Login";
import AdminRoute from "./AdminRoute";
import CustomerDashboard from "./CustomerDashboard";
import CustomerRoute from "./CustomerRoute";
import ServiceManagement from "./ServiceManagement";
import CreateEmployee from "./CreateEmployee";
import Projects from "./Projects";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/content" element={<AdminRoute><Content /></AdminRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
        <Route path="/services" element={<AdminRoute><ServiceManagement /></AdminRoute>} />
        <Route path="/create-employee" element={<CreateEmployee />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);