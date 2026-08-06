import React from "react";
import { motion } from "framer-motion";

export default function PaymentModal({ setShowPaymentModal, setIsTimerAktif, metodeBayar, qrisImageUrl, formatWaktu, waktuBayar, handlePembayaranSukses }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-sm p-6 relative flex flex-col items-center text-center shadow-2xl"
      >
        <button
          onClick={() => {
            setShowPaymentModal(false);
            setIsTimerAktif(false);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 mt-2">Selesaikan Pembayaran</h2>

        {metodeBayar === "qris" && (
          <div className="w-full flex flex-col items-center">
            <img src={qrisImageUrl} alt="QRIS" className="w-40 h-40 border border-gray-200 rounded-xl mb-4 p-2 bg-white" />
            <a href={qrisImageUrl} download="QRIS.svg" target="_blank" rel="noreferrer" className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-full font-medium text-xs mb-4">
              Download QRIS
            </a>
          </div>
        )}

        {metodeBayar === "va" && (
          <div className="w-full bg-gray-50 p-6 rounded-xl border border-gray-200 mb-4">
            <p className="text-xs text-gray-500 font-light mb-1">Bank BCA (Virtual Account)</p>
            <h3 className="text-xl font-medium tracking-widest text-gray-900 mb-3">1234 5678 9012</h3>
            <button onClick={() => navigator.clipboard.writeText("123456789012")} className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-2 rounded-lg text-xs shadow-sm">
              Salin Kode
            </button>
          </div>
        )}

        <div className="mb-6 w-full">
          <p className="text-[10px] font-medium text-gray-400 mb-1">Batas Waktu</p>
          <h2 className="text-3xl font-semibold text-[#D30F25]">{formatWaktu(waktuBayar)}</h2>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handlePembayaranSukses} className="w-full bg-gradient-to-r from-[#D30F25] to-[#FFEC01] text-white p-3.5 rounded-xl font-medium text-sm shadow-md">
          Saya Sudah Bayar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
