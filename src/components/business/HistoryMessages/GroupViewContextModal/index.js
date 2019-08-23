/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'
import _ from 'lodash'
import qs from 'qs'
import helper from 'utils/helper'
import request from 'utils/request'
import API from 'common/api/messages'
import GroupMessageView from '../GroupMessageView'
import {MessageLimit, showNoMoreLimit} from '../config'
import util from '../util'
import styles from './index.less'
import {connect} from 'dva/index'

@hot(module)
@connect(({group_messages, loading}) => ({
    group_messages,
}))
@toggleModalWarp({
    title: '聊天记录',
    width: 910,
    destroyOnClose: true,
    maskClosable: false,
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        this.state = {
            params: {
                from_uin: '',
                to_username: '',
                location_create_time: '', // 需要定位的消息 创建时间戳，13位
                start_create_time: '', // 消息开始时间戳，13位，结果不包含当前时间戳
                end_create_time: '', // 消息截止时间戳，13位，结果不包含当前时间戳
                type: undefined, // 消息类型
                order_by: 'create_time', // -create_time 排序，只支持create_time升序或降序，降序前面加-,升序不需要加
                limit: MessageLimit,
                offset: 0,
            },
            total: 0,
            disableTopFetch: false,
            disableBottomFetch: false,
        }
        this.initData = []
        this.topOffset = 0
        this.bottomOffset = 0
    }

    componentDidMount() {
        this.initMessageView = true
        this.getGroupMembers()
    }

    getGroupMembers = () => {
        const {activeSession} = this.props
        const toUsername = this.getToUsername(activeSession)

        if (helper.isChatRoom(toUsername)) {
            this.props.dispatch({
                type: 'group_messages/groupMembers',
                payload: {
                    fromUin: this.getFromUin(activeSession),
                    toUsername,
                },
                callback: () => {
                    if (this.messageView && !this.initMessageView) {
                        this.messageView.infiniteScrollerForceUpdateRenderItems()
                    }
                },
            })
        }
    }

    handleOk = (e) => {
        e.preventDefault()
        this.props.onModalCancel()
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    getInitParams = () => {
        const {activeSession, activeRecord} = this.props
        let params = {...this.state.params}
        params.location_create_time = util.getCreateTime(activeRecord)
        params.from_uin = this.getFromUin(activeSession)
        params.to_username = this.getToUsername(activeSession)
        return params
    }

    getFromUin = (activeSession) => {
        return _.get(activeSession, 'from.uin') || _.get(activeSession, 'from2.uin')
    }

    getToUsername = (activeSession) => {
        return _.get(activeSession, 'target.username')
    }

    fetchData = async (type) => {
        const {list: prevList} = this.props.group_messages
        let params = {...this.state.params}
        const {total} = this.state
        let data = []

        if (type === 'init') {
            params = this.getInitParams()
            params = {
                ...params,
                offset: 0,
            }

            let res = await this.loadMessages('init', params)
            let {data: responseData, pagination} = res
            if (responseData && responseData.length) {
                this.setProperty('bottom', params, pagination)
                data = responseData

                this.topOffset = pagination.offset
                this.bottomOffset = pagination.offset

                // 总数据一页
                if (pagination.rows_found <= pagination.limit) {
                    this.setState({
                        disableTopFetch: true,
                        disableBottomFetch: true,
                    })
                    if (pagination.rows_found > showNoMoreLimit) {
                        this.concatData(data)
                    }
                    // 返回的数据不到一页
                }else if (pagination.offset + pagination.limit >= total && data.length < pagination.limit) {
                    this.setState({
                        disableBottomFetch: true,
                    })
                    const {limit, offset} = pagination
                    params.offset = offset - limit
                    let res2 = await this.loadMessages('top', params)

                    this.setProperty('top', params, res2.pagination)
                    data = res2.data.concat(data)
                    // 无更多内容
                    if (params.offset === 0) {
                        this.concatData(data)
                    }

                    // 搜索的消息刚好在第一页
                }else if (pagination.offset === 0) {
                    this.setState({
                        disableTopFetch: true,
                    })
                    this.concatData(data)
                }else {
                    const index = this.getActiveIndex(data)
                    if (index / params.limit === 0) {
                        const {limit, offset} = pagination
                        params.offset = offset - limit
                        let res2 = await this.loadMessages('top', params)
                        this.setProperty('top', params, res2.pagination)
                        data = res2.data.concat(data)
                        // 无更多内容
                        if (params.offset === 0) {
                            this.concatData(data)
                        }
                    }
                }
            }
            this.pushItems([], _.cloneDeep(data))
            this.initData = data
            return data
        }else if (type === 'up') {
            const offset = this.topOffset - params.limit
            if (offset >= 0 && offset < total) {
                params.offset = offset
                let {data: responseData, pagination} = await this.loadMessages('top', params)
                if (Array.isArray(responseData) && responseData.length) {
                    this.setProperty('top', params, pagination)
                    data = responseData

                    // 无更多内容
                    if (params.offset === 0) {
                        this.concatData(data)
                    }

                }
                this.unshiftItems(prevList, _.cloneDeep(data))
            }else {
                console.log('up 没有更多了')
            }
            return data
        }else if (type === 'down') {
            const offset = this.bottomOffset + params.limit
            if (offset && offset < total) {
                params.offset = offset
                let {data: responseData, pagination} = await this.loadMessages('bottom', params)
                if (Array.isArray(responseData) && responseData.length) {
                    this.setProperty('bottom', params, pagination)
                    data = responseData
                }
                this.pushItems(prevList, _.cloneDeep(data))
            }else {
                console.log('down 没有更多了')
            }
            return data
        }
    }

    loadMessages = async (type, params) => {
        try {
            const query = this.getQueryObj(type, params, ['from_uin', 'to_username'])
            const res = await request(`${helper.format(API.groupRawMessages.url, {
                uin: params.from_uin,
                username: params.to_username,
            })}?${qs.stringify(query)}`)
            const parsedData = util.parseMessages(res && res.data)
            return {
                data: parsedData,
                pagination: res && res.pagination || {},
            }
        }catch (err) {
            console.log(err)
        }
    }

    getQueryObj = (type, params, exclusion) => {
        if (type !== 'init') {
            delete params.location_create_time
        }
        return JSON.parse(JSON.stringify(params, (key, value) => {
            if (exclusion.includes(key)) {
                return undefined
            }else {
                return value
            }
        }))
    }

    concatData = (data) => {
        const extraData = {
            isExtra: true,
        }
        data.unshift(extraData)
    }

    setProperty = (direction, params, pagination) => {
        let key = `${direction}Offset`
        this[key] = pagination.offset
        this.setState({
            params: params,
            total: pagination.rows_found,
        })
    }

    unshiftItems = (prevList, data) => {
        data = data.reverse()
        const list = data.concat(prevList)
        this.setList(list)
        this.pushImages(data, !prevList.length)
    }

    pushItems = (prevList, data) => {
        const list = prevList.concat(data)
        this.setList(list)
        this.pushImages(data, !prevList.length)
    }

    pushImages = (data, isInit) => {
        let {images: prevImages} = this.props.group_messages
        if (isInit) {
            prevImages = []
        }
        let parseImages = util.parseImages(data)
        const images = prevImages.concat(parseImages)
        this.setImages(images)
    }

    setList = (list) => {
        this.props.dispatch({
            type: 'group_messages/setProperty',
            payload: {
                list: list,
            },
        })
    }

    setImages = (images) => {
        this.props.dispatch({
            type: 'group_messages/setProperty',
            payload: {
                images: images,
            },
        })
    }

    getActiveIndex = (data) => {
        const {activeRecord} = this.props
        const activeCreateTime = util.getCreateTime(activeRecord)
        const index = data.findIndex((v) => {
            return v.create_time === activeCreateTime
        })
        return index === -1 ? 0 : index
    }

    onInfiniteScrollerChange = (scrollRef, firstLoadCount, itemsLen) => {
        if (this.initMessageView && scrollRef && firstLoadCount === 0 && itemsLen > 0) {
            const index = this.getActiveIndex(this.initData)
            scrollRef.scrollTo(index)
            this.initMessageView = false
        }
    }

    render() {
        const {keyword, activeSession, activeRecord} = this.props
        const {images, audio, groupMembers} = this.props.group_messages
        const {disableTopFetch, disableBottomFetch} = this.state

        return (
            <div className={styles.context}>
                <div className={styles.content}>
                    <GroupMessageView
                        {...this.props}
                        ref={(node) =>
                            this.messageView = node
                        }
                        runwayItems={MessageLimit * 2}
                        isScrollToBottom={false}
                        useFetchLoading={true}
                        onFetch={this.fetchData}
                        disableBottomFetch={disableBottomFetch}
                        disableTopFetch={disableTopFetch}
                        onInfiniteScrollerChange={this.onInfiniteScrollerChange}
                        activeSession={activeSession}
                        activeRecord={activeRecord}
                        keyword={keyword}
                        audio={audio}
                        images={images}
                        members={groupMembers}
                    />
                </div>
            </div>
        )
    }
}
