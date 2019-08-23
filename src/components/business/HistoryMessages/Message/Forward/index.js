import React, {PureComponent} from 'react'
import _ from 'lodash'
import createFaceHtml from "components/Face/createFaceHtml"
import styles from './index.less'



export default class Forward extends PureComponent {
    constructor(props) {
        super(props)
        this.state = { }
    }

    componentDidMount() {

    }

    render() {
        const {record} = this.props

        return (<div className={`${styles.box} ${styles.forward}`}>
            <div className={styles.text}>
                <div className={styles.title}>{record.body.title}</div>
                <div className={styles.text}>
                    {record.body.des ?
                        createFaceHtml({tagName: 'div', tagProps: {className: 'desc'}, values: `${record.body.url ? '' : '【请在手机上查看】 '}${record.body.des}`,
                            replace: (html)=>{
                                return _.unescape(html)
                            }})
                        : ''}
                </div>
                <div className={styles.meta}>聊天记录</div>
            </div>
        </div>)
    }
}

