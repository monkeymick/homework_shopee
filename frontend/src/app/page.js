"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {},
    latestOrders: [],
    topSellingProducts: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/dashboard-data");
      if (!res.ok) throw new Error("Network response was not ok");
      const result = await res.json();

      setData({
        stats: result?.stats || {},
        latestOrders: result?.latestOrders || [],
        topSellingProducts: result?.topSellingProducts || [],
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/getorders-list", {
        method: "POST",
      });
      const result = await res.json();
      alert(result.message || "Sync completed!");
      fetchDashboardData();
    } catch (err) {
      alert("Sync Failed!");
    } finally {
      setLoading(false);
    }
  };

  const s = data?.stats || {};

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              เวลาที่ Sync ข้อมูลล่าสุด:{" "}
              {s.lastSyncTime
                ? new Date(s.lastSyncTime).toLocaleString("th-TH")
                : "ยังไม่มีการ Sync"}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "กำลังดึงข้อมูล..." : "Sync ข้อมูลจาก Shopee"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              ยอดขายวันนี้
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ฿{Number(s.totalSalesToday || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              จำนวน Order วันนี้
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {s.totalOrdersToday || 0} รายการ
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Order ที่ยังไม่ได้จัดส่ง
            </p>
            <p className="text-2xl font-bold text-amber-500 mt-2">
              {s.pendingShipping || 0} รายการ
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Order ที่ถูกยกเลิก
            </p>
            <p className="text-2xl font-bold text-red-500 mt-2">
              {s.cancelledOrders || 0} รายการ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                ตารางรายการ Order ล่าสุด
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <th className="p-4">Order No.</th>
                    <th className="p-4">ชื่อลูกค้า</th>
                    <th className="p-4">ยอดเงิน</th>
                    <th className="p-4">Order Created</th>
                    <th className="p-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {!data?.latestOrders || data.latestOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        ยังไม่มีข้อมูลออเดอร์ กรุณากดปุ่ม Sync
                      </td>
                    </tr>
                  ) : (
                    data.latestOrders.map((order) => (
                      <tr
                        key={order.order_id || order.order_sn}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-blue-600 text-xs">
                          {order.order_sn}
                        </td>
                        <td className="p-4 font-medium">{order.buyer_name}</td>
                        <td className="p-4 font-semibold">
                          ฿{Number(order.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4 font-medium">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: false,
                                },
                              )
                            : "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.order_status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : order.order_status === "READY_TO_SHIP"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                รายการสินค้าขายดี
              </h2>
            </div>
            <div className="p-6">
              {!data?.topSellingProducts ||
              data.topSellingProducts.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">
                  ยังไม่มีข้อมูลสินค้า
                </p>
              ) : (
                <div className="space-y-4">
                  {data.topSellingProducts.map((item, index) => (
                    <div
                      key={item.sku || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            SKU: {item.sku || "NO-SKU"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs font-bold text-gray-900">
                          {item.total_sold || 0} ชิ้น
                        </p>
                        <p className="text-xs text-gray-400">
                          ฿{Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
