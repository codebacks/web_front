import {
    getConfig,
    setConfig,
    createContent,
    deleteContent,
    updateContent,
    move,
} from 'wx/services/autoGreet'
import {parse} from "qs"
import _ from 'lodash'

function getInitState() {
    return {
        list: [],
        status: 0,
    }
}

export default {
    namespace: 'wx_newFriends',

    state: getInitState(),

    effects: {
        * getConfig({payload, callback}, {call, put}) {
            const {data} = yield call(getConfig)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.greet_contents,
                        status: Boolean(data.status)
                    },
                })
            }
        },
        * setConfig({payload, callback}, {call, put}) {
            const {data} = yield call(setConfig, {status: Number(payload)})
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.greet_contents,
                        status: Boolean(data.status)
                    },
                })
                callback && callback()
            }
        },
        * createContent({payload, callback}, {call, put}) {
            const {meta} = yield call(createContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * updateContent({payload, callback}, {call, put}) {
            const {meta} = yield call(updateContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * deleteContent({payload, callback}, {call, put}) {
            const {meta} = yield call(deleteContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * move({payload, callback}, {call, put}) {
            const {meta} = yield call(move, payload)
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
