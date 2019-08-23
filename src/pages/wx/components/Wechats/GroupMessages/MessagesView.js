/**
 * @Description
 * @author XuMengPeng
 * @date 2018/10/30
*/

'use strict'
import React from 'react'
import {Icon, Tooltip} from 'antd'
import Helper from 'wx/utils/helper'
import config from 'wx/common/config'
import styles from './MessagesView.scss'
import createFaceHtml from 'components/Face/createFaceHtml'
import Gallery from 'wx/components/Gallery'
import msgUtils, { MessageTypeKey, TransferStatus } from './parseMsgCont' // msgUtils.parseMsg
import _ from 'lodash'

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

    showGallery = (url) => {
        let photos = [], _url
        if (url && url.indexOf('?') !== -1) {
            url = url.split('?')[0]
        }
        const messages = this.props.records
        for (let i = 0, j = messages.length; i < j; i++) {
            // IMG: 3 （与单聊的处理微信聊天内容方式不同）
            if (messages[i].type === MessageTypeKey.IMG || messages[i].type === MessageTypeKey.EMOJI) {
                _url = messages[i].url
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
        const messages = this.props.records
        const getMsgCls = (item) => {
            let cls = item.type === (MessageTypeKey.SYSTEM || MessageTypeKey.INVITE_MEMBER || MessageTypeKey.MODIFY_REMARK
                || MessageTypeKey.MODIFY_REMARK || MessageTypeKey.VERIFY_USER) ? 'noteItem' : ''
            if (item.is_sender) {
                return styles.chatOut + ' ' + cls
            } else {
                return 'chatIn ' + cls
            }
        }
        const getContent = (item) => {
            const data = {'data-id': item.id}
            let { url } = item
            switch (item.type) {
                case MessageTypeKey.MSG: // 文本
                    let _content = item.content
                    if (this.props.keyword) {
                        _content = _content.replace(
                            this.props.keyword,
                            `<strong className="red" style="color:#f00">${this.props.keyword}</strong>`
                        )
                    }
                    return (<div className={styles.bubble + ' menu'} {...data}>
                        <div className={styles.message}>
                            {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: _content, replace: (html)=>{
                                    return _.unescape(html)
                                }})}
                        </div>
                    </div>)
                case MessageTypeKey.IMG: // 图片
                    if(url) {
                        return (<div className={styles.picture + ' menu'} {...data}>
                            <img onClick={this.showGallery.bind(this, url)}
                                 src={url} alt="" rel="noreferrer"/>
                        </div>)
                    }else{
                        return (<div className={styles.note}>
                            {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: '图片地址解析错误！'})}
                        </div>)
                    }
                case MessageTypeKey.NAMECARD: // 名片
                    return (<div className={styles.bubble + ' menu ' + styles.card}>
                        <div className={styles.cardBody}>
                            <h3>名片</h3>
                            <div className={styles.cc}>
                                <a href={item.body.big_head_img_url} target="_blank" rel="noopener noreferrer"
                                   className={styles.cardAvatarWrap}>
                                    <img className={styles.cardAvatar} src={item.body.head_img_url} onError={(e) => {
                                        e.target.src = DefaultAvatar
                                    }} alt="" rel="noreferrer"/>
                                </a>
                                <p className={styles.title}>{item.body.nickname}</p>
                            </div>
                        </div>
                    </div>)
                case MessageTypeKey.EMOJI: // 表情
                    return (
                            Helper.getIn(item, 'body.cdn_url') ? (<div className={styles.picture + ' menu'} {...data}>
                                    <img src={Helper.getIn(item, 'body.cdn_url')} alt="" rel="noreferrer"/>
                                </div>)
                                : (<div className={styles.bubble + ' menu'} {...data}>
                                    <div className={styles.message}>
                                        {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: '[该表情]暂未支持请在手机上查看'})}
                                    </div>
                                </div>)
                    )

                case MessageTypeKey.VIDEO_FILE: // 视频文件
                    if (url) {
                        return (<div className={styles.bubble + ' menu'} {...data}>
                            <video width="320" height="240" controls preload="meta">
                                <source src={url} type="video/mp4"/>
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
                case MessageTypeKey.LINK: // 链接, 分享, 腾讯系应用QQ、京东分享
                case MessageTypeKey.USER_SHARING:
                case MessageTypeKey.LIMIT_SHARING:
                    return (<div className={styles.bubble + ' menu'}>
                        <div className={styles.message}>
                            <a href={item.body.url ? item.body.url : null} target="_blank" rel="noopener noreferrer">
                                <div className={styles.title}>[分享]{item.body.title}</div>
                                <div className={styles.extWrap}>
                                    {item.body.thumb_url ?
                                        <img src={item.body.thumb_url} alt="" rel="noreferrer"/>
                                        : ''}
                                    {item.body.des ?
                                        createFaceHtml({tagName: 'div', tagProps: {className: 'desc'}, values: `${item.body.url ? '' : '[请在手机上查看] '}${item.body.des}`})
                                        : ''}
                                </div>
                            </a>
                        </div>
                    </div>)
                case MessageTypeKey.RED_ENVELOPE: // 红包
                    return (
                        <div className={`${styles.red_bubble} menu`}>
                            <div className={styles.red_cardBody}>
                                <div className={styles.red_cc}>
                                    <div className={styles.red_cardAvatarWrap}>
                                        <img
                                            alt=""
                                            className={styles.red_cardAvatar}
                                            src={require('wx/assets/images/hb.png')}
                                            rel="noreferrer"
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
                /*case MessageTypeKey.TRANSFER: // 转账
                    if (item.body.pay_sub_type === TransferStatus.RECEIVED) {
                        return (
                            <div
                                className={`${styles.bubble} menu ${styles.card} ${styles.red} ${styles.transfer} ${styles.transferReceived}`}>
                                <div className={styles.cardBody}>
                                    <div className={styles.cc}>
                                        <div className={styles.cardAvatarWrap}>
                                            <Icon type="check-circle-o" className={styles.cardAvatar} />
                                        </div>
                                        <p className={styles.title}>已收钱</p>
                                        <p className={styles.desc}>{helper.toString(item.body.fee_desc)}</p>
                                    </div>
                                    <h3>
                                        {helper.toString(item.body.title)}
                                    </h3>
                                </div>
                            </div>
                        )
                    } else {
                        return (
                            <div className={`${styles.bubble} menu ${styles.card} ${styles.red} ${styles.transfer}`}>
                                <div className={styles.cardBody}>
                                    <div className={styles.cc}>
                                        <div className={styles.cardAvatarWrap}>
                                            <Icon type="swap" className={styles.cardAvatar} />
                                        </div>
                                        <p className={styles.title}>{item.body.fee_desc}</p>
                                        <p className={styles.desc}>请在手机上查收</p>
                                    </div>
                                    <h3>
                                        {helper.toString(item.body.title)}
                                    </h3>
                                </div>
                            </div>
                        )
                    }*/
                case MessageTypeKey.INVITE_MEMBER: // 拉人进群提示消息
                    return (<div className={styles.note}>
                        {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: item.body.title ? item.body.title: '[请在手机上查看] '})}
                    </div>)
                case MessageTypeKey.SYSTEM: // 系统消息
                    return (<div className={styles.note}>
                        {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: item.body.title})}
                    </div>)
                default: // 其他类型（未支持解析的消息或其他提示消息）
                    return (
                        item.body.isNote ? (<div className={styles.note}>
                            {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: item.body.msg})}
                        </div>): (<div className={styles.bubble + ' menu'} {...data}>
                            <div className={styles.message}>
                                {createFaceHtml({tagName: 'div', tagProps: {className: ''}, values: item.body.msg})}
                            </div>
                        </div>)
                    )

            }
        }
        return (
            <div className={styles.chatHistory + ' ' + (this.props.cls || '')}
                style={{height: this.props.historyHeight || 300}}
                href="history">
                {this.props.loading ?
                    <div className={styles.loadingWrap}><Icon type="loading"/></div> :
                    <div>
                        {messages.length ?
                            <ul>
                                {messages.map((item, idx) => {
                                    let parseCont = msgUtils.parseMsg(item)
                                    return (
                                        <li className={styles.chatItem + ' ' + getMsgCls(item)}
                                            ref={(ref) => this['_item' + idx] = ref} key={idx}>
                                            {!parseCont.body.isNote ? <Tooltip placement="topLeft"
                                                    title={item.nickname}>
                                                    <img src={item.header_img_url}
                                                        className={styles.avatar}
                                                        onError={(e) => {e.target.src = DefaultAvatar}} alt="" rel="noreferrer"/>
                                                </Tooltip>
                                                : ''}
                                                <div>{ parseCont.body.isNote }</div>
                                            { getContent(parseCont) }
                                            <div className={styles.tip + ' ' + (parseCont.body.isNote ? styles.noteTipTime : '')}>
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
