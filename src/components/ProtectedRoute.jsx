import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("kasir_token");
  const userRole = localStorage.getItem("user_role");

  // 1. AUTHENTICATION: Kalau gak ada token, tendang ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. AUTHORIZATION: Kalau role user gak ada di daftar allowedRoles, tendang!
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Bisa lu arahin ke halaman unauthorized atau balik ke dashboard biasa
    return <Navigate to="/kasir" replace />;
  }

  // Kalau token ada dan role sesuai, kasih lewat
  return <Outlet />;
};

export default ProtectedRoute;
