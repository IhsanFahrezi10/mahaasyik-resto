import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, QrCode, LogOut, Bell, Search, Plus, Edit, Trash2, X, Image as ImageIcon, Filter, CheckCircle2, XCircle, Upload } from "lucide-react";

const MenuMaster = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // STATE UNTUK FILTERING
  const [filterUtama, setFilterUtama] = useState("Semua");
  const [filterOlahan, setFilterOlahan] = useState("Semua");

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const STORAGE_URL = "http://127.0.0.1:8000/storage"; // URL untuk akses foto dari backend

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    type: "Makanan",
    category: "",
    price: "",
    stok: "",
    is_available: true,
  });

  // STATE BARU KHUSUS UNTUK UPLOAD FOTO
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const kategoriMinumanList = ["Jus", "Minuman"];
  const getTipeDariKategori = (kategori) => (kategoriMinumanList.includes(kategori) ? "Minuman" : "Makanan");

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/menus`);
      const menuData = response.data?.data || response.data;
      setMenus(menuData);
    } catch (error) {
      console.error("Gagal menarik data menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const existingMakananCategories = [
    ...new Set(
      menus
        .filter((m) => getTipeDariKategori(m.category) === "Makanan")
        .map((m) => m.category)
        .filter(Boolean),
    ),
  ];
  const existingMinumanCategories = [
    ...new Set(
      menus
        .filter((m) => getTipeDariKategori(m.category) === "Minuman")
        .map((m) => m.category)
        .filter(Boolean),
    ),
  ];

  const getDatalistOptions = () => {
    return formData.type === "Makanan" ? existingMakananCategories : existingMinumanCategories;
  };

  // Fungsi saat user pilih file foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const openModal = (mode, menu = null) => {
    setModalMode(mode);
    setFoto(null); // Reset file foto setiap buka modal

    if (mode === "edit" && menu) {
      setFormData({
        id: menu.id,
        name: menu.nama || menu.name, // Support 'nama' (Laravel) atau 'name' (React lama)
        type: getTipeDariKategori(menu.category),
        category: menu.category,
        price: menu.price,
        stok: menu.stok ?? 0,
        is_available: menu.is_available,
      });
      // Tampilkan foto lama kalau ada
      setPreview(menu.foto ? `${STORAGE_URL}/${menu.foto}` : null);
    } else {
      setFormData({ id: null, name: "", type: "Makanan", category: "", price: "", stok: "", is_available: true });
      setPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // WAJIB PAKAI FORMDATA KARENA ADA FILE
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("price", formData.price);
      payload.append("stok", parseInt(formData.stok) || 0);

      if (foto) {
        payload.append("foto", foto);
      }

      const headers = { "Content-Type": "multipart/form-data" };

      if (modalMode === "add") {
        await axios.post(`${API_URL}/menus`, payload, { headers });
      } else {
        // TRIK LARAVEL: Method spoofing untuk update pakai FormData
        payload.append("_method", "PUT");
        await axios.post(`${API_URL}/menus/${formData.id}`, payload, { headers });
      }

      setIsModalOpen(false);
      fetchMenus();
    } catch (error) {
      console.error("Gagal menyimpan menu", error);
      alert("Gagal menyimpan data! Cek koneksi backend atau pastikan form terisi dengan benar.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin mau hapus menu ini?")) {
      try {
        await axios.delete(`${API_URL}/menus/${id}`);
        fetchMenus();
      } catch (error) {
        console.error("Gagal menghapus", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kasir_token");
    navigate("/login");
  };

  let filteredMenus = menus.filter((menu) => (menu.nama || menu.name)?.toLowerCase().includes(searchQuery.toLowerCase()));

  const menusFilteredByUtama = filteredMenus.filter((menu) => {
    if (filterUtama === "Semua") return true;
    const menuType = getTipeDariKategori(menu.category);
    return menuType === filterUtama;
  });

  const daftarKategoriOlahan = ["Semua", ...new Set(menusFilteredByUtama.map((item) => item.category).filter(Boolean))];

  filteredMenus = menusFilteredByUtama;
  if (filterOlahan !== "Semua") {
    filteredMenus = filteredMenus.filter((menu) => menu.category === filterOlahan);
  }

  return (
    <div className="flex h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] text-gray-800">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold border border-amber-200">K</div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kelola Menu</h2>
              <p className="text-sm text-gray-500 mt-1">Atur ketersediaan, kategori, foto, dan harga menu restoran.</p>
            </div>
            <button onClick={() => openModal("add")} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm">
              <Plus size={18} /> Tambah Menu
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 mr-2 border-r border-gray-200 pr-4">
                <Filter size={16} /> <span className="text-sm font-medium">Tipe:</span>
              </div>
              {["Semua", "Makanan", "Minuman"].map((kat) => (
                <button
                  key={kat}
                  onClick={() => {
                    setFilterUtama(kat);
                    setFilterOlahan("Semua");
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filterUtama === kat ? (kat === "Makanan" ? "bg-amber-500 text-white shadow-sm" : kat === "Minuman" ? "bg-blue-500 text-white shadow-sm" : "bg-gray-800 text-white shadow-sm") : "bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100"}`}
                >
                  {kat}
                </button>
              ))}
            </div>

            {filterUtama !== "Semua" && daftarKategoriOlahan.length > 1 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400 mr-2">Kategori:</span>
                {daftarKategoriOlahan.map((olahan) => (
                  <button
                    key={olahan}
                    onClick={() => setFilterOlahan(olahan)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${filterOlahan === olahan ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {olahan}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">Memuat data...</div>
            ) : filteredMenus.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">Belum ada menu yang sesuai kriteria.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
                    <th className="py-4 px-6 font-medium">Info Menu</th>
                    <th className="py-4 px-6 font-medium">Tipe</th>
                    <th className="py-4 px-6 font-medium">Kategori</th>
                    <th className="py-4 px-6 font-medium">Harga</th>
                    <th className="py-4 px-6 font-medium">Stok</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                    <th className="py-4 px-6 font-medium text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {filteredMenus.map((menu) => {
                      const tipeUi = getTipeDariKategori(menu.category);
                      return (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={menu.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              {/* Cek apakah ada foto dari backend */}
                              {menu.foto ? (
                                <img src={`${STORAGE_URL}/${menu.foto}`} alt={menu.nama || menu.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                  <ImageIcon size={20} />
                                </div>
                              )}
                              <span className="font-semibold text-gray-800">{menu.nama || menu.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${tipeUi === "Makanan" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{tipeUi}</span>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1 rounded-full">{menu.category}</span>
                          </td>
                          <td className="py-3 px-6 font-medium text-gray-900">Rp {Number(menu.price).toLocaleString("id-ID")}</td>
                          <td className="py-3 px-6">
                            <span className="font-bold text-gray-800">{menu.stok ?? 0}</span> <span className="text-xs text-gray-500">porsi</span>
                          </td>
                          <td className="py-3 px-6">
                            {menu.is_available ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                <CheckCircle2 size={14} /> Tersedia
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                                <XCircle size={14} /> Habis
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openModal("edit", menu)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Menu">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDelete(menu.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Menu">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODAL ADD/EDIT */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-900">{modalMode === "add" ? "Tambah Menu Baru" : "Edit Data Menu"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Menu</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "Makanan", category: "" })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.type === "Makanan" ? "bg-amber-500 text-white border-amber-500" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                      >
                        🍔 Makanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "Minuman", category: "" })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.type === "Minuman" ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                      >
                        🍹 Minuman
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Contoh: Ikan Nila Bakar"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Olahan</label>
                    <input
                      type="text"
                      list="kategori-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Pilih atau ketik kategori baru..."
                      required
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white"
                    />
                    <datalist id="kategori-list">
                      {getDatalistOptions().map((kat, idx) => (
                        <option key={idx} value={kat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        min="0"
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stok Porsi</label>
                      <input
                        type="number"
                        value={formData.stok}
                        onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                        required
                        min="0"
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* BAGIAN UPLOAD FOTO DI DALAM MODAL */}
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Menu <span className="text-xs text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {preview ? (
                        <div className="relative group">
                          <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                          <button
                            type="button"
                            onClick={() => {
                              setFoto(null);
                              setPreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                          <Upload size={20} />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg, image/webp"
                          onChange={handleFileChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                      Batal
                    </button>
                    <button type="submit" className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-800 shadow-sm transition-colors">
                      Simpan Data
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuMaster;
