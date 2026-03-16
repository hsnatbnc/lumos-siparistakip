import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";


/* ─────────────────────────────────────────────
   Helper: Animated number badge
───────────────────────────────────────────── */
function OrderBadge({ number, variant = "pending" }) {
  const isPending = variant === "pending";
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-2xl py-4 px-2",
        "backdrop-blur-sm transition-all duration-300 min-w-0",
        isPending
          ? "bg-white/[0.08] border border-white/[0.18] shadow-[0_2px_16px_rgba(0,0,0,0.18)]"
          : "bg-emerald-400/[0.18] border border-emerald-400/55 shadow-[0_2px_24px_rgba(0,0,0,0.22)] animate-readyPulse",
      ].join(" ")}
    >
      <span
        className={`font-mono font-bold leading-none tracking-tight ${
          isPending ? "text-white" : "text-emerald-300"
        }`}
        style={{ fontSize: "clamp(2rem, 3.5vw, 4rem)" }}
      >
        {Number(number)}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helper: Column panel
───────────────────────────────────────────── */
function OrderColumn({ title, orders, variant, icon }) {
  const isPending = variant === "pending";

  return (
    <div
      className={[
        "flex-1 flex flex-col rounded-3xl overflow-hidden backdrop-blur-xl relative z-10",
        "shadow-[0_8px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]",
        "bg-white/[0.045]",
        isPending
          ? "border border-white/[0.28]"
          : "border border-emerald-400/[0.28]",
      ].join(" ")}
    >
      {/* Column header */}
      <div
        className={[
          "flex items-center justify-between px-8 py-5",
          isPending
            ? "border-b border-white/[0.18] bg-gradient-to-br from-white/[0.18] to-white/[0.06]"
            : "border-b border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.22] to-emerald-400/[0.08]",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <span
            className="font-semibold text-white tracking-wide"
            style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)" }}
          >
            {title}
          </span>
        </div>

       
      </div>

      {/* Orders grid */}
      <div className="flex-1 p-5 overflow-y-auto scrollbar-thin relative">

        {/* Veroni watermark — behind order numbers */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/veroni-logo.png"
            alt=""
            className="w-[20%] object-contain opacity-[0.06]"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 gap-2 relative z-10">
            <span className="text-5xl opacity-40">
              {isPending ? "" : ""}
            </span>
            <span className="text-base">
              {isPending ? "Hazırlanan sipariş yok" : "Teslime hazır sipariş yok"}
            </span>
          </div>
        ) : (
          <div
            className="grid gap-3 relative z-10"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
          >
            {orders.map((order) => (
              <OrderBadge
                key={order.id}
                number={order.tracking_number}
                variant={variant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helper: Live clock
───────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-white/55 tracking-widest text-base">
      {time.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
function TrackPage() {
 const backendURL = "https://lumosapi.com/lumos-pos/api-yonetim/";
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pulse, setPulse] = useState(false);
  const prevReadyRef = useRef([]);
  const shop = JSON.parse(localStorage.getItem("shop"));
  console.log(shop)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${backendURL}/get_order_for_tracking.php`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("branch_token")}`,
          },
        }
      );
      if (response.data.success) {
        const newReady = response.data.ready || [];
        if (newReady.length > prevReadyRef.current.length) {
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
        prevReadyRef.current = newReady;
        setPendingOrders(response.data.pending || []);
        setReadyOrders(newReady);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("TrackOrder fetch error:", error);
    }
  };

  return (
    <>
   

      {/* Root */}
      <div
        className={`w-screen h-screen flex flex-col overflow-hidden font-sans ${
          pulse ? "animate-flashGreen" : ""
        }`}
        style={{
background: shop.cafe_color
        }}
      >
        {/* ── HEADER ───────────────────────────────── */}
        <header
          className="flex items-center justify-between px-10 py-5 shrink-0 backdrop-blur-xl border-b border-white/15"
        >
          {/* Cafe logo — left */}
          <div className="flex items-center">
            <img
              src={shop.logo_path}
              alt="cafe-logo"
              className="h-[80px] object-contain brightness-105"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Center — lumos logo + subtitle + clock */}
          <div className="flex flex-col items-center gap-1">
            <img
              src="/lumos-logo.png"
              alt="Lumos Sales"
              className="h-[56px] object-contain brightness-110"
              onError={(e) => (e.target.style.display = "none")}
            />
            <p
              className="m-0 font-light uppercase tracking-[0.2em] text-white/80"
              style={{ fontSize: "clamp(0.7rem, 1.2vw, 1rem)" }}
            >
              Sipariş Takip Ekranı
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="live-dot inline-block w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 6px #34d399" }}
              />
              <LiveClock />
            </div>
          </div>

          {/* Developer logo — right */}
          <div className="flex items-center">
            <img
              src="/inobulutu-logo.png"
              alt="İnoBulutu"
              className="h-[64px] object-contain opacity-80 brightness-110"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        </header>

        {/* ── MAIN CONTENT ─────────────────────────── */}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden relative">

          <OrderColumn
            title="Hazırlanıyor"
            orders={pendingOrders}
            variant="pending"
          />

          {/* Divider */}
          <div
            className="w-px shrink-0 z-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)",
            }}
          />

          <OrderColumn
            title="Teslime Hazır"
            orders={readyOrders}
            variant="ready"
          />
        </main>

        {/* ── FOOTER ───────────────────────────────── */}
        <footer
          className="flex items-center justify-between px-10 py-2 shrink-0 backdrop-blur-xl border-t border-white/10"
        >
          <span className="text-xs text-white/25">Lumos Sales</span>

          {lastUpdated && (
            <span className="text-xs text-white/25">
              Son güncelleme:{" "}
              {lastUpdated.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}

          <span className="text-xs text-white/[0.18]">
            Powered by İnobasyon Bulutu
          </span>
        </footer>
      </div>
    </>
  );
}

export default TrackPage;
