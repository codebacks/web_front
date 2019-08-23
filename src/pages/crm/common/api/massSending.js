import config from 'crm/config'

const {apiHost} = config

const api = {
    tasks: {
        url: `${apiHost}/mass_sending/customers/tasks`,
        type: 'GET',
    },
    details: {
        url: `${apiHost}/mass_sending/customers/tasks/{id}/detail`,
        type: 'GET',
    },
    summary: {
        url: `${apiHost}/mass_sending/tasks/{id}/detail/summary`,
        type: 'GET',
    },
    createTask: {
        url: `${apiHost}/mass_sending/customers/tasks`,
        type: 'POST',
    },
    count: {
        url: `${apiHost}/mass_sending/customers/count`,
        type: 'POST',
    },
    task: {
        url: `${apiHost}/mass_sending/tasks/{id}`,
        type: 'GET',
    },
    cancelled: {
        url: `${apiHost}/mass_sending/tasks/{id}/cancelled`,
        type: 'POST',
    },
    exportTask: {
        url: `${apiHost}/mass_sending/customers/tasks/{id}/export`,
        type: 'GET'
    },
    exportExcel: {
        url: `${apiHost}/wechats/friends/export/status/{task_id}`,
        type: 'GET'
    },
}

export default api
