import React from 'react'
import Container from '../Container'
import styles from './index.less'

export default class extends React.Component {
    
    render() {
        let { model } = this.props
        let data = model.data[0] && model.data[0].data
        
        if (!data) data = [{}]
        data = data[0] || {}
        let text =  data.text ? data.text.replace(/\n/g,'<br />') : '文字内容'
        return <Container {...this.props}>
            <p className={styles.text} dangerouslySetInnerHTML={{__html: text}}/>
        </Container>
    }
}
