import React from 'react'
import { Carousel } from 'antd'
import Container from '../Container'
import styles from './index.less'
const default_icon = require('../../asserts/banner.svg')

export default class extends React.Component {
    render(){
        let {model} = this.props
        let data = model.data
       
        if(!data.length) data = [{data:[]}]
        let h = 176
        if(model.height === 0){
            h = 554
        }else if(model.height){
            h = model.height
        }
        return <Container {...this.props}>
            <Carousel autoplay={true} dots={data && data.length > 1}>
                {
                    data && data.map((item, index) => {
                        const url = item.data && item.data[0] ? (item.data[0].img_url  || item.data[0].img_path || default_icon): default_icon
                        return <div key={index + '_x'} className={styles.banner} style={{height:h}}><img src={url} style={{height:h}} alt='' /></div>
                    })
                }
            </Carousel>
        </Container> 
    }
}
