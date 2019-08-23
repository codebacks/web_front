import React from 'react'
import {Table, Pagination, Row, Col, Form, Input, Select, Button, Icon, Popover, Badge} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import qs from 'qs'
import ContentHeader from 'business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'wx/common/config'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/automatic/moments'
import MomentDetail from 'wx/components/MomentDetail'
import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DateTimeFormat} = config

@connect(({base, wx_moments, wx_moments_log, loading}) => ({
    base,
    wx_moments,
    wx_moments_log,
    detailLoading: loading.effects['wx_moments/details'],
}))
@documentTitleDecorator({
    title: '朋友圈明细'
})
export default class WXAutomaticDetailPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            detailVisible: false,
        }
    }

    componentDidMount() {
        this.loadResult()
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'wx_moments/resetDetailParams',
        })
    }

    loadResult = () => {
        let params = {...this.props.wx_moments.detailParams}
        delete params.limit
        delete params.offset
        this.props.dispatch({
            type: 'wx_moments/taskResult',
            payload: {
                id: this.props.match.params.id,
                params: params
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_moments.detailParams}
        params.limit = size
        this.props.dispatch({
            type: 'wx_moments/setProperty',
            payload: {detailParams: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'wx_moments/details',
            payload: {
                params: {
                    id: id
                },
                page: page
            },
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(e.target){
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.wx_moments.detailParams}
        params[key] = val
        this.props.dispatch({
            type: 'wx_moments/setProperty',
            payload: {
                detailParams: params
            }
        })
    }

    handleSearch = () => {
        this.loadResult()
        this.goPage(1)
    }

    reExecution = (id, historyId) => {
        this.props.dispatch({
            type: 'wx_moments/reExecution',
            payload: {
                id: id,
                historyId: historyId
            },
            callback: () => {
                const current = this.props.wx_moments.detailCurrent
                this.goPage(current)
            }
        })
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

            case 1001:
                return '没有安装自动化助手，无法执行自动化任务'
            case 1002:
                return '启动微信超时'
            case 1003:
                return '没有找到控件'
            case 1004:
                return '没有找到视频或图片资源'
            case 1005:
                return '特殊格式或特殊比例：不能分享这种格式的视频'

                // old code
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

    getExportUrl = (params) => {
        const accessToken = this.props.base.accessToken
        let query = {
            keyword: params.keyword,
            status: params.status
        }
        return `${Helper.format(API.taskDetailsExport.url, {id: params.id})}?${qs.stringify(query)}&access_token=${accessToken}&t=${new Date().getTime()}`
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
                title: '在线状态',
                dataIndex: 'im_online_status',
                render: (text, record, index) => {
                    if(text) {
                        return <Badge status="success" text="在线" />
                    }
                    return <Badge status="default" text="离线" />
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
                            <span onClick={()=>{this.reExecution(this.props.match.params.id, record.id)}}>
                            重新执行
                            </span>
                            <p>{message}</p>
                        </div>
                    }
                    return <p>{message}</p>
                }
            },
            {
                title: '延时评论数',
                dataIndex: 'task_comment_count',
                key: 'task_comment_count',
            },
            // {
            //     title: '评论状态',
            //     dataIndex: 'comment_status',
            //     key: 'comment_status',
            //     render: (text, record, index) => {
            //         switch (record.code) {
            //         case 3130: // 带评论的发圈成功
            //         case 4000: // 调用延时评论成功
            //             return '执行中'
            //         case 3101: // 带评论的发圈调用发圈失败
            //         case 3102: // 带评论的发圈失败
            //         case 4001: // 调用延时评论失败
            //         case 4002: // 延时评论失败
            //             return '评论失败'
            //         case 4040: // 延时评论成功
            //             return '评论成功'
            //         default:
            //             return ''
            //         }
            //     }
            // }
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const {detailLoading} = this.props
        const {detailParams, detailList, detailTotal, detailCurrent, result} = this.props.wx_moments
        const {record, detailVisible} = this.state

        return (
            <div className={styles.details}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '发朋友圈',
                                path: '/wx/automatic/moments',
                            },
                            {
                                name: '明细',
                            },
                        ]
                    }
                />
                <div className={styles.customSearchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Input
                                    placeholder="搜索备注、昵称、微信号"
                                    value={detailParams.keyword}
                                    onChange={(e)=>{this.handleChange('keyword', e)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="执行状态："
                                colon={false}
                            >
                                <Select
                                    value={detailParams.status}
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
                        <Col span={4}>
                            <FormItem {...formItemLayout}
                                label=""
                                colon={false}
                            >
                                <Button className={styles.customSearchBtn}
                                    type="primary"
                                    icon="search" onClick={this.handleSearch}>搜索</Button>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>

                    </Row>
                </div>
                { result ? <div className={styles.tableHead}>
                    <div className={styles.leftWrap}>
                        <div className={styles.taskNo}>指令编号：{this.props.match.params.id}
                            <Popover content={<div className={styles.questionDesc}>由系统生成的朋友圈内容标识；当朋友圈执行异常时，可复制完整编号，发给客服，便于客服查错，更快找到问题。</div>}>
                                <Icon type="question-circle-o" className={styles.questionCircle}/>
                            </Popover>
                        </div>
                        <a target="_blank"
                            rel="noopener noreferrer"
                            href={this.getExportUrl(detailParams)}
                            className={styles.export}
                        >导出数据</a>
                    </div>
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
                        dataSource={detailList}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={detailLoading}
                    />
                    {detailList.length ? (
                        <Pagination
                            className="ant-table-pagination"
                            total={detailTotal}
                            current={detailCurrent}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={detailParams.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        />
                    ) : ''
                    }
                </div>
                {detailVisible ? <MomentDetail visible={detailVisible}
                    record={record}
                    onCancel={this.handleHideDetail}/> : ''}
            </div>
        )
    }
}