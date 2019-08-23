import { getToken } from 'setting/services/shops'
import { getSettingData, saveSettingData, saveSharingData, addExperie, getExperieList, deleteExperie, getMpaAudit, subMpaAudit, getMpaHistory } from 'setting/services/setting'
import _ from 'lodash'
export default {
    namespace: 'mp_setting',
    state: {
        photoToken: '',  
        photoPrefix: '',
        // 主体信息
        mainData: {},
        // 店铺信息
        settingData: {},
        // 体验账号列表
        currentPage: 1,
        perPage: 10,
        totalSize: 0,
        experieList: [],
        // 小程序审核状态
        mpaAudit: 1,
        versionList: [],
    },
    effects: {
        *getSettingData({payload,callback},{select,call,put}){
            const data = yield call(getSettingData, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        mainData: _.cloneDeep(data.mini),
                        settingData: _.cloneDeep(data),
                    }
                })
                callback && callback()
            }
        },
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
                callback && callback(data)
            }
        },
        *saveSettingData({payload,callback},{select,call,put}){
            const data = yield call(saveSettingData, payload)
            console.log(data)
            if(data){
                callback && callback(data)
            }
        },
        *saveSharingData({payload,callback},{select,call,put}){
            const data = yield call(saveSharingData, payload)
            if(data){
                callback && callback(data)
            }
        },
        *addExperie({payload,callback},{select,call,put}){
            const data = yield call(addExperie, payload)
            if(data){
                callback && callback(data)
            }
        },
        *deleteExperie({payload,callback},{select,call,put}){
            const data = yield call(deleteExperie, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getExperieList({payload,callback},{select,call,put}){
            let currentPage = yield select(({mp_setting}) => mp_setting.currentPage)
            let perPage = yield select(({mp_setting}) => mp_setting.perPage)
            const res = yield call(getExperieList, payload)
            const data = yield res.json()
            const totalPage = res.headers.get('page_count')
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        experieList: data,
                        currentPage: parseInt((payload.page?(payload.page>totalPage ? totalPage : payload.page):currentPage),10),
                        perPage: payload.per_page || perPage,
                        totalSize: parseInt(res.headers.get('row_count'),10) || 0,
                    },
                })
                callback && callback(data)
            }
        },
        *getMpaAudit({payload,callback},{select,call,put}){
            const data = yield call(getMpaAudit, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        mpaAudit: data,
                    },
                })
                callback && callback(data)
            }
        },
        // 提交审核
        *subMpaAudit({payload,callback},{select,call,put}){
            const data = yield call(subMpaAudit, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getMpaHistory({payload,callback},{select,call,put}){
            const data = yield call(getMpaHistory, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        versionList: data, 
                    },
                })
                callback && callback(data)
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
