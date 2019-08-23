import {callApi} from '../utils/request'
import api from '../common/api/wechat'
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
 * 获取日期区间内微信好友的统计数据
 * @param {Date} begin 开始日期
 * @param {Number}} days 开始日期的之前多少天
 * @returns {JSON}
 */
export async function getFriendStatictics(begin, days){

    var during = getDuring(begin, days)

    var response = callApi(api.getFriendStatictics, {
        body: {
            start_time: during.begin.format('YYYY-MM-DD'),
            end_time: during.end.format('YYYY-MM-DD')
        }
    })

    return new Promise((resolve, reject) => {
        response.then(result => {
            resolve(convertFriendStaticticsApiModel(result.data, during))
        }, error => {
            reject(error)
        })
    })
}

function convertFriendStaticticsApiModel(apiData, during){
    return during.dates.map(d => {
        var resultData = {
            newCount: 0,
            sendMessageCount: 0,
            receiveMessageCount: 0
        }
        var dateText = d.format('YYYYMMDD')
        var data = getDateData(apiData, dateText)
        // var data = apiData[dateText]
        if(data){
            resultData = {
                ...resultData, 
                newCount: fixNewCount(data.new_friend_count),
                sendMessageCount: data.send_count,
                receiveMessageCount: data.receive_count
            }
        }

        return {
            dateText: dateText,
            date: d,
            data: resultData
        }
    })
}

/**
 * 修复新增数据出现负数的情况，当为负数时，则返回0
 * @param {number} newCount 新增数据
 */
function fixNewCount(newCount) {  
    if(newCount< 0) {
        return 0
    }else{
        return newCount
    }
}

function getDateData(apiData, dateText){
    var key = dateText
    return _.find(apiData, c => c.day + "" === key)
}

/**
 * 获取日期区间内微信群的统计数据
 * @param {Date} begin 开始日期
 * @param {Number}} days 开始日期的之前多少天
 * @returns {JSON}
 */
export async function getGroupStatictics(begin, days){

    var during = getDuring(begin, days)

    var response = callApi(api.getGroupStatictics, {
        body: {
            start_time: during.begin.format('YYYY-MM-DD'),
            end_time: during.end.format('YYYY-MM-DD')
        }
    })

    return new Promise((resolve, reject) => {
        response.then(result => {
            resolve(convertGroupStaticticsApiModel(result.data, during))
        }, error => {
            reject(error)
        })
    })
}


function convertGroupStaticticsApiModel(apiData, during){
    return during.dates.map(d => {
        var resultData = {
            newCount: 0,
            sendMessageCount: 0,
            receiveMessageCount: 0
        }
        var dateText = d.format('YYYYMMDD')
        var data = getDateData(apiData, dateText)
        // var data = apiData[dateText]
        if(data){
            resultData = {
                ...resultData, 
                newCount: fixNewCount(data.new_chatroom_count),
                sendMessageCount: data.send_count,
                receiveMessageCount: data.receive_count
            }
        }

        return {
            dateText: dateText,
            date: d,
            data: resultData
        }
    })
}