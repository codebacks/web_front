/**
 * 文件说明:
 * oem 配置相关方法
 * ----------------------------------------
 * 创建用户: luolong 
 * 创建日期 2019/2/26
 */
import _ from 'lodash'

const OEM_ENUM = {
    /**
     * 虎赞
     */
    HuZan: { match: 'huzan', code: 'huZan'},
    /**
     * 私域管家
     */
    SiYuGuangJia: {
        match: 'siyuguanjia', code: 'siYuGuangJia'
    }
}

const OEMS = [
    OEM_ENUM.SiYuGuangJia,
    OEM_ENUM.HuZan
]

function getHost() {
    return _.get(window, 'location.host', '')
}


/**
 * 获取当前的OEM
 */
function getCurrentOem() {
    const host = getHost()
    const current = OEMS.find(item => host.indexOf(item.match) > -1)
    return current? current.code : OEM_ENUM.HuZan.code
}


export {
    getCurrentOem
}