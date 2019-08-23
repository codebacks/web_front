import React, {PureComponent} from 'react'
import _ from 'lodash'
import config from 'common/config'
import styles from './index.less'

const {DefaultAvatar} = config

export default class Packet extends PureComponent {
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

        return (
            <div className={`${styles.box} ${styles.packet}`}>
                <div className={styles.body}>
                    <div className={styles.info}>
                        <div className={styles.avatarWrap}>
                            <img className={styles.avatar}
                                src={_.get(record, 'body.thumb_url') || _.get(record, 'body.thumburl')}
                                onError={(e) => {
                                    e.target.src = DefaultAvatar
                                }}
                                rel="noreferrer"
                                alt=""
                            />
                        </div>
                        <div className={styles.nameWrap}>
                            <div className={styles.title}>{record.body.des}</div>
                            <div className={styles.username}>
                                {_.get(record, 'body.carditem.brand_name')}
                            </div>
                        </div>
                    </div>
                    <div className={styles.meta}>微信卡包</div>
                </div>
            </div>
        )
    }
}
