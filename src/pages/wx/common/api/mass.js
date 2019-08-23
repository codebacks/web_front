import config from 'wx/config'

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
}