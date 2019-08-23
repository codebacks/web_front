/**
 **@Description:
 **@author: leo
 */

const {existsSync} = require('fs')
const {join} = require('path')
const bodyParser = require('body-parser')
const globby = require('globby')
const assert = require('assert')
const pathToRegexp = require('path-to-regexp')

const VALID_METHODS = ['get', 'post', 'put', 'patch', 'delete']
const BODY_PARSED_METHODS = ['post', 'put', 'patch']

module.exports = function getMockMiddleware(cwd) {
    const absMockPath = join(cwd, 'mock')
    const absConfigPath = join(cwd, '.umirc.mock.js')
    let mockData = getConfig()

    function getConfig() {
        cleanRequireCache()
        let ret = null
        if(existsSync(absConfigPath)) {
            ret = require(absConfigPath) // eslint-disable-line
        }else {
            const mockFiles = globby.sync('**/*.js', {
                cwd: absMockPath,
            })

            ret = mockFiles.reduce((memo, mockFile) => {
                memo = {
                    ...memo,
                    ...require(join(absMockPath, mockFile)), // eslint-disable-line
                }
                return memo
            }, {})
        }
        return normalizeConfig(ret)
    }

    function parseKey(key) {
        let method = 'get'
        let path = key
        if(key.indexOf(' ') > -1) {
            const splited = key.split(' ')
            method = splited[0].toLowerCase()
            path = splited[1] // eslint-disable-line
        }
        assert(
            VALID_METHODS.includes(method),
            `Invalid method ${method} for path ${path}, please check your mock files.`,
        )
        return {
            method,
            path,
        }
    }

    function createHandler(method, path, handler) {
        return function(req, res, next) {
            if(BODY_PARSED_METHODS.includes(method)) {
                bodyParser.json({limit: '5mb', strict: false})(req, res, () => {
                    bodyParser.urlencoded({limit: '5mb', extended: true})(
                        req,
                        res,
                        () => {
                            sendData()
                        },
                    )
                })
            }else {
                sendData()
            }

            function sendData() {
                if(typeof handler === 'function') {
                    handler(req, res, next)
                }else {
                    res.json(handler)
                }
            }
        }
    }

    function normalizeConfig(config) {
        return Object.keys(config).reduce((memo, key) => {
            const handler = config[key]
            const type = typeof handler
            assert(
                type === 'function' || type === 'object',
                `mock value of ${key} should be function or object, but got ${type}`,
            )
            const {method, path} = parseKey(key)
            const keys = []
            const re = pathToRegexp(path, keys)
            memo.push({
                method,
                path,
                re,
                keys,
                handler: createHandler(method, path, handler),
            })
            return memo
        }, [])
    }

    function cleanRequireCache() {
        Object.keys(require.cache).forEach(file => {
            if(file === absConfigPath || file.indexOf(absMockPath) > -1) {
                delete require.cache[file]
            }
        })
    }

    function matchMock(req) {
        const {path: exceptPath} = req
        const exceptMethod = req.method.toLowerCase()

        for(const mock of mockData) {
            const {method, re, keys} = mock
            if(method === exceptMethod) {
                const match = re.exec(req.path)
                if(match) {
                    const params = {}

                    for(let i = 1; i < match.length; i = i + 1) {
                        const key = keys[i - 1]
                        const prop = key.name
                        const val = decodeParam(match[i])

                        if(val !== undefined || !hasOwnProperty.call(params, prop)) {
                            params[prop] = val
                        }
                    }
                    req.params = params
                    return mock
                }
            }
        }

        function decodeParam(val) {
            if(typeof val !== 'string' || val.length === 0) {
                return val
            }

            try {
                return decodeURIComponent(val)
            }catch(err) {
                if(err instanceof URIError) {
                    err.message = `Failed to decode param ' ${val} '`
                    err.status = err.statusCode = 400
                }

                throw err
            }
        }

        return mockData.filter(({method, re}) => {
            return method === exceptMethod && re.test(exceptPath)
        })[0]
    }

    return (req, res, next) => {
        const match = matchMock(req)

        if(match) {
            return match.handler(req, res, next)
        }else {
            return next()
        }
    }
}
