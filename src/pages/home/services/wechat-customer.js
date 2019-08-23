import { callApi } from '../utils/request'
import api from '../common/api/wechat-customer'

export async function getAll(params) {
    let response = callApi(api.get, {
        body: params
    })

    return new Promise((resolve, reject) => {
        response.then(result => {
            resolve(convertApiModel(result.data))
        }, error => {
            reject(error)
        })
    })
}

export async function getPerformances(params) {
    return callApi(api.getPerformances, {
        body: params
    }).then(({data}) => {

        const item = {
            ...{
                receive_customer_count: 0,
                receive_customer_count_change:0,
                receive_order_count: 0,
                receive_order_count_change: 0,
                receive_amount: 0,
                receive_amount_change: 0,
                order_customer_count: 0,
                order_customer_count_change: 0,
                order_count: 0,
                order_count_change: 0,
                amount:0,
                amount_change:0
            },
            ...data.statistics
        }

        return {
            isPayMode: data.settings.overview_mode === 1,
            isStaticticsing: !data.statistics,
            paySuccessTradingCustomers: {
                total: item.order_customer_count,
                diff: item.order_customer_count_change
            },
            paySuccessTradingOrderNumber: {
                total: item.order_count,
                diff: item.order_count_change
            },
            payTurnover: {
                total: item.amount,
                diff: item.amount_change
            },
            successTradingCustomers: {
                total: item.receive_customer_count,
                diff: item.receive_customer_count_change
            },
            successTradingOrderNumber: {
                total: item.receive_order_count,
                diff: item.receive_order_count_change
            },
            turnover: {
                total: item.receive_amount,
                diff: item.receive_amount_change
            }
        }
    })
}

export async function getSetting() {
    return callApi(api.getSetting)
}

export async function setSetting(overview_mode) {
    return callApi(api.setSetting, {
        body: {
            overview_mode: overview_mode
        },
        isErrorPropagation: true
    })
}

/**
 * 获取销售排行榜数据
 * @param {*} params 
 */
export async function getTopSells(params) {
    return callApi(api.getTopSells, {
        body: params
    })
}



/**
 * 转换远程 API 数据为接口实体
 * @method convertApiModel
 * @param {json} apiData 远程API数据
 */
function convertApiModel(apiData){
    return {
        yesterday: converSingleModel(apiData.day),
        week: converSingleModel(apiData.week),
        month: converSingleModel(apiData.month),
        total: converSingleModel(apiData.total)
    }

    function converSingleModel(item) {
        item = {
            ...{
                customer_num: 0,
                customer_inc: 0,
                customer_turnover_num: 0,
                customer_turnover_inc:0,
                order_num: 0,
                order_inc: 0,
                amount_num: 0,
                amount_inc: 0
            },
            ...item
        }

        return {
            cumulativeCustomerCustomers: {
                total: item.customer_num,
                diff: item.customer_inc
            },
            successTradingCustomers: {
                total: item.customer_turnover_num,
                diff: item.customer_turnover_inc
            },
            successTradingOrderNumber: {
                total: item.order_num,
                diff: item.order_inc
            },
            turnover: {
                total: item.amount_num,
                diff: item.amount_inc
            }
        }
    }
}