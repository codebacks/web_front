import React from 'react'
import Container from '../Container'
// import styles from './index.less'

export default class extends React.Component {
    
    render() {
        let { model } = this.props
        let data = model.data[0] && model.data[0].data
        
        if (!data) data = [{}]
        data = data[0] || {}
        return <Container {...this.props}>
            <b style={{padding:10}}>{data.text||'文字内容'}</b>
        </Container>
    }
}
