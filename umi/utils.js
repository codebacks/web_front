/**
 **@Description:
 **@author: leo
 */

const projectConfigName = 'project_config'
const globby = require('globby')
const path = require('path')
const cwd = process.cwd()
const pathSplit = '/'
const pagePath = './src/pages'
const fs = require('fs')
const crypto = require('crypto')

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx']

function fmtFunc(conf) {
    if (typeof conf === 'function') {
        return conf.toString().replace(/\r\n?/g, '\n')
    }
    return conf
}

exports.fmtFunc = fmtFunc
exports.getPathBase = (url) => {
    let pathBase = {baseName: '', extName: ''}
    for (let i = 0, len = JS_EXTNAMES.length; i < len; i++) {
        const baseName = path.basename(url, JS_EXTNAMES[i]).trim()
        if (baseName) {
            pathBase.baseName = baseName
            pathBase.extName = JS_EXTNAMES[i]
            return pathBase
        }
    }
    return pathBase
}

function routesForeach(routes, cb) {
    routes.forEach((route) => {
        cb && cb(route)
        if (route.routes) {
            routesForeach(route.routes, cb)
        }
    })
}

exports.routesForeach = routesForeach

exports.writeWebpackConfig = (alias) => {
    const data = `
        module.exports = {
            resolve: {
                alias: ${JSON.stringify(alias, null, 4)},
            },
        }
    `

    fs.writeFileSync(path.join(cwd, `.webpack.umi.conf.js`), `${data.trim()}\n`, 'utf-8')
}

function getYarnLockString() {
    try {
        return fs.readFileSync(path.join(cwd, `yarn.lock`), 'utf-8').replace(/\r\n?/g, '\n')
    } catch (e) {}
}

function getGitBranchName() {
    try {
        const exec = require('child_process').execSync
        const name = exec('git rev-parse --abbrev-ref HEAD')
            .toString()
            .trim()

        return name
    } catch (e) {
        return ''
    }
}

function digest(str) {
    return crypto
        .createHash('md5')
        .update(str)
        .digest('hex')
}

function getCacheIdentifier(partialIdentifier, webpackConfig, gitBranchName = getGitBranchName()) {
    const hash = require('hash-sum')

    const variables = {
        partialIdentifier,
        umi: require('umi/package.json').version,
        'cache-loader': require('cache-loader/package.json').version,
        'umi-build-dev': require('umi-build-dev/package.json').version,
        'umi-plugin-react': require('umi-plugin-react/package.json').version,
        NODE_ENV: process.env.NODE_ENV,
        HUZAN_ENV: process.env.HUZAN_ENV,
        DISABLE_BROWSER_DETECTION: process.env.DISABLE_BROWSER_DETECTION,
        DEMAND_COMPILE: process.env.DEMAND_COMPILE,
        PORT: process.env.PORT,
        webpackConfig: webpackConfig.toString().replace(/\r\n?/g, '\n'),
        yarnLock: getYarnLockString(),
        gitBranchName,
    }

    const cacheIdentifier = hash(variables)

    return {cacheIdentifier, gitBranchName}
}

let lastGitBranchName
let lastCacheIdentifier

exports.genCacheConfig = (id, partialIdentifier, webpackConfig) => {
    const cacheDirectory = path.join(cwd, `node_modules/.cache/${id}`)
    function cacheKey(options, request) {
        const {cacheDirectory} = options
        let cacheIdentifierValue
        const gitBranchName = getGitBranchName()

        if (lastGitBranchName === gitBranchName && lastCacheIdentifier) {
            cacheIdentifierValue = lastCacheIdentifier
        } else {
            const {cacheIdentifier} = getCacheIdentifier(
                partialIdentifier,
                webpackConfig,
                gitBranchName,
            )
            lastCacheIdentifier = cacheIdentifier
            cacheIdentifierValue = cacheIdentifier
            lastGitBranchName = gitBranchName
        }

        const hash = digest(`${cacheIdentifierValue}\n${request}`)
        return path.join(cacheDirectory, `${hash}.json`)
    }

    return {cacheDirectory, cacheKey}
}

exports.getProjectConfigConfigs = (routesOnly = false) => {
    const projectConfigs = []
    const projectConfigArr = globby.sync(`${pagePath}/*/${projectConfigName}.js`, {
        cwd,
    })
    const absPagesPath = path.join(cwd, pagePath)
    projectConfigArr.forEach((projectConfigPath) => {
        const absProjectConfigPath = path.join(cwd, projectConfigPath)
        const projectConfig = require(absProjectConfigPath)
        if (projectConfig) {
            const config = {
                alias: {},
                absPagesPath,
                absProjectConfigPath,
                projectConfigPath,
            }
            const pathArr = (config.pathArr = projectConfigPath.split(pathSplit))
            const projectName = (config.projectName = pathArr[3] || '')
            if (routesOnly) {
                if (typeof projectConfig.routes === 'function') {
                    config.routes = projectConfig.routes
                }
            } else {
                if (typeof projectConfig.alias === 'function') {
                    config.alias = projectConfig.alias({
                        projectName,
                        cwd,
                        absPagesPath,
                    })
                }

                if (typeof projectConfig.alias === 'function') {
                    config.proxy = projectConfig.proxy({
                        projectName,
                        cwd,
                        absPagesPath,
                    })
                }
            }

            projectConfigs.push(config)
        }
    })

    return projectConfigs
}

exports.getBaseConfig = (routesOnly = false) => {
    const projectName = 'base'
    const config = {
        projectName,
        alias: {},
    }
    try {
        const projectConfigPath = (config.projectConfigPath = `./src/pages/${projectConfigName}.js`)
        const absProjectConfigPath = (config.absProjectConfigPath = path.join(
            cwd,
            projectConfigPath,
        ))
        const absPagesPath = (config.absPagesPath = path.join(cwd, pagePath))
        const baseConfig = require(absProjectConfigPath)
        if (baseConfig) {
            config.pathArr = projectConfigPath.split(pathSplit)
            if (routesOnly) {
                if (typeof baseConfig.routes === 'function') {
                    config.routes = baseConfig.routes
                }
            } else {
                if (typeof baseConfig.alias === 'function') {
                    config.alias = baseConfig.alias({
                        projectName,
                        cwd,
                        absPagesPath,
                    })
                }

                if (typeof baseConfig.alias === 'function') {
                    config.proxy = baseConfig.proxy({
                        projectName,
                        cwd,
                        absPagesPath,
                    })
                }
            }
        }
    } catch (e) {
        console.log(e)
    }

    return config
}
