'use strict'

/**
 * 文件说明:
 * 一些工具函数
 * ----------------------------------------
 * 创建用户: zhanghd
 * 创建日期 15/12/20
 */

// import config from 'crm/common/config'
import Helper from 'utils/helper'

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
}


export default helper
