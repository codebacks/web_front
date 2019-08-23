'use strict'

import config from "crm/config"

export default {
    vipRankList: {
        url: `${config.apiHost_wu}/api/customer/member_levels`,
        type: 'GET',
    },
    vipRankAdd: {
        url: `${config.apiHost_wu}/api/customer/member_levels`,
        type: 'POST',
    },
    vipRankUpdate: {
        url: `${config.apiHost_wu}/api/customer/member_levels/{id}`,
        type: 'PUT',
    },
    vipChanegStatus: {
        url: `${config.apiHost_wu}/api/customer/member_levels/{id}/switch`,
        type: 'POST',
    },
    vipRankDetail: {
        url: `${config.apiHost_wu}/api/customer/member_levels/{id}`,
        type: 'GET',
    },
    vipList: {
        url: `${config.apiHost_wu}/api/customer/member_levels/members`,
        type: 'GET',
    },
    vipListByUser: {
        url: `${config.apiHost_wu}/api/customer/users/member_summaries`,
        type: 'GET',
    },
    getUserList: {
        url: `${config.apiHost_wu}/api/customer/users`,
        type: 'GET',
    },
    getVipDetail: {
        url: `${config.apiHost_wu}/api/customer/members/{id}`,
        type: 'GET',
    },
    getOrderList: {
        url: `${config.apiHost_wu}/api/customer/members/{id}/orders`,
        type: 'GET',
    },
}
