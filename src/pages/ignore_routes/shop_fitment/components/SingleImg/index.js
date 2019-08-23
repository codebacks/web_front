import React from 'react'
import Container from '../Container'
// import styles from './index.less'
const default_icon = require('../../asserts/banner.svg')

export default class extends React.Component {
    
    render() {
        let { model } = this.props
        let data = model.data[0] && model.data[0].data
        if (!data || !data[0]) data = [{}]
        data = data[0]
        return <Container {...this.props}>
            <img width={320} src={data.img_url || data.img_path || default_icon} alt='' />
        </Container>
    }
}
