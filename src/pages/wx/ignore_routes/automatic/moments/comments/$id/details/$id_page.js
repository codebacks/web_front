import React, {Component} from 'react'
import {Table, Row, Col, Form, Input, Select, Button, Badge} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import safeSetState from 'hoc/safeSetState'
import createFaceHtml from 'components/Face/createFaceHtml'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import styles from './index.scss'
import {commentStatus} from '../../../config'

const FormItem = Form.Item
const Option = Select.Option
const Search = Input.Search

const {pageSizeOptions, DateTimeFormat} = config

const executionCode = {
    disconnection: {
        code: 9005,
        text: '未激活不支持追评'
    },
}

@connect(({base, wx_moments_comment, loading}) => ({
    base,
    wx_moments_comment,
    detailLoading: loading.effects['wx_moments_comment/details'],
}))
@documentTitleDecorator({
    overrideTitle: (props)=>{
        const referrer = props.location.query.referrer
        let isAdd = helper.getUrlParams('is_add', referrer)
        if (isAdd) {
            return parseInt(isAdd, 10) ? '追评明细' : '延时评论明细'
        }
        return '追评明细'
    }
})
@safeSetState()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            detailVisible: false,
            content: ''
        }
    }

    componentDidMount() {
        this.loadContent()
        this.loadResult()
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'wx_moments_comment/resetDetailParams',
        })
    }

    loadContent = () => {
        this.props.dispatch({
            type: 'wx_moments_comment/commentContent',
            payload: {
                id: this.props.match.params.id,
            },
            callback: (data) => {
                this.setState({
                    content: data.content
                })
            }
        })
    }

    loadResult = () => {
        let params = {...this.props.wx_moments_comment.detailParams}
        delete params.limit
        delete params.offset
        this.props.dispatch({
            type: 'wx_moments_comment/taskResult',
            payload: {
                id: this.props.match.params.id,
                params: params
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_moments_comment.detailParams}
        params.limit = size
        this.props.dispatch({
            type: 'wx_moments_comment/setProperty',
            payload: {detailParams: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'wx_moments_comment/details',
            payload: {
                id: id,
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
        let params = {...this.props.wx_moments_comment.detailParams}
        params[key] = val
        this.props.dispatch({
            type: 'wx_moments_comment/setProperty',
            payload: {
                detailParams: params
            }
        })
    }

    handleSearch = () => {
        this.loadResult()
        this.goPage(1)
    }

    getCodeText = (code) => {
        const keys = Object.keys(executionCode)
        const key = keys.find((k) => {
            return executionCode[k].code === code
        })
        if (key) {
            return executionCode[key].text
        }
        return '--'
    }

    getBreadcrumbName = (referrer) => {
        let isAdd = helper.getUrlParams('is_add', referrer)
        if (isAdd) {
            return parseInt(isAdd, 10) ? '追评' : '延时评论'
        }
        return '追评'
    }

    render () {
        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                key: 'nickname',
                className: `${styles.firstColumn}`,
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
                    return text || record.nickname
                }
            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                render: (text) => {
                    if(text) {
                        return <Badge status="success" text="在线" />
                    }
                    return <Badge status="default" text="离线" />
                }
            },
            {
                title: '评论状态',
                dataIndex: 'status',
                key: 'status',
                render: (text) => {
                    switch (text) {
                        case 0:
                            return <Badge status="default" text="未执行"/>
                        case 1:
                            return <Badge status="success" text="成功"/>
                        case -1:
                            return <Badge status="error" text="失败"/>
                        case 2:
                            return <Badge status="processing" text="执行中"/>
                        case 3:
                            return <Badge status="warning" text="执行成功"/>
                        default:
                            return ''
                    }
                }
            },
            {
                title: '反馈时间',
                dataIndex: 'feedback_time',
                key: 'feedback_time',
                render: (text) => {
                    if(text){
                        return moment(text*1000).format(DateTimeFormat)
                    }
                    return ''
                }
            },
            {
                title: '失败原因',
                dataIndex: 'code',
                key: 'code',
                className: styles.messageColumn,
                render: (code, record) => {
                    if (record.status === -1) {
                        return this.getCodeText(code)
                    }
                    return '--'
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const {detailLoading} = this.props
        const {detailParams, detailList, detailTotal, detailCurrent, result} = this.props.wx_moments_comment
        const referrer = this.props.location.query.referrer || this.props.location.pathname.replace(/(.*)\/([^\/]+\/[^\/]+)$/, '$1')
        const {content} = this.state
        const prefix = this.getBreadcrumbName(referrer)

        const getOptions = () => {
            let options = []
            commentStatus.forEach((value, key) => {
                options.push(<Option key={key} value={key}>{value}</Option>)
            })
            return options
        }

        const getResult = (result) => {
            let results = []
            commentStatus.forEach((value, key)=>{
                results.push(<div key={key} className={styles.item}>
                    <h3>{result[key] || 0}</h3>
                    <p>{value}</p>
                </div>)
            })
            return results
        }


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
                                name: `${prefix}记录`,
                                path: referrer,
                            },
                            {
                                name: `${prefix}明细`,
                            }
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
                                <Search placeholder="搜索备注、昵称、微信号"
                                    value={detailParams.keyword}
                                    onChange={(e)=>{this.handleChange('keyword', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="执行状态："
                                colon={false}
                            >
                                <Select value={detailParams.status}
                                    onChange={(e)=>{this.handleChange('status', e)}}
                                    style={{width: '100%'}}
                                >
                                    <Option value=''>全部状态</Option>
                                    {getOptions()}
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem {...formItemLayout}
                                label=""
                                colon={false}
                            >
                                <Button type="primary"
                                    icon="search" onClick={this.handleSearch}>搜索</Button>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>

                    </Row>
                </div>
                { result ? <div className={styles.tableHead}>
                    <div className={styles.leftWrap}>
                        <span className={styles.label} style={{width: prefix === '追评' ? '80px' : '100px'}}>
                            {prefix}详情：
                        </span>
                        {createFaceHtml({tagName: 'pre', tagProps: {className: styles.comment}, values: content})}
                    </div>
                    <div className={styles.result}>
                        {
                            getResult(result)
                        }
                    </div>
                </div>: ''
                }
                <div>
                    <Table columns={columns}
                        dataSource={detailList}
                        size="middle"
                        rowKey={(record, index) => index}
                        loading={detailLoading}
                        pagination={ detailList.length ? {
                            size: "middle",
                            total: detailTotal,
                            current: detailCurrent,
                            showQuickJumper: true,
                            pageSizeOptions: pageSizeOptions,
                            showTotal: total => `共 ${total} 条`,
                            pageSize: detailParams.limit,
                            showSizeChanger: true,
                            onShowSizeChange: this.handleChangeSize,
                            onChange: this.goPage,
                        } : false}
                    />
                </div>
            </div>
        )
    }
}