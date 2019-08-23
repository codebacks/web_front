import _ from 'lodash'
import helper from 'utils/helper'
import fastXmlParser from 'fast-xml-parser'
// import localDB from './db'
const xmlOptions = {
    attributeNamePrefix: '',
    attrNodeName: 'attr', // default is 'false'
    textNodeName: '#text',
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    cdataTagName: '', // default is 'false'
    cdataPositionChar: '\\c',
    localeRange: '',
    parseTrueNumberOnly: false
}
export const MessageTypeKey = {
    MSG: 1, // 文本 xml加密 =>(后台解析返回，文本再content中)
    IMG: 3, // # 图片 xml加密 =>(后台解析返回，url在item中)
    SPEAK: 34, // # 语音
    NAMECARD: 42, //  # 名片，可解析xml =>(有)
    VIDEO_FILE: 43, // # 视频，内容为 0:0 加密 =>(后台解析返回，url在item中)
    EMOJI: 47, // # 表情, 可解析xml =>(有)
    LOCATION: 48, //  # 地理位置
    LINK: 49, // # 连接 link share OR file from web 可解析xml =>(有)
    VOIP: 50, //  # 好友语音聊天
    WX_VIDEO: 62, // # 小视频 video took by wechat
    VOIP_CHATROOM: 64, // 群语音聊天  =>(后台解析返回，文本再content中)
    SYSTEM: 10000, // # 系统消息, 文本 =>(有)
    CUSTOM_EMOJI: 1048625, // # 自定义表情
    TRANSFER: 419430449, // # 转账 =>(有)
    RED_ENVELOPE: 436207665, //   # 红包 发 可解析xml =>(有)
    APP_MSG: 16777265, //  # 应用消息
    LOCATION_SHARING: -1879048186, //  # 位置分享
    USER_SHARING: 16777265, //  # 分享 =>(有)
    LIMIT_SHARING: 268435505, // # 腾讯系应用QQ、京东分享 =>(有)
    NOTIFY_MESSAGE: 318767153, // # 模板消息：微信团队、邮件、微信支付
    INVITE_MEMBER: 570425393, // 拉人进群提示消息 =>(有)
    GH_TYPE: 285212721, // 公众号
    //   系统内部指令
    MODIFY_REMARK: 3001, // 修改备注
    VERIFY_USER: 3002, // 好友验证
    UPLOAD_VIDEO: 3004, // 上传视频
    MOMENT_REMOVE: 3100, // 删除朋友圈
    MOMENT_LIKE: 3101, // 赞
    MOMENT_CANCEL_LIKE: 3102, // 取消赞
    MOMENT_COMMENT: 3103, // 评论
    MOMENT_COMMENT_REMOVE: 3104, // 删除评论
    MOMENT_REFRESH: 3105 // 刷新朋友圈
}
export const TransferStatus = {
    UNKNOWN: 0, // # 未知
    SENT: 1, //  # 待收
    RECEIVED: 3, // # 已收
    REFUND: 4, // # 退回
    TIMEOUT_REFUND: -1 //  # 超时退回
}

