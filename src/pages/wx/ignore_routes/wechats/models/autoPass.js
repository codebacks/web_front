import {
    detail,
    update,
    wechatUpdate,
} from 'wx/services/autoConfirm'
import {parse} from "qs"
import _ from 'lodash'
import moment from 'moment'

const format = 'HH:mm'

function getInitState() {
    return {
        uin: 0,
        originalDefaultRule: {},
        autoConfirm: {},
        defaultRule: {},
        formData: {
            status: {
                value: false,
            },
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
            wx_setting_type: {
                value: '0',
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

function setSexLimit(data) {
    return data ? data.split('').map((item, index) => {
        if(item === '0') {
            return (sexLimitArr[index])
        }else {
            return false
        }
    }).filter(Boolean) : []
}

function setFromData(data) {
    return {
        wx_setting_type: {
            value: data.wx_setting_type,
        },
        status: {
            value: data.status,
        },
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
            value: setSexLimit(data.sex_limit),
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
    }
}

export default {
    namespace: 'wx_weChatsAutoPass',

    state: getInitState(),

    effects: {
        * detail({payload, callback}, {call, put}) {
            let {data} = yield call(detail, payload)
            if(data) {
                const defaultRule = Object.assign({}, data)
                defaultRule.allowed_time_start = numToMoment(data.allowed_time_start)
                defaultRule.allowed_time_end = numToMoment(data.allowed_time_end)
                defaultRule.sex_limit_status = Boolean(data.sex_limit_status)
                defaultRule.pass_cipher_status = Boolean(data.pass_cipher_status)
                defaultRule.forbid_repeat_confirm = Boolean(data.forbid_repeat_confirm)
                defaultRule.sex_limit = setSexLimit(data.sex_limit)
                yield put({
                    type: 'setProperty',
                    payload: {
                        defaultRule,
                        originalDefaultRule: data,
                    },
                })
                callback && callback()
            }
        },
        * wechatUpdate({payload, callback}, {call, put, select}) {
            let {data} = yield call(wechatUpdate, payload)
            if(data) {
                callback && callback()
            }
        },
    },

    reducers: {
        setDataForRecord(state, action) {
            const record = action.payload
            const autoConfirm = Object.assign({}, record.auto_confirm)
            const data = Object.assign({}, record.auto_confirm)
            data.status = data.status === 1
            data.wx_setting_type = String(data.wx_setting_type)
            const newState = {
                uin: record.uin,
                formData: setFromData(data),
                autoConfirm,
            }

            return {...state, ...newState}
        },
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
