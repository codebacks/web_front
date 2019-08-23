import React, {Component} from 'react'
import PropTypes from "prop-types"
import {Empty} from 'antd'
import _ from 'lodash'
import InfiniteScroller from 'components/InfiniteScroller/index'
import helper from 'utils/helper'
import Loading from '../Loading'
import config from 'common/config'
import util from '../util'
import {MessageTypes, messageComponentsMap, SearchLimit, DefaultItemHeight} from '../config'
import styles from './index.less'

const {DefaultAvatar} = config
const defaultHeight = 500

export default class SearchView extends Component {
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
        onInfiniteScrollerChange: PropTypes.func,
        activeRecord: PropTypes.object,
    }

    static defaultProps = {
        renderEmpty: ()=> <Empty/>,
        runwayItems: SearchLimit,
        bottomFetchDistance: 10,
        disableBottomFetch: false,
        disableTopFetch: false,
        useFetchLoading: true,
        isScrollToBottom: false,
    }

    componentDidMount() {
        this.initScroll = true
    }

    componentWillUnmount() {
    }

    getContent = (item) => {
        const {keyword, activeRecord} = this.props

        const option = {
            record: item,
            keyword: keyword,
            activeRecord: activeRecord,
        }

        if (messageComponentsMap[item.type]) {
            return messageComponentsMap[item.type].createComponent(option)
        }
        // 默认文本类型
        return messageComponentsMap[MessageTypes.text].createComponent(option)
    }

    getItem = (item, active, members) => {
        const {keyword, isContext} = this.props

        let memberInfo = null

        if(_.get(item, 'is_sender')) { // 微信所属者
            let wxid = util.getGroupUsername(active)
            memberInfo = members && members.find((i) => {
                return i.username === wxid
            })
            if (!memberInfo) {
                memberInfo = {username: wxid}
            }
        } else {
            let wxid = _.get(item, 'wechat_id', '').split(':')[0]
            memberInfo = Array.isArray(members) && members.length && members.find((i) => {
                return i.username === wxid
            })
            if(!memberInfo){
                memberInfo = {username: wxid}
            }
        }

        return <div className={`${styles.item} ${this.isActiveItem(item) ? styles.active : ''}`}>
            <img src={util.getGroupAvatar(item, memberInfo)}
                className={styles.avatar}
                onError={(e) => {e.target.src = DefaultAvatar}}
                rel="noreferrer"
                alt=""
            />
            <div className={styles.mainBody}>
                <div className={styles.top}>
                    <span className={styles.nickname}>
                        {util.getGroupNickname(item, memberInfo)}
                    </span>
                    <div className={styles.time}>
                        {helper.timestampFormat(this.getCreateTime(item))}
                        {isContext && this.getItemType(item) === MessageTypes.text && keyword
                            ? <div className={styles.context}
                                onClick={()=>{this.viewContext(item)}}>查看上下文</div> : null}
                    </div>
                </div>
                <div className={styles.content}>
                    {this.getContent(item)}
                </div>
            </div>

        </div>
    }

    isActiveItem = (item) => {
        const {activeRecord, isContext} = this.props
        return !isContext && activeRecord && item.create_time === util.getCreateTime(activeRecord)
    }

    getItemType = (item) => {
        return item.type
    }

    getCreateTime = (item) => {
        return item.create_time
    }

    viewContext = (item) => {
        this.props.onViewContext(item)
    }

    scrollerItemContent = ({data, id}) => {
        const {activeSession: active, members} = this.props
        if (members) {
            return <div key={id} className={styles.messageItem}>
                {this.getItem(data, active, members)}
            </div>
        }
    }

    onInfiniteScrollerChange = ({scrollToBottom, firstLoadCount, itemsLen}) => {
        if (this.props.isScrollToBottom && this.initScroll && firstLoadCount === 0 && itemsLen > 0) {
            scrollToBottom()
            this.initScroll = false
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
            total,
        } = this.props

        const scrollHeight = total ? listHeight - 41 : listHeight

        return (
            <div className={styles.searchView}>
                {total ? <p className={styles.tip}>
                    <span className={styles.stress}>{total}</span> 条相关聊天记录
                </p> : null}
                <div style={{height: scrollHeight || defaultHeight}}
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
                </div>
            </div>
        )
    }
}
