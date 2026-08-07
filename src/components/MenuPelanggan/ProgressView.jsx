import React from "react";
import { motion } from "framer-motion";
import HeaderLogo from "../HeaderLogo";

export default function ProgressView({ orderData, namaPelanggan, formatTanggal, teksMetodeBayarStruk, nomorMeja, statusStep, strukItems, totalStruk, handleSelesaiKeluar, handleTambahPesanan }) {
  const pageVariants = { initial: { opacity: 0, x: 20 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -20 } };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="p-4 max-w-md mx-auto mt-2 pb-40 print:p-0 print:m-0 print:max-w-none">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col items-center mb-6">
          <HeaderLogo variant="utama" className="w-40 mb-2 print:w-32 grayscale print:grayscale" />
          <p className="text-center font-medium text-gray-600 text-sm">Pembayaran Berhasil</p>
          <p className="text-center text-gray-400 text-xs mt-1">{formatTanggal(orderData.created_at || new Date().toISOString())}</p>
        </div>

        <div className="flex justify-between items-start text-xs sm:text-sm border-b border-gray-100 pb-4 mb-5">
          <div className="flex flex-col gap-1.5 text-left">
            <p className="text-gray-500">
              Metode Pembayaran: <span className="font-medium text-gray-800">{teksMetodeBayarStruk}</span>
            </p>
            <p className="text-gray-500">
              Nama Pelanggan: <span className="font-medium text-gray-800">{orderData.nama_pelanggan || namaPelanggan || "-"}</span>
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-right">
            <p className="text-gray-500">
              Meja: <span className="font-medium text-gray-800">{nomorMeja}</span>
            </p>
            <p className="text-gray-500">
              Order ID: <span className="font-medium text-gray-800">#{orderData.id}</span>
            </p>
          </div>
        </div>

        <div className="mb-8 print:hidden relative px-4 mt-2">
          <div className="absolute left-0 top-3 w-full h-1 bg-gray-100 rounded-full z-0"></div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: statusStep === 1 ? "0%" : statusStep === 2 ? "50%" : "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute left-0 top-3 h-1 bg-[#D30F25] z-0 rounded-full"
          ></motion.div>
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: statusStep === step ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: statusStep === step && step !== 3 ? Infinity : 0, duration: 1.5 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs shadow-sm transition-colors duration-500 ${statusStep >= step ? "bg-[#D30F25] text-white" : "bg-white border border-gray-200 text-gray-400"}`}
                >
                  {step}
                </motion.div>
                <span className={`text-[10px] mt-2 transition-colors duration-500 ${statusStep >= step ? "text-[#D30F25] font-medium" : "text-gray-400 font-light"}`}>{step === 1 ? "Diterima" : step === 2 ? "Dimasak" : "Selesai"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 mb-5 print:border-t-0 print:pt-2">
          <table className="w-full text-sm text-gray-800">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="py-2 text-left font-medium w-1/2">Menu</th>
                <th className="py-2 text-center font-medium w-1/4">Qty</th>
                <th className="py-2 text-right font-medium w-1/4">Harga</th>
              </tr>
            </thead>
            <tbody className="font-light">
              {strukItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-3 pr-2 align-top">
                    <span className="block font-medium text-gray-800">{item.name || item.nama_menu}</span>
                    {item.catatan && <p className="text-[10px] text-gray-400 italic mt-0.5">Note: {item.catatan}</p>}
                  </td>
                  <td className="py-3 text-center align-top text-gray-600">{item.qty || 1}</td>
                  <td className="py-3 text-right font-medium align-top">{(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center border-t border-gray-100 pt-4">
            <span className="font-semibold text-gray-800 text-sm tracking-wider">TOTAL LUNAS</span>
            <span className="text-lg font-bold text-[#D30F25]">Rp {totalStruk.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 print:hidden">
        <div className="max-w-md mx-auto flex flex-col gap-2.5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.print()} className="w-full bg-white text-gray-800 p-3.5 rounded-xl font-medium text-sm border border-gray-200 shadow-sm">
            Cetak Struk
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleTambahPesanan} className="w-2/3 bg-white text-amber-600 border border-amber-200 p-3.5 rounded-xl font-medium text-sm shadow-sm">
            + Pesan Menu Lain
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSelesaiKeluar}
            className="w-full bg-gradient-to-r from-[#D30F25] to-[#FFEC01] text-white p-3.5 rounded-xl font-medium text-sm shadow-[0_4px_15px_rgba(211,15,37,0.3)] active:opacity-90 transition"
          >
            Selesai & Keluar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
