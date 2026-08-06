import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import Layout & HOC
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Import Pages
import LoginKasir from "./pages/LoginKasir";
import DashboardKasir from "./pages/DashboardKasir";
import MenuMaster from "./pages/MenuMaster";
import ManajemenMeja from "./pages/ManajemenMeja";
import ManajemenAkun from "./pages/ManajemenAkun";
import Laporan from "./pages/Laporan";
import MenuPelanggan from "./pages/MenuPelanggan";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTE PELANGGAN (Tidak perlu login) */}
        <Route path="/" element={<MenuPelanggan />} />

        {/* RUTE AUTENTIKASI */}
        <Route path="/login" element={<LoginKasir />} />

        {/* RUTE PROTECTED KASIR & DEVELOPER */}
        <Route element={<ProtectedRoute allowedRoles={["kasir", "developer"]} />}>
          <Route path="/kasir" element={<AdminLayout />}>
            {/* Rute yang bisa diakses Kasir & Developer */}
            <Route index element={<DashboardKasir />} />
            <Route path="menu" element={<MenuMaster />} />
            <Route path="meja" element={<ManajemenMeja />} />
            <Route path="laporan" element={<Laporan />} />
            {/* RUTE PROTECTED KHUSUS DEVELOPER */}
            <Route element={<ProtectedRoute allowedRoles={["developer"]} />}>
              <Route path="manajemen-akun" element={<ManajemenAkun />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback URL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
