import React, { useState } from "react";
import api from "../utils/api"; // Ganti import axios dengan api
import { useNavigate } from "react-router-dom";

const LoginKasir = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Tinggal panggil /login karena baseURL udah diset di api.js
      const response = await api.post("/login", {
        email,
        password,
      });

      // 1. Simpan token
      localStorage.setItem("kasir_token", response.data.token);

      // 2. Simpan data user secara utuh (Object)
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 3. Simpan role secara spesifik biar nggak blank pas dibaca oleh Sidebar/Router
      localStorage.setItem("user_role", response.data.user.role);

      // 4. Arahkan ke halaman utama setelah login
      navigate("/kasir");
    } catch (err) {
      setError("Login gagal. Periksa email dan password lu.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 font-['Plus_Jakarta_Sans']">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-600">Login Mahaasyik</h2>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold py-2 rounded-xl">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginKasir;
