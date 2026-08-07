import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderLogo from "../HeaderLogo";
import axios from "axios";

export default function CheckoutView({
  setView,
  nomorMeja,
  cart,
  BACKEND_URL,
  handleCatatanChange,
  totalHarga,
  namaPelanggan,
  setNamaPelanggan,
  noHpPelanggan,
  setNoHpPelanggan,
  emailPelanggan,
  setEmailPelanggan,
  setOrderData,
  setStrukItems,
  setTotalStruk,
  setTeksMetodeBayarStruk,
}) {
  const pageVariants = { initial: { opacity: 0, x: 20 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -20 } };

  const [isLoading, setIsLoading] = useState(false);

  const handleBayarSekarang = async () => {
    if (!namaPelanggan) {
      alert("Woi, isi nama pemesan dulu ngab!");
      return;
    }

    setIsLoading(true);

    try {
      const dataPesanan = {
        nomor_meja: nomorMeja,
        nama_pelanggan: namaPelanggan,
        no_hp_pelanggan: noHpPelanggan,
        email_pelanggan: emailPelanggan,
        items: cart.map((item) => ({
          menu_id: item.id || item.menu_id,
          jumlah: item.qty || 1,
          catatan: item.catatan || "", // Sekalian kita masukin catatan
        })),
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, dataPesanan);

      if (response.data.success) {
        // 🔥 INI KUNCI FIX-NYA: Kita gabungin data response backend dengan items dari keranjang!
        const orderBaru = {
          ...response.data.data,
          items: [...cart], // <--- Biar pas keranjang dikosongin, struk ini tetep nyimpen datanya
        };

        if (typeof setOrderData === "function") setOrderData(orderBaru);
        if (typeof setStrukItems === "function") setStrukItems(cart);
        if (typeof setTotalStruk === "function") setTotalStruk(totalHarga);
        if (typeof setTeksMetodeBayarStruk === "function") setTeksMetodeBayarStruk("Midtrans (QRIS / VA)");

        const snapToken = response.data.snap_token;

        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            alert("Mantap! Pembayaran berhasil cuy!");
            // Simpan orderBaru yang UDAH ADA items-nya ke memori
            localStorage.setItem("mahaasyik_active_order", JSON.stringify(orderBaru));
            localStorage.setItem("mahaasyik_last_view", "progress");
            setView("progress");
          },
          onPending: function (result) {
            alert("Menunggu pembayaran (bisa cek di email atau dashboard)");
            // Simpan orderBaru yang UDAH ADA items-nya ke memori
            localStorage.setItem("mahaasyik_active_order", JSON.stringify(orderBaru));
            localStorage.setItem("mahaasyik_last_view", "progress");
            setView("progress");
          },
          onError: function (result) {
            alert("Yah, pembayaran gagal!");
          },
          onClose: function () {
            alert("Selesaikan pembayaran untuk memproses pesanan ya!");
          },
        });
      }
    } catch (error) {
      console.error("Gagal buat pesanan:", error);
      alert("Waduh, server lagi ngambek. Coba lagi bentar ya.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="p-4 print:hidden max-w-md mx-auto min-h-screen pb-28">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView("menu")} className="bg-white border border-gray-200 p-2 rounded-full text-gray-600 active:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </motion.button>
        <HeaderLogo variant="alternatif" />
        <h2 className="text-lg font-semibold text-gray-900 border-l border-gray-300 pl-3">Checkout</h2>
      </div>

      <motion.div layout className="bg-white p-5 rounded-2xl border border-gray-100 mb-6 shadow-sm">
        <div className="flex justify-between border-b border-gray-100 pb-3 mb-4">
          <span className="font-light text-gray-500 text-sm">Nomor Meja</span>
          <span className="font-medium text-gray-900">{nomorMeja}</span>
        </div>
        <div className="space-y-4">
          <AnimatePresence>
            {cart.map((item, idx) => (
              <motion.div
                key={item.id || item.menu_id || idx}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-2 border-b border-gray-50 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0"
              >
                <div className="flex gap-3 items-center">
                  <img src={item.foto ? `${BACKEND_URL}/storage/${item.foto}` : "https://via.placeholder.com/300"} alt={item.name || item.nama_menu} className="w-14 h-14 rounded-lg object-cover border border-gray-100 bg-gray-50" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm leading-snug">{item.name || item.nama_menu}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Rp {Number(item.price || 0).toLocaleString()} <span className="font-medium text-gray-800 ml-1">x{item.qty || 1}</span>
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Rp {(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                </div>
                <input
                  type="text"
                  placeholder="Catatan (opsional): Pedas, tanpa daun bawang..."
                  value={item.catatan || ""}
                  onChange={(e) => handleCatatanChange(item.id || item.menu_id, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 focus:outline-none focus:border-[#D30F25] transition-colors mt-1"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-center">
          <span className="font-light text-gray-500 text-sm">Total Pembayaran</span>
          <span className="font-semibold text-lg text-gray-900">Rp {totalHarga.toLocaleString()}</span>
        </div>
      </motion.div>

      <div className="mb-5 flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Pemesan <span className="text-[#D30F25]">*</span>
          </label>
          <input
            type="text"
            value={namaPelanggan}
            onChange={(e) => setNamaPelanggan(e.target.value)}
            placeholder="Masukkan nama kamu..."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#D30F25] focus:ring-1 focus:ring-[#D30F25]"
            required
          />
        </div>
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. HP <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
            </label>
            <input type="tel" value={noHpPelanggan} onChange={(e) => setNoHpPelanggan(e.target.value)} placeholder="08..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#D30F25]" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
            </label>
            <input
              type="email"
              value={emailPelanggan}
              onChange={(e) => setEmailPelanggan(e.target.value)}
              placeholder="email@..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#D30F25]"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-800 font-medium">Pembayaran diurus oleh Midtrans.</p>
        <p className="text-xs text-amber-600 mt-1">Kamu bisa milih QRIS, Virtual Account, atau E-Wallet di halaman selanjutnya.</p>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-30">
        <motion.button
          whileTap={namaPelanggan && !isLoading ? { scale: 0.95 } : {}}
          onClick={handleBayarSekarang}
          disabled={!namaPelanggan || isLoading}
          className={`w-full max-w-md mx-auto p-3.5 rounded-xl font-medium text-sm flex justify-center items-center transition-all ${namaPelanggan && !isLoading ? "bg-gradient-to-r from-[#D30F25] to-[#FFEC01] text-white shadow-md active:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          {isLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}