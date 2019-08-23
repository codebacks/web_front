import config from 'crm/config'

const {apiHost} = config

let API = {}

// 创建好友群发
API.create = {
    url: apiHost + '/mass_sending/friends/tasks',
    type: 'POST',
}

// 好友群发任务
API.tasks = {
    url: apiHost + '/mass_sending/friends/tasks',
    type: 'GET',
}

// 好友群发结果
API.taskResult = {
    url: apiHost + '/mass_sending/friends/tasks/{id}/detail/summary',
    type: 'GET',
}

// 好友群发明细
API.details = {
    url: apiHost + '/mass_sending/friends/tasks/{id}/detail',
    type: 'GET',
}

API.cancelExecution = {
    url: apiHost + '/mass_sending/tasks/{id}/cancelled',
    type: 'POST',
}

API.reexecution = {
    url: apiHost + '/mass_sending/friends/tasks/{task_id}/detail/re_execute',
    type: 'POST',
}

export default API
