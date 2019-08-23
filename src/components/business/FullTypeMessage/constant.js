/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/6
 */

import _ from "lodash"

export const sourceTypeMap = {
    DEFAULT: 0,//默认
    EXTERNAL_DATA: 1,//外部数据
    USER: 2,//用户输入
    MATERIAL_LIB: 3,//素材库
    HZ_MALL: 4,//虎赞小店
    WX_TO_TAO: 5,//微转淘
}

export const sourceTypeArray = Object.keys(sourceTypeMap).map(key => sourceTypeMap[key])

export function verifySourceType(inputSourceType) {
    return sourceTypeArray.indexOf(inputSourceType) > -1
}

export function getSourceType(inputSourceType = sourceTypeMap.DEFAULT) {
    return inputSourceType
}

export function setInitSource(props) {
    return {
        sourceType: sourceTypeMap.DEFAULT,
        sourceData: {},
    }
}

export const defaultTabs = [
    {
        name: '文字',
        type: 1,
        ContentComponent: require('./components/contents/TextContent').default,
    },
    {
        name: '图片',
        type: 2,
        ContentComponent: require('./components/contents/PictureContent').default,
    },
    {
        name: '视频',
        type: 3,
        ContentComponent: require('./components/contents/VideoContent').default,
    },
    {
        name: '文件',
        type: 4,
        ContentComponent: require('./components/contents/FileContent').default,
    },
    {
        name: '语音',
        type: 5,
        ContentComponent: require('./components/contents/VoiceContent').default,
    },
    {
        name: '网页',
        type: 6,
        ContentComponent: require('./components/contents/WebContent').default,
    },
    {
        name: '小程序',
        type: 7,
        ContentComponent: require('./components/contents/MiniProgramContent').default,
    },
    {
        name: '音乐',
        type: 8,
        ContentComponent: require('./components/contents/MusicContent').default,
    },
    {
        name: '公众号名片',
        type: 9,
        ContentComponent: require('./components/contents/OfficialAccountsCardContent').default,
    },
]

export function registerDefaultTabs(tab) {
    if(tab && typeof tab.type === 'number') {
        if(findTabIndex(tab.type) === -1) {
            defaultTabs.push(tab)
        }else {
            console.error(`tab.type已存在`)
        }

    }else {
        console.error(`tab格式不对`)
    }
}

export function getTabName(type = 1, tabs = defaultTabs) {
    const tab = tabs.find(tab => tab.type === type)
    if(tab) {
        return tab.name
    }
    return ''
}

export const imageType = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
]
export const videoType = ['video/mp4']
export const webType = ['image/jpeg', 'image/jpg', 'image/png']

export const imageMaxSize = 20
export const videoMaxSize = 25
export const fileMaxSize = 100
export const webMaxSize = 1

export const filenameExtension = {
    doc: [
        '.doc', '.docx', '.docm', '.dotx', '.dotm', '.wps',
    ],
    xls: [
        'xls', '.xlsx', '.xlsm', '.xltx', '.xltm', '.xlsb', '.xlam', '.et',
    ],
    ppt: [
        '.ppt', '.pptx', '.pptm', '.ppsx', '.ppsm', '.potx', '.potm', '.ppam', '.dps',
    ],
    pdf: [
        '.pdf',
    ],
    txt: [
        '.txt',
    ],
    zip: [
        '.zip', '.rar', '.7z ',
    ],
}

export function findFilenameExtension(suffix) {
    const keys = Object.keys(filenameExtension)
    const keysLen = keys.length
    for(let i = 0; i < keysLen; i++) {
        const key = keys[i]
        const val = filenameExtension[key]
        if(val.includes(suffix.trim())) {
            return key
        }
    }
    return 'unknown'
}

export function createTabs({tabs = [], showTabs, cb}) {
    return showTabs.map((tab) => {
        let propTab = tab
        if(typeof tab !== 'object') {
            propTab = {
                type: tab,
            }
        }

        const newTab = _.defaultsDeep({}, propTab, findTab(propTab.type, tabs), findTab(propTab.type), {
            // values: null,
        })

        if(typeof cb === 'function') {
            cb(newTab)
        }

        return newTab
    })
}

export function findTab(type, tabs = defaultTabs) {
    return tabs.find((item) => {
        return type === item.type
    })
}

export function findTabIndex(type, tabs = defaultTabs) {
    return tabs.findIndex((item) => {
        return type === item.type
    })
}

export function getKeys(tabs = defaultTabs) {
    return tabs.map(item => item.type).join(',')
}
