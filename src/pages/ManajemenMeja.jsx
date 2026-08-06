import React, { useState, useEffect } from "react";
// 1. Ganti import axios dengan api instance yang udah dibuat
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, QrCode, LogOut, Bell, Search, Plus, Trash2, Printer, X, MonitorSmartphone } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const ManajemenMeja = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // API_URL udah nggak kepake buat request karena udah di-handle api.js
  // Tapi APP_URL tetap kita biarin buat generate link QR Code
  const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";

  const fetchTablesAndSyncStatus = async () => {
    setIsLoading(true);
    try {
      // 2. Ganti axios jadi api, dan persingkat endpoint-nya
      const responseTables = await api.get("/meja");
      const tableData = responseTables.data?.data || responseTables.data || [];
      setTables(tableData);
    } catch (error) {
      console.error("Gagal menarik data meja:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndSyncStatus();
    const interval = setInterval(() => fetchTablesAndSyncStatus(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleKosongkanMeja = async (nomor_meja) => {
    if (window.confirm(`Yakin ingin mengosongkan Meja ${nomor_meja}?`)) {
      try {
        // 3. Ganti axios jadi api
        await api.post("/meja/release", { nomor_meja });
        fetchTablesAndSyncStatus();
      } catch (error) {
        console.error("Gagal mengosongkan meja:", error);
        alert("Gagal mengosongkan meja. Cek koneksi server.");
      }
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    setIsSubmitting(true);
    try {
      // 4. Ganti axios jadi api
      await api.post("/meja/store", { nomor_meja: newTableNumber });
      setNewTableNumber("");
      setIsAddModalOpen(false);
      fetchTablesAndSyncStatus();
    } catch (error) {
      console.error("Gagal menambah meja:", error);
      alert("Gagal menambah meja. Pastikan nomor meja belum digunakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (id, nomor_meja) => {
    if (window.confirm(`Yakin ingin menghapus Meja ${nomor_meja} dari sistem?`)) {
      try {
        // 5. Ganti axios jadi api
        await api.delete(`/meja/${id}`);
        fetchTablesAndSyncStatus();
      } catch (error) {
        console.error("Gagal menghapus meja:", error);
        alert("Gagal menghapus meja. Cek koneksi server.");
      }
    }
  };

  const handlePrint = () => window.print();
  const handleLogout = () => {
    // Pastikan ngehapus semua state lokal saat logout
    localStorage.removeItem("kasir_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  const filteredTables = tables.filter((t) => t.nomor_meja.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalMejaKosong = tables.filter((t) => t.status === "Kosong").length;

  return (
    <div className="flex h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] text-gray-800">
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nomor meja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold border border-amber-200">K</div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Meja & QR Code</h2>
              <p className="text-sm text-gray-500 mt-1">Sistem otomatis mendeteksi meja terisi berdasarkan pesanan aktif.</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setIsAddModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors">
                <Plus size={18} /> Tambah Meja
              </button>
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border border-amber-200">
                Kosong: {totalMejaKosong} / {tables.length}
              </div>
            </div>
          </div>

          {isLoading && tables.length === 0 ? (
            <div className="flex justify-center mt-20 text-amber-500">Sinkronisasi data meja...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredTables.map((table) => (
                <motion.div
                  key={table.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${table.status === "Kosong" ? "bg-green-400" : "bg-red-400"}`}></div>

                  <button onClick={() => handleDeleteTable(table.id, table.nomor_meja)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 bg-white hover:bg-red-50 rounded-full p-1.5 transition-colors" title="Hapus Meja">
                    <Trash2 size={16} />
                  </button>

                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 mt-2 border transition-colors ${table.status === "Kosong" ? "bg-gray-50 text-gray-400 border-gray-100" : "bg-red-50 text-red-500 border-red-100"}`}
                  >
                    <MonitorSmartphone size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Meja {table.nomor_meja}</h3>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full mt-1 mb-4 border ${table.status === "Kosong" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{table.status}</span>

                  <div className="w-full space-y-2 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedTable(table);
                        setQrModalOpen(true);
                      }}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <QrCode size={14} /> QR Code
                    </button>
                    {table.status === "Terisi" && (
                      <button
                        onClick={() => handleKosongkanMeja(table.nomor_meja)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        Kosongkan Meja
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL PRINT QR CODE */}
      <AnimatePresence>
        {qrModalOpen && selectedTable && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
              <div className="flex justify-end p-4 print:hidden">
                <button onClick={() => setQrModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center pb-10 pt-4 px-8 print:py-20">
                <h1 className="text-3xl font-extrabold text-amber-600 mb-1">Mahaasyik.</h1>
                <p className="text-sm font-medium text-gray-500 mb-8 text-center">Scan QR Code di bawah untuk memesan menu</p>
                <div className="p-4 bg-white border-4 border-gray-900 rounded-2xl shadow-lg mb-8">
                  <QRCodeCanvas value={`${APP_URL}/?meja=${selectedTable.nomor_meja}`} size={220} level={"H"} fgColor={"#111827"} />
                </div>
                <div className="bg-gray-900 text-white w-full text-center py-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-300 mb-1">NOMOR MEJA</p>
                  <h2 className="text-4xl font-black tracking-widest">{selectedTable.nomor_meja}</h2>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center print:hidden">
                <button onClick={handlePrint} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <Printer size={20} /> Cetak QR Code
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH MEJA */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Tambah Meja Baru</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-800">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTable}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor/Nama Meja</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: 01, VIP-1, atau Outdoor-A"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  {isSubmitting ? "Menyimpan..." : "Simpan Meja"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style
        dangerouslySetInnerHTML={{
          __html: ` @media print { body * { visibility: hidden; } .print\\:bg-white, .print\\:bg-white * { visibility: visible; } .print\\:bg-white { position: absolute; left: 0; top: 0; width: 100%; height: 100%; } .print\\:hidden { display: none !important; } } `,
        }}
      />
    </div>
  );
};

export default ManajemenMeja;
