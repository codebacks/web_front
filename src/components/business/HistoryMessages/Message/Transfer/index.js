import React, {PureComponent} from 'react'
import _ from 'lodash'
import {TransferStatus} from '../../config'
import helper from 'utils/helper'
import styles from './index.less'

export default class Transfer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    isTimeOver = (record) => {
        if (_.get(record, 'body.wcpayinfo.invalidtime') < (helper.getTimestamp() / 1000 + 3600)) {
            return true
        }
    }

    render() {
        const {record} = this.props

        let cls = ''

        let desc = _.get(record, 'body.wcpayinfo.pay_memo')
        if (!desc) {
            desc = '转账给你'
        }

        let icon = <img src={require('../../images/transfer.svg')}
            className={styles.icon}
            alt=""/>

        let paySubType = _.get(record, 'body.wcpayinfo.paysubtype')

        if (paySubType === TransferStatus.received || paySubType === TransferStatus.delayReceived) {
            cls = styles.disabled
            icon = <img src={require('../../images/transfer_ok.svg')} className={styles.icon}
                alt=""/>
            if (record.body.is_received === 0) {
                desc = '已被领取'
            } else {
                desc = '已收钱'
            }
        } else if (paySubType === TransferStatus.refund) {
            cls = styles.disabled
            desc = '已退还'
            icon = <img src={require('../../images/transfer_refund.svg')} className={styles.icon}
                alt=""/>
        }

        if (this.isTimeOver(record) && paySubType !== TransferStatus.received && paySubType !== TransferStatus.delayReceived) {
            cls = styles.disabled
            desc = '已过期'
        }

        return <div className={`${styles.box} ${styles.transfer} ${cls}`}>
            <div className={styles.body}>
                <div className={styles.wrap}>
                    {icon}
                    <div className={styles.desc}>
                        <p className={styles.tip}>{desc}</p>
                        <p className={styles.title}>{_.get(record, 'body.wcpayinfo.feedesc')}</p>
                    </div>
                </div>
                <h3>微信转账</h3>
            </div>
        </div>
    }
}




