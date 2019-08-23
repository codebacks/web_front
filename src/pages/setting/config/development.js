/**
 **@Description:
 **@author: leo
 */


const huZan = {
    mpAuth: 'https://retail-develop.51zan.com/api/authorization/url/mps?state=dev.51zan.com/setting/authorization/oauthresult',
    mpaAuth: 'https://retail-develop.51zan.com/api/authorization/url/mpas?state=dev.51zan.com/setting/authorization/oauthresult'
}

const siYuGuangJia = {
    mpAuth: 'https://retail-develop.51zan.com/api/authorization/url/mps?state=dev.siyuguanjia.com/setting/authorization/oauthresult',
    mpaAuth: 'https://retail-develop.51zan.com/api/authorization/url/mpas?state=dev.siyuguanjia.com/setting/authorization/oauthresult'
}

export {
    huZan,
    siYuGuangJia
}

export default {
    yqxHost: '/yiqixuan_mall',
    apiHost_pay: '/api_setting_pay',
    apiHost: '/api_setting',
    apiHost_wu: '/api_setting_wu',
    apiHost_dev: '/api_setting_dev'
}