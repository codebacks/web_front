import React, {Fragment} from 'react'
import {connect} from 'dva'
import moment from 'moment'
import config from 'crm/common/config'
import styles from './index.scss'

const {DateFormat} = config

@connect(({departments, users, wechats}) => ({
    departments, users, wechats
}))
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
        }
    }

    componentDidMount() {
    }

    render() {
        const {params} = this.props

        const getTime = (value) => {
            let t = value.split(',')
            let startValue = t[0] ? moment(t[0]).format(DateFormat) : '--'
            let endValue = t[1] ? moment(t[1]).format(DateFormat) : '--'
            return `${startValue} ~ ${endValue}`
        }

        const getAmount = (amount) => {
            let a = amount.split(',')
            let startValue = a[0] || '--'
            let endValue = a[1] || '--'
            return `${startValue} ~ ${endValue}`
        }

        return (
            <div className={styles.condition}>
                {
                    Object.keys(params).map((key) => {
                        let value = params[key]
                        if (key === 'create_time' && value && value !== ',') {
                            return <p className={styles.row} key={key}>
                                <span className={styles.label}>创建时间：</span>
                                <span className={styles.value}>
                                    {getTime(value)}
                                </span>
                            </p>
                        } else if (key === 'province' && typeof value !== 'undefined') {
                            let province = ''
                            if (value === '') {
                                province = '未知'
                            } else {
                                province = value
                            }
                            return <p className={styles.row} key={key}>
                                <span className={styles.label}>省：</span>
                                <span className={styles.value}>
                                    {province}
                                </span>
                            </p>
                        } else if (key === 'city' && typeof value !== 'undefined') {
                            let city = ''
                            if (value === '') {
                                city = '未知'
                            } else {
                                city = value
                            }
                            return <p className={styles.row} key={key}>
                                <span className={styles.label}>市：</span>
                                <span className={styles.value}>
                                    {city}
                                </span>
                            </p>
                        }
                        else if (key === 'sexes' && value.length) {
                            let sexes = ''
                            value.forEach((v, idx) => {
                                switch (v) {
                                case 0:
                                    sexes += `${idx > 0 ? '、' : ''}未知`
                                    break
                                case 1:
                                    sexes += `${idx > 0 ? '、' : ''}男`
                                    break
                                case 2:
                                    sexes += `${idx > 0 ? '、' : ''}女`
                                    break
                                default:
                                }
                            })
                            return <p className={styles.row} key={key}>
                                <span className={styles.label}>性别：</span>
                                <span className={styles.value}>
                                    {sexes}
                                </span>
                            </p>
                        } else if (key === 'remark' || key === 'exclude_remark') {
                            if (value.length) {
                                return <p className={styles.row} key={key}>
                                    <span className={styles.label}>
                                        {`${key === 'exclude_remark' ? '不' : ''}包含备注`}：
                                    </span>
                                    <span className={styles.value}>
                                        {value}
                                    </span>
                                </p>
                            }
                        } else if (key === 'tag' && params.tag && params.tag.length) {
                            return <p className={styles.row} key={key}>
                                <span className={styles.label}>包含标签：</span>
                                <span className={styles.value}>
                                    {params.tag.join('、')}
                                </span>
                            </p>
                        } else if (key === 'exclude_tag' && params.exclude_tag && params.exclude_tag.length) {
                            return <p className={styles.row} key={key}>
                                <span className={styles.label}>不包含标签：</span>
                                <span className={styles.value}>
                                    {params.exclude_tag.join('、')}
                                </span>
                            </p>
                        } else if (key === 'order') {
                            return <Fragment key={key}>
                                {value['is_not'] ? <p>排除以下订单条件</p> : ''}
                                {Object.keys(value).map((k)=>{
                                    let val = value[k]
                                    if (k === 'product_name' && val) {
                                        return <p className={styles.row} key={k}>
                                            <span className={styles.label}>购买过商品：</span>
                                            <span className={styles.value}>
                                                {val}
                                            </span>
                                        </p>
                                    } else if (k === 'buy_amount' && val && val !== ',') {
                                        return <p className={styles.row} key={k}>
                                            <span className={styles.label}>订单金额：</span>
                                            <span className={styles.value}>
                                                {getAmount(val)}
                                            </span>
                                        </p>

                                    } else if (k === 'order_create_time' && val && val !== ',') {
                                        return <p className={styles.row} key={k}>
                                            <span className={styles.label}>订单时间：</span>
                                            <span className={styles.value}>
                                                {getTime(val)}
                                            </span>
                                        </p>
                                    }else {
                                        return null
                                    }
                                })}
                            </Fragment>
                        }
                    })
                }
            </div>
        )
    }
}
