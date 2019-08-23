import { getToken } from 'setting/services/shops'
import { addShortTrend, addLongTrend, getTrendList, getTrendDetail, deleteTrend, updateTrend, getTrendComment, postComment } from 'mall/services/trends'
export default {
    namespace: 'trends_management',
    state: {
        photoToken: '',
        photoPrefix: '',
        trendList: [],
        //分页，接口第一页接受参数为0
        currentPage: 1,
        perPage: 10,
        totalSize: 0,
        begin_at: '',
        end_at: '',
        commentData: [],
        commentCurrentPage: 1,
        commentPerPage: 10,
        commentTotalSize: 0,
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    },
    effects: {
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
                callback&&callback(data)
            }
        },
        *addShortTrend({payload, callback},{call, put}){
            const data = yield call(addShortTrend, payload)
            if(data){
                callback && callback(data)
            }
        },
        *addLongTrend({payload, callback},{call, put}){
            const data = yield call(addLongTrend, payload)
            if(data){
                callback && callback(data)
            }
        },
        *updateTrend({payload, callback},{call, put}){
            const data = yield call(updateTrend, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getTrendList({payload, callback},{select, call, put}){
            let params = {}
            if (payload.begin_at && payload.end_at) {
                params = {
                    page: payload.page,
                    per_page: payload.per_page,
                    begin_at: payload.begin_at,
                    end_at: payload.end_at,
                }
            } else { 
                params = {
                    page: payload.page,
                    per_page: payload.per_page,
                }  
            }
            const res = yield call(getTrendList, params)
            const data = yield res.json()
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        trendList: data,
                        currentPage:  payload.page || 0,
                        perPage: payload.per_page || 10,
                        totalSize: parseInt(res.headers.get('row_count'),10) || 0,
                        begin_at: payload.begin_at || '',
                        end_at: payload.end_at || '',
                    },
                })
                callback && callback(data)
            }
        },
        *getTrendDetail({payload, callback},{call, put}){
            const data = yield call(getTrendDetail, payload)
            if(data){
                callback && callback(data)
            }
        },
        *deleteTrend({payload, callback},{call, put}){
            const data = yield call(deleteTrend, payload)
            if(data){
                callback && callback(data)
            }
        },
        // 回复评论
        *postComment({payload, callback},{call, put}){
            const data = yield call(postComment, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getTrendComment ({ payload, callback }, { select, call, put }) {
            let currentPage = yield select(({trends_management}) => trends_management.commentCurrentPage)
            let perPage = yield select(({trends_management}) => trends_management.commentPerPage)
            const res = yield call(getTrendComment, payload)
            const data = yield res.json()
            const totalPage = res.headers.get('page_count')
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        commentData: data,
                        commentCurrentPage: parseInt((payload.page?(payload.page>totalPage ? totalPage : payload.page):currentPage),10),
                        commentPerPage: parseInt((payload.per_page || perPage),10),
                        commentTotalSize: parseInt(res.headers.get('row_count'),10) || 0,
                    },
                })
                callback && callback(data)
            }
        },
    }
}