import {parse} from 'qs'
import { queryActionManage, setActionManage, exportExcel } from "community/services/actionManage"
import moment from "moment/moment"

export default {
    namespace: 'community_actionManage',
    state: {
        // 命令操作
        kickMsg: '', // 显示的踢人警告語

        // 8个switch的值
        msgSensitiveWord: 0, // 消息敏感词
        // nicknameSensitiveWord: 0, // 群成员昵称以及群昵称敏感词
        card: 0, // 发送公众号名片/个人号名片
        link: 0, // 发送链接分享
        smallProgram: 0, // 发送小程序
        video: 0, // 发送小视频
        harassment: 0, // 防骚扰
        lockGroupName: 0, // 群名锁定禁止修改

        // 8个switch的配置
        // 消息敏感词
        msgSensitiveWord_isRefer: undefined,
        msgSensitiveWord_isKickAfterWarning: undefined,
        msgSensitiveWord_warningMsg: '',
        msgSensitiveWord_sensitiveWords: '',

        // 群成员昵称以及群昵称敏感词
        /*nicknameSensitiveWord_isRefer: undefined,
        nicknameSensitiveWord_isKickAfterWarning: undefined,
        nicknameSensitiveWord_warningMsg: '',
        nicknameSensitiveWord_sensitiveWords: '',*/

        // 发送公众号名片/个人号名片
        card_isRefer: undefined,
        card_isKickAfterWarning: undefined,
        card_warningMsg: '',

        // 发送链接分享
        link_isRefer: undefined,
        link_isKickAfterWarning: undefined,
        link_warningMsg: '',
        link_whitelist: '',
        link_domainWhitelist: '',
        link_isAmbush: undefined,

        // 发送小程序
        smallProgram_isRefer: undefined,
        smallProgram_isKickAfterWarning: undefined,
        smallProgram_warningMsg: '',
        smallProgram_domainWhitelist: '',

        // 发送小视频
        video_isRefer: undefined,
        video_isKickAfterWarning: undefined,
        video_warningMsg: '',

        // 防骚扰
        harassment_isRefer: undefined,
        harassment_isKickAfterWarning: undefined,
        harassment_warningMsg: '',
        harassment_maxString: undefined,
        harassment_second: undefined,
        harassment_row: undefined,

        // 群名锁定禁止修改
        lockGroupName_isRefer: undefined,
        lockGroupName_isKickAfterWarning: undefined,
        lockGroupName_warningMsg: '',

        // 用来存放新增敏感词的数组，msgSensitiveWord_sensitiveWords，nicknameSensitiveWord_sensitiveWords
        msgSensitiveWord_localSensitiveWords: [],
        nicknameSensitiveWord_localSensitiveWords: [],

        // 用来存放链接分享的数组，link_whitelist
        link_localWhitelist: [],
        link_localDomainWhitelist: [],
        smallProgram_localDomainWhitelist: [],
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            const state = yield select(({community_actionManage}) => community_actionManage)
            const data = yield call(queryActionManage, payload.params)

            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        ...state,
                        ...data.data,
                        msgSensitiveWord_localSensitiveWords: (data.data.msgSensitiveWord_sensitiveWords ? data.data.msgSensitiveWord_sensitiveWords.split(',') : []),
                        nicknameSensitiveWord_localSensitiveWords: (data.data.nicknameSensitiveWord_sensitiveWords ? data.data.nicknameSensitiveWord_sensitiveWords.split(',') : []),
                        link_localWhitelist: (data.data.link_whitelist ? data.data.link_whitelist.split(',') : []),
                        link_localDomainWhitelist: (data.data.link_domainWhitelist ? data.data.link_domainWhitelist.split(',') : []),
                        smallProgram_localDomainWhitelist: (data.data.smallProgram_domainWhitelist ? data.data.smallProgram_domainWhitelist.split(',') : []),
                    }
                })
                callback && callback(data.data)
            }
        },
        * update({payload, callback}, {select, call, put}) { // 返回修改的值，不用再get一次数据
            const state = yield select(({community_actionManage}) => community_actionManage)
            const data = yield call(setActionManage, payload)
            if (data && data.meta?.code === 200) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        ...state,
                        ...data.data,
                        msgSensitiveWord_localSensitiveWords: (data.data.msgSensitiveWord_sensitiveWords ? data.data.msgSensitiveWord_sensitiveWords.split(',') : []),
                        nicknameSensitiveWord_localSensitiveWords: (data.data.nicknameSensitiveWord_sensitiveWords ? data.data.nicknameSensitiveWord_sensitiveWords.split(',') : []),
                        link_localWhitelist: (data.data.link_whitelist ? data.data.link_whitelist.split(',') : []),
                        link_localDomainWhitelist: (data.data.link_domainWhitelist ? data.data.link_domainWhitelist.split(',') : []),
                        smallProgram_localDomainWhitelist: (data.data.smallProgram_domainWhitelist ? data.data.smallProgram_domainWhitelist.split(',') : []),
                    }
                })
                callback && callback(data.data)
            }
        },
        * exportExcel({payload, callback}, {select, call, put}) {
            const res = yield call(exportExcel, payload)
            callback && callback(res)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}