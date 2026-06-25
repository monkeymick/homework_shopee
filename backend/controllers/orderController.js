const pool = require("../config/db");
const shopeeService = require("../services/shopeeService");
const { logSyncStatus } = require("../utils/logger");

async function getOrdersList(req, res) {
  const connection = await pool.getConnection();

  try {
    const listData = await shopeeService.fetchOrderListFromShopee();
    const shopeeOrderList = listData?.response?.order_list;

    if (!shopeeOrderList || !Array.isArray(shopeeOrderList)) {
      throw new Error("Shopee API did not return a valid order list array");
    }

    await connection.beginTransaction();

    for (let baseOrder of shopeeOrderList) {
      const detailData = await shopeeService.fetchOrderDetailFromShopee(
        baseOrder.order_sn,
      );
      const orderDetail = detailData?.response?.order_list?.[0];

      if (!orderDetail) continue;

      const orderQuery = `
                INSERT INTO orders (order_sn, order_status, buyer_name, total_amount, payment_method, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?))
                ON DUPLICATE KEY UPDATE order_status = VALUES(order_status), updated_at = VALUES(updated_at)
            `;

      const [orderResult] = await connection.query(orderQuery, [
        orderDetail.order_sn,
        orderDetail.order_status,
        orderDetail.buyer_username, 
        Number(orderDetail.total_amount),
        orderDetail.payment_method,
        orderDetail.create_time,
        orderDetail.update_time,
      ]);

      let orderId = orderResult.insertId;
      if (orderId === 0) {
        const [existingOrder] = await connection.query(
          `SELECT order_id FROM orders WHERE order_sn = ?`,
          [orderDetail.order_sn],
        );
        orderId = existingOrder[0]?.order_id;
      }

      if (orderId) {
        await connection.query(`DELETE FROM order_items WHERE order_id = ?`, [
          orderId,
        ]);

        if (orderDetail.item_list && Array.isArray(orderDetail.item_list)) {
          for (let item of orderDetail.item_list) {
            const itemQuery = `
                        INSERT INTO order_items (order_id, product_name, sku, quantity, price, discount)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
            await connection.query(itemQuery, [
              orderId,
              item.item_name,
              item.model_sku || "NO-SKU", 
              item.model_quantity_purchased,
              Number(item.model_discounted_price), 
              0,
            ]);
          }
        }
      }
    }
    await connection.commit();

    await logSyncStatus("MANUAL_SYNC", "SUCCESS");
    return res.json({
      success: true,
      message: "Sync orders from Shopee structures successfully!",
    });
  } catch (error) {
    await connection.rollback();

    await logSyncStatus("MANUAL_SYNC", "FAILED", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Sync failed", error: error.message });
  } finally {
    connection.release();
  }
}

async function getDashboardData(req, res) {
  try {
    
    const [orders] = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`,
    );
    const [logs] = await pool.query(
      `SELECT sync_time FROM api_sync_logs WHERE status = 'SUCCESS' ORDER BY sync_time DESC LIMIT 1`,
    );
    const [topProducts] = await pool.query(`
            SELECT product_name, sku, SUM(quantity) as total_sold, price
            FROM order_items
            GROUP BY sku, product_name, price
            ORDER BY total_sold DESC
            LIMIT 5
        `);

    const todayStr = new Date().toLocaleDateString("sv-SE");

    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).toLocaleDateString("sv-SE");
      return orderDate === todayStr;
    });

    const stats = {
      totalSalesToday: todayOrders.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0,
      ),
      totalOrdersToday: todayOrders.length,
      pendingShipping: orders.filter((o) => o.order_status === "READY_TO_SHIP")
        .length,
      cancelledOrders: orders.filter((o) => o.order_status === "CANCELLED")
        .length,
      lastSyncTime: logs[0] ? logs[0].sync_time : null,
    };

    return res.json({
      stats,
      latestOrders: orders.slice(0, 5),
      topSellingProducts: topProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getOrdersList, getDashboardData };
