import React, {PureComponent} from 'react'
import {Modal} from 'antd'
import styles from './index.less'

const videoMaxWidth = 640
const videoMaxHeight = 640

const videoDefaultWidth = 640
const videoDefaultHeight = 320

export default class VideoViewer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            url: '',
            videoWidth: videoDefaultWidth,
            videoHeight: videoDefaultHeight,
        }
    }

    componentDidMount() {

    }

    handlePlay = (url) => {
        this.setState({
            visible: true,
            url: url,
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false,
        })
    }

    onLoadedMetadata = (e) => {
        const {videoWidth, videoHeight} = e.target
        // console.log(videoWidth, videoHeight)
        this.setState({
            videoWidth,
            videoHeight
        })
    }

    render() {
        const {visible, url} = this.state

        const {videoWidth, videoHeight} = this.state
        let width = videoWidth
        let height = videoHeight
        if (width > height && width >= videoMaxWidth) {
            width = videoMaxWidth
            height = videoMaxWidth * (videoHeight / videoWidth)
        } else if (height > width && height >= videoMaxHeight) {
            height = videoMaxHeight
            width = videoMaxHeight * (videoWidth / videoHeight)
        }

        return visible ? <Modal centered
            title={null}
            wrapClassName={styles.wrapper}
            visible={visible}
            width={width}
            height={height}
            onCancel={this.handleCancel}
            footer={null}
        >
            <video controls="controls"
                autoPlay preload="auto"
                onLoadedMetadata={this.onLoadedMetadata}
                className={styles.video} >
                <source src={url} type="video/mp4"/>
            </video>
        </Modal> : null
    }
}