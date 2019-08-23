import React from 'react'
import {connect} from 'dva'
import { Icon } from 'antd'
import Container from '../Container'
import styles from './index.less'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    render(){
        let { model } = this.props
        const {theme} =this.props.shop_fitment
        let data = model.data[0] && model.data[0].data
        if (!data || !data[0]) data = [{}]
        data = data[0]
        return <Container {...this.props}>
            <div className={`${styles.search_component} ${theme.type !=='default' ? `hz_theme_search_${theme.type}`:''}`}>
                <div className={styles.search}>
                    <Icon type='search' style={{fontSize: '15px', marginRight: '4px'}} />
                    <span>{ data.text || '文字' }</span>
                </div>
            </div>
        </Container> 
    }
}
