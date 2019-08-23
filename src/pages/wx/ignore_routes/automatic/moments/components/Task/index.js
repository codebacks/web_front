import React, {Fragment} from 'react'
import {Form, Input, Button, Icon, Select, Row, Col, Table, Pagination, Modal, Spin, Popover, Divider} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import Link from 'umi/link'
import moment from 'moment'
import createFaceHtml from 'components/Face/createFaceHtml'
import Helper from 'wx/utils/helper'
import styles from './index.scss'
import config from 'wx/common/config'
import ImagePreview from 'components/business/ImagePreview'
import VideoPreview from 'components/business/VideoPreview'
import DateRange from "components/DateRange"
import AddComment from './components/AddComment'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const {pageSizeOptions, DateFormat, DateTimeFormat, DefaultImage} = config
const contentTypeMap = {
    'text': '文本',
    'article': '文章',
    'photo': '图文',
    'video': '视频',
}

@connect(({base, wx_moments, loading}) => ({
    base,
    wx_moments,
    tasksLoading: loading.effects['wx_moments/tasks'],
}))
@Form.create()
export default class MomentTaskPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imagePreviewVisible: false,
            imagePreview: '',
            videoPreviewVisible: false,
            videoPreview: '',
            commentsVisible: false,
            comments: [],
            sortedInfo: null,
        }
    }

    componentDidMount() {
        this.goPage()
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'keyword') {
            val = e.target.value
        }else {
            val = e
        }
        let {params} = this.props.wx_moments
        params[key] = val
        this.props.dispatch({
            type: 'wx_moments/setParams',
            payload: {
                params: params,
            },
        })
    }
    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_moments/tasks',
            payload: {page: page},
        })
    }
    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_moments.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_moments/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleShowImagePreview = (url, record, idx) => {
        let imagePreview = Helper.getLink(Helper.getRealPhotoUrl(url))
        if(Helper.isQiniu(imagePreview)) {
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
                            imagePreview = Helper.getPolicyUrl(contentWatermark.url, policy)
                        }
                    }
                }
            }
        }
        this.setState({
            imagePreviewVisible: true,
            imagePreview: imagePreview,
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

    handleTypeChange = (e) => {
        let params = {...this.props.wx_moments.params}
        params['content_type'] = e
        this.props.dispatch({
            type: 'wx_moments/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeExecuteDate = (startValue, endValue) => {
        let params = {...this.props.wx_moments.params}
        if(startValue) {
            params.execute_time_start = moment(startValue).format(DateFormat) + ' 00:00:00'
        }else {
            params.execute_time_start = ''
        }
        if(endValue) {
            params.execute_time_end = moment(endValue).format(DateFormat) + ' 23:59:59'
        }else {
            params.execute_time_end = ''
        }
        this.props.dispatch({
            type: 'wx_moments/setParams',
            payload: {params: params},
        })
    }

    handleChangeCreateDate = (startValue, endValue) => {
        let params = {...this.props.wx_moments.params}
        if(startValue) {
            params.create_time_start = moment(startValue).format(DateFormat) + ' 00:00:00'
        }else {
            params.create_time_start = ''
        }
        if(endValue) {
            params.create_time_end = moment(endValue).format(DateFormat) + ' 23:59:59'
        }else {
            params.create_time_end = ''
        }
        this.props.dispatch({
            type: 'wx_moments/setParams',
            payload: {params: params},
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || ''
        const order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.wx_moments.params}
        params['order_column'] = field
        params['order_dir'] = order.replace('end', '')
        this.props.dispatch({
            type: 'wx_moments/tasks',
            payload: {
                params: params,
            },
        })
        this.setState({
            sortedInfo: sortedInfo
        })
    }

    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_moments/resetParams',
        })
        this.refs.executeTime.setDate(null, null)
        setTimeout(() => {
            const {params} = this.props.wx_moments
            this.refs.createTime.setDate(moment(params.create_time_start, DateFormat), moment(params.create_time_end, DateFormat))
        }, 0)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
            this.resetSortedInfo()
        }, 0)
    }

    showConfirm = (record) => {
        confirm({
            title: `取消后将有${record.result['0']}条数据不会执行，是否确定要取消执行？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                this.cancelExecution(record.id)
            },
            onCancel: () => {
            },
        })
    }

    cancelExecution = (id) => {
        this.props.dispatch({
            type: 'wx_moments/cancelExecution',
            payload: {
                id: id,
            },
            callback: () => {
                const {current} = this.props.wx_moments
                this.goPage(current)
            },
        })
    }

    handleShowAddComment = (record) => {
        this.setState({
            addCommentVisible: true,
            record: record,
        })
    }

    handleCancelAddComment = () => {
        this.setState({
            addCommentVisible: false,
            record: {},
        })
    }

    handleAddCommentOk = () => {
        this.handleCancelAddComment()
        this.goPage(this.props.wx_moments.current)
    }

    goToDetail = (record) => {
        router.push(`/wx/automatic/moments/details/${record.id}`)
    }

    goToCreate = () => {
        router.push('/wx/automatic/moments/create')
    }

    goToSendAgain = (record) => {
        this.props.dispatch({
            type: 'wx_moments/setProperty',
            payload: {
                moment: record,
            },
        })
        this.goToCreate()
    }

    render() {
        const {
            params,
            total,
            current,
            tasks,
        } = this.props.wx_moments
        const {imagePreviewVisible, imagePreview, videoPreviewVisible, videoPreview,
            commentsVisible, comments, addCommentVisible, record} = this.state
        let sortedInfo = this.state.sortedInfo || {}

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const timeColumn = [
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'execute_time' && sortedInfo.order,
                className: styles.timeColumn,
                render: (text) => {
                    if(text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'create_time' && sortedInfo.order,
                className: styles.timeColumn,
                render: (text) => {
                    return moment(text * 1000).format(DateTimeFormat)
                },
            },
        ]

        const columns = [
            {
                title: '类型',
                dataIndex: 'content_type',
                className: `${styles.firstColumn} ${styles.typeColumn}`,
                render: (text, record, index) => {
                    return contentTypeMap[text] || ''
                },
            },
            {
                title: '内容',
                dataIndex: 'content_desc',
                className: styles.descColumn,
                render: (text, record, index) => {
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
                title: '延时评论',
                dataIndex: 'content_comments',
                render: (text, record) => {
                    const content_comments = text
                    let comments = []
                    if(Array.isArray(content_comments) && content_comments.length) {
                        comments = content_comments
                    }else {
                        if(record.content_comment) {
                            comments = [record.content_comment]
                        }
                    }
                    if(comments.length) {
                        return <Link to={`/wx/automatic/moments/comments/${record.id}?is_add=0`} className={styles.stress}>{comments.length}条</Link>
                    }
                    return '--'
                },
            },
            {
                title: '追评记录',
                dataIndex: 'additional_comment_count',
                render: (text, record) => {
                    if(text) {
                        return <Link to={`/wx/automatic/moments/comments/${record.id}?is_add=1`}>{text}条</Link>
                    }
                    return '--'
                },
            },
            ...timeColumn,
            {
                title: '执行微信总数',
                dataIndex: 'uins_count',
                className: styles.countColumn,
            },
            {
                title: '互动数',
                dataIndex: 'interaction',
                key: 'interaction',
                render: (text, record, index) => {
                    return <div className={styles.interaction}>
                        <p>点赞：{record.like_count || 0}</p>
                        <p>评论：{record.comment_count || 0}</p>
                    </div>
                },
            },
            {
                title: '执行结果',
                dataIndex: 'result',
                render: (text, record, index) => {
                    return <div className={styles.resultPre}>
                        <p>{`发圈成功${text['1'] || 0}条`}</p>
                        <p>{`发圈失败${text['-1'] || 0}条`}</p>
                        <p>{`执行成功${text['3'] || 0}条`}</p>
                        <p>{`执行中${text['2'] || 0}条`}</p>
                        <p>{`未执行${text['0'] || 0}条`}</p>
                        <p>{`取消${text['-2'] || 0}条`}</p>
                    </div>
                },
            },
            {
                title: '操作',
                dataIndex: '',
                render: (text, record, index) => {
                    return <div className={styles.operate}>
                        {record.result['0'] ? <Fragment><span onClick={() => {
                            this.showConfirm(record)
                        }} className={styles.light}
                        >取消</span><Divider type="vertical"/></Fragment> : ''}
                        <span onClick={() => {
                            this.goToDetail(record)
                        }} className={styles.stress}>明细</span>
                        <Divider type="vertical"/>
                        <span onClick={() => {
                            this.goToSendAgain(record)
                        }} className={styles.stress}>跟圈</span>
                        {
                            record.result['1'] ? <Fragment>
                                <Divider type="vertical"/>
                                <span onClick={() => {
                                    this.handleShowAddComment(record)
                                }} className={styles.stress}>追评</span>
                            </Fragment> : null
                        }
                    </div>
                },
            },
        ]

        return (
            <div className={styles.automatedTask} id="automatedTaskList">
                <div>
                    <div className={styles.searchWrap}>
                        <Form className="ant-advanced-search-form">
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="搜索："
                                        colon={false}>
                                        <Input
                                            placeholder="请输入关键字"
                                            value={params.keyword}
                                            onChange={(e) => {
                                                this.handleChange('keyword', e)
                                            }}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...timeFormItemLayout}
                                        label="执行时间："
                                        colon={false}>
                                        <DateRange
                                            ref="executeTime"
                                            {...this.props}
                                            style={{width: '100%'}}
                                            startPlaceholder="执行时间"
                                            endPlaceholder="执行时间"
                                            startValue={params.execute_time_start ? moment(params.execute_time_start, DateFormat) : ''}
                                            endValue={params.execute_time_end ? moment(params.execute_time_end, DateFormat) : ''}
                                            onChange={this.handleChangeExecuteDate}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout}
                                        label="朋友圈类型："
                                        colon={false}
                                    >
                                        <Select
                                            placeholder="全部类型"
                                            value={params.content_type}
                                            onChange={this.handleTypeChange}
                                        >
                                            <Option key="0" value="">全部类型</Option>
                                            {
                                                Object.keys(contentTypeMap).map((key) => {
                                                    return <Option key={key}
                                                        value={key}>{contentTypeMap[key]}</Option>
                                                })
                                            }
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...timeFormItemLayout}
                                        label="创建时间："
                                        colon={false}>
                                        <DateRange
                                            ref="createTime"
                                            {...this.props}
                                            maxToday={true}
                                            style={{width: '100%'}}
                                            startPlaceholder="创建时间"
                                            endPlaceholder="创建时间"
                                            startValue={params.create_time_start ? moment(params.create_time_start, DateFormat) : ''}
                                            endValue={params.create_time_end ? moment(params.create_time_end, DateFormat) : ''}
                                            onChange={this.handleChangeCreateDate}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row className={styles.searchBtn} gutter={20}>
                                <Col span={8}>
                                    <Col offset={8}>
                                        <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Col>

                            </Row>
                        </Form>
                    </div>
                    <div className={styles.createMoment}>
                        <Button icon="plus" type="primary"
                            onClick={this.goToCreate}
                        >新建朋友圈</Button>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={tasks}
                            size="middle"
                            rowKey={(record, index) => index}
                            loading={this.props.tasksLoading}
                            onChange={this.handleTableChange}
                            pagination={false}
                        />
                        {tasks.length ? <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={params.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        /> : null}
                    </div>
                </div>
                {addCommentVisible ? <AddComment {...this.props}
                    visible={addCommentVisible}
                    record={record}
                    onOk={this.handleAddCommentOk}
                    onCancel={this.handleCancelAddComment}
                /> : null}
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
