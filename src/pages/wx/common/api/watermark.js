import config from 'wx/config'

export default {
    watermark: {
        url: `${config.apiHost}/watermark_templets/default`,
        type: 'GET',
    },
    updateWatermark: {
        url: `${config.apiHost}/watermark_templets/default`,
        type: 'PUT',
    },
}