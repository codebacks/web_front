import { getSignTemplateList,  postSignTemplate, deleteSignTemplate,getShopList} from 'platform/services/signManagement'

export default {
    namespace: 'sign_managamnet',
    state: {
        list: [],
        detail: {},
        total:0,
        shopList:[]
    },

    effects: {
        // 获取短信模板列表
        *getSignTemplateList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getSignTemplateList, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: respones.data,
                        total:respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback()
            }
        },
        *getShopList({payload, callback}, {select, call, put}) {
            const data = yield call(getShopList, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopList:data.data
                    }
                })
            } 
        },

        *postSignTemplate({ payload, callback }, { select, call, put }) {
            const respones = yield call(postSignTemplate, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        },
        *deleteSignTemplate({ payload, callback }, { select, call, put }) {
            const respones = yield call(deleteSignTemplate, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
