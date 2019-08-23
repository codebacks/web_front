import _ from 'lodash'
import createFaceHtml from 'components/Face/createFaceHtml'
import helper from 'utils/helper'
import {MessageTypes} from './config'

import parse from './parse'
// const ParseMessage = window.ParseMessage || parseMessage
const ParseMessage = parse

const util = {
    getName: (item) => {
        return item.remark || item.remark_name || item.nickname
    },
    getNickname: (item, active, memberInfo) => {
        let nickname = ''
        if (helper.isChatRoom(item.customer_wxid) || helper.isChatRoom(_.get(item, 'chatroom_id'))) {
            if (item.is_sender) {
                nickname = _.get(active, 'from') ? util.getName(active.from) : ''
            } else {
                nickname = memberInfo?.display_name || memberInfo?.nickname || memberInfo?.username
            }
        } else {
            if (item.is_sender) {
                nickname = _.get(active, 'from') ? (util.getName(active.from) || (_.get(item, 'from') && util.getName(item.from)))
                    : (_.get(active, 'service_wechat') ? util.getName(active.service_wechat)
                        : (_.get(active, 'friend.from') ? util.getName(active.friend.from) : ''))
            } else {
                nickname = _.get(active, 'target') ? (util.getName(active.target) || (_.get(item, 'target') && util.getName(item.target)))
                    : (_.get(active, 'wechat') ? util.getName(active.wechat)
                        : (_.get(active, 'friend.target') ? util.getName(active.friend.target) : ''))
            }
        }
        return createFaceHtml({tagName: 'span', tagProps: {}, values: nickname})
    },
    getAvatar: (item, active, memberInfo) => {
        let avatarUrl = ''
        if (helper.isChatRoom(item.customer_wxid) || helper.isChatRoom(_.get(item, 'chatroom_id'))) {
            if (item.is_sender) {
                avatarUrl = active.from ? (active.from.head_img_url || (item.from && item.from.head_img_url)) : ''
            } else {
                avatarUrl = memberInfo?.head_img_url || ''
            }
        } else {
            if (item.is_sender) {
                avatarUrl = active.from ? (active.from.head_img_url || (item.from && item.from.head_img_url))
                    : (active.service_wechat ? active.service_wechat.head_img_url
                        : (active.friend ? active.friend.from && active.friend.from.head_img_url : ''))
            } else {
                avatarUrl = active.target ? (active.target.head_img_url || (item.target && item.target.head_img_url))
                    : (active.wechat ? active.wechat.head_img_url
                        : (active.friend ? active.friend.target && active.friend.target.head_img_url : ''))
            }
            avatarUrl = helper.getWxThumb(avatarUrl) || ''
        }
        return avatarUrl
    },
    getFriendName: (item) => {
        return item?.remark || item?.remark_name || item?.nickname
    },
    getMemberName: (item) => {
        return item?.display_name || item?.nickname || item?.username
    },
    getGroupUsername: (item) => {
        return _.get(item, 'from.username') || _.get(item, 'from2.username')
    },
    getGroupNickname: (item, memberInfo) => {
        let nickname = ''
        if (helper.isChatRoom(item.customer_wxid) || helper.isChatRoom(_.get(item, 'chatroom_id'))) {
            nickname = util.getMemberName(memberInfo)
        } else {
            if (item.is_sender) {
                nickname = util.getFriendName(item.from)
            } else {
                nickname = util.getFriendName(item.target)
            }
        }
        return createFaceHtml({tagName: 'span', tagProps: {}, values: nickname})
    },
    getGroupAvatar: (item, memberInfo) => {
        let avatarUrl = ''
        if (helper.isChatRoom(item.customer_wxid) || helper.isChatRoom(_.get(item, 'chatroom_id'))) {
            avatarUrl = memberInfo?.head_img_url || ''
        } else {
            if (item.is_sender) {
                avatarUrl = memberInfo?.from?.head_img_url
            } else {
                avatarUrl = memberInfo?.target?.head_img_url
            }
            avatarUrl = helper.getWxThumb(avatarUrl) || ''
        }
        return avatarUrl
    },
    isNotification: (type) => {
        return [MessageTypes.system, MessageTypes.systemNotify, MessageTypes.invitation].includes(type)
    },
    parseImages: (data) => {
        let images = []
        data.forEach((v) => {
            let url = ''
            if ([MessageTypes.image, MessageTypes.emoji, MessageTypes.customEmoji].includes(v.type)) {
                url = _.get(v, 'body.media_url') || _.get(v, 'body.thumb_url')
                if (url) {
                    if (url.indexOf('?') !== -1) {
                        url = url.split('?')[0]
                    }
                }
                images.push({
                    uuid: helper.getUniqueMessageId(v),
                    src: url,
                    alt: '',
                })
            }
        })
        return images
    },
    getCreateTime: (item) => {
        if(item) {
            const createTime = _.get(item, 'create_time')
            if (typeof createTime === 'number') {
                return createTime
            }
            const idStr = _.get(item, 'rawData._id')
            if (typeof idStr === 'string') {
                const arr = idStr.split('/')
                let timestamp = arr[arr.length - 1]
                if (timestamp) {
                    timestamp = Number(timestamp)
                    if (!isNaN(timestamp)) {
                        return timestamp
                    }
                }
            }
            return createTime
        }
    },
    parseMessages: (data) => {
        if(Array.isArray(data)) {
            return data.map((v)=>{
                const rawData = _.cloneDeep(v)
                const content = _.get(v, '_source') || v
                // 保留原始数据
                const item = {...content, ...{rawData: rawData}}
                return ParseMessage(item)
            })
        }
        return []
    },
}

export default util
