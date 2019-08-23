'use strict'

/**
 * 文件说明:
 * 一些工具函数
 * ----------------------------------------
 * 创建用户: zhanghd
 * 创建日期 15/12/20
 */

import Helper from 'utils/helper'

const domains = ['public.51zan.com', 'personal.niukefu.com', 'image.yiqixuan.com']

let helper = {
    format: Helper.format,
    getIn: Helper.getIn,
    getSuffix: Helper.getSuffix,
    htmlToMsg: Helper.htmlToMsg,
    msgToHtml: Helper.msgToHtml,
    qqFaceToImg: Helper.qqFaceToImg,
    emojiToImg: Helper.emojiToImg,
    getTimestamp: Helper.getTimestamp,
    timestampFormat: Helper.timestampFormat,
    formatBirthday: Helper.formatBirthday,
    getAccessTokenUrl: Helper.getAccessTokenUrl,
    removeTag(t) {
        if (t) {
            t = t.replace(/<\/div><div>/g, "<br>")
            t = t.replace(/<\/div>/g, "")
            t = t.replace(/<(?:br|BR)\/?>/g, "\n")
            t = t.replace(/<\/div>/g, "")
            t = t.replace(/<div>/g, "")
            t = t.replace(/&nbsp;/g, " ")
            if (t.endsWith('\n')) {
                t = t.substring(0, t.length - 2)
            }
        }
        return t
    },
    /**
     * [orderBy description]
     * @param  {[type]} source [description]
     * @param  {[type]} orders [description]
     * @param  {[type]} type  {asc, desc}  [description]
     * @return {[type]}        [description]
     */
    orderBy(source, orders, type) {
        if (source instanceof Array && orders instanceof Array && orders.length > 0) {
            let ordersc = orders.concat([])
            let sortType = type || 'asc'
            let results = {results: []}
            let totalSum = {}

            helper.groupOrder(source, ordersc, totalSum, sortType, results)
            return {
                results: results.results,
                totalSum: totalSum
            }
        } else {
            return source
        }
    },
    groupOrder(source, orders, totalSum, sortType, results) {
        source.sort(function (a, b) {
            let convertA = a[orders[0]]
            let convertB = b[orders[0]]
            if (typeof convertA === 'string' && typeof convertB === 'string') {
                if (sortType.toUpperCase() === 'ASC') {
                    return convertA.localeCompare(convertB)
                } else {
                    return convertB.localeCompare(convertA)
                }
            } else {
                if (sortType.toUpperCase() === 'ASC') {
                    return convertA - convertB
                } else {
                    return convertB - convertA
                }
            }
        })
        let groupMap = new Map()
        source.forEach((item) => {
            if (groupMap.has(item[orders[0]])) {
                groupMap.get(item[orders[0]]).push(item)
            } else {
                groupMap.set(item[orders[0]], [])
                groupMap.get(item[orders[0]]).push(item)
            }
        })
        orders.shift()
        for (let [key, val] of groupMap) {
            totalSum[key] = {}
            totalSum[key].name = key
            totalSum[key].value = val.length
            if (orders.length === 0) {
                results.results = results.results.concat(val)
            } else {
                totalSum[key].children = {}
                let ordersCopy = orders.concat([])
                helper.groupOrder(val, ordersCopy, totalSum[key].children, sortType, results)
            }
        }
    },
    getFriendSource(source) {
        switch (source) {
            case 1:
                return `通过搜索QQ号添加`
            case 1000001:
                return `对方通过搜索QQ号添加`
            case 3:
                return `通过搜索微信号添加`
            case 1000003:
                return `对方通过搜索微信号添加`
            case 10:
            case 13:
                return `通过手机通讯录添加`
            case 1000010:
            case 1000013:
                return `对方通过手机通讯录添加`
            case 8:
            case 14:
                return `通过群聊添加`
            case 1000014:
                return `对方通过群聊添加`
            case 15:
                return `通过搜索手机号添加`
            case 1000015:
                return `对方通过搜索手机号添加`
            case 17:
                return `通过名片分享添加`
            case 1000017:
                return `对方通过名片分享添加`
            case 18:
                return `通过附近的人添加`
            case 1000018:
                return `对方通过附近的人添加`
            case 25:
                return `通过漂流瓶添加`
            case 1000025:
                return `对方通过漂流瓶添加`
            case 29:
                return `通过摇一摇添加`
            case 1000029:
                return `对方通过摇一摇添加`
            case 30:
                return `通过扫一扫添加`
            case 1000030:
                return `对方通过扫一扫添加`
            case 4:
            case 12:
                return `来自QQ好友`
            case 48:
                return `雷达`
            default:
                return `其他`
        }
    },
    getFriendSourceCode() {
        return {
            BY_MOBILE: 15,
            FRIEND_BY_MOBILE: 1000015,
            BY_ALIAS: 3,
            FRIEND_BY_ALIAS: 1000003,
            BY_CHAT_ROOM: 8,
            BY_CHAT_ROOM2: 14,
            FRIEND_BY_CHAT_ROOM: 1000014,
            BY_CONTACT: 13,
            FRIEND_BY_CONTACT: 1000013,
            BY_SCAN: 30,
            FRIEND_BY_SCAN: 1000030,
            BY_QQ: 1,
            FRIEND_BY_QQ: 1000001,
            BY_CARD: 17,
            FRIEND_BY_CARD: 1000017,
            BY_NEARBY: 18,
            FRIEND_BY_NEARBY: 1000018,
            BY_CONTACT2: 10,
            FRIEND_BY_CONTACT2: 1000010,
            BY_QQ2: 4,
            BY_QQ3: 12,
            BY_SHAKE: 29,
            FRIEND_BY_SHAKE: 1000029,
            BY_RADAR: 48,
            BY_FLOAT_BOTTLE: 25,
            FRIEND_BY_FLOAT_BOTTLE: 1000025,
        }
    },
    getRealPhotoUrl(url) {
        if (url.indexOf('personal-1256249764.cos.ap-shanghai.myqcloud.com') !== -1) {
            return url.replace('personal-1256249764.cos.ap-shanghai.myqcloud.com', 'personal-1256249764.picsh.myqcloud.com')
        } else if (url.indexOf('crm-1256249764.cos.ap-shanghai.myqcloud.com') !== -1) {
            return url.replace('crm-1256249764.cos.ap-shanghai.myqcloud.com', 'crm-1256249764.picsh.myqcloud.com')
        }
        return url
    },
    getLink(url) {
        const reg = /^http(s)?:\/\//
        const prefix = '//'
        if (url) {
            if (reg.test(url) || url.slice(0, prefix.length) === prefix) {
                return url
            }
            return `${prefix}${url}`
        }
        return ''
    },
    getThumb(url, size) {
        if (url) {
            size = size || 256
            if (helper.isQiniu(url)) {
                return `${url.split('?')[0]}?imageView2/0/h/${size}`
            } else if (url.indexOf('imageMogr2/thumbnail') !== -1) {
                return `${helper.getRealPhotoUrl(url).split('?')[0]}?imageMogr2/thumbnail/${size}x${size}/interlace/0`
            } else {
                return `${helper.getRealPhotoUrl(url)}?imageMogr2/thumbnail/${size}x${size}/interlace/0`
            }
        } else {
            return ''
        }
    },
    isQiniu(url) {
        const index = domains.findIndex((domain) => {
            return url.indexOf(domain) > -1
        })
        return index !== -1
    },
    getVideoCover(url) {
        if(url) {
            return `${url}?vframe/jpg/offset/0`
        }
    },
}


export default helper
