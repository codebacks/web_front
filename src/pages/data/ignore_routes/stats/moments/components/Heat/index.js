/**
 * @description 朋友圈热度
 * @author liyan
 * @date 2018/12/28
 */
import React, {Component} from 'react'
import {Form, Button, Radio, Icon, Row, Col, Table, Popover, notification} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import createFaceHtml from "components/Face/createFaceHtml"
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import ImagePreview from 'components/business/ImagePreview'
import VideoPreview from 'components/business/VideoPreview'
import config from 'data/common/config'
import Helper from "data/utils/helper"

import styles from './index.scss'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const {DateFormat, DateTimeFormat, pageSizeOptions, DefaultImage} = config

const contentTypeMap = {
    text: '文本',
    article: '文章',
    photo: '图文',
    video: '视频',
}

@connect(({ base, data_stat_moments_heat, loading}) => ({
    base,
    data_stat_moments_heat,
    listLoading: loading.effects['data_stat_moments_heat/list']
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imagePreviewVisible: false,
            imagePreview: '',
            videoPreviewVisible: false,
            videoPreview: '',
        }
    }

    componentDidMount() {
        this.goPage()
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_stat_moments_heat/resetParams',
        })
        this.props.dispatch({
            type: 'data_stat_moments_heat/resetRange',
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.state.params}
        if (startValue) {
            params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.start_time = ''
        }
        if (endValue) {
            params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.end_time = ''
        }
        this.setTimeRange(startValue, endValue)
        this.props.dispatch({
            type: 'data_stat_moments_heat/setParams',
            payload: {params: params}
        })
    }

    setTimeRange = (startValue, endValue) => {
        let range = ''
        if(moment().subtract(1, 'days').isSame(startValue, 'day')
            && moment().subtract(1, 'days').isSame(endValue, 'day')){
            range = 'yesterday'
        }else if(moment().subtract(6, 'days').isSame(startValue, 'day')
            && moment().isSame(endValue, 'day')){
            range = 'week'
        }else if(moment().subtract(29, 'days').isSame(startValue,'day')
            && moment().isSame(endValue, 'day')){
            range = 'month'
        }
        this.props.dispatch({
            type: 'data_stat_moments_heat/setProperty',
            payload: {range: range}
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_stat_moments_heat.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'data_stat_moments_heat/setParams',
            payload: {params: params},
        })
    }

    handleChangeType = (e) => {
        let val = e.target.value
        let params = {...this.props.data_stat_moments_heat.params}
        params.order_by = val
        this.props.dispatch({
            type: 'data_stat_moments_heat/setParams',
            payload: {params: params}
        })
        this.goPage(1)
    }

    handleSearch = () => {
        let params = {...this.props.data_stat_moments_heat.params}
        if (!params.start_time) {
            notification.error({
                message: '错误提示',
                description: '开始时间不能为空'
            })
            return false
        }
        if (!params.end_time) {
            notification.error({
                message: '错误提示',
                description: '截止时间不能为空'
            })
            return false
        }
        this.goPage(1)
    }

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        switch(value) {
            case 'yesterday':
                this.setTimeParams(1)
                break
            case 'week':
                this.setTimeParams(6)
                break
            case 'month':
                this.setTimeParams(29)
                break
            default:
        }
        this.props.dispatch({
            type: 'data_stat_moments_heat/setProperty',
            payload: {range: value}
        })
    }

    setTimeParams = (days) => {
        const startTime = moment().subtract(days, 'days').format(DateFormat) + ' 00:00:00'
        let endTime = ''
        if (days === 1) {
            endTime = moment().subtract(days, 'days').format(DateFormat) + ' 23:59:59'
        } else {
            endTime = moment().format(DateFormat) + ' 23:59:59'
        }
        this.props.dispatch({
            type: 'data_stat_moments_heat/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime
                }
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.heatTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.data_stat_moments_heat.params}
        params.limit = size
        this.props.dispatch({
            type: 'data_stat_moments_heat/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'data_stat_moments_heat/list',
            payload: {page: page}
        })
    }

    handleShowImagePreview = (url, record, idx) => {
        let previewImage = Helper.getLink(Helper.getRealPhotoUrl(url))
        if(Helper.isQiniu(previewImage)) {
            if(record.content_type === 'photo') {
                const {content_watermark} = record
                if(content_watermark && content_watermark.length) {
                    const contentWatermark = content_watermark.find((item, index) => {
                        let key = Helper.getUrlKey(item.url)
                        return url.indexOf(key) !== -1 && idx === index
                    })
                    if(contentWatermark) {
                        const policy = contentWatermark.policy
                        if(policy) {
                            previewImage = Helper.getPolicyUrl(contentWatermark.url, policy)
                        }
                    }
                }
            }
        }
        this.setState({
            imagePreviewVisible: true,
            imagePreview: previewImage,
        })
    }

    handleHideImagePreview = () => {
        this.setState({
            imagePreviewVisible: false,
            imagePreview: '',
        })
    }

    handleShowVideoPreview = (videoPreview) => {
        this.setState({
            videoPreviewVisible: true,
            videoPreview: videoPreview
        })
    }

    handleHideVideoPreview = () => {
        this.setState({
            videoPreviewVisible: false,
            videoPreview: ''
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {params, list, total, current, range} = this.props.data_stat_moments_heat
        const {listLoading} = this.props
        const {imagePreviewVisible, imagePreview, videoPreviewVisible, videoPreview} = this.state

        const actionColumn = params.order_by === 'like' ?  [{
            title: '点赞数',
            dataIndex: 'likes',
        }] : [{
            title: '评论数',
            dataIndex: 'comments',
        }]

        const columns = [
            {
                title: '排行',
                dataIndex: 'rank',
                render: (text, record, index) => {
                    return <div>{index + 1 + params.offset}</div>
                }
            },
            ...actionColumn,
            {
                title: '类型',
                dataIndex: 'content_type',
                render: (type) => {
                    return contentTypeMap[type] || ''
                },
            },
            {
                title: '内容',
                dataIndex: 'content_desc',
                className: styles.descColumn,
                render: (text) => {
                    if(text) {
                        return <Popover placement="topLeft" content={createFaceHtml({
                            tagName: 'pre',
                            tagProps: {className: styles.wholeDesc},
                            values: text,
                        })}>
                            {createFaceHtml({tagName: 'pre', tagProps: {className: styles.descCut}, values: text})}
                        </Popover>
                    }
                },
            },
            {
                title: '素材',
                dataIndex: 'content',
                className: styles.content,
                render: (text, record) => {
                    if(record.content_type === 'photo') {
                        const len = text.length
                        const content = text.map((item, index) => {
                            if(item) {
                                return <div key={index} className={styles.box}>
                                    <div className={styles.thumbWrap}>
                                        <img src={Helper.getLink(Helper.getThumb(item))}
                                            onError={(e)=>{
                                                e.target.src = DefaultImage
                                            }}
                                            alt=""
                                        />
                                        <Icon type="eye-o"
                                            className={styles.eye}
                                            onClick={() => {
                                                this.handleShowImagePreview(item, record, index)
                                            }}
                                        />
                                    </div>
                                </div>
                            }
                            return ''
                        })
                        return <div className={4 % len === 0 ? styles.double : styles.three}>{content}</div>
                    }else if(record.content_type === 'video') {
                        const url = Helper.getLink(text[0])
                        let cont
                        if (Helper.isQiniu(url)) {
                            cont = <img src={Helper.getVideoCover(url)}
                                className={styles.cover}
                                onError={(e) => {e.target.src = DefaultImage}}
                                alt="视频封面"
                            />
                        } else {
                            cont = <span className={styles.videoIcon}/>
                        }
                        return <div className={styles.media}
                            onClick={()=>{this.handleShowVideoPreview(url)}}>
                            {cont}
                        </div>
                    } else if (record.content_type === 'article') {
                        const title = record.title
                        let cont
                        if(title) {
                            cont =  <a className={styles.link} href={text} target="_blank" rel="noopener noreferrer">{title}</a>
                        } else {
                            cont = <a className={styles.linkIcon} href={text} target="_blank" rel="noopener noreferrer"/>
                        }
                        return <div className={styles.media}>{cont}</div>
                    } else {
                        return text
                    }
                },
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                render: (timestamp) => {
                    if (timestamp) {
                        return moment(timestamp * 1000).format(DateTimeFormat)
                    }
                }
            },
            {
                title: '执行微信总数',
                dataIndex: 'uins_count',
            },
        ]

        return (
            <div className={styles.heatWrapper}>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value)=>{this.handleChange('department_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value)=>{this.handleChange('user_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value)=>{this.handleChange('uin', value)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={11} style={{marginLeft: '19px'}}>
                            <FormItem {...timeFormItemLayout} label="日期：" colon={false}>
                                <DateRange {...this.props}
                                    ref={(ref) => this.heatTime = ref}
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={this.handleChangeDate}
                                    maxRangeDays={60}
                                />
                            </FormItem>
                        </Col>
                        <Radio.Group className={styles.range}
                            value={range}
                            onChange={this.handleChangeTimeRange}
                        >
                            <Radio.Button value="yesterday" className={styles.item}>昨日</Radio.Button>
                            <Radio.Button value="week" className={styles.item}>近7日</Radio.Button>
                            <Radio.Button value="month" className={styles.item}>近30日</Radio.Button>
                        </Radio.Group>
                        <div className={styles.searchBtn}>
                            <Button type="primary" icon="search" onClick={this.handleSearch}>查询</Button>
                        </div>
                    </Row>
                </div>
                <div className={styles.filterWrap}>
                    <RadioGroup value={params.order_by} onChange={this.handleChangeType}>
                        <RadioButton value='like'>点赞榜</RadioButton>
                        <RadioButton value='comment'>评论榜</RadioButton>
                    </RadioGroup>
                </div>
                <Table
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={listLoading}
                    rowKey={(record, index) => index}
                    pagination={list.length ? {
                        size: 'middle',
                        total: total,
                        current: current,
                        showQuickJumper: true,
                        pageSizeOptions: pageSizeOptions,
                        showTotal: total => `共${total}条`,
                        pageSize: params.limit,
                        showSizeChanger: true,
                        onShowSizeChange: this.handleChangeSize,
                        onChange: this.goPage,
                    } : false}
                />
                <ImagePreview visible={imagePreviewVisible}
                    imageUrl={imagePreview}
                    onCancel={this.handleHideImagePreview}
                />
                <VideoPreview visible={videoPreviewVisible}
                    source={videoPreview}
                    onCancel={this.handleHideVideoPreview}
                />
            </div>
        )
    }
}
