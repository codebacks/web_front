import React, {PureComponent} from 'react'
import _ from 'lodash'
import BaseVideo from '../BaseVideo'
import styles from './index.less'

export default class Video extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            defaultSize: 240,
            visible: false,
            width: 0,
            height: 0,
        }
    }

    componentDidMount() {}

    render() {
        const {record, onClick} = this.props
        const {defaultSize, width, height} = this.state

        const videoSize = {width: defaultSize, height: defaultSize}
        if (height && width) {
            if (height <= defaultSize && width <= defaultSize) {
                videoSize.height = height
                videoSize.width = width
            } else {
                if (width > height) {
                    videoSize.width = 240
                    videoSize.height = 240 * (height / width)
                } else {
                    videoSize.height = 240
                    videoSize.width = 240 * (width / height)
                }
            }
        }

        const cover = _.get(record, 'body.thumb_url') || _.get(record, 'body.media_cover_url')
        const mediaUrl = _.get(record, 'body.media_url')

        if (mediaUrl || cover) {
            return <div className={styles.video}>
                <BaseVideo record={record}
                    videoSize={videoSize}
                    onLoad={this.onLoad}
                    onClick={onClick}
                    cls={styles.cover}
                />
                {!mediaUrl ? <div className={styles.tip}>【视频】请在聊天窗口上查看</div> : null}
            </div>
        }
        return <div className={`${styles.box} ${styles.text}`}>
            【视频】请在聊天窗口上查看
        </div>
    }
}
