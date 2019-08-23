import React, {Fragment} from 'react'
import {Modal, Spin} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import _ from 'lodash'
import styles from './index.scss'
import config from 'wx/common/config'
import createFaceHtml from 'components/Face/createFaceHtml'
import Helper from 'wx/utils/helper'

const {DefaultAvatar} = config

const contentType = {
    photo: 1,
    text: 2,
    article: 3,
    video: 15
}

const updateTip = '当前牛客服版本无法获取互动数据，请更新至最新版本'

@connect(({base, wx_moments_log, loading}) => ({
    base,
    wx_moments_log,
    detailLoading: loading.effects['wx_moments_log/momentDetail']
}))
export default class MomentDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            limit: 10,
            offset: 0,
            comments: [],
        }
        this.throttle = _.throttle(this.handleScroll, 200)
    }

    componentDidMount() {
        this.loadMomentDetail()
    }
    componentWillUnmount() {
    }

    loadMomentDetail = () => {
        const {record} = this.props
        if (record.sns_id) { // sns_id不为0
            this.props.dispatch({
                type: 'wx_moments_log/momentDetail',
                payload: {
                    taskId: record.task_id,
                    historyId: record.id
                },
                callback: () => {
                    this.setCurrentComment()
                }
            })
        }
    }

    handleScroll = () => {
        const {detail: {comments}} = this.props.wx_moments_log
        let ref = this.momentDetail
        if (ref.clientHeight + ref.scrollTop >= ref.scrollHeight - 10) {
            const {offset} = this.state
            if(offset < comments.length) {
                this.setCurrentComment()
            }
        }
    }

    setCurrentComment = () => {
        const {detail} = this.props.wx_moments_log
        const comments = _.cloneDeep(detail.comments)
        const {limit, offset} = this.state
        const end = limit + offset
        if (comments && comments.length) {
            this.setState({
                offset: end,
                comments: comments.slice(0, end)
            })
        }
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

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const {detail} = this.props.wx_moments_log
        const {detailLoading, visible} = this.props

        const {comments}= this.state

        const getArticleUrl = () => {
            if (detail.type === contentType.article) {
                const {body} = detail
                if (body) {
                    if (body.url) {
                        if (body.url.startsWith('http')) {
                            return body.url
                        }
                        return body.url2
                    }
                }
                return ''
            }
        }

        const getCover = (data) => {
            if(data.length) {
                const thumbUrl = data[0].thumb_url
                if (thumbUrl) {
                    return Helper.getLink(thumbUrl)
                }
            }
            return ''
        }

        return (
            <Modal
                centered={true}
                title="朋友圈互动"
                visible={visible}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                destroyOnClose={true}
                onCancel={this.handleCancel}
                footer={null}>
                <Spin spinning={!!detailLoading}>
                    <div ref={(ele) => {
                        this.momentDetail = ele
                    }}  className={styles.detail}
                    onScroll={this.throttle}
                    > { detail && Object.keys(detail).length ? <Fragment>
                            <div className={styles.content}>
                                { detail.content ? createFaceHtml({tagName: 'pre', tagProps: {className: styles.desc}, values: detail.content}) : ''}
                                {
                                    detail.type === contentType.article ?
                                        <a className={styles.between}
                                            href={getArticleUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {
                                                detail.body && detail.body.title ? <Fragment>
                                                    {
                                                        detail.media_list.length ? <img className={styles.cover}
                                                            rel="noreferrer"
                                                            src={this.getFullLink(detail.media_list[0].thumb_url)}
                                                            alt=""/>
                                                            : <img className={styles.defaultCover}
                                                                src={require('wx/assets/images/default_link.png')}
                                                                alt=""/>
                                                    }
                                                    <div
                                                        className={styles.title}>{detail.body && detail.body.title}</div>
                                                </Fragment> : getArticleUrl()
                                            }
                                        </a>
                                        : detail.type === contentType.photo ? <div className={styles.photos}>
                                            {
                                                detail.media_list.map((item, index)=>{
                                                    return <img className={styles.photo} key={index} src={item.thumb_url} rel="noreferrer" alt="" />
                                                })
                                            }
                                        </div> : detail.type === contentType.video ? (
                                            detail.media_list.length ?
                                                <a className={styles.between}
                                                    href={this.getFullLink(detail.media_list[0].url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img className={styles.cover} src={getCover(detail.media_list)} rel="noreferrer" alt="" />
                                                    <div className={styles.title}>{this.getFullLink(detail.media_list[0].url)}</div>
                                                </a> : '') : ''
                                }
                            </div>
                            <div className={styles.feedback}>
                                <span className={styles.likeCount}><i className={styles.icon}/>{detail.likes.length}</span>
                                <span className={styles.commentCount}><i className={styles.icon}/>{detail.comments.length}</span>
                            </div>
                            <div className={styles.interaction}>
                                {detail.likes.length ? <div className={styles.likes}>
                                    {
                                        detail.likes.map((item, index)=>{
                                            return <span key={index} className={styles.nickname}>
                                                {item.remark_name || item.nickname}{index === detail.likes.length - 1
                                                    ? '' : <span className={styles.comma}>，</span>
                                                }
                                            </span>
                                        })
                                    }
                                </div> : ''}
                                { comments.length ? <div className={styles.comments}>
                                    {
                                        comments.map((item, index)=>{
                                            return <div className={styles.item} key={index}>
                                                <img className={styles.headImg}
                                                    src={item.head_img_url}
                                                    onError={(e) => {
                                                        e.target.src = DefaultAvatar
                                                    }}
                                                    rel="noreferrer"
                                                    alt=""
                                                />

                                                <div className={styles.right}>
                                                    <div className={styles.meta}>
                                                        <span className={styles.nickname}>{item.remark_name || item.nickname}</span>
                                                        <span className={styles.time}>{moment(item.create_time * 1000).format('YYYY/MM/DD  HH:mm:ss')}</span>
                                                    </div>
                                                    <div className={styles.comment}>
                                                        {
                                                            item.to_username ? <div>
                                                                <span>回复<span
                                                                    className={styles.nickname}>{item.to_remark_name || item.to_nickname}</span>：</span>
                                                                {createFaceHtml({
                                                                    tagName: 'pre',
                                                                    tagProps: {className: styles.inline},
                                                                    values: item.content
                                                                })}
                                                            </div>
                                                                : createFaceHtml({
                                                                    tagName: 'pre',
                                                                    tagProps: {},
                                                                    values: item.content
                                                                })
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        })
                                    }
                                </div> : ''}
                            </div></Fragment>
                            : !detailLoading && updateTip}
                    </div>
                </Spin>
            </Modal>
        )
    }
}
