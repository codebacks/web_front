import _ from 'lodash'
import Tip from './Message/Tip'
import Text from './Message/Text'
import Image from './Message/Image'
import Video from './Message/Video'
import Voice from './Message/Voice'
import Sharing from './Message/Sharing'
import Packet from './Message/Packet'
import Card from './Message/Card'
import Notification from './Message/Notification'
import RedEnvelope from './Message/RedEnvelope'
import Transfer from './Message/Transfer'
import Emoji from './Message/Emoji'

export const MessageTypes = {
    text: 1, // 文本
    image: 3, // 图片 xml加密
    voice: 34, // 语音
    card: 42, //  名片，可解析xml
    video: 43, // 视频，内容为 0:0 加密
    emoji: 47, // 表情, 可解析xml
    location: 48, //  地理位置
    link: 49, // 链接 link share OR file from web 可解析xml
    voiceP: 50, // 好友语音聊天
    shortVideo: 62, // 小视频 video took by wechat
    chatRoomVoiceP: 64, // 群语音聊天
    system: 10000, // 系统消息, 文本
    systemNotify: 10002, // 系统消息, 文本
    customEmoji: 1048625, // 自定义表情
    transfer: 419430449, // 转账
    redEnvelope: 436207665, // 红包 发 可解析xml
    newYearRedEnvelope: 469762097, // 拜年红包 发 可解析xml
    app: 16777265, //  // 应用消息
    locationSharing: -1879048186, // 位置分享
    userSharing: 16777265, // 分享
    limitSharing: 268435505, // 腾讯系应用QQ、京东分享
    template: 318767153, // 模板消息：微信团队、邮件、微信支付
    invitation: 570425393, // 拉人进群提示消息
    officialAccount: 285212721, // 公众号
    packet: 452984881, // 微信卡包
    transaction: '436207665,419430449', // 红包与转账
}

export const MessageTypeText = {
    '1': '文本',
    '3': '图片',
    '34': '语音',
    '42': '名片',
    '43': '视频',
    '47': '表情',
    '48': '地理位置',
    '49': '分享、链接、附件',
    '50': '好友语音',
    '62': '小视频',
    '64': '群语音',
    '10000': '系统消息',
    '1048625': '自定义表情',
    '419430449': '转账',
    '436207665': '红包',
    '-1879048186': '位置分享',
    '16777265': '分享',
    '268435505': '腾讯系应用QQ、京东分享',
    '318767153': '模板消息',
    '3001': '修改备注',
    '3002': '好友验证',
    '452984881': '微信卡包'
}

export const TransferStatus = {
    unknown: 0, // 未知
    sent: 1, // 待收
    received: 3, // 已收
    refund: 4, // 退回
    timeOutRefund: -1, // 超时退回
    delaySent: 7, // 非实时待收
    delayReceived: 5 // 非实时已收
}

export const MessageSubType = {
    file: 6,
    gif: 8,
    link: 5,
    miniApp: [33, 36],
    music: 3,
    forward: 19, // 历史记录转发
    img: 2 // 图片
}

export const FilterUsername = ['filehelper', 'newsapp', 'fmessage', 'weibo', 'qqmail', 'tmessage', 'qmessage', 'qqsync',
    'floatbottle', 'lbsapp', 'shakeapp', 'medianote', 'qqfriend', 'readerapp', 'blogapp', 'facebookapp', 'masssendapp',
    'meishiapp', 'feedsapp', 'voip', 'blogappweixin', 'weixin', 'brandsessionholder', 'weixinreminder',
    'officialaccounts', 'notification_messages', 'wxitil', 'userexperience_alarm', 'notifymessage',
    'mphelper', 'qqwanggou001', 'wxid_t5t60oy4syhv11', 'cll_qq', 'downloaderapp', 'wxid_7982809829512', 'Jycinema-FZ']

export const DefaultItemHeight = 88 // 默认item高度
export const MessageLimit = 30
export const SearchLimit = 30
export const MediaLimit = 60
export const showNoMoreLimit = 3

export const messageComponentsMap = {
    [MessageTypes.text]: {
        createComponent({record, keyword, activeRecord}) {
            return <Text record={record} keyword={keyword} activeRecord={activeRecord}/>
        }
    },
    [MessageTypes.image]: {
        createComponent({record, onImageClick}) {
            return <Image record={record} onClick={onImageClick}/>
        }
    },

    // 表情
    [MessageTypes.emoji]: {
        createComponent({record, onImageClick, onImageLoad}) {
            return <Emoji record={record} onClick={onImageClick} onImageLoad={onImageLoad}/>
        }
    },
    [MessageTypes.customEmoji]: {
        createComponent({record, onImageClick, onImageLoad}) {
            return <Emoji record={record} onClick={onImageClick} onImageLoad={onImageLoad}/>
        }
    },

    [MessageTypes.video]: {
        createComponent({record, keyword, onVideoClick}) {
            return <Video record={record} onClick={onVideoClick}/>
        }
    },
    [MessageTypes.voice]: {
        createComponent({record, audio}) {
            return <Voice record={record} audio={audio}/>
        }
    },
    [MessageTypes.redEnvelope]: {
        createComponent({record}) {
            return <RedEnvelope record={record}/>
        }
    },
    [MessageTypes.newYearRedEnvelope]: {
        createComponent({record}) {
            return <RedEnvelope record={record}/>
        }
    },

    [MessageTypes.transfer]: {
        createComponent({record}) {
            return <Transfer record={record}/>
        }
    },
    [MessageTypes.card]: {
        createComponent({record}) {
            return <Card record={record}/>
        }
    },
    [MessageTypes.packet]: {
        createComponent({record}) {
            return <Packet record={record}/>
        }
    },


    // 暂不支持
    [MessageTypes.location]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },
    [MessageTypes.locationSharing]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },
    [MessageTypes.limitSharing]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },
    [MessageTypes.voiceP]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },
    [MessageTypes.shortVideo]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },
    [MessageTypes.app]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },
    [MessageTypes.template]: {
        createComponent({record}) {
            return <Tip type={record.type}/>
        }
    },

    // 系统消息
    [MessageTypes.system]: {
        createComponent({record}) {
            const text = record.notification || _.get(record, 'body.title') || record.text
            return <Notification text={text}/>
        }
    },
    [MessageTypes.systemNotify]: {
        createComponent({record}) {
            const text = record.notification || _.get(record, 'body.title') || record.text
            return <Notification text={text}/>
        }
    },
    [MessageTypes.invitation]: {
        createComponent({record}) {
            const text = _.get(record, 'body.title') || record.text
            return <Notification text={text}/>
        }
    },
    [MessageTypes.chatRoomVoiceP]: {
        createComponent({record}) {
            const text = _.get(record, 'body.title') || record.text
            return <Notification text={text}/>
        }
    },

    // 分享
    [MessageTypes.link]: {
        createComponent({record}) {
            return <Sharing record={record}/>
        }
    },
    [MessageTypes.userSharing]: {
        createComponent({record, onImageClick}) {
            return <Sharing record={record} onClik={onImageClick}/>
        }
    },
    [MessageTypes.limitSharing]: {
        createComponent({record}) {
            return <Sharing record={record}/>
        }
    },
    //

}
