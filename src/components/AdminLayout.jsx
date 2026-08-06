import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    // Wrapper utama yang tadinya ada di tiap halaman, pindah ke mari
    <div className="flex h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] text-gray-800 relative">
      {/* Sidebar statis di kiri */}
      <Sidebar />

      {/* Konten utama di kanan */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Outlet /> ini ibarat "lubang" tempat halaman lu (Dashboard, Menu, dll) bakal dimunculin */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
