import React, {Fragment} from 'react'
import {Icon, Modal, Spin} from 'antd'
import {connect} from "dva/index"
import Helper from 'wx/utils/helper'
import createFaceHtml from 'components/Face/createFaceHtml'
import utils from '../../../../utils'
import styles from './index.scss'

@connect(({base, wx_moments_log, loading}) => ({
    base,
    wx_moments_log,
    loadingContent: loading.effects['wx_moments_log/momentContent']
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            previewVisible: false,
            previewImage: '',
        }
    }

    componentDidMount() {
        this.loadMomentContent()
    }

    loadMomentContent = () => {
        const taskId = this.props.record.task_id
        if(taskId) {
            this.props.dispatch({
                type: 'wx_moments_log/momentContent',
                payload: {
                    id: taskId
                },
                callback: (data) => {
                    if(data.content_type === 'video') {
                        this.setCover(data.content[0])
                    }
                }
            })
        }
    }

    renderContent = (record) => {
        const text = record.content
        if (record.content_type === 'photo') {
            const content = text.map((item, index) => {
                if (item) {
                    return <div key={index} className={styles.box}>
                        <img  className={styles.photo} src={Helper.getLink(Helper.getThumb(item))} alt=""/>
                        <Icon
                            type="eye-o"
                            className={styles.eye}
                            onClick={() => {
                                this.handleShowPreview(item, record, index)
                            }}
                        />
                    </div>
                }
                return ''
            })
            return <div className={styles.photos}>{content}</div>
        } else if (record.content_type === 'video') {
            const {videoCover} = this.state
            return <Spin spinning={!videoCover} size="small">
                <a className={styles.between}
                    href={this.getFullLink(text)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img className={styles.cover} src={videoCover} alt=""/>
                    <div className={styles.title}>{this.getFullLink(text)}</div>
                </a>
            </Spin>
        } else if (record.content_type === 'article') {
            return <a className={styles.between}
                href={text}
                target="_blank"
                rel="noopener noreferrer"
            >
                {
                    record.cover && record.title ? <Fragment>
                        <img className={styles.cover} rel="no-referrer" src={Helper.getLink(record.cover)} alt=""/>
                        <div className={styles.title}>{record.title}</div>
                    </Fragment> : record.content[0]
                }

            </a>
        } else {
            return text
        }
    }

    setCover = (url) => {
        if (Helper.isQiniu(url)) {
            this.setState({
                videoCover: Helper.getLink(Helper.getVideoCover(url))
            })
            return
        }
        this.genVideoCover(url)
    }

    genVideoCover = (url) => {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.src = url
        video.addEventListener('loadeddata', () => {
            this.setState({
                videoCover: this.canvasToDataUrl(video)
            })
        }, false)
    }

    canvasToDataUrl = (video) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const imgHeight = video.videoHeight
        const imgWidth = video.videoWidth
        ctx.drawImage(video, 0, 0, imgWidth, imgHeight)
        return canvas.toDataURL('image/png')
    }

    getFullLink(url) {
        const reg = /^http(s)?:\/\//
        const prefix = '//'
        if (url) {
            if (reg.test(url)) {
                return url
            } else if (url.slice(0, prefix.length) === prefix) {
                return `https:${url}`
            } else {
                return `https://${url}`
            }
        }
        return ''
    }

    handleShowPreview = (url, record, idx) => {
        let previewImage = Helper.getLink(Helper.getRealPhotoUrl(url))
        if (Helper.isQiniu(previewImage)) {
            if (record.content_type === 'photo') {
                const {content_watermark} = record
                if (content_watermark && content_watermark.length) {
                    const contentWatermark = content_watermark.find((item, index) => {
                        let key = Helper.getUrlKey(item.url)
                        return url.indexOf(key) !== -1 && idx === index
                    })
                    if (contentWatermark) {
                        const policy = contentWatermark.policy
                        if (policy) {
                            previewImage = Helper.getPolicyUrl(contentWatermark.url, policy)
                        }
                    }
                }
            }
        }
        this.setState({
            previewVisible: true,
            previewImage: previewImage,
        })
    }


    handleCancelPreview = () => {
        this.setState({
            previewVisible: false,
        })
    }


    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {visible, loadingContent} = this.props
        const {content}  = this.props.wx_moments_log

        const {previewVisible, previewLoading, previewImage} = this.state

        let comments = utils.getComments(content)

        return (
            <Modal
                centered
                title="朋友圈详情"
                visible={visible}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}>
                <div className={styles.content}>
                    <Spin spinning={loadingContent}>
                        {
                            content.content && content.content.length ?
                                <Fragment><h4 className={styles.type}>素材</h4>
                                    {this.renderContent(content)}
                                </Fragment> : null
                        }
                        {
                            content.content_desc ? <Fragment>
                                <h4 className={styles.type}>内容</h4>
                                {createFaceHtml({tagName: 'pre', tagProps: {}, values: content.content_desc})}
                            </Fragment> : null
                        }
                        {
                            comments.length ? <Fragment>
                                <h4 className={styles.type}>延时评论</h4>
                                {
                                    comments.map((item, index) => {
                                        return <div key={index}>{createFaceHtml({
                                            tagName: 'pre',
                                            tagProps: {},
                                            values: item
                                        })}</div>
                                    })
                                }
                            </Fragment> : ''
                        }
                    </Spin>
                </div>
                <Modal centered
                    visible={previewVisible}
                    footer={null}
                    onCancel={this.handleCancelPreview}
                >
                    <Spin style={{textAlign: 'center'}}
                        indicator={<Icon type="loading" theme="outlined"/>}
                        spinning={previewLoading}
                    >
                        <img style={{width: '100%', marginTop: '30px'}}
                            src={previewImage}
                            alt="查看大图"
                            onLoad={(e) => {
                                this.setState({
                                    previewLoading: false
                                })
                            }}
                        />
                    </Spin>
                </Modal>
            </Modal>
        )
    }
}
