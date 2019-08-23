import {
    batchAdd,
} from 'services/media'
import createModel from 'utils/model'

function substrTitle(str = '', len = 50) {
    return str.substr(0, len)
}

function setParams(type, values = {}) {
    switch(type) {
        case 1 :
            return {
                desc: values.content,
            }
        case 2 :
            return {
                title: substrTitle(values.name),
                url: values.media_url,
                sub_type: values.sub_type,
            }
        case 3 :
            return {
                title: substrTitle(values.name),
                url: values.media_url,
            }
        case 4 :
            return {
                title: substrTitle(values.name),
                url: values.media_url,
            }
        case 6 :
            return {
                title: substrTitle(values.title),
                url: values.url,
                desc: values.des,
                cover: values.thumb_url,
            }
        default:
            return {}
    }
}

export default createModel({
    namespace: 'media',

    state: {},

    effects: {
        * batchAdd({payload, callback}, {call, put, select}) {
            const paramsArr = payload.map(({type, values}) => {
                const newParams = setParams(type, values)
                newParams.type = type

                return newParams
            })

            const data = yield call(batchAdd, paramsArr)

            if(data.meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {},
})
