"use client";

export default function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-purple-500 opacity-20 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-cyan-500 opacity-20 blur-[150px] rounded-full bottom-[-200px] right-[-200px]" />
    </div>
  );
}
