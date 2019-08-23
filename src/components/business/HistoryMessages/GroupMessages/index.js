import React, {PureComponent} from 'react'
import {connect} from 'dva'
import {Input, Radio, Button} from 'antd'
import moment from 'moment'
import DateRange from 'components/DateRange/index'
import GroupMessageView from '../GroupMessageView'
import GroupSearchView from '../GroupSearchView'
import MediaView from '../MediaView'
import GroupAtView from '../GroupAtView'
import GroupViewContext from '../GroupViewContext'
import _ from 'lodash'
import qs from 'qs'
import config from 'common/config'
import helper from 'utils/helper'
import API from 'common/api/messages'
import request from 'utils/request'
import util from '../util'
import {MessageTypes, MessageLimit, MediaLimit, showNoMoreLimit} from '../config'
import styles from './index.less'

const RadioGroup = Radio.Group
const {DateFormat} = config

@connect(({group_messages, group_search_messages}) => ({
    group_messages,
    group_search_messages,
}))
export default class Messages extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            visible: false, // 是否显示上下文
            activeRecord: {}, // 上下文选中的record
        }
        this.initMessages = true // fetch消息的标志
    }

    componentDidMount() {
        this.getGroupMembers()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.fromUin !== prevProps.fromUin || (this.props.toUsername !== prevProps.toUsername)) {
            new Promise((resolve, reject) => {
                this.reset()
                resolve()
            }).then(() => {
                this.getGroupMembers()
                this.handleSearch()
            })
        }
    }

    componentWillUnmount() {
        this.reset()
    }

    getGroupMembers = () => {
        // 获取群成员
        const {fromUin, toUsername} = this.props
        if (helper.isChatRoom(this.props.toUsername)) {
            this.props.dispatch({
                type: 'group_messages/groupMembers',
                payload: {
                    fromUin,
                    toUsername,
                },
                callback: ()=>{
                    if(this.messageView){
                        this.messageView.infiniteScrollerForceUpdate()
                    }
                }
            })
        }
    }

    reset = () => {
        this.props.dispatch({
            type: 'group_messages/resetParams',
        })
        this.props.dispatch({
            type: 'group_search_messages/resetParams'
        })
        this.props.dispatch({
            type: 'group_search_messages/setProperty',
            payload: {
                searchParams: {},
                total: []
            }
        })
        this.dateRange.setDate(null, null)
    }

    fetchData = async (type) => {
        const keyword = this.props.group_search_messages.params.key
        if(keyword || (this.initMessages && this.props.keyword)) {
            return await this.fetchKeywordData(type)
        } else {
            return await this.fetchNormalData(type)
        }
    }

    fetchAtData = async (type) => { // 请求带有is_at参数的serch接口
        return await this.fetchKeywordData(type, true)
    }

    fetchNormalData = async (type) => {
        // console.log('fetchNormalData')
        const {params: messagesParams, list: prevList, total} = this.props.group_messages
        const currentType = messagesParams.type

        if([MessageTypes.image, MessageTypes.video].includes(currentType)) {
            messagesParams.limit = MediaLimit
        } else {
            messagesParams.limit = MessageLimit
        }

        const namespace = 'group_messages'
        let data = []

        if (type === 'init') {
            const {fromUin, toUsername} = this.props
            const params = {
                ...messagesParams,
                from_uin: fromUin,
                to_username: toUsername,
                offset: 0,
            }
            // console.log('init', params)
            const {responseData, convertedData} = await this.getMessagesData(namespace, currentType, params)
            data = currentType && currentType !== MessageTypes.transaction ? convertedData : responseData
            this.concatItems(currentType, [], responseData, convertedData)
        } else if (type === 'up') {
            let params = {...messagesParams}
            const offset = params.offset + params.limit
            if (offset && offset < total) {
                params.offset = offset
                // console.log('up', params)
                const {responseData, convertedData} = await this.getMessagesData(namespace, currentType, params)
                data = currentType && currentType !== MessageTypes.transaction ? convertedData : responseData
                this.concatItems(currentType, prevList, responseData, convertedData)
            } else {
                console.log('up 没有更多了')
            }
        } else if (type === 'down') {
            let params = {...messagesParams}
            const offset = params.offset + params.limit
            if (offset && offset < total) {
                params.offset = offset
                // console.log('down', params)
                const {responseData, convertedData} = await this.getMessagesData(namespace, currentType, params)
                data = currentType && currentType !== MessageTypes.transaction ? convertedData : responseData
                this.concatItems(currentType, prevList, responseData, convertedData)
            } else {
                console.log('down 没有更多了')
            }
        }
        return data
    }

    fetchKeywordData = async (type, isAt=false) => {
        // console.log('fetchKeywordData')
        const {params: messagesParams} = this.props.group_messages
        let {params: searchMessagesParams, total} = this.props.group_search_messages
        const namespace = 'group_search_messages'
        const startTime = messagesParams.start_create_time
        const endTime = messagesParams.end_create_time
        let data = []

        if (this.initMessages) {
            const {keyword} = this.props
            if (keyword) {
                searchMessagesParams.key = keyword
            }
            this.initMessages = false
        }

        searchMessagesParams = {
            ...searchMessagesParams,
            start_time: startTime ? moment(startTime).format(DateFormat) + ' 00:00:00' : '',
            end_time: endTime ? moment(endTime).format(DateFormat) + ' 23:59:59' : '',
            type: 1, // messagesParams.type
            is_at: isAt ? 1: undefined, // @我的
        }

        if (type === 'init') {
            const {fromUin, toUsername} = this.props
            const params = {
                ...searchMessagesParams,
                uin: fromUin,
                chatroom_id: toUsername,
                offset: 0,
            }
            data = await this.getKeywordMessagesData(namespace, params)
        } else if (type === 'up') {
            let params = {...searchMessagesParams}
            const offset = params.offset + params.limit
            if (offset && offset < total) {
                params.offset = offset
                data = await this.getKeywordMessagesData(namespace, params)
                // console.log('up', params)
            } else {
                console.log('search up 没有更多了')
            }
        } else if (type === 'down') {
            let params = {...searchMessagesParams}
            const offset = params.offset + params.limit
            if (offset && offset < total) {
                params.offset = offset
                // console.log('down', params)
                data = await this.getKeywordMessagesData(namespace, params)
            } else {
                console.log('search down 没有更多了')
            }
        }
        return data
    }

    getMessagesData = async (namespace, type, params) => {
        let {data: responseData = [], pagination = {}} = await this.loadMessages(params)
        if (Array.isArray(responseData) && responseData.length) {
            this.setProperty(namespace, params, pagination)
        }
        const parsedData = util.parseMessages(responseData)
        if (!type || type === MessageTypes.transaction) {
            if ((pagination.rows_found > showNoMoreLimit && pagination.rows_found <= pagination.limit)
                || (params.offset >= params.limit && params.offset + params.limit >= pagination.rows_found)) {
                parsedData.unshift(this.getExtraData())
            }
        }
        return {responseData: parsedData, convertedData: _.cloneDeep(parsedData).reverse()}
    }

    getKeywordMessagesData = async (namespace, params) => {
        let {data: responseData = [], pagination = {}} = await this.loadKeywordMessages(params)
        let data = []
        if (Array.isArray(responseData) && responseData.length) {
            data = responseData
            this.setProperty(namespace, params, pagination)
        }
        return util.parseMessages(data)
    }

    getExtraData = () => {
        return {
            isExtra: true
        }
    }

    concatItems = (currentType, prevList, responseData, convertedData) => {
        if (!currentType) {
            this.pushItems(currentType, prevList, convertedData)
        } else {
            this.unshiftItems(currentType, prevList, responseData)
        }
    }

    unshiftItems = (type, prevList, data) => {
        const list = data.concat(prevList)
        this.setList(list)
        this.pushImages(type, data, !prevList.length)
    }

    pushItems = (type, prevList, data) => {
        const list = prevList.concat(data)
        this.setList(list)
        this.pushImages(type, data, !prevList.length)
    }

    pushImages = (type, data, isInit) => {
        let {images: prevImages} = this.props.group_messages
        if (isInit) {
            prevImages = []
        }
        let parseImages = []
        if (!type) {
            parseImages = util.parseImages(data)
        } else if (type === MessageTypes.image) {
            parseImages = util.parseImages(_.cloneDeep(data).reverse())
        }
        const images = prevImages.concat(parseImages)
        this.setImages(images)
    }

    setList = (list) => {
        this.props.dispatch({
            type: 'group_messages/setProperty',
            payload: {
                list: list
            }
        })
    }

    setImages = (images) => {
        this.props.dispatch({
            type: 'group_messages/setProperty',
            payload: {
                images: images
            }
        })
    }

    loadMessages = async (params) => {
        try {
            const query = this.getQueryObj(params, ['from_uin', 'to_username'])
            return await request(`${helper.format(API.groupRawMessages.url, {
                uin: params.from_uin,
                username: params.to_username
            })}?${qs.stringify(query)}`)
        } catch (err) {
            console.log(err)
        }
    }

    loadKeywordMessages = async (params) => {
        try {
            const query = this.getQueryObj(params, ['uin'])
            const res = await request(`${helper.format(API.groupSearchMessages.url, {
                uin: params.uin,
            })}?${qs.stringify(query)}`)
            this.props.dispatch({
                type: 'group_search_messages/setProperty',
                payload: {
                    searchParams: params,
                    total: res.pagination && res.pagination.rows_found || 0,
                }
            })
            return res
        } catch(err) {
            console.log(err)
        }
    }

    getQueryObj = (params, exclusion) =>{
        return JSON.parse(JSON.stringify(params, (key, value) => {
            if (exclusion.includes(key)) {
                return undefined
            } else {
                return value
            }
        }))
    }

    setProperty = (namespace, params, pagination) => {
        this.props.dispatch({
            type: `${namespace}/setProperty`,
            payload: {
                params: {
                    ...params,
                    ...{
                        offset: pagination.offset
                    }
                },
                total: pagination.rows_found,
            }
        })
    }

    handleInputChange = (e) => {
        let params = {...this.props.group_search_messages.params}
        const value = e.target.value.trim()
        params.key = value
        new Promise((resolve, reject) => {
            this.props.dispatch({
                type: 'group_search_messages/setParams',
                payload: {params: params},
            })
            resolve()
        }).then(()=>{
            if (!value && this.props.group_search_messages.searchParams.key) {
                this.handleSearch()
            }
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.group_messages.params}
        if (startValue) {
            params.start_create_time = startValue.startOf('day').valueOf()
        } else {
            params.start_create_time = null
        }
        if (endValue) {
            params.end_create_time = endValue.endOf('day').valueOf()
        } else {
            params.end_create_time = null
        }
        this.props.dispatch({
            type: 'group_messages/setParams',
            payload: {
                params: params
            }
        })
    }

    handleChangeType = (e) => {
        const type = e.target.value
        let params = {...this.props.group_messages.params}
        params.type = type
        new Promise((resolve, reject)=>{
            this.props.dispatch({
                type: 'group_messages/setParams',
                payload: {params: params},
            })
            this.resetSearchParams()
            resolve()
        }).then(()=>{
            this.handleSearch()
        })
    }

    handleSearch = () => {
        const {visible} = this.state
        if(visible) {
            this.hideContext()
        }
        const type = this.props.group_messages.params.type || ''
        const {params: {key: keyword}, searchParams} = this.props.group_search_messages

        new Promise((resolve, reject)=>{
            if (!keyword && Object.keys(searchParams).length) {
                this.resetSearchParams()
            } else {
                this.setSearchParams({key: keyword})
            }
            resolve()
        }).then(()=>{
            const messageTypes = ['', MessageTypes.transaction]
            const mediaTypes = [MessageTypes.image, MessageTypes.video]
            const isAtTypes = [MessageTypes.text] // @我的
            if (keyword) {
                this.searchView.infiniteScrollerRefresh()
            } else if (messageTypes.includes(type)) {
                this.messageView.infiniteScrollerRefresh()
            } else if (mediaTypes.includes(type)) {
                this.mediaView.infiniteScrollerRefresh()
            }else if (isAtTypes.includes(type)) { // @我的
                this.groupAtView.infiniteScrollerRefresh(type)
            }
        })
    }

    resetSearchParams = () => {
        this.props.dispatch({
            type: 'group_search_messages/resetSearchParams',
        })
    }

    setSearchParams = (params) => {
        this.props.dispatch({
            type: 'group_search_messages/setProperty',
            payload: {
                searchParams: params,
            }
        })
    }

    viewContext = (item) => {
        this.setState({
            visible: true,
            activeRecord: item
        })
    }

    hideContext = () => {
        this.setState({
            visible: false,
            activeRecord: {}
        })
    }

    getView = (type) => {
        const {searchParams: {key: keyword}, total} = this.props.group_search_messages
        const {images, audio} = this.props.group_messages
        const {activeSession, contentHeight} = this.props
        const listHeight = contentHeight - 100
        const baseOption = {
            useFetchLoading: true,
            onFetch: this.fetchData,
            activeSession: activeSession,
            listHeight: listHeight,
            images: images,
            audio: audio,
            list: this.props.group_messages.list
        }

        const scrollOption = this.getScrollOption(type)

        const option = {
            ...scrollOption,
            ...baseOption
        }

        if(keyword) {
            return <GroupSearchView {...this.props}
                {...option}
                ref={this.setSearchView}
                total={total}
                isContext={true}
                keyword={keyword}
                isScrollToBottom={false}
                onViewContext={this.viewContext}
                members={this.props.group_messages?.groupMembers}
            />
        }

        switch (type) {
            case MessageTypes.image:  // 图片/视频
            case MessageTypes.video:
                return <MediaView {...this.props}
                    ref={this.setMediaView}
                    runwayItems={MediaLimit}
                    {...option}
                />
            case MessageTypes.text: // @我的
                return <GroupAtView {...this.props}
                    ref={this.setGroupAtView}
                    isScrollToBottom={false}
                    members={this.props.group_messages?.groupMembers}
                    {...option}
                    onFetch={this.fetchAtData}
                />
            default:
                return <GroupMessageView {...this.props}
                    ref={this.setMessageView}
                    isScrollToBottom={true}
                    members={this.props.group_messages?.groupMembers}
                    {...option}
                />
        }
    }

    getScrollOption = (type) => {
        const keyword = this.props.group_search_messages.params.key
        if (keyword || (type && type !== MessageTypes.transaction)) {
            return {
                disableBottomFetch: false,
                disableTopFetch: true,
            }
        }
        return {
            disableBottomFetch: true,
            disableTopFetch: false,
        }
    }

    setMessageView = (node) => {
        this.messageView = node
    }

    setSearchView = (node) => {
        this.searchView = node
    }

    setMediaView = (node) => {
        this.mediaView = node
    }

    setGroupAtView = (node) => {
        this.groupAtView = node
    }

    render() {
        const {params} = this.props.group_messages
        const {params: keywordParams, searchParams: keywordSearchParams} = this.props.group_search_messages
        const {contentHeight, activeSession} = this.props
        const {visible, activeRecord} = this.state

        return (
            <div className={styles.history}>
                <div className={styles.searchPanel}>
                    <div className={styles.form}>
                        <div className={styles.formItem}>
                            <span className={styles.label}>关键字：</span>
                            <div className={styles.item}>
                                <Input allowClear
                                    placeholder="请输入搜索关键字"
                                    value={keywordParams.key}
                                    onChange={this.handleInputChange}
                                    onPressEnter={this.handleSearch}
                                />
                            </div>
                        </div>
                        <div className={styles.formItem}>
                            <span className={styles.label}>日期：</span>
                            <div className={styles.item}>
                                <DateRange {...this.props}
                                    ref={(node) => {
                                        this.dateRange = node
                                    }}
                                    startValue={params.start_create_time ? moment(params.start_create_time, DateFormat) : null}
                                    endValue={params.end_create_time ? moment(params.end_create_time, DateFormat) : null}
                                    maxToday={true}
                                    maxRangeDays={90}
                                    onChange={this.handleChangeDate}
                                />
                            </div>
                        </div>
                        <Button type="primary" className={styles.btn} onClick={this.handleSearch}>搜索</Button>
                    </div>
                </div>
                <div className={styles.cash}>
                    <RadioGroup onChange={this.handleChangeType}
                        value={params.type}
                        className={keywordParams.key ? styles.hidden : ''}>
                        <Radio value="">全部</Radio>
                        <Radio value={MessageTypes.transaction}>红包与转账</Radio>
                        <Radio value={MessageTypes.image}>图片</Radio>
                        <Radio value={MessageTypes.video}>视频</Radio>
                        <Radio value={MessageTypes.text}>只看@我</Radio>
                    </RadioGroup>
                </div>
                <div className={styles.messages}>
                    {this.getView(params.type)}
                </div>
                {
                    keywordSearchParams.key && visible ?
                        <GroupViewContext {...this.props}
                            keyword={keywordParams.key}
                            contentHeight={contentHeight}
                            activeSession={activeSession}
                            activeRecord={activeRecord}
                            onCancel={this.hideContext}
                        /> : null
                }
            </div>
        )
    }
}

