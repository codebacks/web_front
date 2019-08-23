/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/26
 */
import _ from 'lodash'

export const oemConfig = new Map([
    [
        'siyuguanjia',
        {
            id: 'siyuguanjia',
            title: '私域管家',
            iconHref: '/oem/siyuguanjia/favicon.ico',
            channel: 'siyuguanjia',
            logSrc: require('assets/oem/siyuguanjia/logo.png'),
            logAlt: '私域管家',
            loginLogoSrc: require('assets/oem/siyuguanjia/loginLogo.png'),
            niukefu: {
                name: '工作台',
                alt: '工作台',
                urlMap: {
                    'development': 'https://dev-im.siyuguanjia.com',
                    'production_develop': 'https://dev-im.siyuguanjia.com',
                    'production_test': 'https://test-im.siyuguanjia.com',
                    'production_staging': 'https://staging-im.siyuguanjia.com',
                    'production_master': 'https://im.siyuguanjia.com',
                },
                iconSrc: require('assets/images/niukefu.png'),
            },
        },
    ],
    [
        '*',
        {
            id: 'huzan',
            title: '51赞',
            iconHref: '/favicon.ico',
            channel: 'huzan',
            logSrc: '//image.51zan.com/2019/04/12/FuhJeX7rE7Zgy7l9P2Mwn_BYfHmW.png',
            logAlt: '虎赞',
            loginLogoSrc: '//image.51zan.com/2019/04/11/Fkvoz2FMK_k6lq9l_m6ENkZNql-t.png',
            niukefu: {
                name: '牛客服',
                alt: '牛客服',
                urlMap: {
                    'development': 'https://dev-im.niukefu.com',
                    'production_develop': 'https://dev-im.niukefu.com',
                    'production_test': 'https://test-im.niukefu.com',
                    'production_staging': 'https://im-staging.niukefu.com',
                    'production_master': 'https://im.niukefu.com',
                },
                iconSrc: require('assets/images/niukefu.png'),
            },
        },
    ],
])

function getHost() {
    return _.get(window, 'location.host', '')
}

function setNiukefuUrl(urlMap) {
    return _.get(urlMap, HUZAN_ENV, '')
}

function matchKey(key, value) {
    if (key === '*') {
        return value
    }else if (_.isString(key)) {
        return value.includes(key)
    }else if (_.isFunction(key)) {
        return key(value)
    }else if (_.isRegExp(key)) {
        return key.test(key)
    }
}

export function setIcon(href) {
    const link = document.createElement('link')
    link.href = href
    link.rel = 'shortcut icon'
    document.head.appendChild(link)
}

function matchArrayKey(keys, value) {
    for (let i = 0, len = keys.length; i < len; i++) {
        const matched = matchKey(keys[i], value)

        if (matched) {
            return matched
        }
    }
}

export function getMatchOemConfig() {
    const host = getHost()
    for (const [key, value] of oemConfig.entries()) {
        let matched
        if (Array.isArray(key)) {
            matched = matchArrayKey(key, host)
        }else {
            matched = matchKey(key, host)
        }

        if (matched) {
            return value
        }
    }
}

export function initOem() {
    const oemConfig = getMatchOemConfig()
    setIcon(oemConfig.iconHref)
    oemConfig.niukefu.url = setNiukefuUrl(_.get(oemConfig, 'niukefu.urlMap', {}))

    return {oemConfig}
}

