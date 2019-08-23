'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/11/3
 *
 */

import React from 'react'
import {Icon, Tooltip,
} from 'antd'
import _ from 'lodash'
import Helper from 'wx/utils/helper'
import config from 'wx/common/config'
import BindOrder from './BindOrder'
import styles from './MessagesView.scss'
import createFaceHtml from 'components/Face/createFaceHtml'
import Gallery from 'wx/components/Gallery'

const {ReceiveMessageTypes, DefaultAvatar} = config

class MessagesView extends React.Component {
    constructor(props) {
        super()
        this.state = {
            gallery: false,
            photos: [],
            src: '',
            record: null,
            messageLength: 0
        }
    }

    componentDidMount() {
    }

    onBindOrder = (item) => {
        this.props.dispatch({
            type: 'wx_messages/setProperty',
            payload: {bindModal: true, record: item},
        })

    };
    showGallery = (url) => {
        let photos = [], _url
        if (url && url.indexOf('?') !== -1) {
            url = url.split('?')[0]
        }
        const messages = this.props.records
        for (let i = 0, j = messages.length; i < j; i++) {
            if (messages[i].type === ReceiveMessageTypes.picture) {
                _url = Helper.getIn(messages[i], 'file.url') || Helper.getIn(messages[i], 'body.cdn_url')
                if (_url && _url.indexOf('?') !== -1) {
                    _url = _url.split('?')[0]
                }
                photos.push(_url)
            }
        }
        this.setState({gallery: true, photos: photos, src: url})
    };

    hideGallery = () => {
        this.setState({gallery: false, photos: []})
    };

