import config from 'platform/config'

export default {
    shopList:{
        url: `${config.apiHost}/api/shops/auth/shops`,
        type: 'get',
    },
    voicePacketsAccount:{
        url: `${config.apiHost}/api/partner_red_packets/account`,
        type: 'get',
    },
    openAccount:{
        url: `${config.apiHost}/api/partner_red_packets/account`,
        type: 'POST',
    },
    voicePacketsList:{
        url: `${config.apiHost}/api/partner_red_packets`,
        type: 'get',
    },
    rechargeList:{
        url: `${config.apiHost}/api/partner_red_packets/charge_records`,
        type: 'get',
    },
    recharge:{
        url: `${config.apiHost}/api/partner_red_packets/charge`,
        type: 'POST',
    },
    rechargeStatus:{
        url: `${config.apiHost}/api/partner_red_packets/{no}/charge`,
        type: 'get',
    },
    settlements:{
        url: `${config.apiHost}/api/partner_red_packets/settlements/summary`,
        type: 'get',
    },
    settlementsList:{
        url: `${config.apiHost}/api/partner_red_packets/settlements`,
        type: 'get',
    },
    downloadBill:{
        url: `${config.apiHost}/api/partner_red_packets/settlements/download`,
        type: 'get',
    },
    downloadDetail:{
        url: `${config.apiHost}/api/partner_red_packets/settlements/detailed/download`,
        type: 'get',
    },

    checkFirstRecharge :{
        url: `${config.apiHost}/api/partner_red_packets/first_charge`,
        type: 'get',
    }

}