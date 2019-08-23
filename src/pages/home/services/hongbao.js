import {callApi} from '../utils/request'
import api from '../common/api/hongbao'
import moment from 'moment'
import _ from 'lodash'

function getDuring(dateTime, days){
    var date = dateTime

    var dates = []

    for ( var i = days; i > 0; i--) {
        dates.push(moment(date).subtract(i, 'days'))
    }

    return {
        begin: dates[0],
        end: dates[dates.length - 1],
        dates: dates
    }
}

/**
 * 获取日期区间内红包的统计数据
 * @returns {JSON}
 */
export async function getWeekStatistics(){
    const yesterday = moment().subtract(1).toDate()
    var during = getDuring(yesterday, 7)

    var response = callApi(api.getWeekStatistics, {
        body: {
            begin_at: during.begin.format('YYYY-MM-DD'),
            end_at: during.end.format('YYYY-MM-DD')
        }
    })

    return new Promise((resolve, reject) => {
        response.then(result => {
            resolve(convertWeekStatisticsApiModel(result.data, during))
        }, error => {
            reject(error)
        })
    })
}

function convertWeekStatisticsApiModel(apiData, during){
    
    return {
        data: during.dates.map(d => {
            var dateText = d.format('YYYY-MM-DD')
            var data = getDateData(apiData, dateText)

            var resultData = {
                //发送的红包个数
                sendNumber: 0, 
                //发送的总金额
                sendAmount: 0,
                // 成功领取的个数
                takedSuccessNumber: 0,
                // 成功领取的金额
                takedSuccessAmount: 0,
                // 失败领取的个数
                takedFailedNumber: 0,
                // 失败领取的金额
                takedFailedAmount: 0,
                // 未领取金额
                unTakedAmount: 0,
                // 未领取数量
                unTakedNumber: 0
            }

            if(data){
                resultData = {
                    ...resultData,
                    sendAmount: convertAmountYuan(data.total_amount),
                    sendNumber: data.total_count,
                    takedSuccessAmount: convertAmountYuan(data.success_amount),
                    takedSuccessNumber: data.success_count,
                    takedFailedAmount: convertAmountYuan(data.fail_amount),
                    takedFailedNumber: data.fail_count,
                    unTakedAmount: convertAmountYuan(data.unreceived_amount),
                    unTakedNumber: data.unreceived_count
                }
            }

            return {
                dateText: dateText,
                date: d,
                data: resultData
            }
        })
    }
}

function getDateData(apiData, dateText){
    var key = dateText + ' 00:00:00'
    return _.find(apiData, c => c.begin_at === key)
}

/**
 * 转换金额单位为（元）
 * @param {number} amount 金额（单位分）
 * @returns 
 */
function convertAmountYuan(amount){
    return amount / (1.0 * 100)
}