import React from "react";

const HeaderLogo = ({ variant = "utama", className = "" }) => {
  // Pilih file logo berdasarkan props
  const logoSrc = variant === "alternatif" ? "/images/logo-mahaasyik2.png" : "/images/logo-mahaasyik1.png";

  // Styling default biar proporsional
  // Styling supaya ukurannya pas
  const defaultClass = variant === "utama" ? "w-32 h-auto mx-auto object-contain" : "h-12 w-auto object-contain"; // <-- Diubah jadi h-12 biar lebih gede dan pas

  return <img src={logoSrc} alt={`Mahaasyik Resto Logo ${variant}`} className={`${defaultClass} ${className}`} />;
};

export default HeaderLogo;
