import React,{Fragment} from 'react'
import styles from './index.less'
const default_icon = require('../../asserts/default.svg')
// const ImageUrl = '//image.yiqixuan.com/'

export default class extends React.Component {
    render(){
        let {data, active, theme } = this.props
        
        let lineText = !active || active==='tuijian' ? '销量' : active === 'pingtuan' ? '拼团中 | 已团': null
        let _porps = {}
        _porps = {style:{width:'auto',maxWidth:74}}
        return <div 
            className={`${styles.product_direction} ${theme.type !=='default' ? `hz_theme_direction_${theme.type}`:''}`}
        >
            <img src={data.cover_url ? data.cover_url : default_icon} alt='' />
            <div className={styles.left}>
                <h3>{data.name || '商品名称'}</h3>
                <p className={styles.product_line}>{lineText? lineText:''} {lineText? <Fragment><span style={{display:'contents'}} className='color'>{ active === 'pingtuan' ? data.groupon_goods_sales_count :data.sales_count }</span>件</Fragment> :null}</p>
                <p>
                    {active && active === 'pingtuan' ? <span {..._porps} className={`${styles.money} money`}>
                    ￥{data.groupon_goods_price_low && data.groupon_goods_price_low / 100} </span>
                        :<span className={`${styles.money} money`} {..._porps} >￥{data.price && data.price / 100} </span>}
                    {active && active === 'tejia' ? <em {..._porps}> ￥{data.display_price && data.display_price / 100} </em> : null}
                    {active && active === 'pingtuan' ? 
                        <em {..._porps} > ￥{data.groupon_goods_origin_price_low && data.groupon_goods_origin_price_low / 100} </em> : null}
                    {/* {active === 'pingtuan'? <b> 马上抢 </b> : null } */}
                </p>
            </div>
        </div>
    }
}
