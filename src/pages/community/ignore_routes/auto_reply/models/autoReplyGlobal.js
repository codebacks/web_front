/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/29
*/

import { query, addKeyword, editKeyword, getReplyContents, move, removeKeyword, setStatus, } from 'community/services/autoReply/autoReplyGlobal'
import { treeForEach } from 'utils'
import _ from 'lodash'
import { parse } from "qs"
import { safeJsonParse } from "utils"


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
    namespace: 'community_autoReply_global',

    state: {
        list: [], // 关键词列表
        current: 1,
        params: {
            limit: 10,
            offset: 0,
        },
        total: 0,
        replyObj: null, // 回复内容，回复列表在.reply_contents中
    },

    effects: {
        // 关键词列表
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_autoReply_global}) => community_autoReply_global.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(query, parse(params))
            const data = res?.data
            if (res && data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.keywords,
                        params: params,
                        total: res.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    }
                })
                callback && callback(data.keywords)
            }
        },
        // 设置全局开关
        * setStatus({payload, callback}, {call, put}) {
            const {meta} = yield call(setStatus, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 新增关键词
        * addKeyword({payload, callback}, {call, put}) {
            const {meta} = yield call(addKeyword, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 编辑关键词
        * editKeyword({payload, callback}, {call, put}) {
            const {meta} = yield call(editKeyword, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 回复内容// 回复内容
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
                if(payload?.isSetProperty) { // 给AddKeyword组件中：获取回复内容
                    yield put({
                        type: 'setProperty',
                        payload: {
                            replyObj: data,
                        }
                    })
                }
                callback && callback(data) // templateDetail列表中的回复内容（赋值给state.replyContents）
            }
        },
        // 移动关键词
        * move({payload, callback}, {call, put}) {
            const {meta} = yield call(move, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 删除关键词
        * removeKeyword({payload, callback}, {call, put}) {
            const {meta} = yield call(removeKeyword, payload)
            if(meta && meta.code === 200) {
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
