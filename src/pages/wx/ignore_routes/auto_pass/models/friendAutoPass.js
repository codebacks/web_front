import {
    detail,
    update,
} from 'wx/services/autoConfirm'
import {
    message,
} from 'antd'
import {parse} from "qs"
import _ from 'lodash'
import moment from 'moment'

const format = 'HH:mm'

function getInitState() {
    return {
        isEdit: false,
        status: 0,
        formData: {
            duration: {
                value: 1,
            },
            allowed_time_start: {
                value: moment('09:00', format),
            },
            allowed_time_end: {
                value: moment('18:30', format),
            },
            auto_confirm_cnt: {
                value: 10,
            },
            one_day_confirm_limit: {
                value: 50,
            },
            sex_limit_status: {
                value: false,
            },
            sex_limit: {
                value: [],
            },
            pass_cipher_status: {
                value: false,
            },
            pass_cipher: {
                value: '',
            },
            forbid_repeat_confirm: {
                value: false,
            },
        },
    }
}

function numToMoment(value) {
    return moment(`${parseInt(value / 60)}:${value % 60}`, format)
}

const sexLimitArr = [
    '未知',
    '男',
    '女',
]

function setData(data) {
    return {
        status: data.status,
        formData: {
            duration: {
                value: data.duration,
            },
            allowed_time_start: {
                value: numToMoment(data.allowed_time_start),
            },
            allowed_time_end: {
                value: numToMoment(data.allowed_time_end),
            },
            auto_confirm_cnt: {
                value: data.auto_confirm_cnt,
            },
            one_day_confirm_limit: {
                value: data.one_day_confirm_limit,
            },
            sex_limit_status: {
                value: Boolean(data.sex_limit_status),
            },
            sex_limit: {
                value: data.sex_limit ? data.sex_limit.split('').map((item, index) => {
                    if(item === '0') {
                        return (sexLimitArr[index])
                    }else {
                        return false
                    }
                }).filter(Boolean) : [],
            },
            pass_cipher_status: {
                value: Boolean(data.pass_cipher_status),
            },
            pass_cipher: {
                value: data.pass_cipher,
            },
            forbid_repeat_confirm: {
                value: Boolean(data.forbid_repeat_confirm),
            },
        },
    }
}

export default {
    namespace: 'wx_friendAutoPass',

    state: getInitState(),

    effects: {
        * detail({payload, callback}, {call, put}) {
            let {data} = yield call(detail, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: setData(data),
                })
                callback && callback()
            }
        },
        * changeStatus({payload, callback}, {call, put, select}) {
            const params = yield select(({wx_friendAutoPass}) => wx_friendAutoPass)
            const fetchOption = {}
            let status
            if(params.status === 0) {
                status = 1
            }else if(params.status === 1) {
                status = 0
                yield put({
                    type: 'setStateByPath',
                    payload: {
                        path: 'isEdit',
                        value: false,
                    },
                })
            }

            fetchOption.status = status
            fetchOption.change_status = 1

            let {data} = yield call(update, fetchOption)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: setData(data),
                })
                if(status === 1){
                    message.success('启用成功')
                }else{
                    message.warning('禁用成功')
                }
            }
        },
        * update({payload, callback}, {call, put, select}) {
            payload.status = yield select(({wx_friendAutoPass}) => wx_friendAutoPass.status)

            let {data} = yield call(update, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: setData(data),
                })
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignStateByPath(state, action) {
            const payload = action.payload
            const oldValue = _.get(state, payload.path, {})
            _.set(state, payload.path, Object.assign(oldValue, payload.value))

            return _.cloneDeep(state)
        },
        setStateByPath(state, action) {
            const payload = action.payload
            _.set(state, payload.path, payload.value)

            return _.cloneDeep(state)
        },
        resetState() {
            return getInitState()
        },
    },
}
