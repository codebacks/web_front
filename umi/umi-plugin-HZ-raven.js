/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/12
 */

const path = require('path')
const isProduction = process.env.NODE_ENV === 'production'
const cwd = process.cwd()

export default (api) => {
    const Raven = path.join(cwd, `src/components/Raven`)
    if(Raven){
        api.addRuntimePlugin(Raven)
    }
}