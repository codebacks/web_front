// import Helper from '../utils/helper'
// import {parse} from 'qs'

export default {
    namespace: 'wx_im',
    state: {
        content: '',//发送内容
        sessions: [],
        sessionTotal: 0,
        sessionParams: {
            uin: '',
            is_chat_room: '',
            offset: 0,
            limit: 50,
            is_no_reply: '',
            is_hidden: 0
        },
        loadingSessions: false,
        messages: [],
        wechats: {}, //保存用户详情信息
        activeSession: {},//当前聊天对象
        activeTab: 'session', //会话(session)、好友(friend)、群(group)
        loadingMessages: false,
        loadingEarlierMessages: false,
        totalMessages: 0,
        earlierPage: 1,
        sessionNewMsg: false, //会话 tab 红点提示
        loadEarlier: false,
        showFilter: '',
        scrollBottom: false,
        hasBindPaste: false //是否已经绑定粘贴事件
    },

    subscriptions: {
        setup({dispatch, history}) {
        },
    },

    effects: {
        // *querySessions({payload}, {select, call, put}) {
        //     yield put({type: 'setLoadingSessions', payload: true})
        //     const {data} = yield call(querySessions, parse(payload))
        //     if (data && data.data) {
        //         yield put({
        //             type: 'querySessionsSuccess',
        //             payload: {
        //                 sessions: data.data,
        //                 sessionTotal: data.pagination.rows_found
        //             }
        //         })
        //         const sessionParams = yield select(({im}) => im.sessionParams) //取当前 state
        //         sessionParams.offset = sessionParams.offset + sessionParams.limit
        //         yield put({
        //             type: 'setParams',
        //             payload: {sessionParams: sessionParams},
        //         })
        //     } else {
        //         yield put({type: 'setLoadingSessions', payload: false})
        //     }
        // },
        // *sendMessage({payload, callback}, {select, call, put}) {
        //     const {activeTab, activeSession} = yield select(({im}) => im)
        //     let res = null
        //     if (activeTab === 'group') {
        //         res = yield call(sendGroupMessage, parse(payload))
        //     } else {
        //         res = yield call(sendMessage, parse(payload))
        //     }
        //     //更新消息
        //     let sendStatus = SendStatus.success
        //     if (res) {
        //         if (res.data.meta) {
        //             if (res.data.meta.code < 200 || res.data.meta.code > 300) {
        //                 //发送失败
        //                 sendStatus = SendStatus.error
        //             }
        //         }
        //         let message = res.data.data.message || {}, //群为空
        //             session = res.data.data.session || {} //群为空
        //         message.client_message_id = res.data.data.client_message_id
        //         //设置消息状态
        //         yield put({
        //             type: 'setMessageStatus',
        //             payload: {
        //                 message: message,
        //                 session: session,
        //                 status: sendStatus
        //             }
        //         })
        //         //更新 session
        //
        //         if (activeTab !== 'session') {
        //             yield put({
        //                 type: 'updateSession',
        //                 payload: {session: session, message: message},
        //             })
        //         } else {
        //             yield put({
        //                 type: 'updateSessionMessage',
        //                 payload: {session: session, message: message},
        //             })
        //
        //         }
        //         //设置营销计划状态
        //         if (!activeSession.target.username.startsWith('@@')) {
        //             let tags = Array.from(activeSession.target.tags)
        //             for (let i = 0, j = tags.length; i < j; i++) {
        //                 if (tags[i].key && (typeof tags[i].key === 'string') && tags[i].key.startsWith(planStatusPrefix)) {
        //                     if (tags[i].value === '0') {
        //                         tags[i].value = '1'
        //                     }
        //                 }
        //             }
        //             yield put({
        //                 type: 'updateSessionField',
        //                 payload: {key: 'tags', value: tags, postMessage: true},
        //             })
        //         }
        //         callback && callback()
        //     }
        // },
        // *retweetMessage({payload, callback}, {select, call, put}) {
        //     const {data} = yield call(retweetMessage, parse(payload))
        //     if (data && data.data) {
        //         callback && callback()
        //     }
        // },
        // *queryEarlierMessages({payload}, {select, call, put}) {
        //     const {earlierPage, totalMessages, loadEarlier, scrollBottom} = yield select(({im}) => im) //取当前 state
        //     payload.params.offset = payload.params.limit * earlierPage
        //     if (totalMessages > payload.params.offset && loadEarlier && !scrollBottom && payload.uin) {
        //         yield put({type: 'showLoadingEarlierMessages'})
        //         const {data} = yield call(queryMessagesByUin, parse(payload))
        //         if (data && data.data) {
        //             if (data.data.length) {
        //                 let item = data.data[0]
        //                 const activeSession = yield select(({im}) => im.activeSession) //取当前 state
        //                 if (activeSession.target.username === item.receiver.username || activeSession.target.username === item.sender.username) {
        //                     for (let key in data.data) {
        //                         if (data.data.hasOwnProperty(key)) {
        //                             let item = data.data[key]
        //                             if (item.is_revoke) {
        //                                 item.type = 'Note'
        //                             }
        //                         }
        //                     }
        //                     yield put({
        //                         type: 'queryEarlierMessagesSuccess',
        //                         payload: {
        //                             messages: data.data,
        //                             earlierPage: earlierPage + 1,
        //                             totalMessages: data.pagination.rows_found
        //                         }
        //                     })
        //                 }
        //             } else {
        //                 yield put({type: 'hideLoadingEarlierMessages'})
        //             }
        //         }
        //     }
        // },
        // *queryMessages({payload}, {select, call, put}) {
        //     yield put({type: 'showLoadingMessages'})
        //     const {data} = yield call(queryMessagesByUin, parse(payload))
        //     if (data && data.data) {
        //         if (data.data.length) {
        //             let item = data.data[0]
        //             const activeSession = yield select(({im}) => im.activeSession) //取当前 state
        //             if (activeSession.target.username === item.receiver.username || activeSession.target.username === item.sender.username) {
        //                 for (let key in data.data) {
        //                     if (data.data.hasOwnProperty(key)) {
        //                         let item = data.data[key]
        //                         if (item.is_revoke) {
        //                             item.type = 'Note'
        //                         }
        //                     }
        //                 }
        //                 yield put({
        //                     type: 'queryMessagesSuccess',
        //                     payload: {
        //                         messages: data.data,
        //                         earlierPage: 1,
        //                         totalMessages: data.pagination.rows_found
        //                     }
        //                 })
        //             }
        //         } else {
        //             yield put({type: 'hideLoadingMessages'})
        //         }
        //     }
        // },
        //
        // *clearUnreadCount({payload}, {call, put}){
        //     yield put({type: 'clearSessionUnreadCount', payload: payload})
        //     yield call(clearSessionUnreadCount, parse({
        //         uin: payload.session.uin,
        //         session_id: payload.session.id
        //     }))
        // },
        //
        // *cleanUnreadCountAll({payload}, {call, put}){
        //     yield put({type: 'cleanSessionsUnreadCount', payload: payload})
        //     yield call(cleanSessionsUnreadCount, parse({
        //         uins: payload.uins
        //     }))
        // },
        //
        // *revokeMessage({payload, callback}, {select, call, put}) {
        //     yield put({type: 'revokeMessageSuccess', payload: payload})
        //     const {data} = yield call(revokeMessage, parse(payload))
        //     if (data && data.data) {
        //         callback && callback()
        //     }
        // },
    },

    reducers: {
        // setLoadingSessions(state, action) {
        //     return {...state, loadingSessions: action.payload}
        // },
        // setParams(state, action) {
        //     return {...state, ...action.payload}
        // },
        // revokeMessageSuccess(state, action) {
        //     //撤回
        //     let messages = [...state.messages]
        //     messages = messages.filter((item) => {
        //         return item.id !== action.payload.message_id
        //     })
        //     return {...state, ...{messages: messages}}
        // },
        // querySessionsSuccess(state, action) {
        //     let params = {...state.sessionParams}
        //     let _sessions = []
        //     if (params.offset > 0) {
        //         _sessions = state.sessions.concat(action.payload.sessions)
        //         let records = {}
        //         for (let i = 0, j = _sessions.length; i < j; i++) {
        //             //去重处理
        //             let item = _sessions[i], key = item.from.username + item.target.username
        //             if (!records[key]) {
        //                 records[key] = item
        //             }
        //         }
        //         action.payload.sessions = Object.values(records)
        //     }
        //     return {...state, ...action.payload, loadingSessions: false}
        // },
        // setActiveSession(state, action) {
        //     let old_username = Helper.getIn(state.activeSession, 'target.username') || ''
        //     let username = Helper.getIn(action.payload, 'target.username') || ''
        //     if (old_username && old_username !== username) {
        //         let _html = window.ChatEditor.getText()
        //         if (_html && _html.trim()) {
        //             localStorage.setItem(old_username, Helper.htmlToMsg(_html.trim()))
        //         } else {
        //             localStorage.removeItem(old_username)
        //         }
        //     }
        //     let content = localStorage.getItem(username) || '' //编辑器FOCUS导致 undefine BUG 暂时未解决 https://github.com/zenoamaro/react-quill/issues/117
        //     PostMessage.sendActiveSession(action.payload)//通知到插件
        //     setTimeout(() => {
        //         window.ChatEditor.setText(content || '')
        //     }, 100)
        //     return {...state, ...{activeSession: action.payload, content: content}}
        // },
        // setActiveTab(state, action) {
        //     return {...state, activeTab: action.payload.key}
        // },
        // setContent(state, action) {
        //     window.ChatEditor.setText(action.payload.content)
        //     return {...state, content: action.payload.content}
        // },
        // setSessionTabTip(state, action) {
        //     return {...state, sessionNewMsg: action.payload.hasNewMsg}
        // },
        // showLoadingMessages(state) {
        //     return {...state, loadingMessages: true, loadEarlier: false}
        // },
        // hideScrollBottom(state) {
        //     return {...state, scrollBottom: false}
        // },
        // hasBindPaste(state) {
        //     return {...state, hasBindPaste: true}
        // },
        // hideLoadingMessages(state) {
        //     return {...state, loadingMessages: false, loadEarlier: true}
        // },
        // showLoadingEarlierMessages(state) {
        //     return {...state, loadingEarlierMessages: true}
        // },
        // hideLoadingEarlierMessages(state) {
        //     return {...state, loadingEarlierMessages: false}
        // },
        // clearMessages(state) {
        //     return {...state, messages: []}
        // },
        // clearSessionUnreadCount(state, action) {
        //     //清除未读数
        //     let session = action.payload.session
        //     let sessions = Array.from(state.sessions)
        //     let idx = sessions.findIndex((item) => {
        //         return session.id === item.id
        //     })
        //     if (idx !== -1) {
        //         sessions[idx].unread_count = 0
        //     }
        //     return {...state, ...{sessions: sessions}}
        // },
        // cleanSessionsUnreadCount(state, action) {
        //     //清除未读数
        //     let uins = action.payload.uins
        //     let sessions = Array.from(state.sessions)
        //     sessions.map((item) => {
        //         if (uins.includes(item.uin)) {
        //             item.unread_count = 0
        //         }
        //     })
        //     return {...state, ...{sessions: sessions}}
        // },
        // queryEarlierMessagesSuccess(state, action) {
        //     //初始化消息列表
        //     action.payload.messages = action.payload.messages.concat(state.messages)
        //     return {
        //         ...state, ...action.payload,
        //         loadingMessages: false,
        //         earlierPage: action.payload.earlierPage,
        //         totalMessages: action.payload.totalMessages,
        //         loadingEarlierMessages: false
        //     }
        // },
        // queryMessagesSuccess(state, action) {
        //     //初始化消息列表
        //     action.payload.messages = action.payload.messages.concat(state.messages)
        //     return {
        //         ...state, ...action.payload, loadingMessages: false,
        //         totalMessages: action.payload.totalMessages, loadEarlier: true, scrollBottom: true
        //     }
        // },
        // updateSessionMessage(state, action){
        //     //只更新消息内容，不置顶
        //     //更新会话
        //     let session = action.payload.session
        //     let sessions = Array.from(state.sessions)
        //     let idx = sessions.findIndex((item) => {
        //         return session.target.id === item.target.id && session.target.username === item.target.username
        //     })
        //     if (idx !== -1) { //存在会话中先移除
        //         sessions[idx].latest_message = {...action.payload.message}
        //     }
        //     return {...state, ...{sessions: sessions}}
        // },
        // updateSession(state, action){
        //     //更新会话
        //     let session = action.payload.session
        //     let sessions = Array.from(state.sessions)
        //     let idx = sessions.findIndex((item) => {
        //         return session.target.id === item.target.id && session.target.username === item.target.username
        //     })
        //     if (idx !== -1) { //存在会话中先移除
        //         sessions.splice(idx, 1)
        //     }
        //     let pinnedIdx = sessions.findIndex((item) => {
        //         return !item.is_pinned
        //     })
        //     session.lastMessageContent = Helper.getIn(action.payload, 'message.content')
        //     session.lastMessageTime = Helper.getIn(action.payload, 'message.create_time')
        //     if (pinnedIdx !== -1) {
        //         //有置顶会话插到置顶下方
        //         sessions.splice(pinnedIdx, 0, session)
        //     } else {
        //         sessions.unshift(session) //新会话插入到顶部
        //     }
        //     return {...state, ...{sessions: sessions}}
        // },
        // removeMessage(state, action){
        //     //当前会话插入消息
        //     let messages = state.messages.filter((msg) => {
        //         return msg.client_message_id !== action.payload.client_message_id
        //     })
        //     return {...state, ...{messages: messages}}
        // },
        // pushMessageCleanStatus(state, action){
        //     //当前会话插入消息
        //     return {...state, pushMessageStatus: false}
        // },
        // pushMessage(state, action){
        //     //当前会话插入消息
        //     action.payload.messages = state.messages.concat(action.payload.message)
        //     return {...state, ...action.payload, pushMessageStatus: true}
        // },
        // previewMessage(state, action){
        //     //图片预览
        //     let messages = Array.from(state.messages)
        //     let idx = messages.findIndex((item) => {
        //         return item.client_message_id && item.client_message_id === action.payload.client_message_id
        //     })
        //     if (idx !== -1) {
        //         messages[idx].content = action.payload.content
        //         messages[idx].type = action.payload.type
        //         messages[idx].file = action.payload.file
        //         messages[idx].file_id = action.payload.file.id
        //         return {...state, ...{messages: messages}}
        //     } else {
        //         return {...state}
        //     }
        // },
        // setMessageStatus(state, action){
        //     let messages = Array.from(state.messages)
        //     let idx = messages.findIndex((item) => {
        //         return item.client_message_id && item.client_message_id === action.payload.message.client_message_id
        //     })
        //     if (idx !== -1) {
        //         if (idx !== -1 && action.payload.message && action.payload.message.content && action.payload.status !== SendStatus.error) { //替换原会话,content判断兼容群消息
        //             messages.splice(idx, 1, action.payload.message)
        //         } else {
        //             messages[idx].send_status = action.payload.status
        //         }
        //         return {...state, ...{messages: messages}}
        //     } else {
        //         return {...state}
        //     }
        // },
        // updateRemark(state, action){
        // },
        // updateTags(state, action){
        // },
        // updateSessionField(state, action){
        //     let key = action.payload.key,
        //         value = action.payload.value
        //     let activeSession = {...state.activeSession} //更新字段
        //     let target = {...activeSession.target}
        //     target[key] = value
        //     if (action.payload.postMessage) {
        //         PostMessage.sendActiveSession(activeSession)//通知到插件
        //     }
        //     let session = {...activeSession, target}
        //     if (state.activeTab === 'session') {
        //         let sessions = Array.from(state.sessions)
        //         if (session.id) {
        //             let idx = sessions.findIndex((item) => {
        //                 return item.id === session.id
        //             })
        //             if (idx !== -1) {
        //                 sessions.splice(idx, 1, session)
        //             }
        //         }
        //         return {...state, activeSession: session, sessions}
        //     } else {
        //         return {...state, activeSession: session}
        //     }
        //
        // },
        // updateSessionKeyVal(state, action){
        //     let key = action.payload.key,
        //         value = action.payload.value
        //     let activeSession = {...state.activeSession}
        //     activeSession[key] = value
        //     let sessions = Array.from(state.sessions)
        //     if (activeSession.id) {
        //         let idx = sessions.findIndex((item) => {
        //             return item.id === activeSession.id
        //         })
        //         if (idx !== -1) {
        //             sessions[idx][key] = value
        //         }
        //     }
        //     return {...state, activeSession, sessions}
        // }

    },

}