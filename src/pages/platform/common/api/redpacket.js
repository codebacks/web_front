import config from 'platform/config'
// import { tableList } from '../../services/redpacket';
export default {
    // 店铺列表
    shopList:{
        url: `${config.apiHost}/api/shops/auth/shops`,
        type: 'get',
    },
    //是否开通小红包功能
    checkPacket:{
        url: `${config.apiHost}/api/wx_mps`,
        type: 'get',
    },
    tableList:{
        url: `${config.apiHost}/api/packets`,
        type: 'get',
    },
    report:{
        url: `${config.apiHost}/api/packets/generate/report`,
        type: 'POST',
    },
    reportList:{
        url: `${config.apiHost}/api/packets/reports`,
        type: 'GET',
    }
}
