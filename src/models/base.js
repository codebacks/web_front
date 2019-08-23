import {parse} from 'qs'
import {$height} from 'tools/dom/css'
import router from 'umi/router'
import {getTokenForStorage, setTokenForStorage, removeTokenForStorage, treeForEach} from 'utils'
import {
    getTreeCurrent,
    getInitData,
    querySmsCount,
    OSSAuth as QueryOSSAuth,
    COSAuth as queryCOSAuth,
    authToken,
    qiniuAuth,
    qiniuAuthTest,
    getNoticeList,
    getUnreadNum,
    setReadStatus,
} from 'services'
import {recentApps, frequentApps} from 'services/apps'

const headerHeight = 60
const winHeight = $height(window)

function getInitAccessToken() {
    const search = window.location.search.split('?')[1] || ''
    const searchObj = parse(search)
    let accessToken = null
    let tokenAccessToken
    if(searchObj.access_token){
        accessToken = searchObj.access_token
        setTokenForStorage(accessToken)
        setTimeout(_=>router.replace(window.location.pathname))
        
    }else if((tokenAccessToken = getTokenForStorage())){
        accessToken = tokenAccessToken
    }

    return accessToken
}


export default {
    namespace: 'base',
    state: {
        headerHeight: headerHeight,
        winHeight: winHeight,
        pageHeight: winHeight - headerHeight,
        accessToken: getInitAccessToken(),
        tree: [],
        initData: {},
        user: {
            isCreated: false,
            isManage: false,
        },
        flatTree: null,
        modules: [],
        noticeList: [],
        unReadNum: null,
    },

    effects: {
        * getTreeCurrent({payload, callback}, {call, put, select}) {
            const {data} = yield call(getTreeCurrent, payload)

            if (data) {
                const flatTree = []
                treeForEach(data, (item) => {
                    flatTree.push(item)
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        tree: data,
                        flatTree,
                    },
                })

                callback && callback()
            }
        },

        * getInitData({payload}, {call, put, all, select}) {
            const oemConfig = yield select(({oem}) => {
                return oem.oemConfig
            })

            const option = Object.assign({}, payload, {
                channel: oemConfig.channel,
            })

            // const  {data: initData} = yield call(getInitData, option)

            const [
                {data: initData},
                {data: recentAppsData},
                {data: frequentAppsData},
            ] = yield all([
                call(getInitData, option),
                call(recentApps, payload),
                call(frequentApps, payload),
            ])

            if (initData) {
                const {user} = initData
                yield put({
                    type: 'setProperty',
                    payload: {
                        initData: initData,
                        user: {
                            isCreated: user.is_creator,
                            isManage: user.type === 1,
                        },
                    },
                })
            }

            yield put({
                type: 'app/initRecentApps',
                payload: {
                    recentApps: recentAppsData,
                },
            })

            yield put({
                type: 'app/initFrequentApps',
                payload: {
                    frequentApps: frequentAppsData,
                },
            })
        },

        * querySmsCount({payload}, {select, call, put}) {
            yield put({type: 'showLoading'})
            const userInfo = yield select(({base}) => {
                return base.initData.user
            })
            const {data} = yield call(querySmsCount, {})
            if (data) {
                const _userInfo = {...userInfo}
                const _company = {...userInfo.company}
                yield put({
                    type: 'setUser',
                    payload: {..._userInfo, ...{company: {..._company, ...data.data}}},
                })
            }else {
                yield put({type: 'hideLoading'})
            }
        },

        * ossAuth({payload, callback}, {select, call, put}) {
            //获取OSS接口
            let {OSSAuth} = yield select(({base}) => base)
            let now = Date.parse(new Date()) / 1000
            if (!OSSAuth || OSSAuth.expire && OSSAuth.expire < now + 50) {
                const {data} = yield call(QueryOSSAuth, parse(payload))
                if (data && data.data) {
                    yield put({
                        type: 'setProperty',
                        payload: {OSSAuth: data.data},
                    })
                    callback && callback(data.data)
                }
            }else {
                callback && callback(OSSAuth)
            }
        },

        * cosAuth({payload, callback}, {call, put}) {
            const {data} = yield call(queryCOSAuth, parse(payload))
            if (data) {
                callback && callback(data)
            }
        },

        * qiniuAuth({payload, callback}, {call, put}) {
            const data = yield call(qiniuAuth, parse(payload))
            callback && callback(data)
        },

        * qiniuAuthTest({payload, callback}, {call, put}) {
            const data = yield call(qiniuAuthTest, parse(payload))
            callback && callback(data)
        },

        * authToken({payload, callback}, {call, put}) {
            const {meta, data} = yield call(authToken, parse(payload))
            if (meta && meta.code === 200) {
                callback && callback(data)
            }
        },
        * getNoticeList({payload, callback}, {call, put}) {
            const data = yield call(getNoticeList, payload)
            if (data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        getNoticeList: data.data,
                    },
                })
            }
            callback && callback(data)
        },
        * getUnreadNum({payload, callback}, {call, put}) {
            const data = yield call(getUnreadNum, payload)
            if (data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        unReadNum: data.pagination.rows_found,
                    },
                })
            }
            callback && callback(data)
        },
        * setReadStatus({payload, callback}, {select, call, put}) {
            const data = yield call(setReadStatus, payload)
            if (data.data) {
                yield put({
                    type: 'setProperty',
                })
            }
        },
        * setToken({payload, callback}, {select, call, put}) {
            yield put({
                type: 'setAccessToken',
                payload: {
                    accessToken: payload,
                },
            })
            window.localStorage && window.localStorage.setItem('isQIDIAN',1)
            callback && callback()
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setOffset(state) {
            const winHeight = $height(window)
            const pageHeight = winHeight - headerHeight

            return {...state, winHeight, pageHeight}
        },
        setAccessToken(state, action) {
            const {accessToken = ''} = action.payload
            setTokenForStorage(accessToken)

            return {...state, accessToken}
        },
        removeAccessToken(state) {
            removeTokenForStorage()
            delete state.accessToken

            return {...state}
        },
        setConfig(state, action) {
            return {...state, config: action.payload}
        },
        setModules(state, action) {
            return {...state, modules: action.payload}
        },
    },
}
