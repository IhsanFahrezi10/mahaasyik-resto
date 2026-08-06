import React, { useState, useEffect } from "react";
// 1. Ganti import axios dengan api (seperti di Manajemen Meja)
import api from "../utils/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, QrCode, Search, Bell, LogOut, WifiOff, Users, Plus } from "lucide-react";

const ManajemenAkun = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isError, setIsError] = useState(false);

  // State untuk form & modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // Tambahan state buat nandain kalau lagi mode Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kasir",
  });

  const fetchUsersData = async () => {
    try {
      // 2. Ganti axios jadi api
      const response = await api.get("/users");
      setUsers(response.data);
      setIsError(false);
    } catch (error) {
      console.error("Gagal menarik data dari server:", error);
      setIsError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kasir_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Modifikasi Handle Submit untuk bisa Nambah dan Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Mode Edit (PUT Request)
        await api.put(`/users/${editId}`, formData);
        alert("Akun berhasil diperbarui!");
      } else {
        // Mode Tambah Baru (POST Request)
        await api.post("/users", formData);
        alert("Akun berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "kasir" });
      setEditId(null); // Reset state edit
      fetchUsersData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan data akun");
    }
  };

  // 4. Fungsi Edit (Buka form dengan data yang udah ada)
  const openEditModal = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Kosongkan, kalau ga diisi berarti user ga mau ganti password
      role: user.role,
    });
    setEditId(user.id);
    setIsModalOpen(true);
  };

  // 5. Fungsi Hapus Data
  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus akun milik ${name}?`)) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsersData();
      } catch (error) {
        console.error("Gagal menghapus data:", error);
        alert("Gagal menghapus akun. Pastikan koneksi server aman.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] text-gray-800 relative">
      {isError && (
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-0 left-0 w-full bg-red-500 text-white py-2 flex items-center justify-center space-x-2 z-50">
          <WifiOff size={18} />
          <span className="font-semibold text-sm">Koneksi Terputus. Gagal menyinkronkan data dengan server.</span>
        </motion.div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari Pengguna..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold border border-amber-200">D</div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Akun</h2>
                <p className="text-sm text-gray-500 mt-1">Kelola akses developer dan kasir Mahaasyik</p>
              </div>

              <button
                onClick={() => {
                  setEditId(null);
                  setFormData({ name: "", email: "", password: "", role: "kasir" });
                  setIsModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Akun
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                    <th className="py-4 px-6">Nama Pengguna</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-800">{user.name}</td>
                        <td className="py-4 px-6 text-gray-500">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === "developer" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-orange-100 text-orange-700 border border-orange-200"}`}>
                            {user.role ? user.role.toUpperCase() : "UNKNOWN"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-3">
                          {/* 6. Pasang fungsi onClick di tombol Edit dan Hapus */}
                          <button onClick={() => openEditModal(user)} className="text-amber-600 hover:text-amber-800 font-medium text-sm transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(user.id, user.name)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
                            Hapus
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-500">
                        {isError ? "Gagal memuat data." : "Memuat data..."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{editId ? "Edit Akun" : "Tambah Akun Baru"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengguna</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password {editId && <span className="text-xs text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editId} // Wajib diisi cuma pas nambah akun baru
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="kasir">Kasir</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-600 transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2.5 text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold shadow-md transition-colors">
                    {editId ? "Simpan Perubahan" : "Simpan Akun"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManajemenAkun;
