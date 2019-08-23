import _ from 'lodash'
import helper from 'utils/helper'
import { voiceConvert, groupMembers, unload, } from 'services/messages'

function getInitParams() {
    return {
        from_uin: '',
        to_username: '',

        location_create_time: undefined, // 需要定位的消息 创建时间戳，13位
        start_create_time: undefined, //群聊天记录的起止时间戳，结果不包含当前时间戳
        end_create_time: undefined,
        type: '', // 消息类型
        order_by: '-create_time', // -create_time 排序，只支持create_time升序或降序，降序前面加-,升序不需要加
        limit: 30,
        offset: 0,
    }
}

export default {
    namespace: 'group_messages',
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
        groupMembers: [], // 群成员
    },

    subscriptions: {},

    effects: {
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
        * groupMembers({payload, callback}, {select, call, put}) {
            const data = yield call(groupMembers, payload)
            if (data && data?.meta?.code === 200) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        groupMembers: data.data?.target?.members,
                    },
                })
                callback && callback(data)
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
        },
    }
}
