'use strict'

/**
 * 文件说明:
 * 一些工具函数
 * ----------------------------------------
 * 创建用户: zhanghd
 * 创建日期 15/12/20
 */

import Helper from 'utils/helper'

let helper = {
    format: Helper.format,
    formatUrl: Helper.formatUrl,
    getIn: Helper.getIn,
    htmlToMsg: Helper.htmlToMsg,
    msgToHtml: Helper.msgToHtml,
    qqFaceToImg: Helper.qqFaceToImg,
    emojiToImg: Helper.emojiToImg,
    getSuffix: Helper.getSuffix,
    timestampFormat: Helper.timestampFormat,
    getAccessTokenUrl: Helper.getAccessTokenUrl,
    removeTag: Helper.removeTag,
    getTimestamp: Helper.getTimestamp,
    getFriendSource: (source) => {
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
    getRealPhotoUrl(url) {
        if (url.indexOf('personal-1256249764.cos.ap-shanghai.myqcloud.com') !== -1) {
            return url.replace('personal-1256249764.cos.ap-shanghai.myqcloud.com', 'personal-1256249764.picsh.myqcloud.com')
        } else if (url.indexOf('crm-1256249764.cos.ap-shanghai.myqcloud.com') !== -1) {
            return url.replace('crm-1256249764.cos.ap-shanghai.myqcloud.com', 'crm-1256249764.picsh.myqcloud.com')
        }
        return url
    },
    getThumb(url, size) {
        if (url) {
            size = size || 256
            if (url.indexOf('public.51zan.com') !== -1) {
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
    getThumbLimit(url, size) {
        if (url) {
            size = size || 1280
            if (url.indexOf('public.51zan.com') !== -1) {
                return `${url.split('?')[0]}?imageView2/0/h/${size}/q/100`
            }
            return `${url}?imageView2/0/h/${size}/q/100`
        }
        return ''
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
    getVideoCover(url) {
        if(url) {
            return `${url}?vframe/jpg/offset/0`
        }
    },
    isQiniu(url) {
        return url.indexOf('public.51zan.com') !== -1
    },
    getUrlKey(url) {
        if (url) {
            return url.replace(/^.+?(\/[^\/]+?\/[^\/]+?)(.[^.]*?)?$/gi, '$1')
        }
    },
    getPolicyUrl(url, policy) {
        if (policy) {
            return url.includes('?') ? `${url}|${policy}` : `${url}?${policy}`
        }
        return url
    },
    getBase64(img, callback) {
        const reader = new FileReader()
        reader.addEventListener('load', () => callback(reader.result))
        reader.readAsDataURL(img)
    },
    getWxThumb(url) {
        if (url.endsWith('/0')) {
            return `${url.substring(0, url.length - 2)}/96`
        } else {
            return url
        }
    },
    getUrlParams(name, url) {
        if (!url) {
            url = window.location.href
        }
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")
        const regexStr = `[\\?&]${name}=([^&#]*)`
        const regex = new RegExp(regexStr)
        const results = regex.exec(url)
        return results == null ? null : results[1]
    }
}


export default helper
