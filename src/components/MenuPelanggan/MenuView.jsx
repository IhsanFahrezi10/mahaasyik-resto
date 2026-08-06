import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderLogo from "../HeaderLogo";

export default function MenuView({
  nomorMeja,
  orderData,
  namaPelanggan,
  totalItems,
  setView,
  searchQuery,
  setSearchQuery,
  kategoriUtama,
  handleKategoriUtamaChange,
  daftarKategoriOlahan,
  kategoriOlahan,
  setKategoriOlahan,
  isLoadingMenu,
  filteredMenus,
  BACKEND_URL,
  getCartItemQty,
  handleTambah,
  handleKurang,
  cart,
  totalHarga,
}) {
  const pageVariants = { initial: { opacity: 0, x: 20 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -20 } };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="pb-28 max-w-md mx-auto bg-white min-h-screen relative shadow-sm">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center shadow-sm">
        <div className="flex flex-col items-start">
          <div className="scale-[1.35] origin-left mb-1.5">
            <HeaderLogo variant="alternatif" />
          </div>

          <span className="text-xs text-gray-500 font-medium mt-1">Meja {nomorMeja}</span>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-wide">
            A.N: <span className="font-semibold text-gray-700">{orderData?.nama_pelanggan || namaPelanggan || "-"}</span>
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (totalItems > 0) setView("checkout");
          }}
          className="relative bg-gray-50 border border-gray-100 p-2.5 rounded-full active:bg-gray-100 transition"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -right-2 bg-[#D30F25] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="p-4">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Cari menu kesukaanmu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-800 font-light focus:outline-none focus:border-gray-400 shadow-sm transition-colors"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <div className="flex justify-center gap-8 mb-6 pb-4 border-b border-gray-100">
          {["Semua", "Makanan", "Minuman"].map((kat) => (
            <motion.button key={kat} whileTap={{ scale: 0.9 }} onClick={() => handleKategoriUtamaChange(kat)} className="flex flex-col items-center gap-2 group">
              <motion.div layout className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${kategoriUtama === kat ? "bg-[#D30F25] text-white shadow-md" : "bg-white border border-gray-200"}`}>
                {kat === "Semua" ? "🍽️" : kat === "Makanan" ? "🍔" : "🍹"}
              </motion.div>
              <span className={`text-xs ${kategoriUtama === kat ? "text-gray-900 font-medium" : "text-gray-500 font-light"}`}>{kat}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
          <AnimatePresence>
            {!isLoadingMenu &&
              daftarKategoriOlahan.map((kategori) => (
                <motion.button
                  key={kategori}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setKategoriOlahan(kategori)}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm transition-colors duration-300 ${kategoriOlahan === kategori ? "bg-gray-800 text-white font-medium shadow-sm" : "bg-white border border-gray-200 text-gray-600 font-light"}`}
                >
                  {kategori}
                </motion.button>
              ))}
          </AnimatePresence>
        </div>

        <motion.div layout className="grid grid-cols-2 gap-3 md:gap-4">
          <AnimatePresence>
            {isLoadingMenu ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <motion.div key={`skeleton-${idx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col animate-pulse shadow-sm">
                  {/* Skeleton foto juga dibuat persegi (aspect-square) */}
                  <div className="w-full aspect-square bg-gray-200"></div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded-md w-1/2 mb-4"></div>
                  </div>
                </motion.div>
              ))
            ) : filteredMenus.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-10 text-gray-500 font-light">
                Menu tidak ditemukan
              </motion.div>
            ) : (
              filteredMenus.map((menu, index) => {
                if (!menu) return null;
                const menuId = menu.id || menu.menu_id || index;
                const menuName = menu.name || menu.nama_menu || "Menu";
                const qty = getCartItemQty(menuId);
                const isHabis = menu.is_available === 0 || menu.is_available === false;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={menuId}
                    className={`bg-white rounded-2xl border overflow-hidden flex flex-col shadow-sm transition-all ${isHabis ? "opacity-50 grayscale border-gray-200" : "border-gray-100"}`}
                  >
                    {/* Perubahan di sini: Mengganti h-28 menjadi aspect-square */}
                    <img src={menu.foto ? `${BACKEND_URL}/storage/${menu.foto}` : "https://via.placeholder.com/300?text=Tanpa+Foto"} alt={menuName} className="w-full aspect-square object-cover bg-gray-50" />
                    <div className="p-3 flex flex-col flex-grow justify-between">
                      <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">{menuName}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-medium text-gray-900 text-sm">Rp {Number(menu.price || 0).toLocaleString()}</p>
                        {isHabis ? (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">HABIS</span>
                        ) : qty === 0 ? (
                          <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleTambah(menu)} className="w-7 h-7 bg-[#D30F25] text-white rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                            </svg>
                          </motion.button>
                        ) : (
                          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} className="flex items-center gap-2 overflow-hidden">
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleKurang(menuId)} className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-medium">
                              -
                            </motion.button>
                            <span className="font-medium text-gray-800 text-sm w-3 text-center">{qty}</span>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleTambah(menu)} className="w-7 h-7 bg-[#D30F25] text-white rounded-full flex items-center justify-center font-medium shadow-sm">
                              +
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            // PERUBAHAN: Pakai left-0 right-0 mx-auto
            className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setView("checkout")}
              className="w-full bg-gradient-to-r from-[#D30F25] to-[#FFEC01] text-white p-3.5 rounded-xl font-medium shadow-[0_4px_15px_rgba(211,15,37,0.3)] flex justify-between items-center"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/90 font-light">{totalItems} Item</span>
                <span className="text-sm font-semibold">Rp {totalHarga.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                Lanjut Bayar{" "}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
