const features = {
    "1.0.1": [
        // {
        //     id: 1,
        //     menuName: '客户管理',
        //     navName: '客户群发',
        //     message: '根据条件筛选微信好友，进行精准营销、日常关怀等',
        // },
        // {
        //     id: 2,
        //     menuName: '个人号',
        //     navName: '群内群发',
        //     message: '根据部门筛选对应的微信群，对微信群进行营销',
        // },
    ]
}

const READ_FEATURES_KEYS = 'hz-read-features'

let readFeatures = {}

const LASTER_VERSION = '1.0.1'

function getReadFeatures(userID) {
    if(!readFeatures[userID]) {
        const readFeaturesString = window.localStorage.getItem(`${READ_FEATURES_KEYS}_${userID}`) || "{}"
        const userReadFeature = JSON.parse(readFeaturesString)
        if(!userReadFeature[LASTER_VERSION]) {
            userReadFeature[LASTER_VERSION] = []

        }
        readFeatures[userID] = userReadFeature
    }

    return readFeatures[userID]
}

function getReadLasterVersionFeatures(userID) {
    return getReadFeatures(userID)[[LASTER_VERSION]]
}

function getUnreadFeatures(userID) {
    const readVersion = getReadLasterVersionFeatures(userID)
    if(readVersion && readVersion.length > 0) {
        return features[LASTER_VERSION].filter(c => !readVersion.some(v => v === c.id))
    }else {
        return features[LASTER_VERSION]
    }
}

export function getHasMenuNewFeature(userID, menuName, existsChildMenus) {
    const features = getUnreadFeatures(userID)

    if(!(existsChildMenus && existsChildMenus.length > 0)){
        return false
    }
    else{
        let existsMenus = []
        convertChildMenuToArray(existsChildMenus, existsMenus)

        return features.filter(c => existsMenus.some(m => m.name === c.navName)).some(c => c.menuName === menuName)
    }
}

function convertChildMenuToArray(childMenus, container) {
    for(let menu of childMenus) {
        container.push(menu)
        if(menu.children && menu.children.length > 0){
            convertChildMenuToArray(menu.children, container)
        }
    }
}


export function getNavNewFeature(userID, navName) {
    const tips = getUnreadFeatures(userID)
    const navTips = tips.filter(c => c.navName === navName)
    return navTips[0]
}

export function readNewFeature(userID, tip) {
    let userReadFeatures = getReadLasterVersionFeatures(userID)

    userReadFeatures.push(tip.id)

    window.localStorage.setItem(`${READ_FEATURES_KEYS}_${userID}`, JSON.stringify(getReadFeatures(userID)))
}