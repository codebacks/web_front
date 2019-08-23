import base from '../base'
import config from 'community/config'

const {apiHost} = config

let API = base('wechats/chat_rooms/keyword')

API.summary = {
    url: `${apiHost}/wechats/chat_rooms/keyword/summary`,
    type: 'GET'
}

export default API