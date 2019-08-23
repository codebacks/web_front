/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/13
 */
import {findTabIndex} from "./constant"
import _ from "lodash"
import parse from 'utils/parse'

const parseMessageFn = parse

export function getVideoCover(url) {
    if(url) {
        return `${url}?vframe/jpg/offset/0`
    }
}

export function getFileName(name = '') {
    const index = name.lastIndexOf('.')
    if(index === -1) {
        return name
    }else{
        return name.slice(0, name.lastIndexOf('.'))
    }
}

export function setStateFromProps({name, preName, newState, props, state, setNewStateValue = value => value}) {
    if(props[name] !== state[preName]) {
        newState = newState || {}

        _.defaults(newState, {
            [preName]: props[name],
            [name]: setNewStateValue(props[name], props, name),
        })
    }
    return newState
}

export function setTabStateFromProps({name, preName, newState, tabs, props, state, setNewTabs}) {
    if(props[name] !== state[preName]) {
        newState = newState || {}
        let index = findTabIndex(props[name].type, tabs)
        if(index > -1) {
            let newTabs = tabs
            if(!newState) {
                newTabs = _.defaultsDeep([], tabs)
            }

            setNewTabs && setNewTabs(newTabs, index, name)

            _.defaults(newState, {
                [preName]: props[name],
                tabs: newTabs,
            })
        }else {
            _.defaults(newState, {
                [preName]: props[name],
            })
            // console.error(`type: ${props.typeValue.type}无效`)
        }
    }
    return newState
}

const domains = ['public.51zan.com', 'personal.niukefu.com']

function canUseThumbLimitUrl(url) {
    return domains.findIndex((domain) => {
        return url.indexOf(domain) > -1
    })
}

export function getOriginalUrl(url) {
    if(url) {
        if(canUseThumbLimitUrl(url) === -1) {
            return url
        }
        return url.split('?')[0]
    }
    return url
}

export function getThumbLimit(url, size = 500) {
    if(url) {
        if(canUseThumbLimitUrl(url) === -1) {
            return url
        }
        url = url.replace(/imageView2([^|]*)(\|)?/g, '')
        let separator = '?'
        if(url.indexOf('?') > -1) {
            separator = '|'
        }
        const length = url.length
        const last = url.slice(length - 1)
        if(last === "|" || last === "?") {
            separator = ''
        }
        return `${url}${separator}imageView2/0/h/${size}/q/100`
    }
    return url
}

export function parseWxMessage({type, text = '', body = {}}) {
    const msg = {
        type: getMessageType(type),
        text,
        body,
    }
    return parseMessageFn(msg) || {}
}

function getMessageType(type) {
    switch(type) {
        case 5 :
            return 34 // 语音
        case 6:
        case 7:
        case 8:
            return 49 // 网页、小程序、音乐
        case 9:
            return 42 // 公众号名片
        default:
            return 0
    }
}
