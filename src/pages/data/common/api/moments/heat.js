/**
 * @description 朋友圈热度
 * @author liyan
 * @date 2018/12/28
 */
import config from 'data/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/stats/moment/rank`,
    type: 'GET'
}

export default API
