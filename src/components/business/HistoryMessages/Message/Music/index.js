import React, {Fragment, PureComponent} from 'react'
import _ from 'lodash'
import config from 'common/config'
import styles from './index.less'

const {DefaultImage} = config

export default class Music extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            url: ''
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        const {record} = this.props

        let url = record.body.url
        let content = <Fragment>
            <div className={styles.info}>
                <div className={styles.meta}>
                    <h3 className={styles.title}>{record.body.title}</h3>
                    <div className={styles.desc}>{record.body.des}</div>
                </div>
                <div className={styles.coverWrap}>
                    <div className={styles.playIcon}/>
                    <img className={styles.cover}
                        src={record.body.thumb_url || ''}
                        onError={(e) => {
                            e.target.src = DefaultImage
                        }}
                        alt=""
                    />
                </div>
            </div>
            <h3 className={styles.appName}>{_.get(record, 'body.appinfo.appname') || _.get(record, 'body.app_name') || '未知'}</h3>
        </Fragment>
        if (url) {
            content = <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        }
        return <div className={`${styles.box} ${styles.music}`}>
            {content}
        </div>
    }
}
