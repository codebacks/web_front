import {voiceConvert, unload, wxTalkersDetail} from 'services/messages'
import helper from 'utils/helper'
import _ from 'lodash'
import {changeWxSensitiveOperationRecords} from "risk_control/services/devices"

function getInitParams() {
    return {
        from_uin: '',
        to_username: '',

        location_create_time: undefined, // 需要定位的消息 创建时间戳，13位
        start_create_time: undefined, // 1545977138000 消息开始时间戳，13位，结果不包含当前时间戳
        end_create_time: undefined, // 1545977138000 消息截止时间戳，13位，结果不包含当前时间戳
        type: '', // 消息类型
        order_by: '-create_time', // -create_time 排序，只支持create_time升序或降序，降序前面加-,升序不需要加
        limit: 30,
        offset: 0,
    }
}

export default {
    namespace: 'messages',
    state: {
        params: getInitParams(),
        total: 0,
        list: [],
        audioUrls: {}, // 已转换的音频url, {uuid: url}
        audio: { // 音频播放
            uuid: '',
            ele: new Audio(),
            playing: false,
        },
        images: [], // 图片预览
    },

    subscriptions: {},

    effects: {
        * wxTalkersDetail({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(wxTalkersDetail, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * voiceConvert({payload, callback}, {select, call}) {
            const {data} = yield call(voiceConvert, payload)
            if (data) {
                callback && callback(data)
            }
        },
        * unload({payload, callback}, {select, call, put}) {
            const {data} = yield call(unload, {url: payload.url, md5: payload.md5})
            let url = ''
            const {record = {}} = payload
            record.isLoaded = true
            if (data.url) {
                url = helper.getRealPhotoUrl(data.url)
                _.set(record, 'body.media_url', url)
                const image = {src: url, uuid: helper.getUniqueMessageId(record), alt: ""}
                yield put({
                    type: 'replaceImage',
                    payload: {
                        image: image
                    }
                })
            }
            if (callback) {
                callback(url)
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        replaceImage(state, action) {
            // 表情图片替换
            let images = _.cloneDeep(state.images)
            const {image} = action.payload
            const idx = images.findIndex((v) => {
                return v.uuid === image.uuid
            })
            if (idx !== -1) {
                images[idx] = image
            } else {
                images.push(image)
            }
            return {...state, images}
        }
    }
}
