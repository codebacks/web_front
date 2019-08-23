import React, {PureComponent} from 'react'
import _ from 'lodash'
import styles from './index.less'
import createFaceHtml from "components/Face/createFaceHtml"

export default class Notification extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        const {text} = this.props

        return <div className={styles.notification}>
            {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: text, replace: (html)=>{
                return _.unescape(html)
            }})}
        </div>
    }
}