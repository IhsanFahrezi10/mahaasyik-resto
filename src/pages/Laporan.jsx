import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Receipt, Package, Search, Bell, LogOut, AlertCircle, Printer, Calendar } from "lucide-react";

const Laporan = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("semua");
  const [tanggalPilih, setTanggalPilih] = useState(""); // State khusus nampung tanggal
  const [reportData, setReportData] = useState({
    total_pendapatan: 0,
    total_transaksi: 0,
    riwayat_menu: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      let url = `/laporan?filter=${filter}`;
      // Kalau pilih "Tanggal Tertentu", selipkan tanggalnya ke request
      if (filter === "tanggal_tertentu" && tanggalPilih) {
        url += `&tanggal=${tanggalPilih}`;
      }

      const response = await api.get(url);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error("Gagal menarik data laporan:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Tahan request kalau milih "Tanggal Tertentu" tapi belum nge-klik tanggalnya
    if (filter === "tanggal_tertentu" && !tanggalPilih) return;
    fetchReportData();
  }, [filter, tanggalPilih]);

  const handleLogout = () => {
    localStorage.removeItem("kasir_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  // --- LOGIKA PENAMAAN CETAKAN ---
  const generateNamaPeriode = () => {
    if (filter === "hari_ini") return `Hari Ini (${new Date().toLocaleDateString("id-ID")})`;
    if (filter === "minggu_ini") return "Minggu Ini";
    if (filter === "bulan_ini") return "Bulan Ini";
    if (filter === "tahun_ini") return "Tahun Ini";
    if (filter === "tanggal_tertentu" && tanggalPilih) {
      // Ubah dari YYYY-MM-DD jadi format Indo yang enak dibaca
      return new Date(tanggalPilih).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
    return "Semua Waktu Keseluruhan";
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const periodeCetak = generateNamaPeriode();

    // Setting nama file pas disave jadi PDF
    document.title = `Riwayat Pesanan tanggal ${periodeCetak}`;
    window.print();
    // Balikin title browser semula biar tab-nya normal lagi
    document.title = originalTitle;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] text-gray-800 relative">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 print:hidden">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari sesuatu..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold border border-amber-200">K</div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible bg-white print:bg-white">
          <div className="max-w-6xl mx-auto">
            {/* KOP LAPORAN DI KERTAS PRINT */}
            <div className="hidden print:block mb-8 text-center border-b-2 border-gray-800 pb-6 mt-8">
              <h1 className="text-3xl font-black text-gray-900 mb-2">MAHAASYIK.</h1>
              <h2 className="text-xl font-bold text-gray-700">Laporan Keuangan & Riwayat Pesanan</h2>
              <p className="text-gray-500 mt-1 font-medium">Periode: {generateNamaPeriode()}</p>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 print:hidden">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
                <p className="text-sm text-gray-500 mt-1">Pantau performa restoran berdasarkan rentang waktu.</p>
              </div>

              {/* AREA KONTROL FILTER & CETAK */}
              <div className="flex flex-wrap items-center gap-3">
                {/* JIKA MEMILIH TANGGAL TERTENTU, MUNCULKAN INPUT DATE */}
                {filter === "tanggal_tertentu" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative">
                    <input
                      type="date"
                      value={tanggalPilih}
                      onChange={(e) => setTanggalPilih(e.target.value)}
                      className="appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
                    />
                  </motion.div>
                )}

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      if (e.target.value !== "tanggal_tertentu") setTanggalPilih(""); // Reset tanggal
                    }}
                    className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-sm"
                  >
                    <option value="hari_ini">Hari Ini</option>
                    <option value="minggu_ini">Minggu Ini</option>
                    <option value="bulan_ini">Bulan Ini</option>
                    <option value="tahun_ini">Tahun Ini</option>
                    <option value="tanggal_tertentu">Tanggal Tertentu...</option>
                    <option value="semua">Semua Waktu</option>
                  </select>
                </div>

                <button
                  onClick={handlePrint}
                  disabled={isLoading || (filter === "tanggal_tertentu" && !tanggalPilih)}
                  className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Printer size={16} /> Cetak Laporan
                </button>
              </div>
            </div>

            {isError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6 print:hidden">
                <AlertCircle size={20} />
                <p className="font-medium">Gagal memuat data laporan. Pastikan server menyala.</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-20 text-amber-600 font-semibold print:hidden">Menyinkronkan data...</div>
            ) : (
              <>
                {/* WIDGET SUMMARY CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:grid-cols-2 print:gap-4 print:mb-6">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 print:border-gray-300 print:shadow-none">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 print:border print:border-gray-200">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">{formatRupiah(reportData.total_pendapatan)}</h3>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 print:border-gray-300 print:shadow-none"
                  >
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 print:border print:border-gray-200">
                      <Receipt size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Transaksi Sukses</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">
                        {reportData.total_transaksi} <span className="text-lg font-medium text-gray-400">Nota</span>
                      </h3>
                    </div>
                  </motion.div>
                </div>

                {/* TABEL MENU TERLARIS */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-gray-300 print:shadow-none"
                >
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2 print:border-gray-300">
                    <Package className="text-amber-600 print:text-gray-800" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">Rincian Penjualan Menu</h3>
                  </div>
                  <table className="w-full text-left border-collapse print:text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 text-sm font-semibold text-gray-500 print:bg-gray-100 print:text-gray-800">
                        <th className="py-4 px-6 border-b print:border-gray-300">Peringkat</th>
                        <th className="py-4 px-6 border-b print:border-gray-300">Nama Menu</th>
                        <th className="py-4 px-6 text-center border-b print:border-gray-300">Total Terjual</th>
                        <th className="py-4 px-6 text-right border-b print:border-gray-300">Pemasukan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.riwayat_menu.length > 0 ? (
                        reportData.riwayat_menu.map((item, index) => (
                          <tr key={item.menu_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors print:border-gray-300">
                            <td className="py-4 px-6">
                              <span
                                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index === 0 ? "bg-amber-100 text-amber-700 print:border print:border-gray-400" : index === 1 ? "bg-gray-200 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-800" : "text-gray-400"}`}
                              >
                                #{index + 1}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-medium text-gray-800">{item.menu ? item.menu.name || item.menu.nama || item.menu.nama_menu || "Nama Tidak Terbaca" : "Menu Dihapus"}</td>
                            <td className="py-4 px-6 text-center font-bold text-amber-600 print:text-gray-900">{item.total_terjual} porsi</td>
                            <td className="py-4 px-6 text-right font-medium text-gray-600 print:text-gray-900">{formatRupiah(item.total_uang)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-gray-500 print:text-gray-600">
                            Belum ada data penjualan pada periode ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: ` 
          @media print { 
            body * { visibility: hidden; } 
            .print\\:block { display: block !important; }
            .print\\:hidden { display: none !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:overflow-visible { overflow: visible !important; }
            
            main .flex-1.overflow-auto { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                visibility: visible;
                background-color: white !important;
            } 
            main .flex-1.overflow-auto * { 
                visibility: visible; 
            }
            .bg-gray-50 { background-color: white !important; }
            @page { margin: 20mm; }
          } 
          `,
        }}
      />
    </div>
  );
};

export default Laporan;
