import React from 'react'
import {connect} from 'dva'
import { Carousel } from 'antd'
import chunk from 'lodash/chunk'
import Container from '../Container'
import styles from './index.less'
const default_icon = require('../../asserts/default.svg')

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    getImages = (data) => {
        let arr = []
        for (let i = 0; i < data.length; i++) {
            if (data[i].data[0]) {
                let _d = data[i].data[0]
                if (_d && _d.cover_url) {
                    arr.push({ cover_url: _d.cover_url, name: _d.name })
                }
            }
        }
        return chunk(arr, 5)
    }
    render() {
        const { theme } = this.props.shop_fitment
        let { model } = this.props
        let data = model.data

        if (!data.length) data = [{ data: [] }]
        let images = this.getImages(data)

        return <Container {...this.props}>
            <div className={styles.category_carousel}>
                <Carousel>
                    {
                        images.length > 0 ? images && images.map((item, index) => {
                            return <div className={`${styles.category} ${theme.type !=='default' ? `hz_theme_category_${theme.type}`:''}`} key={index + '_x'} >
                                <ul>
                                    {
                                        item.map((_item, i) => <li key={'_' + i}>
                                            <img src={_item.cover_url} alt='' />
                                            <span>{_item.name}</span>
                                        </li>)
                                    }
                                </ul>
                            </div>
                        }) : [1,1].map((_,index)=>
                            <div key={index} className={`${styles.category} ${theme.type !=='default' ? `hz_theme_category_${theme.type}`:''}`}>
                                <ul>
                                    <li>
                                        <img src={default_icon} alt='' />
                                        <span>文字</span>
                                    </li>
                                    <li>
                                        <img src={default_icon} alt='' />
                                        <span>文字</span>
                                    </li><li>
                                        <img src={default_icon} alt='' />
                                        <span>文字</span>
                                    </li><li>
                                        <img src={default_icon} alt='' />
                                        <span>文字</span>
                                    </li><li>
                                        <img src={default_icon} alt='' />
                                        <span>文字</span>
                                    </li>
                                </ul>
                            </div>)
                    }

                </Carousel>

            </div>

        </Container>
    }
}
