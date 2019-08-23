'use strict'

/**
 * 文件说明:
 * 一些工具函数
 * ----------------------------------------
 * 创建用户: zhanghd
 * 创建日期 15/12/20
 */

// import config from 'wx/common/config'
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
}


export default helper
