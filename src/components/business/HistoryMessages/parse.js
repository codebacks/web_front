/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2018/12/14
 */
const xmlParse = require('fast-xml-parser')
const _ = require('lodash')
const base = require('js-base64')

const ParseMessage = (message) => {
    const Base64 = base.Base64
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
    const utils = {
    /**
     * 原始消息体 XML 过滤
     * @param message
     * @returns {*}
     */
        filter(message) {
            try {
                message.text = message.text.replace(/&#x20;/g, ' ')
                message.text = message.text.replace(/&apos;/g, '\'')
                message.text = message.text.replace(/&quot;/g, '"')
                message.text = message.text.replace(/&amp;/g, '&')
                message.text = message.text.replace(/&lt;/g, '<')
                message.text = message.text.replace(/&gt;/g, '>')
                if (message.text.indexOf('brandSubscriptConfigUrl')) {
                    message.text = message.text.replace(/brandSubscriptConfigUrl[^ ]* /g, '')
                }
                if (message.is_truncated) {
                    let title = ''
                    let des = ''
                    let r = ''
                    let matches = ''
                    r = /<title>(.*)<\/title>/
                    matches = r.exec(message.text)
                    if (matches && matches.length > 1) {
                        title = matches[1]
                    }
                    r = /<des>(.*)<\/des>/
                    matches = r.exec(message.text)
                    if (matches && matches.length > 1) {
                        des = matches[1]
                    }
                    return {
                        msg: {
                            appmsg: {
                                title: title,
                                des: des
                            }
                        }
                    }
                }
                let data = message.text || ''
                let msgData = ''
                if (data) {
                    let r = /<msg>(.*)<\/msg>/
                    data = data.replace(/↵/g, '')
                    data = data.replace(/\n\t\t/g, '')
                    data = data.replace(/\n\t/g, '')
                    data = data.replace(/\r\n/g, '')
                    data = data.replace(/\n/g, '')
                    data = data.replace(/\t/g, '')
                    data = data.replace(/\\"/g, '"')
                    let matches = r.exec(data)

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
                            } else {
                                r = /<sysmsg type="NewXmlChatRoomAccessVerifyApplication">(.*)<\/sysmsg>/
                                matches = r.exec(data)
                                if (matches && matches.length) {
                                    msgData = matches[0]
                                }
                            }
                        }
                    }
                }
                let result = null
                if (xmlParse.validate(msgData) === true) { // optional
                    result = xmlParse.parse(msgData, xmlOptions)
                }
                if (result) {
                    return result
                } else {
                    if (data.indexOf('<msg>') !== -1) {
                        // xml 转换失败上报日志
                        console.log('未解析出消息内容:', message)
                    }
                    return ''
                }
            } catch (error) {
                console.log('消息解析失败:', error)
            }
        },
        /**
     * 链接消息解析
     * @param message
     * @returns {{}}
     */
        parseUrl(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                let matches = ''
                if (result) {
                    let res = _.get(result, 'msg.appmsg') || {}
                    body = _.cloneDeep(res)
                    if (result.msg && result.msg.appinfo) {
                        body.appinfo = result.msg.appinfo
                    }
                    for (let key in body) {
                        if (key.indexOf('url') !== -1) {
                            body[key] = _.unescape(body[key])
                        }
                    }
                    // if(res.type === 6 || res.type === 3){
                    //     // 文件消息
                    //     body = { ...res }
                    // }else{
                    //     body = {
                    //         'title': res.title || '',
                    //         'url': res.url || '',
                    //         'des': res.des || '',
                    //         // 'thumb_url': _.get(message,'body.thumb_url') || res.thumburl || '',
                    //         // 'from_username': res.fromusername || '',
                    //         'sourcedisplayname': res.sourcedisplayname || '',
                    //         'sourceusername': res.sourceusername || '',
                    //         'type': res.type
                    //     }
                    //     if (res.weappinfo) {
                    //         body.weappinfo = res.weappinfo
                    //     }
                    // }
                } else {
                    ['title', 'url', 'from_username', 'thumburl', 'des'].forEach((item) => {
                        let r = new RegExp(`<${item}>(.*)</${item}>`)
                        matches = r.exec(message.text)
                        if (matches) {
                            body[item] = matches[1]
                        }
                    })
                }
                if (typeof body.url !== 'string') {
                    body.url = ''
                }
                return body
            } catch (error) {
                console.log('链接消息解析出错:', error)
                return {}
            }
        },
        parseImg(message) {
            try {
                let result = utils.filter(message)
                let attr = _.get(result, 'msg.img.attr')
                return { ...attr, ...message.body }
            } catch (error) {
                console.log('图片消息解析失败:', error)
                return {}
            }
        },
        /**
     * emoji表情解析
     * @param message
     * @returns {{}}
     */
        parseEmoji(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                let localObj = {}
                const formatBody = (attr) => {
                    let obj = _.cloneDeep(attr)
                    obj.md5 = attr.md5 || attr.emoticonmd5 || ''
                    return { ...obj, ...attr }
                }
                if (result && result.msg) {
                    let attr = _.get(result, 'msg.emoji.attr') || _.get(result, 'msg.appmsg.appattach') || {}
                    body = formatBody(attr)

                    if (body.cdnurl) {
                        body.cdnurl = body.cdnurl.replace('*#*', ':')
                        localObj.url = body.cdnurl
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

                if (body.emoticonmd5 && !body.md5) {
                    body.md5 = body.emoticonmd5
                }

                if (!body.cdnurl && !body.md5) {
                    console.log('Emoji表情解析为空:', body, message)
                }
                return body
            } catch (error) {
                console.log('Emoji表情解析失败:', error, message)
                return {}
            }
        },
        parseCustomerEmoji(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                let localObj = {}
                const formatBody = (attr) => {
                    let obj = _.cloneDeep(attr)
                    obj.md5 = attr.md5 || attr.emoticonmd5 || ''
                    return obj
                }
                if (result && result.msg) {
                    let attr = _.get(result, 'msg.emoji.attr') || _.get(result, 'msg.appmsg.appattach') || {}
                    body = formatBody(attr)
                    if (body.cdnurl) {
                        body.cdnurl = body.cdnurl.replace('*#*', ':')
                        localObj.url = body.cdnurl
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

                if (!body.cdnurl && !body.md5) {
                    console.log('Emoji表情解析为空:', body, message)
                }
                return body
            } catch (error) {
                console.log('Emoji表情解析失败:', error, message)
                return {}
            }
        },

        /**
     * 名片解析
     * @param message
     * @returns {{}}
     */
        parseCard(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                if (result && result.msg) {
                    const res = result.msg.attr
                    body = _.cloneDeep(res)
                } else {
                    console.log('名片消息解析为空:', message)
                }
                return body
            } catch (error) {
                console.log('名片消息格式化出错:', error, message)
                return {}
            }
        },
        /**
     * 系统通知解析
     * @param message
     * @returns {{}}
     */
        parseSystem(message) {
            // 获取红包领取信息
            try {
                let r = ''
                let body = {}
                let matches = ''
                if (message.text.indexOf('红包') !== -1) {
                    r = /<img src="SystemMessages_HongbaoIcon.png"\/>\s+(.*)领取了(.*)的<_wc_custom_link_ color="#FD9931" href="weixin:\/\/weixinhongbao\/opendetail\?sendid=(\d+).*">红包<\/_wc_custom_link_>/
                    matches = r.exec(message.text)
                    if (matches) {
                        body = {
                            'title': `${matches[1]}领取了${matches[2]}的红包`, //  # 标题
                            'pay_msg_id': matches[3], // # 红包ID
                            'transaction_id': matches[3], // # 红包ID
                            'pay_sub_type': 3
                        }
                    }
                } else {
                    let title = ''
                    r = /(.*)<(.*)><(.*)>(.*)/
                    matches = r.exec(message.text)
                    if (matches) {
                        title = `${matches[1]}`
                    } else {
                        r = /(.*)<a href="http(.*)/
                        matches = r.exec(message.text)
                        if (matches) {
                            title = `${matches[1]}`
                        }
                        r = /(.*)<a href="weixin(.*)/
                        title = title || message.text
                        matches = r.exec(title)
                        if (matches) {
                            title = `${matches[1]}`
                        }
                    }
                    if (title.endsWith('，请先向')) {
                        title.replace('，请先向', '')
                    }
                    body = {
                        'title': title
                    }
                }
                return body
            } catch (error) {
                console.log('系统消息解析失败:', error, message)
                return {}
            }
        },

        /**
     * 红包解析
     * @param message
     * @returns {{}}
     */
        parseRedPack(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                if (result) {
                    let res = _.get(result, 'msg.appmsg') || {}
                    if (_.get(res, 'wcpayinfo.templateid') === '7a2a165d31da7fce6dd77e05c300028a') {
                        // 旧红包消息
                        body = {
                            'from_username': _.get(result, 'msg.fromusername'), // 发件人
                            'title': res.title, // 标题
                            'des': res.des, // 描述
                            // 'url': result['msg']['appmsg']['url'],
                            'type': +res.type, // 2001 红包类型
                            'url': res.url,
                            'wcpayinfo': res.wcpayinfo
                        }
                    } else if (_.get(res, 'wcpayinfo.templateid') === '7') {
                        // 新红包消息
                        body = {
                            'from_username': _.get(result, 'msg.fromusername'), // 发件人
                            'title': res.title, // 标题
                            'des': res.des, // 描述
                            'type': +res.type, // 2001 红包类型
                            'url': res.url,
                            'fee_desc': res.redenvelopereceiveamount,
                            'wcpayinfo': res.wcpayinfo
                        }
                    } else if (_.get(res, 'wcpayinfo.templateid') === 'b9a794071ca79264fb48909c24f2c6cc') {
                        // aa收款
                        body = { ...res }
                    } else {
                        console.log('新类型红包格式化出错:', { message })
                    }
                }
                return body
            } catch (error) {
                console.log('红包格式化出错:', error, message)
                return {}
            }
        },
        /**
     * 拜年红包
     * @param message
     * @returns {{}}
     */
        parseNewYearRedPack(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                if (result) {
                    const res = _.get(result, 'msg.appmsg') || {}
                    body = {
                        ...res
                    }
                } else {
                    console.log('拜年红包解析为空:', message)
                }
                return body
            } catch (error) {
                console.log('拜年红包解析失败:', error, message)
                return {}
            }
        },
        /**
     * 转账消息
     * @param message
     * @returns {{}}
     */
        parseTransfer(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                if (result) {
                    const res = _.get(result, 'msg.appmsg') || {}
                    body = {
                        'title': res.title,
                        'type': +res.type,
                        'des': res.des,
                        'url': res.url,
                        'wcpayinfo': res.wcpayinfo
                    }
                } else {
                    console.log('转账消息解析为空:', message)
                }
                return body
            } catch (error) {
                console.log('转账消息解析失败:', error, message)
                return {}
            }
        },

        /**
     * 邀请新成员
     * @param message
     * @returns {{}}
     */
        parseInviteMember(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                if (result && result.sysmsg) {
                    const res = result.sysmsg
                    let contentTemplate = res.sysmsgtemplate.content_template
                    let tpl = contentTemplate.template
                    let link = _.get(contentTemplate, 'link_list.link')
                    let target = ''
                    let names = ''
                    let attr = ''
                    const tplFormat = (lk) => {
                        names = _.get(lk, 'plain')
                        if (!names) {
                            target = _.get(lk, 'memberlist.member')
                            if (target instanceof Array) {
                                let tempNames = []
                                target.forEach((item) => {
                                    tempNames.push(_.get(item, 'nickname'))
                                })
                                names = tempNames.join(_.get(lk, 'separator'))
                            } else {
                                names = _.get(target, 'nickname')
                            }
                        }
                        // 临时屏蔽撒回
                        attr = _.get(lk, 'attr.name')
                        if (attr && attr !== 'revoke') {
                            if (names) {
                                tpl = tpl.replace(`$${attr}$`, names)
                            }
                        }
                        tpl = tpl.replace(' $revoke$', '')
                        tpl = tpl.replace(' $adminexplain$', '')
                    }
                    if (link instanceof Array) {
                        link.forEach((lk) => {
                            if (lk) {
                                tplFormat(lk)
                            }
                        })
                    } else {
                        tplFormat(link)
                    }
                    body = {
                        title: tpl
                    }
                }
                return body
            } catch (error) {
                console.log('邀请好友进群消息解析出错:', error, message)
                return {}
            }
        },
        /**
     * 解析@
     * @param lvbuffer
     * @param message
     * @returns {*}
     */
        parseAt(lvbuffer, message) {
            if (lvbuffer) {
                try {
                    let data = Base64.decode(lvbuffer)
                    data = data.replace(/\/n/g, '')
                    data = data.replace(/↵/g, '')
                    data = data.replace(/\n\t\t/g, '')
                    data = data.replace(/\n\t/g, '')
                    data = data.replace(/\r\n/g, '')
                    data = data.replace(/\n/g, '')
                    data = data.replace(/\t/g, '')
                    data = data.replace(/\\"/g, '"')
                    let r = /<msgsource>(.*)<\/msgsource>/
                    let matches = r.exec(data)
                    let msgData = ''
                    if (matches && matches.length) {
                        msgData = matches[0]
                    }
                    let result = {}
                    if (xmlParse.validate(msgData) === true) { // optional
                        result = xmlParse.parse(msgData, xmlOptions)
                        if (result) {
                            return _.get(result, 'msgsource.atuserlist')
                        }
                    }
                    return ''
                } catch (error) {
                    console.log('AT解析失败:', error, message)
                    return ''
                }
            }
            return ''
        },
        parseSystemNotice(message) {
            let body = {}
            if (message.text.indexOf('你撤回了一条消息') !== -1) {
                body.title = '你撤回了一条消息'
            } else if (message.text.indexOf('位朋友加入群聊') !== -1) {
                try {
                    let result = utils.filter(message)
                    if (result) {
                        const res = _.get(result, 'sysmsg.NewXmlChatRoomAccessVerifyApplication') || {}
                        body = Object.assign({ title: res.text }, res)
                    } else {
                        console.log('转账消息解析为空:', message)
                    }
                    return body
                } catch (error) {
                    console.log('转账消息解析失败:',error)
                    return {}
                }
            }
            return body
        },
        parseSpeak(message) {
            let body = {}
            try {
                let arr = message.text.split(':')
                if (arr.length > 1) {
                    body.duration = +arr[1]
                }
            } catch (error) {
                console.log('语音消息解析失败:', error)
                return {}
            }
            return body
        },
        /**
     * 微信卡包
     * @param message
     * @returns {{}}
     */
        parseCardPacket(message) {
            try {
                let result = utils.filter(message)
                let body = {}
                if (result) {
                    const res = _.get(result, 'msg.appmsg') || {}
                    body = {
                        ...res
                    }
                } else {
                    console.log('微信卡包解析为空:', message)
                }
                return body
            } catch (error) {
                console.log('微信卡包解析失败', error)
                return {}
            }
        }
    }
    const Type = {
        msg: 1,
        img: 3,
        speak: 34,
        namecard: 42,
        video_file: 43,
        emoji: 47,
        location: 48,
        link: 49,
        voip: 50,
        wx_video: 62,
        voip_chatroom: 64,
        system: 10000,
        system_notify: 10002,
        custom_emoji: 1048625,
        transfer: 419430449,
        red_envelope: 436207665,
        new_year_red_envelope: 469762097,
        app_msg: 16777265,
        location_sharing: -1879048186,
        user_sharing: 16777265,
        limit_sharing: 268435505,
        notify_message: 318767153,
        invite_member: 570425393,
        gh_Type: 285212721,
        cardPacket: 452984881
    }
    try {
        if (typeof message === 'string') {
            message = window.JSON.parse(message)
            if (typeof message.body === 'string') { // 字符串转json
                message.body = window.JSON.parse(message.body)
            }
        }
        if (message.text) { // 判断有原始内容才需要解析
            const type = message.type
            if (type === Type.msg) {
                if (message.lvbuffer) {
                    message.at_ids = utils.parseAt(message.lvbuffer, message) || ''
                }
            } else if ([Type.link, Type.user_sharing, Type.limit_sharing].includes(type)) {
                message.body = Object.assign(message.body || {}, utils.parseUrl(message))
            } else if (type === Type.img) {
                message.body = Object.assign(message.body || {}, utils.parseImg(message))
            } else if (type === Type.emoji) {
                message.body = Object.assign(message.body || {}, utils.parseEmoji(message))
            } else if (type === Type.custom_emoji) {
                message.body = Object.assign(message.body || {}, utils.parseCustomerEmoji(message))
            } else if (type === Type.namecard) {
                message.body = Object.assign(message.body || {}, utils.parseCard(message))
            } else if (type === Type.red_envelope) {
                message.body = Object.assign(message.body || {}, utils.parseRedPack(message))
            } else if (type === Type.new_year_red_envelope) {
                // 拜年红包
                message.body = Object.assign(message.body || {}, utils.parseNewYearRedPack(message))
            } else if (type === Type.transfer) {
                // 转账
                message.body = Object.assign(message.body || {}, utils.parseTransfer(message))
            } else if (type === Type.system) {
                // 系统消息
                message.body = Object.assign(message.body || {}, utils.parseSystem(message))
            } else if (type === Type.system_notify) {
                // 系统消息 1002
                message.body = Object.assign(message.body || {}, utils.parseSystemNotice(message))
            } else if (type === Type.speak) {
                // 语音
                message.body = Object.assign(message.body || {}, utils.parseSpeak(message))
            } else if (type === Type.cardPacket) {
                // 卡包
                message.body = Object.assign(message.body || {}, utils.parseCardPacket(message))
            } else if (type === Type.invite_member) {
                message.format = true
                message.body = Object.assign(message.body || {}, utils.parseInviteMember(message))
            }
        }
    } catch (error) {
        console.log(error)
    }
    return message
}

export default ParseMessage