const msgUtils = {
    filter(message) {
        // if (message.is_truncated) {
        //     let title = ''
        //     let des = ''
        //     let r = ''
        //     let matches = ''
        //     r = /<title>(.*)<\/title>/
        //     matches = r.exec(message.text)
        //     if (matches && matches.length > 1) {
        //         title = matches[1]
        //     }
        //     r = /<des>(.*)<\/des>/
        //     matches = r.exec(message.text)
        //     if (matches && matches.length > 1) {
        //         des = matches[1]
        //     }
        //     return {
        //         msg: {
        //             appmsg: {
        //                 title: title,
        //                 des: des
        //             }
        //         }
        //     }
        // }
        let data = message.content
        let r = /<msg>(.*)<\/msg>/
        // data = data.replace(//g, '');
        data = data.replace(/↵/g, '')
        data = data.replace(/\n\t\t/g, '')
        data = data.replace(/\n\t/g, '')
        data = data.replace(/\r\n/g, '')
        data = data.replace(/\n/g, '')
        data = data.replace(/\t/g, '')
        data = data.replace(/\\"/g, '"')
        let matches = r.exec(data)
        let msgData = ''
        if (matches && matches.length) {
            msgData = matches[0]
        } else {
            r = /<msg(.*)\/>/
            matches = r.exec(data)
            if (matches && matches.length) {
                msgData = matches[0]
            } else {
                // 群通知消息
                r = /<sysmsg type="sysmsgtemplate">(.*)<\/sysmsg>/
                matches = r.exec(data)
                if (matches && matches.length) {
                    msgData = matches[0]
                }
            }
        }

        let result = {}
        if (fastXmlParser.validate(msgData) === true) { // optional
            result = fastXmlParser.parse(msgData, xmlOptions)
        }
        if (result) {
            return result
        } else {
            console.error('消息解析失败:', message)
            return ''
        }
    },
    parseUrl(message) {
        try {
            let result = msgUtils.filter(message)
            let body = {}
            let matches = ''
            if (result) {
                let res = helper.getIn(result, 'msg.appmsg') || {}
                body = {
                    'title': res.title || '',
                    'url': res.url || '',
                    'des': res.des || '',
                    'thumburl': res.thumburl || '',
                    'from_username': res.fromusername || ''
                }
            } else {
                ['title', 'url', 'from_username', 'thumburl', 'des'].forEach((item) => {
                    let r = new RegExp(`<${item}>(.*)</${item}>`)
                    matches = r.exec(message.content)
                    if (matches) {
                        body[item] = matches[1]
                    }
                })
            }
            if (typeof body.url !== 'string') {
                body.url = ''
            }
            return body
        } catch (err) {
            console.error('URL消息格式化出错:', message)
            return {}
        }
    },
    parseEmoji(message) {
        try {
            let result = msgUtils.filter(message)
            let body = {}
            let localObj = {}
            const formatBody = (attr) => {
                return {
                    'from_username': attr.fromusername || '',
                    'to_username': attr.tousername || '',
                    'type': attr.type || '',
                    'md5': attr.md5 || attr.emoticonmd5 || '',
                    'len': attr.len || '',
                    'product_id': attr.productid || '',
                    'cdn_url': attr.cdnurl || '',
                    'thumburl': attr.thumburl || '',
                    'width': attr.width || '',
                    'height': attr.height || ''
                }
            }
            if (result.msg) {
                let attr = helper.getIn(result, 'msg.emoji.attr') || helper.getIn(result, 'msg.appmsg.appattach') || {}
                body = formatBody(attr)
                if (body.cdn_url) {
                    body.cdn_url = body.cdn_url.replace('*#*', ':')
                    localObj.url = body.cdn_url
                }
                if (body.thumburl) {
                    body.thumburl = body.thumburl.replace('*#*', ':')
                    localObj.thumburl = body.thumburl
                }
            } else {
                const r = /(.*):(.*):(.*)::/
                const matches = r.exec(message.text)
                if (matches && matches.length >= 4) {
                    body = formatBody({
                        md5: matches[3]
                    })
                }
            }
            if (body.cdn_url && body.md5) {
                // md5对应url保存到本地 避免多条消息内容没返回cdn_url问题
                // localDB.insertImgMd5Map(body.md5, localObj)
            }
            return body
        } catch (err) {
            console.error('EMOJI表情格式化出错:', message)
            return {}
        }
    },
    parseCard(message) {
        try {
            let result = msgUtils.filter(message)
            console.log('名片解析的result：', result)
            let body = {}
            if (result) {
                const res = result.msg.attr
                body = {
                    'alias': res.alias,
                    'big_head_img_url': res.bigheadimgurl,
                    'nickname': res.nickname,
                    'head_img_url': res.brandIconUrl,
                    'username': res.username,
                    'antispamticket': res.antispamticket
                }
            }
            return body
        } catch (err) {
            console.error('名片消息格式化出错:', message)
            return {}
        }
    },
    parseSystem(message) {
        // 获取红包领取信息
        try {
            let r = ''
            let body = {}
            let matches = ''
            if (message.content.indexOf('红包') !== -1) {
                r = /<img src="SystemMessages_HongbaoIcon.png"\/>\s+(.*)领取了(.*)的<_wc_custom_link_ color="#FD9931" href="weixin:\/\/weixinhongbao\/opendetail\?sendid=(\d+).*">红包<\/_wc_custom_link_>/
                matches = r.exec(message.content)
                if (matches) {
                    body = {
                        'title': `${matches[1]}领取了${matches[2]}的红包`, //  # 标题
                        'pay_msg_id': matches[3], // # 红包ID
                        'transaction_id': matches[3], // # 红包ID
                        'pay_sub_type': TransferStatus.RECEIVED
                    }
                }
            } else {
                let title = ''
                r = /(.*)<(.*)><(.*)>(.*)/
                matches = r.exec(message.content)
                if (matches) {
                    title = `${matches[1]}`
                } else {
                    r = /(.*)<a href="http(.*)/
                    matches = r.exec(message.content)
                    if (matches) {
                        title = `${matches[1]}`
                    }
                    r = /(.*)<a href="weixin(.*)/
                    title = title || message.content
                    matches = r.exec(title)
                    if (matches) {
                        title = `${matches[1]}`
                    }
                }
                body = {
                    'title': title
                }
            }
            return body
        } catch (err) {
            console.error('系统消息格式化出错:', message)
            return {}
        }
    },
    parseRedPack(message) {
        try {
            let result = msgUtils.filter(message)
            let body = {}
            if (result) {
                let res = helper.getIn(result, 'msg.appmsg') || {}
                if (res.wcpayinfo.templateid === '7a2a165d31da7fce6dd77e05c300028a') {
                    // 旧红包消息
                    body = {
                        'from_username': result.username, // 发件人
                        'title': res.title, // 标题
                        'des': res.des, // 描述
                        // 'url': result['msg']['appmsg']['url'],
                        'type': +res.type, // 2001 红包类型
                        'pay_msg_id': res.wcpayinfo.paymsgid, // 红包ID
                        'transaction_id': res.wcpayinfo.paymsgid, // 红包ID, 使用红包ID
                        'invalid_time': +res.wcpayinfo.invalidtime, // 失效时间戳
                        'receiver_title': res.wcpayinfo.receivertitle, // 收件人标题
                        'sender_title': res.wcpayinfo.sendertitle,
                        'receiver_des': res.wcpayinfo.receiverdes
                    }
                } else if (res.wcpayinfo.templateid === '7') {
                    // 新红包消息
                    body = {
                        'from_username': result.username, // 发件人
                        'title': res.title, // 标题
                        'des': res.des, // 描述
                        'url': res.url,
                        'type': +res.type, // 2001 红包类型
                        'pay_msg_id': res.wcpayinfo.paymsgid, // 红包ID
                        'transaction_id': res.wcpayinfo.paymsgid, // 红包ID, 使用红包ID
                        'invalid_time': +res.wcpayinfo.invalidtime, // 失效时间戳
                        'receiver_title': res.wcpayinfo.receivertitle, // 收件人标题
                        'sender_title': res.wcpayinfo.sendertitle,
                        'receiver_des': res.wcpayinfo.receiverdes,
                        'fee_desc': res.redenvelopereceiveamount
                    }
                } else if (res.wcpayinfo.templateid === 'b9a794071ca79264fb48909c24f2c6cc') {
                    // aa收款
                } else {
                    console.error('unknown red packet message ', result)
                }
            }
            return body
        } catch (err) {
            console.error('红包格式化出错:', message)
            return {}
        }
    },
    parseTransfer(message) {
        try {
            let result = msgUtils.filter(message)
            let body = {}
            if (result) {
                const res = helper.getIn(result, 'msg.appmsg') || {}
                body = {
                    'title': res.title,
                    'type': +res.type,
                    'des': res.des,
                    'pay_sub_type': +res.wcpayinfo.paysubtype, // 转账类型
                    'fee_desc': res.wcpayinfo.feedesc, // 金额
                    'transaction_id': res.wcpayinfo.transcationid, // 交易ID
                    'transfer_id': res.wcpayinfo.transferid, // 转账ID
                    'invalid_time': +res.wcpayinfo.invalidtime, // 失效时间戳
                    'begin_transfer_time': +res.wcpayinfo.begintransfertime, // 转账时间戳
                    'effective_date': +res.wcpayinfo.effectivedate, // 是否在有效日期
                    'pay_memo': res.wcpayinfo.pay_memo || '', // 转账附言
                    'url': res.url
                }
            }
            return body
        } catch (err) {
            console.error('转账格式化出错:', message)
            return {}
        }
    },
    parseInviteMember(message) {
        try {
            let result = msgUtils.filter(message)
            let body = {}
            if (result) {
                const res = result.sysmsg
                let contentTemplate = res.sysmsgtemplate.content_template
                let tpl = contentTemplate.template
                let link = helper.getIn(contentTemplate, 'link_list.link')
                let target = ''
                let names = ''
                let attr = ''
                const tplFormat = (lk) => {
                    names = helper.getIn(lk, 'plain')
                    if (!names) {
                        target = helper.getIn(lk, 'memberlist.member')
                        if (target instanceof Array) {
                            let tempNames = []
                            target.forEach((item) => {
                                tempNames.push(helper.getIn(item, 'nickname'))
                            })
                            names = tempNames.join(helper.getIn(lk, 'separator'))
                        } else {
                            names = helper.getIn(target, 'nickname')
                        }
                    }
                    attr = helper.getIn(lk, 'attr.name')
                    if (attr) {
                        tpl = tpl.replace(`$${attr}$`, names)
                    }
                }
                if (link instanceof Array) {
                    link.forEach((lk) => {
                        tplFormat(lk)
                    })
                } else {
                    tplFormat(link)
                }
                body = {
                    title: tpl
                }
            }
            return body
        } catch (err) {
            console.error('转账格式化出错:', message)
            return {}
        }
    },
    parseMsg(msg) {
        let newMsg = _.cloneDeep(msg)
        if (typeof newMsg === 'string') {
            newMsg = JSON.parse(newMsg)
        }

        const type = newMsg.type
        // 为每个newMsg.body添加个isNote
        if ([MessageTypeKey.LINK, MessageTypeKey.USER_SHARING, MessageTypeKey.LIMIT_SHARING].includes(type)) {
            newMsg.body = { ...msgUtils.parseUrl(newMsg), isNote: false }
        } else if (type === MessageTypeKey.MSG) {
            newMsg.body = { isNote: false }
        } else if (type === MessageTypeKey.IMG) {
            newMsg.body = { isNote: false }
        } else if (type === MessageTypeKey.SPEAK) {
            newMsg.body = {  msg: '[语音]暂未支持请在手机上查看', isNote: false  }
        } else if (type === MessageTypeKey.VOIP) {
            newMsg.body = {  msg: '[好友语音聊天]暂未支持请在手机上查看', isNote: true  }
        } else if (type === MessageTypeKey.EMOJI) {
            newMsg.body = { ...msgUtils.parseEmoji(newMsg), isNote: false }
        } else if (type === MessageTypeKey.NAMECARD) {
            newMsg.body = { ...msgUtils.parseCard(newMsg), isNote: false }
        } else if (type === MessageTypeKey.RED_ENVELOPE) {
            newMsg.body = { ...msgUtils.parseRedPack(newMsg), msg: '[微信红包]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.TRANSFER) {
            newMsg.body = { ...msgUtils.parseTransfer(newMsg), msg: '[转账]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.SYSTEM) {
            newMsg.body = { ...msgUtils.parseSystem(newMsg), isNote: true }
        } else if (type === MessageTypeKey.CUSTOM_EMOJI) {
            newMsg.body = { msg: '[自定义表情]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.INVITE_MEMBER) {
            newMsg.format = true
            newMsg.body = { ...msgUtils.parseInviteMember(newMsg), isNote: true }
        } else if (type === MessageTypeKey.GH_TYPE) {
            newMsg.body = { msg: '[公众号消息]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.VOIP_CHATROOM) {
            newMsg.body = { msg: newMsg.content ? newMsg.content :'[群语音聊天]暂未支持请在手机上查看', isNote: true }
        } else if (type === MessageTypeKey.LOCATION || type === MessageTypeKey.LOCATION_SHARING) {
            newMsg.body = { msg: '[位置消息]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.WX_VIDEO) {
            newMsg.body = { msg: '[小视频]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.APP_MSG) {
            newMsg.body = { msg: '[应用消息]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.NOTIFY_MESSAGE) {
            newMsg.body = { msg: '[模板消息]暂未支持请在手机上查看', isNote: false }
        } else if (type === MessageTypeKey.VIDEO_FILE) {
            newMsg.body = { isNote: false }
        } else { // 其他类型
            newMsg.body = { msg: '【该消息仅支持手机查看！】', isNote: true }
        }
        return newMsg
    }
}

export default msgUtils
