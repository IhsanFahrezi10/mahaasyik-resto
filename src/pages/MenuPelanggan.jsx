const prosesMasukMeja = async (targetMeja) => {
  setErrorMeja("");
  setIsLoadingMeja(true);

  try {
    const response = await axios.get(`${API_URL}/check-meja/${targetMeja}`);

    if (response.data.status === "available") {
      try {
        await axios.post(`${BACKEND_URL}/api/meja/occupy`, { nomor_meja: targetMeja });
      } catch (err) {
        console.log("Gagal update meja", err);
      }
      localStorage.setItem("mahaasyik_nomor_meja", targetMeja);
      setNomorMeja(targetMeja);
      setView("menu");
    } else if (response.data.status === "active") {
      Toast.fire({ icon: "info", title: "Memulihkan sesi pesanan..." });

      const dataOrderDariBackend = response.data.order;

      if (!dataOrderDariBackend) {
        localStorage.setItem("mahaasyik_nomor_meja", targetMeja);
        setNomorMeja(targetMeja);
        setView("menu");
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      const backendItems = Array.isArray(dataOrderDariBackend?.items) ? dataOrderDariBackend.items : [];
      const restoredCart = backendItems.map((item) => {
        const hargaValid = Number(item.menu?.price) || Number(item.subtotal) / Number(item.jumlah || 1) || 0;
        return { id: item.menu_id, name: item.menu?.name || item.menu?.nama_menu || `Menu #${item.menu_id}`, qty: Number(item.jumlah) || 1, price: hargaValid, catatan: item.catatan || "" };
      });

      // 🔥 TRIK AMAN: Ambil data token dan metode bayar dari memori HP pelanggan (kalau ada)
      const memoriLama = JSON.parse(localStorage.getItem("mahaasyik_active_order"));
      const isPesananSama = memoriLama && memoriLama.id === dataOrderDariBackend.id;

      const activeOrder = {
        ...dataOrderDariBackend,
        status: dataOrderDariBackend?.status_pesanan || "Menunggu",
        // Tetap simpan riwayat token & metode bayar kalau itu pesanan yang sama
        metode_pembayaran_text: isPesananSama ? memoriLama.metode_pembayaran_text : dataOrderDariBackend?.metode_pembayaran || "-",
        payment_details: isPesananSama ? memoriLama.payment_details : null,
        snap_token: isPesananSama ? memoriLama.snap_token : null,
        items: restoredCart,
      };

      setOrderData(activeOrder);
      setCart(restoredCart);
      localStorage.setItem("mahaasyik_active_order", JSON.stringify(activeOrder));
      localStorage.setItem("mahaasyik_active_cart", JSON.stringify(restoredCart));
      localStorage.setItem("mahaasyik_nomor_meja", targetMeja);

      setNomorMeja(targetMeja);
      setView("progress");
    }
  } catch (error) {
    if (error.response && error.response.status === 404) setErrorMeja("Sistem backend belum dikonfigurasi (404).");
    else setErrorMeja("Gagal terhubung ke server.");
  } finally {
    setIsLoadingMeja(false);
    window.history.replaceState(null, "", window.location.pathname);
  }
};
