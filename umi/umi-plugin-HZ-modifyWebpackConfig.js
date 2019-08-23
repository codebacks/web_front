/**
 **@Description:
 **@author: leo
 */

const isProduction = process.env.NODE_ENV === 'production'
const development = process.env.NODE_ENV === 'development'
const _ = require('lodash')
const {writeWebpackConfig} = require('./utils')

export default (api) => {
    api.modifyWebpackConfig((memo) => {
        if(isProduction){
            const uglifyjsCompress = _.get(memo, 'optimization.minimizer[0].options.uglifyOptions.compress')
            const terserjsCompress = _.get(memo, 'optimization.minimizer[0].options.terserOptions.compress')
            if(typeof uglifyjsCompress === 'object'){
                uglifyjsCompress.drop_debugger = true
                uglifyjsCompress.drop_console = true
            }

            if(typeof terserjsCompress === 'object'){
                terserjsCompress.drop_debugger = true
                terserjsCompress.drop_console = true
            }
        }

        development && writeWebpackConfig(_.get(memo, 'resolve.alias', {}))

        return memo
    })
}
