/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/31
 */
import _ from 'lodash'
import router from 'umi/router'
import {checkPath} from 'utils'
import {matchGlobalPagePaths} from 'utils'

function checkPagesPermission({dispatch, getState}) {
    return next => action => {
        const state = getState()
        const pathname = _.get(state, 'routing.location.pathname')
        const flatTree = _.get(state, 'base.flatTree')
        if(flatTree !== null && !matchGlobalPagePaths(pathname)) {
            const noPermission = flatTree.findIndex((item) => {
                return checkPath(item.url, pathname)
            }) === -1

            if(noPermission) {
                router.push('/home')
            }
        }
        return next(action)
    }
}

export default checkPagesPermission