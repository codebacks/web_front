import config from 'setting/config'

export default {
    getSettingData: {
        url: `${config.yqxHost}/management/merchant`,
        type: 'GET',
    },
    saveSettingData: {
        url: `${config.yqxHost}/management/merchant`,
        type: 'PUT',
    },
    saveSharingData: {
        url: `${config.yqxHost}/management/merchant/share_info`,
        type: 'PUT',
    },
    addExperie: {
        url: `${config.yqxHost}/management/mpa/tester`,
        type: 'POST',
    },
    getExperieList: {
        url: `${config.yqxHost}/management/mpa/tester`,
        type: 'GET',
    },
    deleteExperie: {
        url: `${config.yqxHost}/management/mpa/tester`,
        type: 'DELETE',
    },
    getMpaAudit: {
        url: `${config.yqxHost}/management/mpa/audit`,
        type: 'GET',
    },
    subMpaAudit: {
        url: `${config.yqxHost}/management/mpa/audit`,
        type: 'POST',
    },
    getMpaHistory: {
        url: `${config.yqxHost}/management/mpa/history`,
        type: 'GET',
    },
}