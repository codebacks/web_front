import moment from 'moment'
import config from 'community/common/config'
import {list} from 'community/services/keyword/detail'

const {DateFormat} = config

function getInitParams() {
    return {
        start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().format(DateFormat) + ' 23:59:59',
    }
}

export default {
    namespace: 'community_keyword_detail',
    state: {
        params: getInitParams(),
        keyword: '',
        list: [],
        original: [],
        range: 'week',
    },
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({community_keyword_detail}) => community_keyword_detail.params)
            params = {...params, ...payload.params}
            const res = yield call(list, {id: payload.id, params: params})
            if (res && res.data) {
                let data = res.data.statistics

                let addition = []
                let startTime = moment(params.start_time)
                let endTime = moment(params.end_time)
                let diff = endTime.diff(startTime, 'days') + 1
                for (let i = 0; i < diff; i++) {
                    let year = startTime.year()
                    let month = startTime.month() + 1
                    let day = startTime.date()

                    month = month < 10 ? `0${month}` : month
                    day = day < 10 ? `0${day}` : day
                    addition.push({
                        day: `${year}${month}${day}`
                    })
                    startTime = startTime.add(1, 'day')
                }

                let day
                let arr = []
                const original = addition.map((item)=>{
                    let temp = data.find((v)=>{
                        return v.day_int.toString() === item.day
                    })
                    if(temp) {
                        return {
                            ...item,
                            ...temp
                        }
                    }
                    return item
                })

                original.forEach((item) => {
                    day = item.day ? ('' + item.day).substr(4, 4) : ''
                    arr.push({
                        '时间': day,
                        '数量': item.show_count || 0,
                        '类型': '出现次数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.sender_count || 0,
                        '类型': '发送用户数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.group_count || 0,
                        '类型': '出现群数'
                    })
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        keyword: res.data.keyword,
                        list: arr,
                        original: original,
                        params: params,
                    }
                })
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        resetRange(state, action) {
            return {...state, ...{range: 'week'}}
        },
    }
}