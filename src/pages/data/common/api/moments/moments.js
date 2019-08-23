/**
 * @description 朋友圈统计
 * @author liyan
 * @date 2018/12/28
 */
import config from 'data/config'

const {apiHost} = config

let API = {}

API.momentsSummary = {
    url: `${apiHost}/stats/moment_overview`,
    type: 'GET'
}

API.momentsStat = {
    url: `${apiHost}/stats/moment`,
    type: 'GET'
}

API.momentsStatByDate = {
    url: `${apiHost}/stats/moment_by_date`,
    type: 'GET'
}

API.exportTask = {
    url: `${apiHost}/stats/moment/export`,
    type: 'GET'
}

API.exportExcel = {
    url: `${apiHost}/wechats/friends/export/status/{task_id}`,
    type: 'GET'
}


export default API
