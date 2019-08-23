import { getTableList, getMchNo, accountsDownLoad, accountsDetailDownLoad, downLoadDetail,createDetailRecords } from 'data/services/packetAccounts'

export default {
    namespace: 'data_packet_accounts',
    state: {
        list: [],
        totalPage: 0,
        mchList: [],
        totalAmount: '',
        totalCount: '',
        downLoadUrl: '',
        loading: false,
        createDetailRecord:[],
        total:0
    },

    effects: {
        * getTableList({payload, callback}, {select, call, put}) {
            const { data, pagination } = yield call(getTableList, payload)
            for (let i = 0, len = data.data.length; i < len; i++) {
                let temp = data.data[i].begin_at.split(' ')
                data.data[i].date = temp[0]
                data.data[i].amount = data.data[i].amount / 100
                if (data.data[i].mch_no === '') {
                    data.data[i].mch_no = '--'
                }
            }
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        totalPage: pagination.rows_found,
                        totalAmount: data.total.total_amount,
                        totalCount: data.total.total_count
                    }
                })
            }
            callback && callback(data)
        },
        * getMchNo({payload, callback}, {select, call, put}) {
            const { data } = yield call(getMchNo, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        mchList: data
                    }
                })
            }
            callback && callback(data)
        },
        * accountsDownLoad({payload, callback}, {select, call, put}) {
            const { down_path } = yield call(accountsDownLoad, payload)
            if (down_path) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        downLoadUrl: down_path
                    }
                })
            }
            callback && callback(down_path)
        },
        *downLoadDetail({payload, callback}, {select, call, put}) {
            const data = yield call(downLoadDetail, payload)
            callback && callback(data)
        },
        * accountsDetailDownLoad({payload, callback}, {select, call, put}) {
            const { down_path } = yield call(accountsDetailDownLoad, payload)
            if (down_path) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        downLoadUrl: down_path
                    }
                })
                callback && callback(down_path)
            } 
        },

        * createDetailRecords({payload, callback}, {select, call, put}) {
            const { data,pagination } = yield call(createDetailRecords, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        createDetailRecord: data,
                        total:pagination.rows_found
                    }
                })
            }
            callback && callback(data)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}
