import React, {PureComponent} from 'react'
import config from 'common/config'
import styles from './index.less'

const {DefaultImage} = config

export default class MiniApp extends PureComponent {
    constructor(props) {
        super(props)
        this.state = { }
    }

    componentDidMount() {

    }

    render() {
        const {record} = this.props
        const body = record.body

        return (<div className={`${styles.box} ${styles.miniApp}`}>
            <div className={styles.meta}>
                <img className={styles.icon}
                    src={body && body.weappinfo && body.weappinfo.weappiconurl || DefaultImage}
                    onError={(e) => {
                        e.target.src = DefaultImage
                    }}
                    rel="noreferrer"
                    alt=""
                />
                <span className={styles.title}>{body?.appinfo?.appname ? body?.appinfo?.appname: body?.sourcedisplayname || ''}</span>
            </div>
            <div className={styles.desc}>
                {body && body.title || ''}
            </div>
            <img src={body && body.thumb_url || DefaultImage}
                className={styles.cover}
                onError={(e) => {
                    e.target.src = DefaultImage
                }}
                alt=""
            />
            <div className={styles.mark}><i className={styles.miniAppIcon}/><span>小程序</span></div>
        </div>
        )
    }
}

