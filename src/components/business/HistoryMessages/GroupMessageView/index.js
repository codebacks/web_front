import React, {Component} from 'react'
import PropTypes from "prop-types"
import {Divider, Empty} from 'antd'
import _ from 'lodash'
import InfiniteScroller from 'components/InfiniteScroller/index'
import helper from 'utils/helper'
import Loading from '../Loading'
import ImageViewer from '../ImageViewer'
import VideoViewer from '../VideoViewer'
import config from 'common/config'
import util from '../util'
import {MessageTypes, messageComponentsMap, MessageLimit, DefaultItemHeight} from '../config'
import styles from './index.less'

const {DefaultAvatar} = config
const defaultHeight = 500

export default class MessageView extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    static propTypes = {
        onFetch: PropTypes.func.isRequired,
        renderEmpty: PropTypes.func,
        runwayItems: PropTypes.number,
        bottomFetchDistance: PropTypes.number,
        disableBottomFetch: PropTypes.bool,
        disableTopFetch: PropTypes.bool,
        useFetchLoading: PropTypes.bool,
        isScrollToBottom: PropTypes.bool,
        isContext: PropTypes.bool,
        onInfiniteScrollerChange: PropTypes.func,
        activeRecord: PropTypes.object,
    }

    static defaultProps = {
        renderEmpty: ()=> <Empty/>,
        runwayItems: MessageLimit,
        bottomFetchDistance: 10,
        disableBottomFetch: false,
        disableTopFetch: false,
        useFetchLoading: true,
        isScrollToBottom: false,
        isContext: false,
    }

    componentDidMount() {
        this.initScroll = true
    }

    componentWillUnmount() {
    }

    onImageClick = (url, uuid) => {
        this.imageViewer.showGallery(url, uuid)
    }

    onVideoClick = (url) => {
        this.videoViewer.handlePlay(url)
    }

    getContent = (item) => {
        const {keyword, activeRecord, audio} = this.props

        const option = {
            record: item,
            keyword: keyword,
            onImageClick: this.onImageClick,
            onVideoClick: this.onVideoClick,
            audio: audio,
            activeRecord: activeRecord,
            onImageLoad: this.loadImage,
        }
        if (messageComponentsMap[item.type]) {
            return messageComponentsMap[item.type].createComponent(option)
        }
        // 默认文本类型
        return messageComponentsMap[MessageTypes.text].createComponent(option)
    }

    loadImage = (payload, callback) => {
        this.props.dispatch({
            type: 'group_messages/unload',
            payload: payload,
            callback: (data) => {
                callback && callback(data)
            }
        })
    }


    getAvatar = (item, memberInfo) => {
        return <img src={util.getGroupAvatar(item, memberInfo)}
            className={styles.avatar}
            onError={(e) => {e.target.src = DefaultAvatar}}
            rel="noreferrer"
            alt=""
        />
    }

    getTime = (item) =>{
        return <div className={styles.time}>
            {helper.timestampFormat(this.getCreateTime(item))}
        </div>
    }

    getGroupNickname = (item, memberInfo) => {
        return <div className={styles.nickname}>
            {util.getGroupNickname(item, memberInfo)}
        </div>
    }

    getItemContent = (item) => {
        return <div className={styles.content}>
            {this.getContent(item)}
        </div>
    }

    getItem = (item, active, members) => {
        if (!item.is_sender && util.isNotification(item.type)) { // 通知消息
            return <div className={styles.noteItem}>
                {this.getContent(item)}
                {this.getTime(item)}
            </div>
        } else if(item.is_sender) { // 微信所属者
            let wxid = util.getGroupUsername(active)
            let memberInfo = members && members.find((i) => {
                return i.username === wxid
            })
            if(!memberInfo){
                memberInfo = {username: wxid}
            }
            console.log('is_sender', active, memberInfo)

            return <div className={`${styles.item} ${styles.from} ${this.isActiveItem(item) ? styles.active : ''}`}>
                <div className={styles.mainBody}>
                    <div className={styles.top}>
                        {this.getTime(item)}
                        {this.getGroupNickname(item, memberInfo)}
                    </div>
                    {this.getItemContent(item)}
                </div>
                {this.getAvatar(item, memberInfo)}
            </div>
        } else { // 非微信所属者和非通知消息类型（其他群成员）
            let wxid = item.text.split(':')[0]
            let memberInfo = Array.isArray(members) && members.length && members.find((i) => {
                return i.username === wxid
            })
            if(!memberInfo){
                memberInfo = {username: wxid}
            }
            return <div className={`${styles.item} ${styles.target} ${this.isActiveItem(item) ? styles.active : ''}`}>
                {this.getAvatar(item, memberInfo)}
                <div className={styles.mainBody}>
                    <div className={styles.top}>
                        {this.getGroupNickname(item, memberInfo)}
                        {this.getTime(item)}
                    </div>
                    {this.getItemContent(item)}
                </div>
            </div>
        }
    }

    isActiveItem = (item) => {
        const {activeRecord, isContext} = this.props
        return !isContext && activeRecord && item.create_time === util.getCreateTime(activeRecord)
    }

    getCreateTime = (item) => {
        return item.create_time
    }

    scrollerItemContent = ({data, id}) => {
        const {activeSession, members} = this.props
        if(members) {
            if (data.isExtra) {
                return <Divider className={styles.noMore}>无更多内容</Divider>
            }
            return <div key={id} className={styles.messageItem}>
                {this.getItem(data, activeSession, members)}
            </div>
        }
    }

    onInfiniteScrollerChange = ({scrollToBottom, firstLoadCount, itemsLen}) => {
        const {onInfiniteScrollerChange, isScrollToBottom} = this.props
        if (onInfiniteScrollerChange && typeof onInfiniteScrollerChange === 'function') {
            onInfiniteScrollerChange(this.infiniteScrollerRef, firstLoadCount, itemsLen)
        } else {
            if (isScrollToBottom && this.initScroll && firstLoadCount === 0 && itemsLen > 0) {
                scrollToBottom()
                this.initScroll = false
            }
        }
    }

    infiniteScrollerForceUpdateRenderItems = ()=>{
        this.infiniteScrollerRef.forceUpdateRenderItems()
    }

    infiniteScrollerForceUpdate = ()=>{
        if(!this.initScroll){
            this.infiniteScrollerRef.forceUpdateRenderItems()
        }
    }

    infiniteScrollerRefresh = () => {
        this.initScroll = true
        this.infiniteScrollerRef.refresh()
    }

    getInfiniteScrollerRef = (node) => {
        this.infiniteScrollerRef = node
    }

    renderLoading = (loading) => {
        return <Loading loading={loading}/>
    }

    render() {
        const {onFetch, renderEmpty,
            useFetchLoading, runwayItems, bottomFetchDistance,
            disableBottomFetch, disableTopFetch,
            listHeight,
            images,
        } = this.props

        return (
            <div className={styles.messageView}>
                <div style={{height: listHeight || defaultHeight}}
                >
                    <InfiniteScroller
                        ref={this.getInfiniteScrollerRef}
                        fetchData={async ({type}) => {
                            return await onFetch(type)
                        }}
                        defaultItemHeight={DefaultItemHeight}
                        renderEmpty={renderEmpty}
                        runwayItems={runwayItems}
                        useFetchLoading={useFetchLoading}
                        bottomFetchDistance={bottomFetchDistance}
                        disableBottomFetch={disableBottomFetch}
                        disableTopFetch={disableTopFetch}
                        renderLoading={this.renderLoading}
                        onChange={this.onInfiniteScrollerChange}
                        scrollerItemContent={this.scrollerItemContent}
                    />
                    <ImageViewer ref={(node)=>{this.imageViewer = node}} images={images}/>
                    <VideoViewer ref={(node)=>{this.videoViewer = node}}/>
                </div>
            </div>
        )
    }
}
