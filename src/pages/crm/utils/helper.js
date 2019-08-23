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
    qqFaceToImg: Helper.qqFaceToImg,
    emojiToImg: Helper.emojiToImg,
    msgToHtml: Helper.msgToHtml,
    getTimestamp: Helper.getTimestamp,
    timestampFormat: Helper.timestampFormat,
    formatBirthday: Helper.formatBirthday,
    getAccessTokenUrl: Helper.getAccessTokenUrl,
    removeTag: Helper.removeTag,
}


export default helper
