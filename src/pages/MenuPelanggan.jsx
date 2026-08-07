import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeaderLogo from "../components/HeaderLogo";
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "69420";
// Import komponen pecahan
import MenuView from "../components/MenuPelanggan/MenuView";
import CheckoutView from "../components/MenuPelanggan/CheckoutView";
import ProgressView from "../components/MenuPelanggan/ProgressView";
import PaymentModal from "../components/MenuPelanggan/PaymentModal";

export default function MenuPelanggan() {
  const API_URL = import.meta.env.VITE_API_URL || "https://wife-monsieur-gratuity.ngrok-free.dev/api";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://wife-monsieur-gratuity.ngrok-free.dev";

  const [searchParams] = useSearchParams();
  const mejaUrl = searchParams.get("meja");

  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [emailPelanggan, setEmailPelanggan] = useState("");
  const [noHpPelanggan, setNoHpPelanggan] = useState("");

  const [nomorMeja, setNomorMeja] = useState(() => mejaUrl || localStorage.getItem("mahaasyik_nomor_meja") || "");
  const [inputMeja, setInputMeja] = useState("");
  const [errorMeja, setErrorMeja] = useState("");
  const [isLoadingMeja, setIsLoadingMeja] = useState(false);

  const [view, setView] = useState(() => localStorage.getItem("mahaasyik_last_view") || "menu");
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("mahaasyik_active_cart")) || []);
  const [orderData, setOrderData] = useState(() => JSON.parse(localStorage.getItem("mahaasyik_active_order")) || null);

  const [metodeBayar, setMetodeBayar] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [waktuBayar, setWaktuBayar] = useState(180);
  const [isTimerAktif, setIsTimerAktif] = useState(false);

  const [menus, setMenus] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriUtama, setKategoriUtama] = useState("Semua");
  const [kategoriOlahan, setKategoriOlahan] = useState("Semua");

  useEffect(() => {
    localStorage.setItem("mahaasyik_last_view", view);
  }, [view]);

  useEffect(() => {
    if (nomorMeja) localStorage.setItem("mahaasyik_nomor_meja", nomorMeja);
  }, [nomorMeja]);

  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoadingMenu(true);
      try {
        const response = await axios.get(`${API_URL}/menus`);
        const dataMenu = response.data?.data || response.data;
        setMenus(Array.isArray(dataMenu) ? dataMenu : dataMenu ? Object.values(dataMenu) : []);
      } catch (error) {
        console.error("❌ GAGAL PANGGIL API MENU!", error);
        setMenus([]);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    if (nomorMeja) fetchMenus();
  }, [nomorMeja, API_URL]);

  useEffect(() => {
    let pollInterval;
    if (view === "progress" && orderData?.id) {
      pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/orders/${orderData.id}`);
          const statusTerbaru = response.data?.status;

          if (statusTerbaru && statusTerbaru !== orderData.status) {
            const updatedOrder = { ...orderData, status: statusTerbaru };
            setOrderData(updatedOrder);
            localStorage.setItem("mahaasyik_active_order", JSON.stringify(updatedOrder));
          }
        } catch (error) {
          console.error("Gagal cek status", error);
        }
      }, 5000);
    }
    return () => clearInterval(pollInterval);
  }, [view, orderData, API_URL]);

  let safeMenus = Array.isArray(menus) ? menus : [];
  let filteredMenus = safeMenus;

  if (searchQuery) {
    filteredMenus = filteredMenus.filter((menu) => {
      const name = menu.name || menu.nama_menu || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }

  const menusFilteredByUtama = filteredMenus.filter((menu) => {
    if (kategoriUtama === "Semua") return true;
    const kategoriMinuman = ["Jus", "Minuman"];
    const isMinuman = kategoriMinuman.includes(menu.category);
    if (kategoriUtama === "Minuman") return isMinuman;
    else if (kategoriUtama === "Makanan") return !isMinuman;
    return true;
  });

  const daftarKategoriOlahan = ["Semua", ...new Set(menusFilteredByUtama.map((item) => item.category).filter(Boolean))];

  filteredMenus = menusFilteredByUtama;
  if (kategoriOlahan !== "Semua") filteredMenus = filteredMenus.filter((menu) => menu.category === kategoriOlahan);

  const handleKategoriUtamaChange = (utama) => {
    setKategoriUtama(utama);
    setKategoriOlahan("Semua");
  };

  const handleTambah = (menu) => {
    if (menu.is_available === 0 || menu.is_available === false) {
      Swal.fire({ icon: "error", title: "Menu Habis!", text: "Maaf, menu ini sedang tidak tersedia hari ini.", confirmButtonColor: "#D30F25" });
      return;
    }
    setCart((prev) => {
      const exist = prev.find((i) => (i.id || i.menu_id) === (menu.id || menu.menu_id));
      let newCart = exist ? prev.map((i) => ((i.id || i.menu_id) === (menu.id || menu.menu_id) ? { ...i, qty: i.qty + 1 } : i)) : [...prev, { ...menu, qty: 1, catatan: "" }];
      localStorage.setItem("mahaasyik_active_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  // TAMBAHAN: Fungsi handleKurang yang sebelumnya terlewat
  const handleKurang = (menuId) => {
    setCart((prev) => {
      const exist = prev.find((i) => (i.id || i.menu_id) === menuId);
      if (!exist) return prev;
      if (exist.qty === 1) {
        const newCart = prev.filter((i) => (i.id || i.menu_id) !== menuId);
        localStorage.setItem("mahaasyik_active_cart", JSON.stringify(newCart));
        return newCart;
      }
      const newCart = prev.map((i) => ((i.id || i.menu_id) === menuId ? { ...i, qty: i.qty - 1 } : i));
      localStorage.setItem("mahaasyik_active_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleCatatanChange = (menuId, catatanText) => {
    setCart((prev) => {
      const newCart = prev.map((item) => ((item.id || item.menu_id) === menuId ? { ...item, catatan: catatanText } : item));
      localStorage.setItem("mahaasyik_active_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const totalHarga = cart.reduce((total, item) => total + Number(item.price || 0) * (item.qty || 1), 0);
  const totalItems = cart.reduce((total, item) => total + (item.qty || 1), 0);
  const getCartItemQty = (id) => cart.find((c) => (c.id || c.menu_id) === id)?.qty || 0;

  useEffect(() => {
    let interval = null;
    if (isTimerAktif && waktuBayar > 0) {
      interval = setInterval(() => setWaktuBayar((p) => p - 1), 1000);
    } else if (waktuBayar === 0) {
      clearInterval(interval);
      alert("Waktu habis! Silakan ulangi.");
      setIsTimerAktif(false);
      setShowPaymentModal(false);
    }
    return () => clearInterval(interval);
  }, [isTimerAktif, waktuBayar]);

  const formatWaktu = (detik) => {
    const m = Math.floor(detik / 60)
      .toString()
      .padStart(2, "0");
    const s = (detik % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatTanggal = (tanggalString) => {
    if (!tanggalString) return "";
    return new Date(tanggalString).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handlePembayaranSukses = async () => {
    if (!namaPelanggan.trim()) {
      Swal.fire({ title: "Tunggu Dulu!", text: "Nama pemesan wajib diisi ya.", icon: "warning", confirmButtonColor: "#D30F25" });
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/orders`, {
        nomor_meja: nomorMeja,
        nama_pelanggan: namaPelanggan,
        email_pelanggan: emailPelanggan,
        no_hp_pelanggan: noHpPelanggan,
        items: cart.map((i) => ({ menu_id: i.id || i.menu_id, jumlah: i.qty, catatan: i.catatan || "" })),
      });
      const newOrder = {
        id: response.data.data.id,
        status: "Menunggu",
        nama_pelanggan: namaPelanggan,
        metode_pembayaran: metodeBayar,
        created_at: new Date().toISOString(),
        items: [...cart],
      };
      setOrderData(newOrder);
      localStorage.setItem("mahaasyik_active_order", JSON.stringify(newOrder));
      setIsTimerAktif(false);
      setShowPaymentModal(false);
      Swal.fire({ title: "Berhasil!", text: "Pembayaran sukses, pesananmu sedang diproses.", icon: "success", timer: 2000, showConfirmButton: false });
      setView("progress");
    } catch (err) {
      Swal.fire({ title: "Gagal!", text: "Gagal memproses pesanan. Silakan coba lagi.", icon: "error", confirmButtonColor: "#D30F25" });
    }
  };

  const handleMasukMeja = async (e) => {
    e.preventDefault();
    if (!inputMeja) return;
    setErrorMeja("");
    setIsLoadingMeja(true);

    try {
      const response = await axios.get(`${API_URL}/check-meja/${inputMeja}`);
      if (response.data.status === "available") {
        try {
          await axios.post(`${BACKEND_URL}/api/meja/occupy`, { nomor_meja: inputMeja });
        } catch (err) {
          console.log("Gagal update meja", err);
        }
        localStorage.setItem("mahaasyik_nomor_meja", inputMeja);
        setNomorMeja(inputMeja);
        setView("menu");
      } else if (response.data.status === "active") {
        Swal.fire({ title: "Sesi Dipulihkan", text: "Meja ini masih aktif...", icon: "info", timer: 2500, showConfirmButton: false });
        const dataOrderDariBackend = response.data.order;
        const backendItems = Array.isArray(dataOrderDariBackend?.items) ? dataOrderDariBackend.items : [];
        const restoredCart = backendItems.map((item) => {
          const hargaValid = Number(item.menu?.price) || Number(item.subtotal) / Number(item.jumlah || 1) || 0;
          return { id: item.menu_id, name: item.menu?.name || item.menu?.nama_menu || `Menu #${item.menu_id}`, qty: Number(item.jumlah) || 1, price: hargaValid, catatan: item.catatan || "" };
        });
        const activeOrder = { ...dataOrderDariBackend, status: dataOrderDariBackend?.status_pesanan || "Menunggu", metode_pembayaran: dataOrderDariBackend?.metode_pembayaran || "qris", items: restoredCart };
        setOrderData(activeOrder);
        setCart(restoredCart);
        localStorage.setItem("mahaasyik_active_order", JSON.stringify(activeOrder));
        localStorage.setItem("mahaasyik_nomor_meja", inputMeja);
        localStorage.setItem("mahaasyik_active_cart", JSON.stringify(restoredCart));
        setNomorMeja(inputMeja);
        setView("progress");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) setErrorMeja("Sistem backend belum dikonfigurasi (404).");
      else setErrorMeja("Gagal terhubung ke server.");
    } finally {
      setIsLoadingMeja(false);
    }
  };

  const handleSelesaiKeluar = () => {
    Swal.fire({
      title: "Selesai & Keluar?",
      text: "Pastikan pesanan sudah selesai. Sesi meja akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D30F25",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("mahaasyik_nomor_meja");
        localStorage.removeItem("mahaasyik_last_view");
        localStorage.removeItem("mahaasyik_active_order");
        localStorage.removeItem("mahaasyik_active_cart");
        window.history.replaceState(null, "", window.location.pathname);
        setNomorMeja("");
        setView("menu");
        setOrderData(null);
        setCart([]);
        setSearchQuery("");
        setKategoriUtama("Semua");
        setKategoriOlahan("Semua");
        setNamaPelanggan("");
        setEmailPelanggan("");
        setNoHpPelanggan("");
        setMetodeBayar("");
        setInputMeja("");
        Swal.fire({ title: "Sesi Berakhir", text: "Terima kasih atas kunjungannya!", icon: "success", timer: 1500, showConfirmButton: false });
      }
    });
  };

  if (!nomorMeja) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] text-gray-800">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm w-full max-w-sm text-center">
          <HeaderLogo variant="utama" className="mb-4" />
          <h2 className="text-xl font-semibold mb-2">Selamat Datang</h2>
          <p className="text-sm text-gray-500 mb-6 font-light">Silakan scan QR Code meja atau masukkan nomor meja Anda.</p>
          <form onSubmit={handleMasukMeja} className="flex flex-col gap-4">
            <div>
              <input
                type="number"
                value={inputMeja}
                onChange={(e) => setInputMeja(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-xl text-center text-2xl font-semibold focus:outline-none focus:border-[#D30F25] transition-colors"
                placeholder="Contoh: 05"
                required
              />
              {errorMeja && <p className="text-[#D30F25] text-xs mt-2 font-medium">{errorMeja}</p>}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={isLoadingMeja} className="w-full bg-[#D30F25] text-white font-medium p-3.5 rounded-xl disabled:opacity-70 shadow-sm shadow-red-200">
              {isLoadingMeja ? "Mengecek..." : "Mulai Pesan"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  const statusStep = orderData?.status === "Selesai" ? 3 : orderData?.status === "Diproses" ? 2 : 1;
  const qrisImageUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";
  const strukItems = Array.isArray(orderData?.items) && orderData.items.length > 0 ? orderData.items : Array.isArray(cart) ? cart : [];
  const totalStruk = strukItems.reduce((total, item) => total + Number(item.price || 0) * (item.qty || 1), 0);
  const teksMetodeBayarStruk = orderData?.metode_pembayaran === "qris" ? "QRIS" : orderData?.metode_pembayaran === "va" ? "Transfer Bank" : "QRIS / Transfer";

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans'] print:pb-0 relative overflow-hidden">
      <AnimatePresence>
        {orderData && view === "menu" && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("progress")}
            className="fixed bottom-[100px] right-4 z-40 bg-white text-[#D30F25] border border-gray-200 py-3 px-5 rounded-full shadow-lg font-medium flex items-center gap-2"
          >
            Cek Pesanan
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === "menu" && (
          <MenuView
            key="menu"
            nomorMeja={nomorMeja}
            orderData={orderData}
            namaPelanggan={namaPelanggan}
            totalItems={totalItems}
            setView={setView}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            kategoriUtama={kategoriUtama}
            handleKategoriUtamaChange={handleKategoriUtamaChange}
            daftarKategoriOlahan={daftarKategoriOlahan}
            kategoriOlahan={kategoriOlahan}
            setKategoriOlahan={setKategoriOlahan}
            isLoadingMenu={isLoadingMenu}
            filteredMenus={filteredMenus}
            BACKEND_URL={BACKEND_URL}
            getCartItemQty={getCartItemQty}
            handleTambah={handleTambah}
            handleKurang={handleKurang}
            cart={cart}
            totalHarga={totalHarga}
          />
        )}

        {view === "checkout" && (
          <CheckoutView
            key="checkout"
            setView={setView}
            nomorMeja={nomorMeja}
            cart={cart}
            BACKEND_URL={BACKEND_URL}
            handleCatatanChange={handleCatatanChange}
            totalHarga={totalHarga}
            namaPelanggan={namaPelanggan}
            setNamaPelanggan={setNamaPelanggan}
            noHpPelanggan={noHpPelanggan}
            setNoHpPelanggan={setNoHpPelanggan}
            emailPelanggan={emailPelanggan}
            setEmailPelanggan={setEmailPelanggan}
            metodeBayar={metodeBayar}
            setMetodeBayar={setMetodeBayar}
            setWaktuBayar={setWaktuBayar}
            setIsTimerAktif={setIsTimerAktif}
            setShowPaymentModal={setShowPaymentModal}
            setOrderData={setOrderData}
          />
        )}

        {view === "progress" && orderData && (
          <ProgressView
            key="progress"
            orderData={orderData}
            namaPelanggan={namaPelanggan}
            formatTanggal={formatTanggal}
            teksMetodeBayarStruk={teksMetodeBayarStruk}
            nomorMeja={nomorMeja}
            statusStep={statusStep}
            strukItems={strukItems}
            totalStruk={totalStruk}
            handleSelesaiKeluar={handleSelesaiKeluar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            setShowPaymentModal={setShowPaymentModal}
            setIsTimerAktif={setIsTimerAktif}
            metodeBayar={metodeBayar}
            qrisImageUrl={qrisImageUrl}
            formatWaktu={formatWaktu}
            waktuBayar={waktuBayar}
            handlePembayaranSukses={handlePembayaranSukses}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
