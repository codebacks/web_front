/*
 * @Author: sunlzhi 
 * @Date: 2018-11-16 14:36:09 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-19 16:53:05
 */

import config from 'data/config'

export default {
    userGroupings: {
        url: `${config.apiHost_wu}/api/user_groupings`,
        type: 'GET',
    },
    addGroup: {
        url: `${config.apiHost_wu}/api/user_groupings`,
        type: 'POST',
    },
    deleteGroupings: {
        url: `${config.apiHost_wu}/api/user_groupings/{user_grouping_id}`,
        type: 'DELETE',
    },
    customerList: {
        url: `${config.apiHost_wu}/api/user_groupings/{user_grouping_id}/members`,
        type: 'GET',
    },
}
