/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/29
*/

import {getTree, getQuestions, getReplyContents} from 'community/services/addKeywordReply'
import { treeForEach } from 'utils'
import _ from 'lodash'
import {safeJsonParse} from "utils"

const initParams = {
    limit: 10,
    offset: 0,
    key: undefined,
    exclude_children_category: undefined, // 显示直属问题
}

function generateId(table, cb) {
    let id = 0
    table.forEach((item) => {
        item.id = id++
        if(cb) {
            cb(item)
        }
    })
    return table
}

export default {
    namespace: 'community_addKeywordReply',

    state: {
        tree: [],
        activeSort: null,
        expandedKeys: [], // tree展开的keys
        params: {
            ...initParams,
        },
        list: [],
        total: 0,
        current: 1,
        selectedRowKeys: [],
        selectedRows: [],
    },

    effects: {
        // tree相关
        * getTree({payload, callback}, {select, call, put}) {
            const {data} = yield call(getTree, payload)
            if(data) {
                treeForEach(data, (item, parent) => {
                    item.parent = parent
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        tree: data,
                    },
                })
                const expandedKeys = yield select(({community_addKeywordReply}) => community_addKeywordReply.expandedKeys)
                if(!expandedKeys.length) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            expandedKeys: [String(_.get(data, '[0].id'))],
                        },
                    })
                }

                let activeSort = yield select(({community_addKeywordReply}) => community_addKeywordReply.activeSort)

                if(!activeSort && data[0]) {
                    yield put({
                        type: 'setActiveSort',
                        payload: data[0],
                    })
                }
                callback && callback()
            }
        },
        // question相关
        * getQuestions({payload, callback}, {select, call, put}) {
            const { params, activeSort } = yield select(({community_addKeywordReply}) => community_addKeywordReply)
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            payload.id = activeSort?.id || ''
            const data = yield call(getQuestions, payload, params)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: _.get(data, 'pagination.rows_found', 0),
                        current: payload.page === undefined ? 1 : payload.page,
                        selectedRowKeys: [],
                        selectedRows: [],
                    },
                })
                callback && callback()
            }
        },
        * getReplyContents({payload, callback}, {select, call, put}) {
            const { data } = yield call(getReplyContents, payload)
            if(data) {
                generateId(data.reply_contents, (item) => {
                    item.common_msg_content = {
                        type: item.common_msg_content_type,
                        values: safeJsonParse(item.common_msg_content_values),
                        source_type: item.common_msg_content_source_type,
                    }
                })
                callback && callback(data) // data 放到state中的replyContents
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        updateTree(state, action) { // 主要设置tree的 item.select === true
            const tree = state.tree
            return {...state, ...tree}
        },
        setActiveSort(state, action) {
            return {...state, ...{activeSort: action.payload}}
        },
        setParams(state, action) {
            return {
                ...state, ...{
                    params: {
                        ...state.params,
                        ...action.payload,
                    },
                },
            }
        },
        resetParams(state, action){
            return {
                ...state, ...{
                    params: {
                        ...initParams,
                    },
                },
            }
        }
    },
}
