import React, {Component} from 'react'
import {Modal, Slider} from 'antd'
import {connect} from "dva/index"
import PropTypes from 'prop-types'
import styles from './index.scss'

@connect(({loading}) => ({
    cutVideoLoading: loading.effects['wx_moments/cutVideo']
}))
export default class VideoCut extends Component {
    constructor(props) {
        super(props)
        this.state = {
            src: '',
            trt: 0,
            range: [0, 15],
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
        source: PropTypes.string,
        duration: PropTypes.number,
        range: PropTypes.array,
        onOk: PropTypes.func,
        onCancel: PropTypes.func
    }

    static defaultProps = {
        visible: false,
        source: '',
        duration: 0,
        range: [0, 15],
        onOk: () => {},
        onCancel: () => {}
    }

    componentDidMount() {
        this.setState({
            range: this.props.range
        })
    }

    componentWillUnmount() {
    }

    cutVideo = (url, policy, range) => {
        this.props.dispatch({
            type: 'wx_moments/cutVideo',
            payload: {
                body: {
                    url: url,
                    fops: policy
                }
            },
            callback: (data) => {
                if(data.url) {
                    this.props.onOk(data.url, range)
                }
            }
        })
    }

    handleChange = (range) => {
        const duration = range[1] - range[0]
        if (duration <= 15 && duration >= 2) {
            this.setState({
                range: range
            })
        }
    }

    handleOk = () => {
        const {range} = this.state
        const start = range[0]
        const end = range[1]
        const duration = end - start
        const policy = `avthumb/mp4/noDomain/1/ss/${start}/t/${duration}`
        this.cutVideo(this.props.source, policy, range)
    }

    handleCancel = () => {
        if (this.props.cutVideoLoading) {
            return
        }
        this.props.onCancel()
    }

    render() {
        const {visible, source, duration: trt, cutVideoLoading} = this.props

        const {range} = this.state

        const defaultMarks = {
            0: '0s',
            [trt]: `${trt}s`
        }

        const marks = {
            ...defaultMarks,
            [range[0]]: `${range[0]}s`,
            [range[1]]: `${range[1]}s`,
        }

        const name = source.replace(/^.+?\/([^\/]+?)(.[^.]*?)?$/gi,'$1')
        let ext = source.replace(/.+\./,'.')
        const filename = `${name}${ext}`

        return (
            <Modal
                centered={true}
                title="视频编辑"
                visible={visible}
                width={820}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                confirmLoading={!!cutVideoLoading}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                okText="确定"
                cancelText="取消">
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
                <div className={styles.slider}>
                    <span className={styles.label}>视频截取：</span>
                    <Slider range
                        min={0}
                        max={trt}
                        step={1}
                        marks={marks}
                        value={range}
                        tipFormatter={(value)=>{ return `${value}s` }}
                        onChange={this.handleChange}
                    />
                </div>
            </Modal>
        )
    }
}
