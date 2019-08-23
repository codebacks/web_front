/**
 * @Description
 * @author XuMengPeng
 * @date 2019/4/3
*/

import { getSetting, setSetting, getTemplates, queryGlobal, getReplyContents, } from 'wx/services/autoReplyModal'
import _ from 'lodash'
import {safeJsonParse} from "utils"
import { parse } from 'qs'

function generateId(table, cb) {
    let id = 1
    table.forEach((item) => {
        item.id = id++
        if(cb) {
            cb(item)
        }
    })
    return table
}

function getInitState() {
    return {
        // 自定义关键词列表（本地维护）
        list: [],
        params: {
            offset: 0,
            limit: 10,
            current: 1,
        },

        // 全局关键词列表
        globalKeywords: [],
        globalParams: {
            offset: 0,
            limit: 10,
        },
        globalTotal: 0,
        globalCurrent: 1,

        status: undefined, // 是否开启
        wx_setting_type: undefined, // 自动回复类型
        replyObj: null, // 问题的回复内容（AddKeywordReply中添加回复内容请求到的）
        target_template_id: undefined, // 模板id
        templates: [], // 模板
    }
}

export default {
    namespace: 'wx_weChatsAutoReplyModal',

    state: getInitState(),

    effects: {
        // 获取设置
        * getSetting({payload}, {select, call, put}) {
            const res = yield call(getSetting, payload, {limit: 50})
            const data = res.data
            if (res && data) {
                if(data.keywords.length) {
                    generateId(data.keywords)
                }
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.wx_setting_type === 1 ? data.keywords : [],
                        status: data.status,
                        wx_setting_type: data.wx_setting_type,
                        target_template_id: data.wx_setting_type === 2 ? data?.target_template_id : undefined,
                    }
                })
            }
        },
        // 获取全局关键词
        * queryGlobal({payload, callback}, {select, call, put}) {
            let globalParams = yield select(({wx_weChatsAutoReplyModal}) => wx_weChatsAutoReplyModal.globalParams)
            globalParams = {...globalParams, ...payload.globalParams}
            if (payload.page) {
                globalParams.offset = globalParams.limit * (payload.page - 1)
            }
            const res = yield call(queryGlobal, parse(globalParams))
            const data = res?.data
            if (res && data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        globalKeywords: data.keywords,
                        globalParams: globalParams,
                        globalTotal: res?.pagination?.rows_found,
                        globalCurrent: payload.page === undefined ? 1 : payload.page,
                    }
                })
                callback && callback(data.keywords)
            }
        },
        // 获取模板
        * getTemplates({payload}, {select, call, put}) {
            const data = yield call(getTemplates, { offset: 0, limit: 10000,})
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        templates: data.data,
                    }
                })
            }
        },
        // 更新设置
        * setSetting({payload, callback}, {select, call, put}) {
            const wx_weChatsAutoReplyModal = yield select(({wx_weChatsAutoReplyModal}) => wx_weChatsAutoReplyModal)
            const wx_setting_type = wx_weChatsAutoReplyModal.wx_setting_type
            let keywords = [...wx_weChatsAutoReplyModal.list]
            let newPayload = {...payload}

            keywords.forEach((item) => {
                delete item.id
            })

            if(wx_setting_type === 0) {
                newPayload.body = {
                    wx_setting_type: wx_weChatsAutoReplyModal.wx_setting_type,
                    status: wx_weChatsAutoReplyModal.status,
                }
            }else if(wx_setting_type === 1) {
                newPayload.body = {
                    wx_setting_type: wx_weChatsAutoReplyModal.wx_setting_type,
                    status: wx_weChatsAutoReplyModal.status,
                    keywords: keywords,
                }
            }else {
                newPayload.body = {
                    wx_setting_type: wx_weChatsAutoReplyModal.wx_setting_type,
                    status: wx_weChatsAutoReplyModal.status,
                    template_id: wx_weChatsAutoReplyModal.target_template_id,
                }
            }
            const {meta} = yield call(setSetting, newPayload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 回复内容
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
                callback && callback(data) // AutoReplyModal列表中的回复内容（赋值给state.replyContents）
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetState() {
            return getInitState()
        },
    },
}
