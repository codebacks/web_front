/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/29
*/

import { query, addKeyword, editKeyword, getReplyContents, move, removeKeyword, } from 'wx/services/autoReply/templateDetail'
import { treeForEach } from 'utils'
import _ from 'lodash'
import {safeJsonParse} from "utils"

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
    namespace: 'wx_autoReply_templateDetail',

    state: {
        list: [], // 关键词列表
        replyObj: null, // 回复内容，回复列表在.reply_contents中
    },

    effects: {
        // 关键词列表
        * query({payload, callback}, {select, call, put}) {
            const data = yield call(query, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                    }
                })
                callback && callback(data.data)
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
