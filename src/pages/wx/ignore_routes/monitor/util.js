import _ from 'lodash'
import parse from 'components/business/HistoryMessages/parse'
// const ParseMessage = window.ParseMessage || parseMessage
const ParseMessage = parse

export const parseMsg = (item) => {
    const record = _.cloneDeep(item)
    record.text = _.get(record, 'content') || _.get(record, 'last_message.content')
    record.type = Number(record.msg_type)
    return ParseMessage(record)
}
