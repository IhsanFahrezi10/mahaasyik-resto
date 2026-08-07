import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Pakai file api.js kita
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, Settings, Bell, Search, Clock, CheckCircle, ChefHat, AlertTriangle, WifiOff, User, QrCode, LogOut, Users } from "lucide-react";

const DashboardKasir = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ mejaKosong: 0, stokKritis: 0, totalMeja: 0 });
  const [isError, setIsError] = useState(false);

  // API_URL dihapus karena baseURL udah terpusat di utils/api.js

  const fetchDashboardData = async () => {
    try {
      // Ganti axios.get jadi api.get
      const responseOrders = await api.get(`/orders`);

      const formattedOrders = responseOrders.data.data.map((order) => {
        const itemsArray =
          order.items?.map((item) => {
            const menuName = item.menu?.nama || item.menu?.name || item.menu?.nama_menu || "Menu tidak ditemukan";
            return `${item.jumlah || item.quantity || 1}x ${menuName}`;
          }) || [];

        const totalRupiah = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(order.total_harga || 0);

        const timeString = new Date(order.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: `#ORD-${order.id?.toString().padStart(3, "0")}`,
          original_id: order.id,
          table: order.nomor_meja || order.meja?.nomor_meja || "-",
          customer: order.nama_pelanggan || "Pelanggan",
          items: itemsArray,
          total: totalRupiah,
          status: order.status_pesanan?.toLowerCase() || "pending",
          time: timeString,
        };
      });

      setOrders(formattedOrders);

      // Ganti axios.get jadi api.get
      const responseStats = await api.get(`/dashboard-stats`);

      setStats({
        mejaKosong: responseStats.data.data.mejaKosong || 0,
        stokKritis: responseStats.data.data.stokKritis || 0,
        totalMeja: responseStats.data.data.totalMeja || 0,
      });

      setIsError(false);
    } catch (error) {
      console.error("Gagal menarik data dari server:", error);
      setIsError(true);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // Ganti axios.put jadi api.put
      await api.put(`/orders/${orderId}/status`, {
        status_pesanan: newStatus,
      });
      fetchDashboardData();
    } catch (error) {
      console.error(`Gagal mengubah status pesanan ${orderId}:`, error);
      alert("Gagal merubah status pesanan. Pastikan server aktif.");
    }
  };

  const handleLogout = () => {
    // Bersihkan semua data auth saat logout
    localStorage.removeItem("kasir_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboardData();
    const pollingInterval = setInterval(() => {
      fetchDashboardData();
    }, 3000);
    return () => clearInterval(pollingInterval);
  }, []);

  const waitingOrders = orders.filter((o) => o.status === "menunggu" || o.status === "pending");
  const processingOrders = orders.filter((o) => o.status === "diproses");
  const completedOrders = orders.filter((o) => o.status === "selesai" || o.status === "lunas" || o.status === "paid");

  return (
    <div className="flex h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] text-gray-800 relative">
      {isError && (
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-0 left-0 w-full bg-red-500 text-white py-2 flex items-center justify-center space-x-2 z-50">
          <WifiOff size={18} />
          <span className="font-semibold text-sm">Koneksi Terputus. Gagal menyinkronkan data dengan server.</span>
        </motion.div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari ID Pesanan..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold border border-amber-200">K</div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {/* QUICK INFO WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Meja Kosong</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.mejaKosong} <span className="text-sm font-normal text-gray-400">/ {stats.totalMeja > 0 ? stats.totalMeja : "..."}</span>
                </h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Peringatan Stok</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {stats.stokKritis} <span className="text-sm font-normal text-gray-400">Menu Kritis</span>
                </h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-amber-500 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-amber-100 font-medium text-sm">Pesanan Aktif</p>
                <h3 className="text-3xl font-bold">{waitingOrders.length + processingOrders.length}</h3>
              </div>
              <ChefHat className="absolute right-[-10px] bottom-[-10px] text-amber-400/50" size={80} />
            </motion.div>
          </div>

          {/* KANBAN BOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* KANBAN COLUMN: MENUNGGU */}
            <div className="flex flex-col bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-2 text-orange-600">
                  <Clock size={18} />
                  <h2 className="font-semibold">Menunggu</h2>
                </div>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">{waitingOrders.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 pb-4">
                {waitingOrders.map((order) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={order.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md w-fit">{order.id}</span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center mt-1">
                          <User size={12} className="mr-1" /> {order.customer}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{order.table}</span>
                    </div>

                    <div className="mb-4 space-y-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {order.items.map((menuItem, idx) => (
                        <p key={idx} className="text-sm font-medium text-gray-700 flex items-start">
                          <span className="text-orange-400 mr-2 font-bold">•</span> {menuItem}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-800">{order.total}</span>
                      <div className="flex gap-2">
                        {/* Tombol Batalkan */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Yakin mau membatalkan pesanan ${order.id}? Jangan lupa kembalikan uang customer secara manual/cash!`)) {
                              handleUpdateStatus(order.original_id, "Dibatalkan");
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-sm"
                        >
                          Batalkan
                        </button>

                        {/* Tombol Proses Asli */}
                        <button onClick={() => handleUpdateStatus(order.original_id, "Diproses")} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors shadow-sm">
                          Proses
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* KANBAN COLUMN: DIPROSES */}
            <div className="flex flex-col bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-2 text-blue-600">
                  <ChefHat size={18} />
                  <h2 className="font-semibold">Diproses (Dapur)</h2>
                </div>
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{processingOrders.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 pb-4">
                {processingOrders.map((order) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={order.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md w-fit">{order.id}</span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center mt-1">
                          <User size={12} className="mr-1" /> {order.customer}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{order.table}</span>
                    </div>

                    <div className="mb-4 space-y-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {order.items.map((menuItem, idx) => (
                        <p key={idx} className="text-sm font-medium text-gray-700 flex items-start">
                          <span className="text-blue-400 mr-2 font-bold">•</span> {menuItem}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 flex items-center font-medium">
                        <Clock size={12} className="mr-1" /> Masuk: {order.time}
                      </span>
                      <button onClick={() => handleUpdateStatus(order.original_id, "Selesai")} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors shadow-sm">
                        Selesai
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* KANBAN COLUMN: SELESAI */}
            <div className="flex flex-col bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle size={18} />
                  <h2 className="font-semibold">Selesai / Bayar</h2>
                </div>
                <span className="bg-green-100 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">{completedOrders.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 pb-4 opacity-75 hover:opacity-100 transition-opacity">
                {completedOrders.map((order) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md w-fit">{order.id}</span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center mt-1">
                          <User size={12} className="mr-1" /> {order.customer}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{order.table}</span>
                    </div>

                    <div className="mb-4 space-y-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {order.items.map((menuItem, idx) => (
                        <p key={idx} className="text-sm font-medium text-gray-500 flex items-start">
                          <span className="text-green-400 mr-2 font-bold">•</span> {menuItem}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-800">{order.total}</span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Tuntas</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardKasir;