    render() {
        const bindModal = this.props.bindModal
        const messages = this.props.records
        // const hideBind = this.props.hideBind
        const createMarkup = (t) => {
            let html = Helper.qqFaceToImg(t)
            if (html === 'null') {
                html = t.replace('[', '<').replace(']', '>')
            }
            html = Helper.emojiToImg(html)
            html = Helper.msgToHtml(html)
            return {__html: html}
        }
        const getMsgCls = (item) => {
            let cls = ( item.type === ReceiveMessageTypes.note && item?.origin_app_message_type !== 2001 ) ? 'noteItem' : ''
            if (item.is_send) {
                return styles.chatOut + ' ' + cls
            } else {
                return 'chatIn ' + cls
            }
        }
        const getMsgAvatarUrl = (item) => {
            if (item.sender) {
                return item.sender.head_img_url
            } else {
                // return activeObj.from.head_img_url; //发送消息时取当前微信头像
                return ''
            }
        }
        const getMapUrl = (item) => {
            return Helper.format('http://apis.map.qq.com/uri/v1/geocoder?coord={lat},{lng}&name={label}', {
                lat: item.lat,
                lng: item.lng,
                label: item.label
            })
        }
        // const getBindOrder = (item) => {
        //     if (item.transfer.id) {
        //         if (!item.is_send && !item.is_current) {
        //             if (Helper.getIn(item, 'transfer.outer_order_id')) {
        //                 return '已关联订单:' + Helper.getIn(item, 'transfer.outer_order_id')
        //             } else {
        //                 return (<Button size="small" onClick={this.onBindOrder.bind(this, item)}>关联订单</Button>)
        //             }
        //         }
        //     }
        // }
        const getContent = (item) => {
            let data = {
                'data-id': item.id
            }
            switch (item.type) {
            case ReceiveMessageTypes.text:
                let _content = item.content
                if (this.props.keyword) {
                    // if (item.is_match) {
                    _content = _content.replace(this.props.keyword, `<strong className="red" style="color:#f00">${this.props.keyword}</strong>`)
                    // }
                }
                return (<div className={styles.bubble + ' menu'} {...data}>
                    <div className={styles.message}>
                        {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: _content, replace: (html)=>{
                            return _.unescape(html)
                        }})}
                    </div>
                </div>)
            case ReceiveMessageTypes.picture:
                if (Helper.getIn(item, 'file.url')) {
                    return (<div className={styles.picture + ' menu'} {...data}>
                        <img onClick={this.showGallery.bind(this, item.file.url)}
                            src={Helper.getIn(item, 'file.url')} rel="noreferrer" alt=""/>
                    </div>)
                } else if (Helper.getIn(item, 'body.cdn_url')) {
                    return <div className={styles.picture + ' menu'} {...data}>
                        <img src={Helper.getIn(item, 'body.cdn_url')}
                            onClick={this.showGallery.bind(this, Helper.getIn(item, 'body.cdn_url'))} rel="noreferrer" alt=""/>
                    </div>
                } else {
                    if (!item.id) { //未发送成功
                        return (<div className={styles.picture + ' menu'} {...data}>
                            <Icon type="picture" style={{fontSize: 110, color: '#aaa', marginTop: '-12px'}}/>
                        </div>)
                    } else {
                        return (<div className={styles.bubble + ' menu'}>
                            <div className={styles.message}>[收到了一个{item.content ? item.content : '表情'}，请在手机上查看]
                            </div>
                        </div>)
                    }
                }
            case ReceiveMessageTypes.video:
                if (Helper.getIn(item, 'file.url')) {
                    return (<div className={styles.bubble + ' menu'} {...data}>
                        <video width="320" height="240" controls preload="meta">
                            <source src={item.file.url} type="video/mp4"/>
                        </video>
                    </div>)
                } else {
                    if (!item.id) {
                        return (<div className={styles.videoCover}>
                            <span className="icon-video"/>
                        </div>)
                    } else {
                        return (<div className={styles.bubble + ' menu'}>
                            <div className={styles.message}>
                                【该视频消息需在手机上查看】
                            </div>
                        </div>)
                    }
                }
            case ReceiveMessageTypes.recording:
                if (Helper.getIn(item, 'file.url')) {
                    return (<div className={styles.bubble + ' menu'} {...data}>
                        <audio controls>
                            <source src={item.file.url} type="audio/mpeg"/>
                        </audio>
                    </div>)
                } else {
                    return (<div className={styles.bubble + ' menu'}>
                        <div className={styles.message}>
                            【该语音消息需在手机上查看】
                        </div>
                    </div>)
                }
            case ReceiveMessageTypes.attachment:
                if (Helper.getIn(item, 'file.url') || !item.id) {
                    //item.id 用于判断上传中状态
                    return (<div className={styles.bubble + ' menu ' + styles.attachment}>
                        <div className={styles.message} {...data}>
                            <div className={styles.attach}>
                                <div className={styles.cover}></div>
                                <div className={styles.cont}>
                                    <p className={styles.title}>{item.file.filename}</p>
                                    <p className={styles.opt}>{(item.file.size / 1024).toFixed(2)}KB
                                        {item.file.url ?
                                            <span>
                                                <span className={styles.sep}>|</span>
                                                <a href={item.file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer">
													下载
                                                </a>
                                            </span>
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>)
                } else {
                    return '附件请在手机上查看'
                }

            case ReceiveMessageTypes.sharing:
                return (<div className={styles.bubble + ' menu'}>
                    <div className={styles.message}>
                        <a href={item.body.url ? item.body.url : null} target="_blank" rel="noopener noreferrer">
                            <div className={styles.title}>[分享]{item.body.title}</div>
                            <div className={styles.extWrap}>
                                {item.body.thumb_url ?
                                    <img src={item.body.thumb_url} rel="noreferrer" alt=""/>
                                    : ''}
                                {item.body.des ?
                                    createFaceHtml({tagName: 'div', tagProps: {className: 'desc'}, values: `${item.body.url ? '' : '[请在手机上查看] '}${item.body.des}`,
                                        replace: (html)=>{
                                            return _.unescape(html)
                                        }})
                                    : ''}
                            </div>
                        </a>
                    </div>
                </div>)

            case ReceiveMessageTypes.map:
                return (<div className={styles.bubble + ' menu'}>
                    <div className={styles.message}>
                        <a href={getMapUrl(item.body)} target="_blank" rel="noopener noreferrer">
                            <div className={styles.title}>{item.content}{item.body.label}</div>
                            {item.body.thumb_url ?
                                <div className={styles.extWrap + ' ' + styles.mapExtWrap}>
                                    <img src={item.body.thumb_url} rel="noreferrer" alt=""/>
                                </div>
                                : ''}
                        </a>
                    </div>
                </div>)
                // case ReceiveMessageTypes.friends: {/*return <div>{item.content}</div>;*/
                // }
            case ReceiveMessageTypes.card:
                //TODO 名片头像显示
                return (<div className={styles.bubble + ' menu ' + styles.card}>
                    <div className={styles.cardBody}>
                        <h3>名片
                            {item.body.is_friend ?
                                <Icon type="message" className={styles.icon}/>
                                : ''
                            }
                        </h3>
                        <div className={styles.cc}>
                            <a href={item.body.big_head_img_url} target="_blank" rel="noopener noreferrer"
                                className={styles.cardAvatarWrap}>
                                <img className={styles.cardAvatar} src={item.body.head_img_url} onError={(e) => {
                                    e.target.src = DefaultAvatar
                                }} rel="noreferrer" alt=""/>
                            </a>
                            <p className={styles.title}>{item.body.nickname}</p>
                        </div>
                    </div>
                </div>)
            case ReceiveMessageTypes.note:
                let content = item.content
                // 红包
                if (item.origin_app_message_type === 2001) {
                    return (
                        <div className={`${styles.red_bubble} menu`}>
                            <div className={styles.red_cardBody}>
                                <div className={styles.red_cc}>
                                    <div className={styles.red_cardAvatarWrap}>
                                        <img
                                            alt=""
                                            className={styles.red_cardAvatar}
                                            src={require('wx/assets/images/hb.png')}
                                        />
                                    </div>
                                    <p className={styles.red_title}>{item.body.sender_title}</p>
                                    <p className={styles.red_desc}>请在手机上查收</p>
                                </div>
                                <h3>
                                    红包
                                </h3>
                            </div>
                        </div>
                    )
                }
                // 转账
                if (item.origin_app_message_type === 2000) {
                    if (item.username === item.sender.username) {
                        content = content.replace('好友', item.sender.nickname)
                    } else {
                        content = content.replace('好友', item.receiver.nickname)
                    }
                }
                return (<div className={styles.note}>
                    {
                        createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: content, replace: (html)=>{
                            return _.unescape(html)
                        }})
                    }
                    {/*{!hideBind && getBindOrder(item)}*/}
                </div>)

            default:
                return (<div className={styles.bubble + ' menu'}>
                    <div className={styles.message}>
                        {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: item.content, replace: (html)=>{
                            return _.unescape(html)
                        }})}
                    </div>
                </div>)
                //
            }
        }
        return (
            <div className={styles.chatHistory + ' ' + (this.props.cls || '')}
                style={{height: this.props.historyHeight || 600}}
                href="history">
                {this.props.loading ?
                    <div className={styles.loadingWrap}><Icon type="loading"/></div> :
                    <div>
                        {messages.length ?
                            <ul>
                                {messages.map((item, idx) => {
                                    return (
                                        <li className={styles.chatItem + ' ' + getMsgCls(item)}
                                            ref={(ref) => this['_item' + idx] = ref} key={idx} data-id={item.id}>
                                            {
                                                (item.type === ReceiveMessageTypes.note && item?.origin_app_message_type !== 2001) ?
                                                '' : <Tooltip placement="topLeft"
                                                    title={`${item.sender.nickname}${!item.is_send ? '[' + item.sender.remark_name + ']' : ''}`}>
                                                    <img src={getMsgAvatarUrl(item)}
                                                        className={styles.avatar}
                                                        onError={(e) => {e.target.src = DefaultAvatar}} rel="noreferrer" alt=""/>
                                                </Tooltip>
                                            }
                                            {getContent(item)}
                                            <div className={styles.tip + ' ' + (item.type === ReceiveMessageTypes.note ? styles.noteTipTime : '')}>
                                                <span className={styles.time}>{Helper.timestampFormat(item.create_time)}</span>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul> : <div className={styles.tipWrap}>
                                <p className={styles.tip}>没有聊天记录</p>
                            </div>
                        }
                    </div>
                }
                {bindModal ?
                    <BindOrder {...this.props} />
                    : ''}
                {this.state.gallery ?
                    <Gallery
                        onClose={this.hideGallery}
                        images={this.state.photos}
                        src={this.state.src}
                        show={this.state.gallery}
                    />
                    : ''}
            </div>
        )
    }
}

export default MessagesView
