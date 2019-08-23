import React, {PureComponent} from 'react'
import PropTypes from "prop-types"
import BaseImage from '../../Message/BaseImage'
import styles from './index.less'

export default class Image extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    static propTypes = {
        record: PropTypes.object.isRequired,
        onClick: PropTypes.func,
    }

    static defaultProps = {
        onClick: () => {},
    }

    componentDidMount() {

    }

    render() {
        const {record, onClick} = this.props

        const imageSize = {
            width: 156,
            height: 156,
        }

        return <div className={styles.box}>
            <BaseImage record={record}
                imageSize={imageSize}
                onClick={onClick}
                cls={styles.img}
                tip={'[图片]请在手机上查看'}
            />
        </div>
    }
}
