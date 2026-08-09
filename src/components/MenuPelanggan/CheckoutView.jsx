import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderLogo from "../HeaderLogo";
import axios from "axios";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3",
    title: "text-sm font-medium text-gray-800 m-0",
    icon: "scale-75 m-0 mr-2",
  },
});

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
      Toast.fire({ icon: "warning", title: "Isi nama pemesan dulu ngab!" });
      return;
    }

    setIsLoading(true);

    try {
      const dataPesanan = {
        nomor_meja: nomorMeja,
        nama_pelanggan: namaPelanggan,
        no_hp_pelanggan: noHpPelanggan,
        email_pelanggan: emailPelanggan,
        items: cart.map((item) => ({ menu_id: item.id || item.menu_id, jumlah: item.qty || 1, catatan: item.catatan || "" })),
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, dataPesanan);

      if (response.data.success) {
        const riwayatPesanan = JSON.parse(localStorage.getItem("mahaasyik_active_order")) || null;
        const itemGabungan = riwayatPesanan && riwayatPesanan.items ? [...riwayatPesanan.items, ...cart] : [...cart];

        const orderBaru = { ...response.data.data, items: itemGabungan };
        const snapToken = response.data.snap_token;
        orderBaru.snap_token = snapToken;

        // 🔥 WAJIB DISIMPAN DI AWAL BIAR NGGAK BLANK SCREEN PAS PINDAH HALAMAN!
        if (typeof setOrderData === "function") setOrderData(orderBaru);

        let isPaymentProcessed = false;

        const extractPaymentInfo = (result) => {
          let payType =
            result.payment_type === "bank_transfer"
              ? "Transfer Bank"
              : result.payment_type === "qris"
                ? "QRIS"
                : result.payment_type === "echannel"
                  ? "Mandiri Bill"
                  : result.payment_type === "cstore"
                    ? "Minimarket"
                    : result.payment_type === "gopay"
                      ? "GoPay"
                      : result.payment_type === "shopeepay"
                        ? "ShopeePay"
                        : result.payment_type;

          let payDetails = "";
          if (result.va_numbers && result.va_numbers.length > 0) {
            payDetails = `${result.va_numbers[0].bank.toUpperCase()} VA: ${result.va_numbers[0].va_number}`;
          } else if (result.bca_va_number) {
            payDetails = `BCA VA: ${result.bca_va_number}`;
          } else if (result.permata_va_number) {
            payDetails = `Permata VA: ${result.permata_va_number}`;
          } else if (result.bill_key && result.biller_code) {
            payDetails = `Kode: ${result.biller_code} - ${result.bill_key}`;
          } else if (result.payment_code) {
            payDetails = `Kode Bayar: ${result.payment_code}`;
          }

          return { payType, payDetails };
        };

        window.snap.pay(snapToken, {
          onSuccess: async function (result) {
            isPaymentProcessed = true;
            const info = extractPaymentInfo(result);
            orderBaru.metode_pembayaran_text = info.payType;
            orderBaru.metode_pembayaran = info.payType;
            orderBaru.payment_details = info.payDetails;

            Toast.fire({ icon: "success", title: "Pembayaran Berhasil!" });

            try {
              await axios.put(`${BACKEND_URL}/api/orders/${orderBaru.id}/status`, {
                status_pesanan: "Menunggu",
                metode_pembayaran: info.payType,
              });
            } catch (e) {}

            orderBaru.status_pesanan = "Menunggu";
            orderBaru.status = "Menunggu";

            // 🔥 UPDATE PAKSA REACT BIAR TEKS BERUBAH
            if (typeof setOrderData === "function") setOrderData({ ...orderBaru });
            localStorage.setItem("mahaasyik_active_order", JSON.stringify(orderBaru));
            localStorage.setItem("mahaasyik_last_view", "progress");
            setView("progress");
          },

          onPending: async function (result) {
            isPaymentProcessed = true;
            const info = extractPaymentInfo(result);
            orderBaru.metode_pembayaran_text = info.payType;
            orderBaru.metode_pembayaran = info.payType;
            orderBaru.payment_details = info.payDetails;

            Toast.fire({ icon: "info", title: "Selesaikan instruksi pembayaran." });

            try {
              await axios.put(`${BACKEND_URL}/api/orders/${orderBaru.id}/status`, {
                status_pesanan: "Menunggu Pembayaran",
                metode_pembayaran: info.payType,
              });
            } catch (e) {}

            orderBaru.status_pesanan = "Menunggu Pembayaran";
            orderBaru.status = "Menunggu Pembayaran";

            // 🔥 UPDATE PAKSA REACT BIAR TEKS BERUBAH
            if (typeof setOrderData === "function") setOrderData({ ...orderBaru });
            localStorage.setItem("mahaasyik_active_order", JSON.stringify(orderBaru));
            localStorage.setItem("mahaasyik_last_view", "progress");
            setView("progress");
          },

          onError: function (result) {
            Toast.fire({ icon: "error", title: "Pembayaran Gagal!" });
          },

          onClose: async function () {
            if (!isPaymentProcessed) {
              try {
                const res = await axios.get(`${BACKEND_URL}/api/orders/${orderBaru.id}`);
                const curStatus = res.data?.data?.status_pesanan || res.data?.status_pesanan || res.data?.status;

                if (curStatus === "Menunggu Pembayaran" || curStatus === "Menunggu" || curStatus === "Diproses") {
                  orderBaru.status_pesanan = curStatus;
                  orderBaru.status = curStatus;

                  if (typeof setOrderData === "function") setOrderData({ ...orderBaru });
                  localStorage.setItem("mahaasyik_active_order", JSON.stringify(orderBaru));
                  localStorage.setItem("mahaasyik_last_view", "progress");
                  setView("progress");
                } else {
                  Toast.fire({ icon: "warning", title: "Pembayaran belum diselesaikan/dibatalkan." });
                }
              } catch (e) {
                Toast.fire({ icon: "warning", title: "Pembayaran ditutup." });
              }
            }
          },
        });
      }
    } catch (error) {
      Toast.fire({ icon: "error", title: "Server sibuk. Coba lagi bentar ya." });
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
                  placeholder="Catatan (opsional): Pedas..."
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
