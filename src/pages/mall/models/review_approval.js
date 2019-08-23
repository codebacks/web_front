import { getTrendComment } from 'mall/services/trends'
import { getApprovalList, changeCommentStatus } from 'mall/services/approval'
import _ from 'lodash'
export default {
    namespace: 'review_approval',
    state: {
        currentKey: '1',
        approvalList : [],
        currentPage: 1,
        perPage: 10,
        totalSize: 0,
        begin_at: '',
        end_at: '',
        tabCount: 0,

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
        *getApprovalList ({ payload, callback }, { select, call, put }) {
            // 处理当参数为空时候获取的数据为空的问题，接口问题
            let params = {}
            if (payload.begin_at && payload.end_at) {
                params = {
                    page: payload.page,
                    per_page: payload.per_page,
                    status: payload.status,
                    begin_at: payload.begin_at,
                    end_at: payload.end_at,
                }
            } else { 
                params = {
                    page: payload.page,
                    per_page: payload.per_page,
                    status: payload.status,
                }  
            }
            const res = yield call(getApprovalList, params)
            const data = yield res.json() 
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        approvalList: data,
                        currentPage: payload.page || 0,
                        perPage: payload.per_page || 10,
                        totalSize: parseInt(res.headers.get('row_count'), 10) || 0,
                        begin_at: payload.begin_at || '',
                        end_at: payload.end_at || '',
                        tabCount: parseInt(res.headers.get('data_count'), 10) || 0,
                        currentKey: payload.status || '',
                    },
                })
                callback && callback(data)
            }
        },
        *changeCommentStatus({payload, callback},{call, put}){
            const data = yield call(changeCommentStatus, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getCommentData ({ payload, callback }, { select, call, put }) {
            let currentPage = yield select(({review_approval}) => review_approval.commentCurrentPage)
            let perPage = yield select(({ review_approval }) => review_approval.commentPerPage)
            const res = yield call(getTrendComment, payload)
            const data = yield res.json() 
            const totalPage = res.headers.get('page_count')
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        commentData: _.cloneDeep(data),
                        commentCurrentPage: parseInt((payload.page?(payload.page>totalPage ? totalPage : payload.page):currentPage),10),
                        commentPerPage: payload.per_page || perPage,
                        commentTotalSize: parseInt(res.headers.get('row_count'),10) || 0,
                    },
                })
                callback && callback(data)
            } 
        }
    }
}