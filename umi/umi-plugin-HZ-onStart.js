/**
 **@Description:
 **@author: leo
 */

const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'

export default (api) => {
    api.register('onStart', () => {
        // console.log(api.webpackConfig.module.rules)
    })
}
