import React from 'react'
import {connect} from 'dva'
import Container from '../Container'
import styles from './index.less'
const default_icon = require('../../asserts/default.svg')
const icon = {
    default:require('../../asserts/icon_home_contact.png'),
    blue:require('../../asserts/icon_contact_wechat@2x.png')
}
@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    render(){
        let {model} = this.props
        const { theme } = this.props.shop_fitment
        let data = model.data
        if(!data || !data[0])data = [{data:[{}]}]
        let _data = data[0].data[0]
        if(!_data) _data = {}
        return <Container {...this.props}>
            <div className={`${styles.content } ${theme.type !=='default' ? `hz_theme_ImageText_${theme.type}`:''}`}>
                <div className={ `${styles.body} body` }>
                    <img src={_data.img_url || _data.img_path || default_icon} alt='' />
                    {/*  */}
                    <img src={icon[theme.type]} alt='' className={ `${styles.contact_icon} contact_icon`} />
                    <p>
                        <span className={styles.top}>{ _data.textHead || '描述文字' }</span>
                        <span className={`${styles.bot} bot`}>{ _data.text || '描述文字' }</span>
                    </p>
                </div>
            </div>
        </Container> 
    }
}
