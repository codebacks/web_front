/**
 **@Description:
 **@author: leo
 */

module.exports = {
    'get /api_mock/doll/info': function(req, res, next) {
        setTimeout(() => {
            const data = {
                status: 1,
                yesterday_coin_count: 1000,
                last_seven_day_coin_count: 154,
                coin_count: 145,
                yesterday_settle_order_amount: 145,
                yesterday_unsettle_order_amount: 1,
                last_seven_day_settle_order_amount: 1,
                last_seven_day_unsettle_order_amount: 156,
                paid_amount: 154,
                un_paid_amount: 999,
            }
            res.json({
                data: data,
            })
        }, 500)
    },
}