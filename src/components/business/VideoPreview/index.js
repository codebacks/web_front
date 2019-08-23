import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'antd'
import styles from './index.less'

export default class VideoPreview extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
        source: PropTypes.string,
        extra: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.node]
        ),
    }

    static defaultProps = {
        visible: false,
        source: '',
        extra: '',
    }


    componentDidMount() {

    }

    componentWillUnmount() {
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {visible, source, extra} = this.props

        const name = source.replace(/^.+?\/([^\/]+?)(.[^.]*?)?$/gi,'$1')
        let ext = source.replace(/.+\./,'.')
        let idx = ext.indexOf('?')
        if (idx !== -1) {
            ext = ext.slice(0, idx)
        }
        const filename = `${name}${ext}`

        return (
            <Modal
                centered={true}
                title="视频"
                visible={visible}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
            >
                <div className={styles.videoWrap}>
                    {
                        source ? <video className={styles.video}
                            controls="controls"
                            preload="preload"
                        >
                            <source src={source} type="video/mp4" />
                        </video> : null
                    }
                </div>
                <div className={styles.extra}>{extra}</div>
                <a href={`${source}?attname=${filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="视频">部分视频的编码格式chrome浏览器不支持播放，请下载后查看</a>
            </Modal>
        )
    }
}
