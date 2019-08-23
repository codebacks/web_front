import React, {PureComponent} from 'react'
import _ from 'lodash'
import styles from './index.less'

const ReceiveStatus = {
    'success': 2 // 领取成功
}
const HbStatus = {
    'timeOver': 5, // 过期
    'received': 4 // 已被领取
}

export default class RedEnvelope extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        const {record} = this.props

        let tip = '' // 领取红包
        let cls = ''

        if (_.get(record, 'detail.receiveStatus') === ReceiveStatus.success) {
            // tip = '红包已领取'
            cls = styles.disabled
        } else if (_.get(record, 'detail.hbStatus') === HbStatus.timeOver) {
            cls = styles.disabled
        }

        let icon = <img alt=""
            className={styles.icon}
            src={require('../../images/red_envelope.png')}
        />

        let meta = '微信红包'
        if (_.get(record, 'body.wcpayinfo.templateid') === 'b9a794071ca79264fb48909c24f2c6cc') {
            cls = `${cls} ${styles.aaPay}`
            icon = <img alt=""
                className={styles.icon}
                src={require('../../images/activity_bill.png')}
            />
            meta = _.get(record, 'body.wcpayinfo.scenetext')
        }

        return <div className={`${styles.box} ${styles.redEnvelope} ${cls}`}>
            <div className={styles.body}>
                <div className={styles.wrap}>
                    {icon}
                    <div className={styles.desc}>
                        <p className={styles.title}>{_.get(record, 'body.wcpayinfo.sendertitle') || _.get(record, 'body.sender_title')}</p>
                        <p className={styles.tip}>{tip}</p>
                    </div>
                </div>
                <h3>{meta}</h3>
            </div>
        </div>
    }
}




