
import {
    getFanStatic,
    getAppId,
    getFanList
} from '../services/gzh_fans'

export default {
    namespace: 'gzh_fans',
    state: {
        fansStats: {},
        fansData: [],
        current: 1,
        pageSize: 10,
        total: 0,
        app_id: '',
        getOauthGzh: '',
    },
    effects: {
        *getFanStatic({ payload, callback }, { select, call, put }) {
            const respones = yield call(getFanStatic, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        fansStats: respones.data
                    }
                })
                callback && callback()
            }
        },
        *getFanList({ payload, callback }, { select, call, put }) {
            let params = {}
            if (payload.per_page) {
                params.limit = payload.per_page
            } else {
                params.limit = 10
            }
            if (payload.page) {
                params.offset = (payload.page - 1) * params.limit
            } else {
                params.offset = 0
            }
            payload.app_id === undefined ? params.app_id = '' : params.app_id = payload.app_id
            payload.fans === undefined ? params.fans = '' : params.fans = payload.fans
            payload.belongs_wechat === undefined ? params.belongs_wechat = '' : params.belongs_wechat = payload.belongs_wechat
            payload.is_related === undefined ? params.is_related = '' : params.is_related = payload.is_related
            const respones = yield call(getFanList, params)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        fansData: respones.data,
                        total:respones.pagination && respones.pagination.rows_found,
                        current: payload.page || 0,
                        pageSize: payload.per_page || 10
                    }
                })
                callback && callback()
            }
        }, 
        *getAppId({ payload, callback }, { select, call, put }) {
            const respones = yield call(getAppId, payload)
            if (respones && respones.data&&respones.data.length>0) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        app_id: respones.data[0].app_id
                    }
                })
                callback && callback()
            }
        }, 
        *getOauthGzh({ payload, callback }, { select, call, put }) {
            const respones = yield call(getAppId, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        getOauthGzh: respones.data
                    }
                })
                callback && callback()
            }
        }, 
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
