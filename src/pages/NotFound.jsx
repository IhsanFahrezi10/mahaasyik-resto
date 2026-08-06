import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-7xl font-bold text-gray-800">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-600">Waduh, Salah Kamar Bro!</h2>
      <p className="mt-2 text-gray-500">Halaman yang kamu cari nggak ada atau udah dipindah.</p>

      <Link to="/login" className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300">
        Kembali ke Halaman Awal
      </Link>
    </div>
  );
};

export default NotFound;
