async function fetchOrderListFromShopee() {
  return {
    response: {
      order_list: [
        { order_sn: "2404098R48U37C" },
        { order_sn: "201218V2W2SG1D" },
      ],
    },
  };
}

async function fetchOrderDetailFromShopee(orderSn) {
  return {
    response: {
      order_list: [
        {
          order_sn: orderSn,
          order_status: "COMPLETED",
          buyer_username: "xt4fdsf96j",
          total_amount: 2000,
          payment_method: "Cash on Delivery",
          create_time: 1782360975,
          update_time: 1782360978,
          item_list: [
            {
              item_name: "Kem nở ngực SADOER enlarging breast cream",
              model_sku: "QAZ-SADOER-05",
              model_quantity_purchased: 1,
              model_discounted_price: 48,
              promotion_group_id: 0,
            },
          ],
        },
      ],
    },
  };
}

module.exports = { fetchOrderListFromShopee, fetchOrderDetailFromShopee };
