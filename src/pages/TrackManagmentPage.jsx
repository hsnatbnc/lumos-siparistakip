import React, { useEffect, useState, useContext } from "react";
import axios from "axios";


function TrackManagmentPage() {
 const backendURL = "https://lumosapi.com/lumos-pos/api-yonetim/";

  const [pending, setPending] = useState([]);
  const [ready, setReady] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${backendURL}/get_tracking_orders_for_management.php`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("branch_token")}`,
          },
        }
      );

      if (response.data.success) {
        setPending(response.data.pending || []);
        setReady(response.data.ready || []);
      }
    } catch (error) {
      console.error("Tracking fetch error:", error);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await axios.post(
        `${backendURL}/update_tracking_order_status.php`,
        { order_id: orderId, is_ready: newStatus },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("branch_token")}`,
          },
        }
      );
      await fetchOrders();
    } catch (err) {
      console.error("Update status error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-light tracking-tight mb-8 text-center lg:text-left">
          Sipariş Takip Yönetimi
        </h1>

        {loading && (
          <div className="text-center py-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Güncelleniyor...
          </div>
        )}

        {/* Grid: Hazırlanıyor & Hazır */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hazırlanıyor Siparişler */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Hazırlanıyor</h2>
              <span className="text-2xl font-light text-neutral-500 dark:text-neutral-400">
                {pending.length}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {pending.length === 0 ? (
                <div className="col-span-full text-center py-16 text-neutral-400 dark:text-neutral-600">
                  Hazırlanan sipariş yok
                </div>
              ) : (
                pending.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => updateStatus(order.id, 1)}
                    disabled={loading}
                    className="aspect-square bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-2xl rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    {order.tracking_number}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Teslim Hazır Siparişler */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Teslim Hazır</h2>
              <span className="text-2xl font-light text-neutral-500 dark:text-neutral-400">
                {ready.length}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {ready.length === 0 ? (
                <div className="col-span-full text-center py-16 text-neutral-400 dark:text-neutral-600">
                  Teslim hazır sipariş yok
                </div>
              ) : (
                ready.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => updateStatus(order.id, 0)}
                    disabled={loading}
                    className="aspect-square bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-2xl rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    {order.tracking_number}
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TrackManagmentPage;
