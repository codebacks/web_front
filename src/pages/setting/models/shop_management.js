
import {
    getShopList,
    createShop,
    getToken,
    editeShopStore,
    shopOauthXuan,
    deleteOauthTao,
    deleteOauthXuan,
    oauthXuanList,
    getOauthUrl,
    getOauthInfo,
    editeShopDepart,
    getExpiringShopsList,
    getJstOauthUrl,
    getDueRemind,
    postDueRemind,
    putDueRemind,
    getJdOauthUrl
} from 'setting/services/shops'
import { tree } from 'setting/services/departments'

export default {
    namespace: 'setting_shopManagement',

    state: {
        //弹窗
        createShopVisible: false,
        updatePartVisible: false,
        shopOauthTaoVisible: false,
        shopOauthXuanVisible: false,
        shopEditeTaoVisible: false,
        shopEditeXuanVisible: false,
        shopEditeStoreVisible: false,
        shopInfoTaoVisible: false,
        shopDeleteTaoVisible: false,
        shopDeleteXuanVisible: false,
        taoOauthBackVisible: false,
        shopDueSetVisible: false,
        shopJdVisible: false,
        //参数

        shopType: '',
        shopStatus: '',
        shopName: '',

        params: {
            type: '',
            auth_status: '',
            name: '',
            offset: '',
            limit: '',
        },
        currentPage: 1,
        perPage: 10,
        totalPage: 0,
        shopData: [],
        //部门列表
        selectTree: [],
        photoToken: '',
        photoPrefix: '',
        currentShop: {},
        oauthXuanList: [],
        auth_url: '',
        jdAuth_url: '',
        oauth_type: '',
        dueRemind: {}
    },

    effects: {
        //获取数据列表
        *getShopList ({ payload, callback }, { select, call, put }) {
            let params = yield select(({ setting_shopManagement }) => setting_shopManagement.params)
            let currentPage = yield select(({ setting_shopManagement }) => setting_shopManagement.currentPage)
            let perPage = yield select(({ setting_shopManagement }) => setting_shopManagement.perPage)
            if (payload.per_page) {
                params.limit = payload.per_page
            } else {
                params.limit = perPage
            }
            if (payload.page) {
                params.offset = (payload.page - 1) * params.limit
            } else {
                params.offset = (currentPage - 1) * params.limit
            }
            payload.type === undefined ? params.type = '' : params.type = payload.type
            payload.auth_status === undefined ? params.auth_status = '' : params.auth_status = payload.auth_status
            payload.name === undefined ? params.name = '' : params.name = payload.name
            const data = yield call(getShopList, params)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopType: payload.type,
                        shopStatus: payload.auth_status,
                        shopName: payload.name,
                        totalPage: data.pagination.rows_found,
                        shopData: data.data,
                        // shopData: [
                        //     {
                        //         id: 10092,
                        //         auth_source: 3,
                        //         auth_status: 1,
                        //         name: '111',
                        //         company_id: 71,
                        //         type: 5,
                        //     },
                        //     {
                        //         id: 129,
                        //         auth_source: 3,
                        //         auth_status: 1,
                        //         company_id: 71,
                        //         name: '111',
                        //         type: 6,
                        //     }
                        // ],
                        currentPage: payload.page === undefined ? currentPage : payload.page,
                        perPage: payload.per_page === undefined ? perPage : payload.per_page,
                    },
                })
                callback && callback(data)
            }
        },
        *getToken({ payload, callback }, { call, put }) {
            const data = yield call(getToken, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
            }
        },
        //创建店铺
        *createShop({ payload, callback }, { call, put }) {
            const data = yield call(createShop, payload)
            if (data) {
                callback && callback(data)
            }
        },
        //部门树
        * selectTree({ payload, callback }, { select, call, put }) {
            const { data } = yield call(tree, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        selectTree: data,
                    },
                })
            }
        },
        //修改门店
        *editeShopStore({ payload, callback }, { call, put }) {
            const data = yield call(editeShopStore, payload)
            if (data) {
                callback && callback(data)
            }
        },
        //小程序授权
        *shopOauthXuan({ payload, callback }, { call, put }) {
            const data = yield call(shopOauthXuan, payload)
            if (data) {
                callback && callback(data)
            }
        },
        //解除淘宝授权
        *deleteOauthTao({ payload, callback }, { call, put }) {
            const data = yield call(deleteOauthTao, payload)
            if (data) {
                callback && callback(data)
            }
        },
        //解除虎赞小店授权
        *deleteOauthXuan({ payload, callback }, { call, put }) {
            const data = yield call(deleteOauthXuan, payload)
            if (data) {
                callback && callback(data)
            }
        },
        //小程序列表
        *oauthXuanList({ payload, callback }, { call, put }) {
            const data = yield call(oauthXuanList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        oauthXuanList: data.data ? data.data : '',
                    },
                })
                callback && callback(data)
            }
        },
        //淘宝授权
        *getOauthUrl({ payload, callback }, { call, put }) {
            const data = yield call(getOauthUrl, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        auth_url: data.data ? data.data.auth_url : '',
                    },
                })
                callback && callback(data)
            }
        },
        // 京东授权
        *getJdOauthUrl({ payload, callback }, { call, put }) {
            const data = yield call(getJdOauthUrl, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        jdAuth_url: data.data ? data.data.auth_url : '',
                    },
                })
                callback && callback(data)
            }
        },
        // 聚水潭授权
        *getJstOauthUrl({payload, callback},{select, call, put}){
            const data = yield call(getJstOauthUrl, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        jstOauthUrl: data.data.auth_url || '',
                    },
                })
                callback&&callback(data)
            }
        },
        //淘宝店铺信息
        *getOauthInfo({ payload, callback }, { call, put }) {
            const data = yield call(getOauthInfo, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        currentShop: data.data,
                    },
                })
                callback && callback(data)
            }
        },
        //编辑店铺部门
        *editeShopDepart({ payload, callback }, { call, put }) {
            const data = yield call(editeShopDepart, payload)
            if (data) {
                callback && callback(data)
            }
        },

        //设置过期提醒详情
        *getDueRemind({ payload, callback }, { call, put }) {
            const respones = yield call(getDueRemind, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        dueRemind: respones.data,
                    },
                })
            }
        },
        //设置过期提醒
        *postDueRemind({ payload, callback }, { call, put }) {
            const respones = yield call(postDueRemind, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopDueSetVisible: false,
                    },
                })
                callback && callback(respones.data)
            }

        },
        //修改设置过期提醒
        *putDueRemind({ payload, callback }, { call, put }) {
            const respones = yield call(putDueRemind, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopDueSetVisible: false,
                    },
                })
                callback && callback(respones.data)
            }
        }

    },

    reducers: {
        //将请求的店铺数据列表的数据显示到页面上
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
