import React, { Fragment } from 'react'
import { amount, jine } from "@/utils/display"
import { Col } from 'antd'
import classnames from 'classnames'
import styles from '../index.less'
import TipTop from '../../../assets/images/sell-top-one.png'
import TipSecond from '../../../assets/images/sell-top-second.png'
import TipThird from '../../../assets/images/sell-top-third.png'

const TIPS = [{
    image: TipTop,
    text: '第一名'
},{
    image: TipSecond,
    text: '第二名'
}, {
    image: TipThird,
    text: '第三名'
}]

export default class Index extends React.PureComponent {
    render () {
        const {
            data,
            rank,
            isPayMode
        } = this.props
        const tip = TIPS[rank-1]

        return <Col span={8}>
            <dl>
                <dt>
                    <img src={tip.image} alt={tip.text} />
                </dt>
                <dd>
                    <Display data={data} isPayMode={isPayMode} rank={rank}  />
                </dd>
            </dl>
        </Col>
    }
}

const Display = (props) => {
    const { data, isPayMode, rank } = props
    const hasSell = data && (isPayMode ? data.amount : data.receive_amount) > 0
    

    return hasSell ? 
        <Fragment>
            <span className={styles.sellsNickName} title={data.user_nickname}>{ data.user_nickname }</span>
            <span className={classnames(rank === 1? styles.sellsJineTopOne : '')}>
                ￥{ jine(isPayMode ? data.amount : data.receive_amount, null, amount.unit.Fen)}
            </span>
        </Fragment>
        :
        <Fragment>
            <span className={styles.sellsNickName}>--</span>
        </Fragment>
}