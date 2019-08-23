import React from 'react'
import Container from '../Container'
import styles from './index.less'

export default class extends React.Component {
    render() {
        let {isActive} = this.props
        return <Container {...this.props}>
            <div className={`${isActive? styles.line_padding : ''}`}>
                <hr className={styles.line} />
            </div>
        </Container>
    }
}
