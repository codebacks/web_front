import config from 'config'

export default {
    check: {
        url: `${config.apiHost}/api/captcha/check`,
        type: 'POST',
    },
}