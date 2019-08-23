import React from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'antd'
import styles from './index.less'

export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
        source: PropTypes.string,
    }

    static defaultProps = {
        visible: false,
        source: '',
        width: 472,
        height: 250,
        title: '视频'
    }


    componentDidMount() {

    }

    componentWillUnmount() {

    }

    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {visible, source, width, height , title} = this.props

        const name = source.replace(/^.+?\/([^\/]+?)(.[^.]*?)?$/gi,'$1')
        let ext = source.replace(/.+\./,'.')
        const filename = `${name}${ext}`

        return (
            <Modal
                centered={true}
                title={title}
                visible={visible}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
                width={width}
                height={height}
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
                <a href={`${source}?attname=${filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="视频">部分视频的编码格式chrome浏览器不支持播放，请下载后查看</a>
            </Modal>
        )
    }
}
