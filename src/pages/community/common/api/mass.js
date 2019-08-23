import config from 'community/config'

export default {
    tasks: {
        url: `${config.apiHost}/mass_sending/chat_rooms/tasks`,
        type: 'GET',
    },
    cancelled: {
        url: `${config.apiHost}/mass_sending/tasks/{id}/cancelled`,
        type: 'POST',
    },
    details: {
        url: `${config.apiHost}/mass_sending/chat_rooms/tasks/{id}/detail`,
        type: 'GET',
    },
    groupingsSummary: {
        url: `${config.apiHost}/wechats/chat_rooms/groupings/summary`,
        type: 'GET',
    },
    reExecute: {
        url: `${config.apiHost}/mass_sending/tasks/{task_id}/detail/re_execute`,
        type: 'POST',
    },
    task: {
        url: `${config.apiHost}/mass_sending/tasks/{id}`,
        type: 'GET',
    },
    search: {
        url: `${config.apiHost}/mass_sending/chat_rooms/search`,
        type: 'POST',
    },
    sendTask: {
        url: `${config.apiHost}/mass_sending/chat_rooms/tasks`,
        type: 'POST',
    },
    exitsCount: {
        url: `${config.apiHost}/mass_sending/chat_rooms/exits/count`,
        type: 'POST',
    },
    // 明细的数据导出
    exportTask: {
        url: `${config.apiHost}/mass_sending/chat_rooms/tasks/{id}/export`,
        type: 'GET'
    },
    exportExcel: {
        url: `${config.apiHost}/wechats/friends/export/status/{task_id}`,
        type: 'GET'
    },
    // 群发消息列表的数据导出
    exportTaskMsg: {
        url: `${config.apiHost}/mass_sending/chat_rooms/tasks/export`,
        type: 'GET'
    },
    // 检查是否有群发次数
    checkMass: {
        url: `${config.apiHost}/mass_sending/chatroom/check`,
        type: 'GET'
    },

}
