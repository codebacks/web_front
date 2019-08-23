import React, {PureComponent} from 'react'
import _ from 'lodash'
import createFaceHtml from "components/Face/createFaceHtml"
import helper from 'utils/helper'
import util from '../../util'

import styles from './index.less'

export default class Text extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    getContent = (record, keyword) => {
        let text = this.getText(record)
        if (helper.isChatRoom(record.customer_wxid) && !record.is_sender) {
            let name = text.split(':\n')[0]
            text = record.text.replace(`${name}:\n`, '')
        }
        text = _.escape(text)
        if (record.at_ids === 'announcement@all') {
            text = `@所有人<br />${text}`
        }
        text = text.replace(/\n/g, '<br />')
        text = text.replace(/\r/g, '<br />')
        if (keyword ) {
            text = this.getActiveText(record, text)
        }
        text = text.replace(/http:\/\//g, ' http://')
        text = text.replace(/https:\/\//g, ' https://')
        text = helper.textToLink(text)
        return text
    }

    getText = (record) => {
        return record.text || record.content
    }

    getActiveText = (record, text) => {
        const {keyword, activeRecord} = this.props
        if (keyword && (!activeRecord || record.create_time === util.getCreateTime(activeRecord))) {
            const reg = new RegExp(keyword, 'g')
            text = text.replace(reg, `<strong className="red" style="color:#47A85E">${keyword}</strong>`)
        }
        return text
    }

    render() {
        const {record, keyword} = this.props

        const content = this.getContent(record, keyword)

        return <div className={`${styles.box} ${styles.text}`}>
            {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: content, replace: (html)=>{
                return _.unescape(html)
            }})}
        </div>
    }
}
