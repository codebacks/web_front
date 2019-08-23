import React, {PureComponent} from 'react'
import config from 'common/config'
import styles from './index.less'

const {DefaultImage} = config

export default class ErrorImage extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
    }

    render() {
        const {tip, imageSize} = this.props

        return <div className={styles.default}>
            <img src={DefaultImage}
                className={styles.img}
                style={imageSize}
                alt=""/>
            {tip ? <div className={styles.tip}>{tip}</div> : null}
        </div>
    }
}
