import {shopType, platformType, addedType, addedStatus, addedCode} from "./config"

const utils = {
    shopToPlatform: (type) => {
        const shop = shopType.find((v) => {
            return v.value === type
        })
        if (shop) {
            const platform = platformType.find((v) => {
                return v.type === shop.type
            })
            if (platform) {
                return platform.value
            }
        }
    },
    platformToShop: (type) => {
        const platform = platformType.find((v)=>{
            return v.value === type
        })
        if(platform) {
            const shop = shopType.find((v)=>{
                return v.type === platform.type
            })
            if (shop) {
                return shop.value
            }
        }
    },
    getDataFormText: (from) => {
        switch (from) {
            case 1:
                return '导入'
            case 2:
                return '淘宝/天猫'
            case 3:
                return '小程序'
            case 4:
                return '京东'
            case 22:
                return '有赞'
            case 101:
                return '自营'
            default:
                return ''
        }
    },

    getAddedTypeText: (type) => {
        const keys = Object.keys(addedType)
        const key = keys.find((k) => {
            return addedType[k].type === type
        })
        if (key) {
            return addedType[key].text
        }
        return ''
    },
    getAddedStatusText: (type) => {
        const keys = Object.keys(addedStatus)
        const key = keys.find((k) => {
            return addedStatus[k].status === type
        })
        if (key) {
            return addedStatus[key].text
        }
        return ''
    },
    getAddedCodeText: (code) => {
        const keys = Object.keys(addedCode)
        const key = keys.find((k) => {
            return addedCode[k].code === code
        })
        if (key) {
            return addedCode[key].text
        }
        return ''
    },
    getMessage: (code, record) => {
        if (code === addedCode.clientCode.code) {
            return record.message
        }
        return utils.getAddedCodeText(code)
    }
}

export default utils
