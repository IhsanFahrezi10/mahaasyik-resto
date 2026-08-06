import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Tambahin icon TrendingUp buat menu laporan
import { LayoutDashboard, Utensils, QrCode, Users, TrendingUp } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data user dari localStorage (pastikan backend ngirim data role dan disave pas login)
  const user = JSON.parse(localStorage.getItem("user")) || { role: "kasir" };

  const isActive = (path) => location.pathname === path;

  // Tambahkan property 'roles' untuk membatasi akses setiap menu
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/kasir", roles: ["kasir", "developer", "admin"] },
    { name: "Menu Master", icon: <Utensils size={20} />, path: "/kasir/menu", roles: ["kasir", "developer", "admin"] },
    { name: "Manajemen Meja", icon: <QrCode size={20} />, path: "/kasir/meja", roles: ["kasir", "developer", "admin"] },
    { name: "Manajemen Akun", icon: <Users size={20} />, path: "/kasir/manajemen-akun", roles: ["developer", "admin"] },
    // Icon-nya udah gw ganti jadi TrendingUp
    { name: "Laporan", icon: <TrendingUp size={20} />, path: "/kasir/laporan", roles: ["kasir", "developer", "admin"] },
  ];

  // Filter menu berdasarkan role yang sedang aktif
  const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex shadow-sm z-10 h-screen">
      <div>
        <div className="h-20 flex items-center justify-center border-b border-gray-100">
          <h1 className="text-2xl font-bold text-amber-600 tracking-tight">Mahaasyik.</h1>
        </div>

        <nav className="p-4 space-y-2">
          {/* Loop dijalankan pada array yang sudah difilter */}
          {filteredMenu.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive(item.path) ? "bg-amber-50 text-amber-600 cursor-default" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
