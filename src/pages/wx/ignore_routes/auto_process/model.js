import {
    setting,
    settingUpdate,
} from 'wx/services/settingAuto'
import _ from 'lodash'


function getInitState() {
    return {
        auto_bind_aliwangwang: false,
        auto_bind_cellphone: false,
        auto_bind_order: false,
        auto_bind_jd: false,
    }
}

export default {
    namespace: 'wx_autoProcess',

    state: getInitState(),

    effects: {
        * setting({payload, callback}, {call, put}) {
            let {data} = yield call(setting, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        auto_bind_aliwangwang: Boolean(data.auto_bind_aliwangwang),
                        auto_bind_cellphone: Boolean(data.auto_bind_cellphone),
                        auto_bind_order: Boolean(data.auto_bind_order),
                        auto_bind_jd: Boolean(data.auto_bind_jd),
                    },
                })
                callback && callback()
            }
        },
        * settingUpdate({payload, callback}, {call, put, select}) {
            const status = yield select(({wx_autoProcess}) => wx_autoProcess)
            const formData = Object.assign({}, status, payload)

            let {data} = yield call(settingUpdate, formData)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        auto_bind_aliwangwang: Boolean(data.auto_bind_aliwangwang),
                        auto_bind_cellphone: Boolean(data.auto_bind_cellphone),
                        auto_bind_order: Boolean(data.auto_bind_order),
                        auto_bind_jd: Boolean(data.auto_bind_jd),
                    },
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
