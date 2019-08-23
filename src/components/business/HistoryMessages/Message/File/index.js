import React, {Fragment, PureComponent} from 'react'
import {Divider} from 'antd'
import _ from 'lodash'
import helper from 'utils/helper'
import styles from './index.less'

export default class File extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }


    render() {
        const {record} = this.props

        const fileExt = _.get(record, 'body.appattach.fileext')
        const size = _.get(record, 'body.appattach.totallen') || 0
        let iconCls = styles.icon_unknown
        if (styles[`icon_${fileExt}`]) {
            iconCls = styles[`icon_${fileExt}`]
        }

        let url = helper.getQiNiuDownloadUrl(record.body.media_url, record.body.title || '未命名')
        let link = ''
        if (url) {
            link = <a href={url} target="_blank" rel="noopener noreferrer" className={styles.download}>下载</a>
        }
        return <div className={`${styles.box} ${styles.file}`}>
            <div className={styles.iconWrap}>
                <span className={`${styles.icon} ${iconCls}`}/>
            </div>
            <div className={styles.info}>
                <div className={styles.name}>{record.body.title}</div>
                <div className={styles.option}>
                    <span className={styles.size}>{helper.formatLength(size)}</span>
                    {
                        link ? <Fragment><Divider type="vertical"/>{link}</Fragment> : null
                    }
                </div>
            </div>
        </div>
    }
}
