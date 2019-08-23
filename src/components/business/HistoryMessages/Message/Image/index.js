import React, {PureComponent} from 'react'
import PropTypes from "prop-types"
import _ from 'lodash'
import BaseImage from '../BaseImage'
import styles from './index.less'

export default class Image extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            defaultSize: 120,
        }
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

    getImageSize = (record, defaultSize) => {
        const imageSize = {width: defaultSize, height: defaultSize}
        const thumbWidth = record.body?.cdnthumbwidth || 0
        const thumbHeight = record.body?.cdnthumbheight || 0
        if (thumbHeight && thumbWidth) {
            if (thumbWidth <= imageSize && thumbHeight <= imageSize) {
                imageSize.height = thumbHeight
                imageSize.width = thumbWidth
            }
        }
        return imageSize
    }

    render() {
        const {record, onClick} = this.props
        const {defaultSize} = this.state

        const imageSize = this.getImageSize(record, defaultSize)

        let dom = ''

        if (_.get(record, 'body.thumb_url') || _.get(record, 'body.media_url')) {
            dom = <div className={`${styles.box} ${styles.image}`}>
                <BaseImage record={record}
                    imageSize={imageSize}
                    onClick={onClick}
                    cls={styles.img}
                />
            </div>
        }
        else {
            dom = (<div className={`${styles.box} ${styles.text}`}>
                    【图片】请在手机上查看
            </div>)
        }

        return dom
    }
}
