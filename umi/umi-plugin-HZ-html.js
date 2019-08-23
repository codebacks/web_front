/**
 **@Description:
 **@author: leo
 */

const isDev = process.env.NODE_ENV === 'development'

export default (api) => {
    api.register('modifyHTML', ({memo, args}) => {
        memo = memo.replace('{{barNew}}', isDev ? 'http://dev-dashboard.51zan.cn/public/bar-new.js' : 'http://client.51zan.cn/public/bar-new.js')
        memo = memo.replace('{{messageNew}}', isDev ? 'http://dev-dashboard.51zan.cn/public/message-new.js' : 'http://client.51zan.cn/public/message-new.js')
        return memo
    })
}
