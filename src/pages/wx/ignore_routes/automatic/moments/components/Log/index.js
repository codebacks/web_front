import React from 'react'
import {Table, Pagination, Row, Col, Form, Input, Select, Button} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import config from 'wx/common/config'
import DateRange from 'components/DateRange'
import styles from './index.scss'
import Content from "./components/Content"
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import MomentDetail from 'wx/components/MomentDetail'
import {contentType} from '../../config'

const FormItem = Form.Item
const Option = Select.Option
const Search = Input.Search

const {pageSizeOptions, DateTimeFormat, DateFormat } = config

@connect(({base, wx_moments, wx_moments_log}) => ({
    base,
    wx_moments,
    wx_moments_log,
}))
export default class MomentsLogPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            contentVisible: false,
            detailVisible: false
        }
    }

    componentDidMount() {
        this.loadResult()
        this.goPage(1)
    }

    componentWillUnmount() {
    }

    loadResult = () => {
        let params = {...this.props.wx_moments_log.params}
        delete params.limit
        delete params.offset
        this.props.dispatch({
            type: 'wx_moments_log/result',
            payload: params,
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_moments_log.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_moments_log/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'wx_moments_log/details',
            payload: {
                id: id,
                page: page
            },
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_moments_log.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'wx_moments_log/setParams',
            payload: {
                params: params
            }
        })
    }


    handleTypeChange = (e) => {
        let params = {...this.props.wx_moments_log.params}
        params['content_type'] = e
        this.props.dispatch({
            type: 'wx_moments_log/setParams',
            payload: {
                params: params
            }
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.wx_moments_log.params}
        if (startValue) {
            params.execute_time_start = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.execute_time_start = ''
        }
        if (endValue) {
            params.execute_time_end = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.execute_time_end = ''
        }
        this.props.dispatch({
            type: 'wx_moments_log/setParams',
            payload: {params: params}
        })
    }

    handleSearch = () => {
        this.loadResult()
        this.goPage(1)
    }

    handleShowDetail = (record) => {
        this.setState({
            record: record,
            detailVisible: true
        })
    }

    handleHideDetail = () => {
        this.setState({
            detailVisible: false
        })
        this.props.dispatch({
            type: 'wx_moments_log/setProperty',
            payload: {
                detail: {}
            }
        })
    }

    handleShowContent = (record) => {
        this.setState({
            record: record,
            contentVisible: true
        })
    }

    handleHideContent = () => {
        this.setState({
            contentVisible: false
        })
        this.props.dispatch({
            type: 'wx_moments_log/setProperty',
            payload: {
                content: {}
            }
        })
    }

    reExecution = (record) => {
        const id = record.task_id
        const historyId = record.id
        this.props.dispatch({
            type: 'wx_moments/reExecution',
            payload: {
                id: id,
                historyId: historyId
            },
            callback: () => {
                const current = this.props.wx_moments_log.current
                this.goPage(current)
            }
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_moments_log/resetParams',
        })
        this.refs.logTime.setDate(null, null)
    };

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }

    parseCode = (code) => {
        switch(code){
            case 2001:
                return '素材资源下载失败，请检查按网络状态'
            case 2002:
                return '微信进程不存在，请启动手机微信'
            case 2003:
                return '等待超时，请启动手机微信'
            case 3000: // 调用发圈成功
                return '--'
            case 3001:
                return '调用失败请重试'
            case 3101: // 带评论的发圈调用发圈失败
            case 3002: // 发圈失败
            case 3102: // 带评论的发圈失败
                return '发圈失败'
            case 3030: // 发圈成功
            case 3130: // 带评论的发圈成功
                return '--'

            case 9981:
                return '未拉取'
            case 9982:
                return '设备不在线'
            case 9991:
                return '请检查设备网络状态' // 任务超时
            case 9992:
                return '设备不在线' // 离线超时

            // old
            case 1001:
                return '脚本文件不存在'
            case 1002:
                return '网络连接差，下载资源失败'
            case 1004:
                return '进程占用，稍后重试'
            case 1005:
                return '脚本执行错误'
            case 1101:
                return '未找到发现界面'
            case 1201:
                return '指令超时'
            case 1202:
                return '网速太慢，分享失败'
            case 1203:
                return '未添加自己为好友'
            case 2000:
                return '执行成功'
            case 2004:
                return '进程占用，稍后重试'
            case 2005:
                return '未找到对应控件'
            case 2007:
                return '启动分享失败'
            default:
                return `错误码：${code}`
        }
    }

    render () {
        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                key: 'nickname',
                className: `${styles.firstColumn} ${styles.nicknameColumn}`,
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                key: 'alias',
                render: (text, record, index) => {
                    return text || record.username
                }
            },
            {
                title: '微信备注',
                dataIndex: 'remark',
                key: 'remark',
                render: (text, record, idnex) =>{
                    if(text){
                        return text
                    }
                    return record.nickname
                }
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                key: 'execute_time',
                render: (text, record, index) => {
                    if(text){
                        return moment(text*1000).format(DateTimeFormat)
                    }
                    return ''
                }
            },
            {
                title: '执行状态',
                dataIndex: 'status',
                key: 'status',
                render: (text, record, index) =>{
                    switch (text) {
                        case 0:
                            return <span className={`${styles.status} ${styles.notPull}`}>未执行</span>
                        case 3:
                            return <span className={`${styles.status} ${styles.callSuccess}`}>执行成功</span>
                        case 2:
                            return <span className={`${styles.status} ${styles.doing}`}>执行中</span>
                        case 1:
                            return <span className={`${styles.status} ${styles.success}`}>发圈成功</span>
                        case -1:
                            return <span className={`${styles.status} ${styles.error}`}>发圈失败</span>
                        case -2:
                            return <span className={`${styles.status} ${styles.notPull}`}>取消执行</span>
                        default:
                            return ''
                    }
                }
            },
            {
                title: '反馈时间',
                dataIndex: 'feedback_time',
                key: 'feedback_time',
                render: (text ,record ,index) => {
                    if(text){
                        return moment(text*1000).format(DateTimeFormat)
                    }
                    return ''
                }
            },
            {
                title: '互动数',
                dataIndex: 'interaction',
                key: 'interaction',
                render: (text, record, index) => {
                    if (record.status === 1) {
                        return <div className={styles.interaction}
                            onClick={() => {
                                this.handleShowDetail(record)
                            }}>
                            <p>点赞：{record.like_count || 0}</p>
                            <p>评论：{record.comment_count || 0}</p>
                        </div>
                    }
                    return '--'
                }
            },
            {
                title: '失败原因',
                dataIndex: 'error',
                key: 'error',
                className: styles.messageColumn,
                render: (text ,record ,index) => {
                    if(record.status === 1 || record.status === 3) {
                        return '--'
                    }
                    if(record.status === 0 || record.status === 2 || record.status === -2) {
                        return ''
                    }
                    let message = this.parseCode(record.code)
                    if(record.status === -1){
                        return <div className={styles.reExecution} >
                            <span onClick={()=>{this.reExecution(record)}}>
                            重新执行
                            </span>
                            <p>{message}</p>
                        </div>
                    }
                    return <p>{message}</p>
                }
            },
            {
                title: '操作',
                dataIndex: '',
                key: '',
                render: (text, record, index) => {
                    return <span className={styles.checkContent} onClick={()=> {this.handleShowContent(record)}}>朋友圈详情</span>
                }
            }
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const {params, loading, list, total, current, result} = this.props.wx_moments_log
        const {record, contentVisible, detailVisible} = this.state

        return (
            <div className={styles.details}>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="执行状态："
                                colon={false}
                            >
                                <Select
                                    value={params.status}
                                    onChange={(e)=>{this.handleChange('status', e)}}
                                    style={{width: '100%'}}
                                >
                                    <Option value=''>全部状态</Option>
                                    <Option value='0'>未执行</Option>
                                    <Option value='1'>发圈成功</Option>
                                    <Option value='-1'>发圈失败</Option>
                                    <Option value='3'>执行成功</Option>
                                    <Option value='2'>执行中</Option>
                                    <Option value='-2'>取消执行</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="朋友圈内容："
                                colon={false}
                            >
                                <Search
                                    placeholder="请输入内容"
                                    value={params.content_desc}
                                    onChange={(e)=>{this.handleChange('content_desc', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="微信信息："
                                colon={false}>
                                <Search value={params.keyword}
                                    onChange={(e) => {this.handleChange('keyword', e)}}
                                    onSearch={this.handleSearch}
                                    placeholder="请输入昵称/微信号/备注"/>
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
                                    style={{width: '100%'}}
                                    placeholder="全部类型"
                                    value={params.content_type}
                                    onChange={this.handleTypeChange}
                                >
                                    <Option key="0" value="">全部类型</Option>
                                    {
                                        Object.keys(contentType).map((key) => {
                                            return <Option key={key}
                                                value={key}>{contentType[key]}</Option>
                                        })
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                        {/*<Col span={8}>*/}
                        {/*<FormItem {...formItemLayout} label="微信号所属部门：" colon={false}>*/}
                        {/*<DepartmentSelect*/}
                        {/*departmentId={params.department_id}*/}
                        {/*onChange={(value)=>{this.handleChange('department_id', value)}}*/}
                        {/*/>*/}
                        {/*</FormItem>*/}
                        {/*</Col>*/}
                        {/*<Col span={8}>*/}
                        {/*<FormItem {...formItemLayout} label="微信号所属员工：" colon={false}>*/}
                        {/*<UserSelect*/}
                        {/*departmentId={params.department_id}*/}
                        {/*userId={params.user_id}*/}
                        {/*onChange={(value)=>{this.handleChange('user_id', value)}}*/}
                        {/*/>*/}
                        {/*</FormItem>*/}
                        {/*</Col>*/}
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="执行时间："
                                colon={false}>
                                <DateRange
                                    ref="logTime"
                                    {...this.props}
                                    style={{width: '100%'}}
                                    startPlaceholder="执行时间"
                                    endPlaceholder="执行时间"
                                    startValue={params.create_time_start ? moment(params.create_time_start, DateFormat) : ''}
                                    endValue={params.create_time_end ? moment(params.create_time_end, DateFormat) : ''}
                                    onChange={this.handleChangeDate}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    {/*<Row gutter={20}>*/}
                    {/*<Col span={8}>*/}
                    {/*<FormItem {...formItemLayout}*/}
                    {/*label="执行时间："*/}
                    {/*colon={false}>*/}
                    {/*<DateRange*/}
                    {/*ref="logTime"*/}
                    {/*{...this.props}*/}
                    {/*style={{width: '100%'}}*/}
                    {/*startPlaceholder="执行时间"*/}
                    {/*endPlaceholder="执行时间"*/}
                    {/*startValue={params.create_time_start ? moment(params.create_time_start, DateFormat) : ''}*/}
                    {/*endValue={params.create_time_end ? moment(params.create_time_end, DateFormat) : ''}*/}
                    {/*onChange={this.handleChangeDate}*/}
                    {/*/>*/}
                    {/*</FormItem>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}
                    <Row className={styles.searchBtn} gutter={20}>
                        <Col span={8}>
                            <Col offset={8}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>
                { result ? <div className={styles.tableHead}>
                    <div className={styles.result}>
                        <div className={styles.item}>
                            <h3>{result['-1'] || 0}</h3>
                            <p>发圈失败</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['1'] || 0}</h3>
                            <p>发圈成功</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['3'] || 0}</h3>
                            <p>执行成功</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['0'] || 0}</h3>
                            <p>未执行</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['2'] || 0}</h3>
                            <p>执行中</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['-2'] || 0}</h3>
                            <p>取消执行</p>
                        </div>
                    </div>
                </div>: ''
                }
                <div style={{ clear: 'right' }}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={loading}
                    />
                    {list.length ? (
                        <Pagination
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
                        />
                    ) : ''
                    }
                </div>
                {
                    detailVisible ? <MomentDetail visible={detailVisible}
                        record={record}
                        onCancel={this.handleHideDetail}/> : ''}
                { contentVisible ? <Content visible={contentVisible}
                    record={record}
                    onCancel={this.handleHideContent}
                /> : ''}
            </div>
        )
    }
}
