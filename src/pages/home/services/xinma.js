import {callApi} from '../utils/request'
import api from '../common/api/xinma'
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
 * 获取日期区间内新码的统计数据
 * @param {Date} begin 开始日期
 * @param {Number}} days 开始日期的之前多少天
 * @returns {JSON}
 */
export async function getWeekStatistics(){
    const yesterday = moment().subtract(1).toDate()
    var during = getDuring(yesterday, 7)

    var response = callApi(api.getWeekStatistics, {
        body: {
       
        },
        isErrorPropagation: true
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
        addTotalCount: apiData.addCount || 0,
        displayTotalCount: apiData.displayCount || 0,
        data: during.dates.map(d => {
            
            var dateText = d.format('YYYY-MM-DD')
            var data = getDateData(apiData.data, dateText)

            var resultData = {
                addCount: 0,
                displayCount: 0
            }

            if(data){
                resultData = {
                    ...resultData,
                    displayCount: data.displayCount,
                    addCount: data.addCount
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
    var key = dateText
    return _.find(apiData, c => c.createdAt === key)
}