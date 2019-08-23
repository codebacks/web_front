import {
    getConfig,
    getOneConfig,
    setOneConfig,
    createOneContent,
    deleteOneContent,
    updateOneContent,
    oneMove,
} from 'wx/services/autoGreet'
import {parse} from "qs"
import _ from 'lodash'

function getInitState() {
    return {
        list: [],
        status: 0,
        companyList: [],
        companyStatus: 0,
        wx_setting_type: '0',
    }
}

export default {
    namespace: 'wx_weChatsNewFriends',

    state: getInitState(),

    effects: {
        * getConfig({payload, callback}, {call, put}) {
            const {data} = yield call(getConfig)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        companyList: data.greet_contents,
                        companyStatus: Boolean(data.status),
                    },
                })
            }
        },
        * getOneConfig({payload, callback}, {call, put}) {
            const {data} = yield call(getOneConfig, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.greet_contents,
                        status: Boolean(data.status),
                        wx_setting_type: String(data.wx_setting_type),
                    },
                })
            }
        },
        * setOneConfig({payload, callback}, {call, put, select}) {
            const {
                status,
                wx_setting_type,
            } = yield select(({wx_weChatsNewFriends}) => wx_weChatsNewFriends)
            const fetchOption = Object.assign({
                status,
                wx_setting_type,
            }, payload)
            const {data} = yield call(setOneConfig, fetchOption)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.greet_contents,
                        status: Boolean(data.status),
                        wx_setting_type: String(data.wx_setting_type),
                    },
                })
                callback && callback()
            }
        },
        * createOneContent({payload, callback}, {call, put}) {
            const {meta} = yield call(createOneContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * updateOneContent({payload, callback}, {call, put}) {
            const {meta} = yield call(updateOneContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * deleteOneContent({payload, callback}, {call, put}) {
            const {meta} = yield call(deleteOneContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * oneMove({payload, callback}, {call, put}) {
            const {meta} = yield call(oneMove, payload)
            if(meta && meta.code === 200) {
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
