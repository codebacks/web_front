import React from 'react'

import Cross from './Cross'
import Direction from './Direction'
import styles from './index.less'

export default class extends React.Component {
    render(){
        // type = 'cross' 为横排产品列表
        let {data,type,active,theme} = this.props
        if(!data || !data.length) data = [{},{}]
        data = data.slice(0,10)
        return <div className={styles.product_cotent} style={{paddingBottom:type === 'cross' ? 8 : 0}}>
            {
                data && data.map((d, i) => type === 'cross' ?
                    <Cross key={i + '_d'} data={d} theme={theme} /> :
                    <Direction active={active} key={i + '_d'} data={d} theme={theme} />
                )
            }
        </div>
    }
}
