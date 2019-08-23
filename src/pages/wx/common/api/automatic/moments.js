import config from 'wx/config'

const {apiHost} = config

let API = {}

API.tasks = {
    url: apiHost + '/cloud_control/tasks',
    type: 'GET',
}

API.getAuthorization = {
    url: apiHost + '/storages/auth',
    type: 'GET',
}

API.shareMoments = {
    url: apiHost + '/cloud_control/tasks/share_moments',
    type: 'POST',
}

API.cancelExecution = {
    url: apiHost + '/cloud_control/tasks/{id}/cancel',
    type: 'PUT',
}

API.details = {
    url: apiHost + '/cloud_control/tasks/{id}/histories',
    type: 'GET',
}


API.taskResult = {
    url: apiHost + '/cloud_control/tasks/{id}/result',
    type: 'GET',
}

API.reexecution = {
    url: apiHost + '/cloud_control/tasks/{id}/reexecution/{history_id}',
    type: 'PUT',
}

API.articleExtract = {
    url: apiHost + '/cloud_control/tasks/articles/extract',
    type: 'POST',
}

API.taskDetailsExport = {
    url: `${apiHost}/cloud_control/tasks/{id}/histories/excel_export`
}

API.labels = {
    url: `${apiHost}/wechats/friend_contact_labels`,
    type: 'GET',
}

API.defaultWatermark = {
    url: `${apiHost}/watermark_templets/default`,
    type: 'GET'
}

API.cutVideo = {
    url: `${apiHost}/cloud_control/tasks/video_cut`,
    type: 'POST'
}

API.verifyVideo = {
    url: `${apiHost}/cloud_control/tasks/video_verify`,
    type: 'POST'
}

API.taskCount = {
    url:  `${apiHost}/cloud_control/tasks/count`,
    type: 'GET'
}

export default API
