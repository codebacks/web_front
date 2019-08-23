import React from 'react'
import styles from './index.less'
const default_icon = require('../../asserts/default.svg')

export default class extends React.Component {
    numberFilter = (number) => {
        if (!number) return 0
        if (number / 10000 > 1) {
            return Math.floor(number / 10000) + '万'
        } else if (number / 1000 > 1) {
            return Math.floor(number / 1000) + '千'
        } else {
            return number
        }
    }
    render() {
        let { data, theme} = this.props
        return <div className={`${styles.product_cross} ${theme.type !=='default' ? `hz_theme_cross_${theme.type}`:''}`}>
            <img src={data.cover_url ? data.cover_url : default_icon} alt='' />
            <div className={styles.product_footer}>
                <h3>{data.name || '商品名称'}</h3>
                <p>
                    <span className={`${styles.money} money`}>￥{ data.price && data.price / 100}</span>
                    <span>销量 <b className={`${styles.red} color`}>{this.numberFilter(data.sales_count)}</b>件</span>
                </p>
            </div>
        </div>
    }
}
