"use client";

import { useState, useEffect } from "react";

// 背景画像のリスト
const backgroundImages = [
  "/bg-1.jpg",
  "/bg-2.jpg",
  "/bg-3.jpg",
  "/bg-4.jpg",
  "/bg-5.jpg",
  "/bg-6.jpg",
  "/bg-7.jpg",
  "/bg-8.jpg",
  "/bg-9.jpg",
  "/bg-10.jpg",
  "/bg-11.jpg",
];

export default function BackgroundImageSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 5秒ごとに背景を切り替えるタイマー
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* --- ここから背景スライドショーレイヤー --- */}
      {backgroundImages.map((image, index) => (
        <div
          key={image}
          className={`
            absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out
            filter blur-[6px] scale-105
            ${index === currentImageIndex ? "opacity-100" : "opacity-0"}
          `}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      {/* 背景を少し暗くする膜（文字を読みやすくするため） */}
      <div className="absolute inset-0 bg-black/30" />
      {/* --- ここまで背景スライドショーレイヤー --- */}
    </>
  );
}
