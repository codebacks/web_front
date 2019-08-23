import config from 'wx/config'

const {apiHost} = config

let API = {}

API.details = {
    url: `${apiHost}/cloud_control/tasks/histories`,
    type: 'GET',
}

API.result = {
    url: `${apiHost}/cloud_control/tasks/result`,
    type: 'GET',
}

API.momentContent = {
    url: `${apiHost}/cloud_control/tasks/{id}/content`,
    type: 'GET'
}

API.momentDetail = {
    url: `${apiHost}/cloud_control/tasks/{task_id}/histories/{history_id}/content`,
    type: 'GET'
}

export default API
