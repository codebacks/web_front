/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/3/15
 */
import createModel from 'utils/model'
import {appsClick, deleteRecentApp, addFrequentApps, deleteFrequentApps, getApp} from 'services/apps'
import {message} from "antd"
import {routerRedux} from 'dva/router'
import _ from 'lodash'
import {winOpen} from 'utils'

function getInitState() {
    return {
        recentApps: [],
        recentAppsInit: false,
        frequentApps: [],
        activeIframeMessage: null,
    }
}

export default createModel({
    namespace: 'app',

    state: getInitState(),

    effects: {
        * postActiveIframeMessage({payload, callback}, {select, call, put}) {
            try {
                const {activeIframeMessage} = yield select(
                    ({app}) => app,
                )

                if(typeof activeIframeMessage === 'function'){
                    activeIframeMessage(payload)
                }

            }catch (e) {
            }
        },
        * getApp({payload, callback}, {select, call, put}) {
            try {
                const {data} = yield call(getApp, payload)

                if (data) {
                    callback && callback(data)
                }
            }catch (e) {
            }
        },
        * deleteRecentApp({payload, callback}, {select, call, put}) {
            try {
                const {app} = yield select(
                    (state) => {
                        return state
                    },
                )

                const newRecentApps = _.cloneDeep(app.recentApps)
                newRecentApps.splice(payload.index, 1)

                yield put({
                    type: 'setProperty',
                    payload: {
                        recentApps: newRecentApps,
                    },
                })

                const {meta, data} = yield call(deleteRecentApp, {
                    id: _.get(payload, 'item.id'),
                })

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
            }
        },
        * appsClick({payload, callback}, {select, call, put}) {
            try {
                const {app: {recentApps}, base: {accessToken}} = yield select(
                    ({app, base}) => {
                        return {app, base}
                    },
                )
                const {
                    item,
                } = payload

                const newRecentApps = _.cloneDeep(recentApps)
                const index = newRecentApps.findIndex(app => app.id === item.id)
                if (index > -1) {
                    newRecentApps.splice(index, 1)
                }
                newRecentApps.unshift(item)

                yield put({
                    type: 'setProperty',
                    payload: {
                        recentApps: newRecentApps,
                    },
                })

                if(item.target === 'blank'){
                    winOpen(window.encodeURI(`${item.url}?access_token=${accessToken}`))
                }else{
                    yield put(routerRedux.push('/app/0'))
                }

                const {meta, data} = yield call(appsClick, {
                    id: item.id,
                })

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
            }
        },
        * addFrequentApps({payload, callback}, {select, call, put}) {
            try {
                const {frequentApps} = yield select(
                    ({app}) => app,
                )
                const {
                    item,
                } = payload

                const newFrequentApps = _.cloneDeep(frequentApps)
                const index = newFrequentApps.findIndex(app => app.id === item.id)
                if (index > -1) {
                    message.warning('已存在')
                    return
                }

                if (frequentApps.length > 9) {
                    message.warning('不能添加大于10个')
                    return
                }

                newFrequentApps.push(item)

                yield put({
                    type: 'setProperty',
                    payload: {
                        frequentApps: newFrequentApps,
                    },
                })

                const {meta, data} = yield call(addFrequentApps, {
                    body: {
                        id: item.id,
                    },
                })

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
            }
        },
        * deleteFrequentApps({payload, callback}, {select, call, put}) {
            try {
                const {app} = yield select(
                    (state) => {
                        return state
                    },
                )

                const newFrequentApps = _.cloneDeep(app.frequentApps)
                newFrequentApps.splice(payload.index, 1)

                yield put({
                    type: 'setProperty',
                    payload: {
                        frequentApps: newFrequentApps,
                    },
                })

                const {meta, data} = yield call(deleteFrequentApps, {
                    id: _.get(payload, 'item.id'),
                })

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
            }
        },
        * initRecentApps({payload, callback}, {call, put, select}) {
            const {recentApps = []} = payload
            if (Array.isArray(recentApps)) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        recentApps,
                        recentAppsInit: true,
                    },
                })
            }
        },
        * initFrequentApps({payload, callback}, {call, put, select}) {
            const {frequentApps = []} = payload
            if (Array.isArray(frequentApps)) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        frequentApps,
                    },
                })
            }
        },
    },

    reducers: {},
})
