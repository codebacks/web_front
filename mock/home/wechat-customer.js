/**
 **@Description:
 **@author: 罗龙
 */
import Mock, { Random } from 'mockjs'

function customerVariant(multiple) {
    var data = {
        cumulativeCustomerCustomers: {
            total: 5854
        },
        successTradingCustomers: {
            total: 3845
        },
        successTradingOrderNumber: {
            total: 1526
        },
        turnover: {
            total: 455645.85
        }
    }

    var result = {}

    Object.entries(data).forEach(item => {
        const key = item[0],
            value = item[1]

        var total = value.total * multiple
        result[key] = {
            total: total,
            prev: total + Random.integer(-100, 100)
        }
    })

    return result
}


module.exports = {
    'get /api_home/Statistics/wechat-customer': function(req, res, next) {

        var { type } = req.query

        var data = customerVariant(1)

        switch(type){
            case "yestarday":
                break
            case "week":
                data = customerVariant(10)
                break
            case "month":
                data = customerVariant(120)
                break
            case "total":
                data = customerVariant(250)
                break
            default:
                break
        }

        setTimeout(() => {
            res.json({
                data: data,
            })
        }, 500)
    },
    'get none/api_home/api/performance/overview/rank': function(req, res, next) {
        const data = [{
            // amount: 0,
            receive_amount: 223200,
            user_id: 12,
            user_nickname: '罗龙'
        },{
            // amount: 0,
            receive_amount: 213200,
            user_id: 13,
            user_nickname: '王子龙'
        },
        {
            // amount: 0,
            receive_amount: 500,
            user_id: 14,
            user_nickname: '张赛'
        }]

        setTimeout(() => {
            res.json({
                data: data
            })
        }, 100)
    }

}
