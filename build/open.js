/**
 **@Description:
 **@author: leo
 */

const path = require('path')
const express = require('express')
const proxyMiddleware = require('http-proxy-middleware')
const ip = require('ip')
const open = require('react-dev-utils/openBrowser')
const getUmiConfig = require('../umi/getUmiConfig')
const {proxy} = getUmiConfig()
const createMockMiddleware = require('./createMockMiddleware')

const config = {
    proxy,
}

function appOpen() {
    const app = express()
    const port = process.env.PORT || 9595
    const proxyTable = config.proxy || {}
    const cwd = process.cwd()
    Object.keys(proxyTable).forEach(function(context) {
        let options = proxyTable[context]
        if(typeof options === 'string') {
            options = {target: options}
        }
        app.use(proxyMiddleware(options.filter || context, options))
    })
    if(process.env.MOCK !== 'none') {
        app.use(createMockMiddleware(cwd))
    }
    app.use(require('connect-history-api-fallback')())
    app.use(express.static(path.join(process.cwd(), './dist')))
    app.listen(port)
    const uri = `http://${ip.address()}:${port}/`
    open(`${uri}`)
}

appOpen()