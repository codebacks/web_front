import {
    watermark,
    updateWatermark,
} from 'wx/services/watermark'
import _ from 'lodash'

function getInitState() {
    return {
        textWatermarkValue: '',
        qrCodeChecked: true,
    }
}

export default {
    namespace: 'wx_defaultWatermark',

    state: getInitState(),

    effects: {
        * watermark({payload, callback}, {call, put}) {
            let {data} = yield call(watermark, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        textWatermarkValue: _.get(data, 'attached_data.textWatermarkValue', ''),
                        qrCodeChecked: _.get(data, 'attached_data.qrCodeChecked', true),
                    },
                })
                callback && callback()
            }
        },
        * updateWatermark({payload, callback}, {call, put, select}) {
            const {
                textWatermarkValue,
                qrCodeChecked,
            } = yield select(({wx_defaultWatermark}) => wx_defaultWatermark)
            let {meta} = yield call(updateWatermark, {
                attached_data: {
                    textWatermarkValue,
                    qrCodeChecked,
                },
                type: 1,
            })
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignStateByPath(state, action) {
            const payload = action.payload
            const oldValue = _.get(state, payload.path, {})
            _.set(state, payload.path, Object.assign(oldValue, payload.value))

            return _.cloneDeep(state)
        },
        setStateByPath(state, action) {
            const payload = action.payload
            _.set(state, payload.path, payload.value)

            return _.cloneDeep(state)
        },
        resetState() {
            return getInitState()
        },
    },
}
