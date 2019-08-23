/**
 **@Description:
 **@author: leo
 */
import config from 'setting/config'
import base from "./base"

const api = base('api/users')

api.invitations = {
    url: `${config.apiHost}/api/invitations`,
    type: 'GET',
}

api.invitationInit = {
    url: `${config.apiHost}/api/invitations/init`,
    type: 'GET',
}

api.invitationVerify = {
    url: `${config.apiHost}/api/invitations/{id}/verify`,
    type: 'POST',
}

export default api