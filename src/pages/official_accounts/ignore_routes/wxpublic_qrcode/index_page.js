'use strict'

import React from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, Col, Input, Icon, message, Badge, Popover, Select, Popconfirm } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import moment from 'moment'
import Link from 'umi/link'
import QrcodeDownload from './qrcode/QrcodeDownload'
import { REPLY_TYPE } from '../../services/wxpublic_qrcode'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import styles from './index.less'


const Option = Select.Option

const pageSizeOptions = ['10', '20', '50', '100']

const DATA = {
    name: '',
    type:''
}

@connect(({wxpublic_qrcode }) => ({wxpublic_qrcode}))
@documentTitleDecorator({title:'带参二维码'})
@Form.create()
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            tab: '',
            pager: {
                ...DEFAULT_PAGER
            },
            model: {
                visible: false,
                id: null
            },
            downloadVisible:false,
            imgUrl:''
        }
    }

    static defaultProps = {
        qrcode_type: '1'
    }

    pager = {
        ...DEFAULT_PAGER
    }
    form = {
        ...DATA
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DATA, this.props.location.query, { date: this.momentToDate })
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { name, type } = condition
        this.form = condition
        this.pager = { ...this.pager, ...pager }
        this.getPageData(pager.current, pager.pageSize, isSetHistory)
        this.props.form.setFieldsValue({ name, type:type?type:undefined})
    }

    edit = (id) => {
        this.props.dispatch({
            type: 'wxpublic_qrcode/qrcodeDetail',
            payload: { id }
        })
        this.setState({
            model: {
                visible: true,
                id: id
            }
        })
    }
    onCancel = () => {
        this.setState({
            model: {
                visible: false,
                id: null
            }
        })
    }

    getPageData = (current = 1, pageSize = this.pager.pageSize, isSetHistory = true) => {
        let pager = { current, pageSize }
        this.setState({ loading: true })
        if (isSetHistory) {
            this.history({ ...this.form }, pager)
        }
        let payload = {
            name: this.form.name,
            type: this.form.type,
            qrcode_type: this.props.qrcode_type,
            offset: (pager.current - 1) * pager.pageSize,
            limit: pager.pageSize
        }
        this.props.dispatch({
            type: 'wxpublic_qrcode/qrcodeList',
            payload,
            callback: (data) => {
                this.setState({
                    loading: false,
                    pager
                })
            }
        })
    }

    handlePageChange = (page) => {
        this.pager.current = page
        this.getPageData(this.pager.current)
    }

    handleChangeSize = (current, size) => {
        this.pager.current = current
        this.pager.pageSize = size
        this.getPageData(this.pager.current,this.pager.pageSize)
    }

    handleSearch = () => {
        this.getPageData()
    }
    handleChangeTabs = (value) => {
        this.form.tab = value
        this.setState({
            tab: value
        })
        this.getPageData()
    }

    confirm = (id) => {
        this.props.dispatch({
            type: 'wxpublic_qrcode/deleteQrcode',
            payload: { id },
            callback: () => {
                message.success('删除成功')
                this.getPageData()
            }
        })
    }
    getColumns = () => {
        let today = new Date()
        const { qrcode_type } = this.props
        let columnsBefore = [{
            title: '公众号名称',
            dataIndex: 'mp_name',
            key: 'mp_name',
        }, {
            title: '二维码名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '回复类型',
            dataIndex: 'type',
            key: 'type',
            render: (data) => {
                const _type = REPLY_TYPE.filter(item => item.value === data + '')
                return _type[0] && _type[0].text
            }
        }]
        let columnsQS = [{
            title: '二维码',
            dataIndex: 'qrcode_url',
            key: 'qrcode_url',
            render: (url) =>
                url ? <Popover placement="right" arrowPointAtCenter content={
                    <img src={url} style={{maxWidth:200}} alt="二维码" />
                } trigger="hover">
                    <img src={url} width='40' height='40' alt="二维码" />
                </Popover> : null
        }, {
            title: '有效期(天)',
            dataIndex: 'expired',
            key: 'expired',
            align:'center',
            render: (data,row) =>
                <span>
                    { data + '' === '-1' ? '永久' : today >= moment(row.expired_at) ? <Badge status="error" text="已过期" /> : data}
                </span>
        }, {
            title: '到期时间',
            dataIndex: 'expired_at',
            key: 'expired_at',
            render: (data,row) =>
                <span>
                    { row.expired + '' === '-1' ? '永久' : data }
                </span>
        }]

        let columnsAfter = [{
            title: '扫描次数',
            dataIndex: 'scan_count',
            align:'center',
            key: 'scan_count',
        }, {
            title: '新增粉丝',
            dataIndex: 'fans_count',
            align:'center',
            key: 'fans_count',
        }, {
            title: '最后编辑时间',
            dataIndex: 'updated_at',
            key: 'updated_at',
        }]

        const operationRender = {
            1: {
                render: (id, row) =>
                    <div>
                        {
                            row.expired + '' === '-1' || today < moment(row.expired_at) ?
                                <Link to={`wxpublic_qrcode/qrcode?id=${id}`} className={styles.spilt_icon}>编辑</Link> :
                                <Link to={`wxpublic_qrcode/qrcode?showid=${id}`} className={styles.spilt_icon}>查看</Link>
                        }
                        <a onClick={e => this.handleDownload(e,row)} className={styles.spilt_icon} >下载二维码</a>
                        <Popconfirm placement="bottomRight" title={"您是否确定删除此二维码？"} onConfirm={e => this.confirm(id)} okText="删除" cancelText="取消">
                            <a onClick={e => e.preventDefault()}>删除</a>
                        </Popconfirm>
                    </div>
            },
            2: {
                render: id =>
                    <div>
                        <Link to={'1'} className={styles.spilt_icon}>编辑</Link>
                        <Link to={'1'} className={styles.spilt_icon}>明细</Link>
                        <Popconfirm placement="bottomRight" title={"您是否确定删除此项？"} onConfirm={e => this.confirm(id)} okText="删除" cancelText="取消">
                            <a onClick={e => e.preventDefault()}>删除</a>
                        </Popconfirm>
                    </div>
            }
        }

        const operation = [{
            title: '操作',
            dataIndex: 'id',
            key: 'id',
            render: operationRender[qrcode_type].render
        }]

        return columnsBefore.concat(qrcode_type === '1' ? columnsQS : [], columnsAfter, operation)
    }

    handleDownload = (e,row) =>{
        e.preventDefault()
        this.setState({
            downloadVisible : true,
            imgUrl:row
        })
    }
    handleDownloadClose = () =>{
        this.setState({
            downloadVisible : false,
            imgUrl:''
        }) 
    }
    onReset= () => {
        this.props.form.resetFields()
        this.form = {}
        this.getPageData()
    }


    render() {

        const { list, total } = this.props.wxpublic_qrcode
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            }
        }

        const columns = this.getColumns()
        const { getFieldDecorator } = this.props.form
        // const { qrcode_type } = this.props
        const content = <div style={{maxWidth:360}}>
            <p>1. 利用参数二维码将粉丝引流到公众号，应用场景为线上、线下的活动，例如，粉丝卡、海报等；</p>
            <p>2. 粉丝扫描参数二维码时，可提供关注公众号、推送相关事件等功能，例如图文、活动等引导性信息；</p>
        </div>

        const titleHelp = <Popover content={content} placement="bottomLeft" title="" trigger="hover">
            <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type='question-circle' />
        </Popover>
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="参数二维码"
                    titleHelp={titleHelp}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E5%85%AC%E4%BC%97%E5%8F%B7%E6%8E%A8%E5%B9%BF.md"
                    action={<Link to='wxpublic_qrcode/qrcode'><Button type="primary" onClick={this.ceateTemplate}><Icon type="plus" /> 创建二维码</Button></Link> }
                />
                <Page.ContentAdvSearch hasGutter={false}>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <Form.Item style={{ marginBottom: 0 }} label="二维码名称：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('name', {})(
                                            <Input placeholder="请输入" maxLength={30} onChange={(e) => { this.form.name = e.target.value }} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item style={{ marginBottom: 0 }} label="回复类型：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('type', {})(
                                            <Select
                                                allowClear
                                                placeholder='请选择'
                                                optionFilterProp="children"
                                                onChange={value => this.form.type = value}
                                            >
                                                <Option value=''>全部</Option>  
                                                {
                                                    REPLY_TYPE.map((item, index) => <Option key={index} value={item.value} >{item.text}</Option>)
                                                }
                                            </Select>)
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button onClick={e => { e.preventDefault(); this.handleSearch() }} style={{ marginRight: 16 }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button onClick={e => { e.preventDefault();this.onReset() }} className="hz-btn-width-default" >
                                        重置
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>

                <Page.ContentTable>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={this.state.loading}
                    />
                </Page.ContentTable>

                {total > 0 ? (<Pagination
                    className="ant-table-pagination"
                    total={total}
                    current={this.state.pager.current}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={this.state.pager.pageSize}
                    showSizeChanger={true}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.handlePageChange}
                />) : ('')}
                <QrcodeDownload
                    visible = {this.state.downloadVisible}
                    imgUrl = {this.state.imgUrl}
                    onCancel={this.handleDownloadClose}
                />
            </Page>
        )
    }
}
