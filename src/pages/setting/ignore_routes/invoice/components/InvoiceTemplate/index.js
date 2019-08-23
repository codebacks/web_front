/*
 * @Author: sunlzhi 
 * @Date: 2018-11-02 10:45:28 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-11 17:05:28
 */

import React, {Component} from 'react'
import {Button, Icon, Modal, Table, Form, Row, Col, Input, Pagination, message } from 'antd'
import router from 'umi/router'
import styles from './index.less'
import Page from 'components/business/Page'

const confirm = Modal.confirm

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            tabsValue: '1',
            condition: {},
            pager: {
                offset: 1,
                limit: 10,
            },
            tid: '',
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.props.onRef(this)
        this.getTaxpayers()
    }
    
    // 获取发票模板列表
    getTaxpayers = () => {
        const {condition, pager} = this.state
        this.props.dispatch({
            type: 'invoice/taxpayers',
            payload: {
                offset: (pager.offset - 1) * pager.limit,
                limit: pager.limit,
                name: condition.name,
                company_name: condition.company_name,
                taxpayer_no: condition.taxpayer_no,
            },
            callback: () => {}
        })
    }

    // 模态弹窗取消（关闭）
    handleCancel = () => {
        this.setState({
            formVisible: false,
            payConfigureVisible: false,
        })
    }

    // 点击搜索
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields(['search_template_name', 'search_company_name', 'search_taxpayer'], (err, values) => {
            // console.log(values)
            if (!err) {
                const {condition, pager} = this.state
                pager.offset = 1
                condition.name = values.search_template_name
                condition.company_name = values.search_company_name
                condition.taxpayer_no = values.search_taxpayer

                this.setState({
                    pager,
                    condition,
                },()=>{
                    this.getTaxpayers()
                })
            }
        })
    }

    // 选择每页的条数
    handleChangeSize = (value, pageSize) => {
        const { pager } = this.state
        pager.offset = 1
        pager.limit = pageSize

        this.setState({
            pager
        },()=>{
            this.getTaxpayers()
        })
    }

    // 换页
    goToPage = (page) => {
        const { pager } = this.state
        pager.offset = page
        
        this.setState({
            pager
        },()=>{
            this.getTaxpayers()
        })
    }
    
    // 删除点击
    onDelete = (id) => {
        this.batchDeleteConfirm(id)
    }

    // 删除商品
    batchDeleteConfirm = (id) => {
        confirm({
            title: `确认操作`,
            content: `是否删除选中的模板`,
            maskClosable: true,
            centered: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'invoice/deleteTaxpayers',
                    payload: {
                        id: id,
                    },
                    callback: (res) => {
                        message.success('删除成功')
                        this.getTaxpayers()
                    }
                })
            },
            onCancel() {
            },
        })
    }

    // 点击新增商品
    routerAdd = () => {
        router.push({
            pathname: '/mall/goods_management/add_good',
        })
    }

    // 点击新增/修改模板
    addTemplate = (id) => {
        this.props.jumpAddTemplate(id)
    }

    // 修改完成后修改tid
    changeTid = () => {
        this.setState({
            tid: ''
        })
    }
    
    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    render() {
        const {pager} = this.state
        const { taxpayersData, taxpayersPagination } = this.props.invoice
        const { getFieldDecorator } = this.props.form
        // const { templateVisible } = this.props
        
        // 发票模板列表table
        const columns = [
            {
                title: '公司名称',
                dataIndex: 'company_name',
                key: 'company_name',
            }, {
                title: '纳税人识别号',
                dataIndex: 'taxpayer_no',
                key: 'taxpayer_no',
            }, {
                title: '注册地址',
                dataIndex: 'register_province,register_city,register_region,register_address',
                render: (text, record) => {
                    return (
                        <div>
                            {record.register_province + record.register_city + record.register_region}
                            <br/>
                            {record.register_address}
                        </div>
                    )
                },
            }, {
                title: '注册电话',
                dataIndex: 'register_phone',
                key: 'register_phone',
            }, {
                title: '开户银行',
                dataIndex: 'bank_name',
                key: 'bank_name',
            }, {
                title: '银行账户',
                dataIndex: 'bank_account',
                key: 'bank_account',
            }, {
                title: '模板名称',
                dataIndex: 'name',
                key: 'name',
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record) => {
                    return (
                        <div className={styles.operationBtn}>
                            <a href="javascript:;" onClick={() => this.addTemplate(record.id)}>编辑</a>
                            <span className={styles.vertical}>|</span>
                            <a href="javascript:;" onClick={() => this.onDelete(record.id)}>删除</a>
                        </div>
                    )
                },
            }
        ]

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '96px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        return <div>
            <Button type="primary" style={{marginBottom: 16, marginTop: 0}} onClick={()=>this.addTemplate()}>新增模板</Button>
            <Page.ContentAdvSearch hasGutter={false}>
                <Form layout="horizontal" className="hz-from-search">
                    <Row>
                        <Col span={8}>
                            <Form.Item label="模板名称"  {...formItemLayout}>
                                {getFieldDecorator('search_template_name', {
                                    rules: [{ whitespace: true,message: '不能只输入空格' },],
                                })(
                                    <Input placeholder="输入模板名称" type="search" maxLength={30}/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="公司名称"  {...formItemLayout}>
                                {getFieldDecorator('search_company_name', {
                                    rules: [{ whitespace: true,message: '不能只输入空格' },],
                                })(
                                    <Input placeholder="输入公司名称" type="search" maxLength={30}/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="纳税人识别号" {...formItemLayout}>
                                {getFieldDecorator('search_taxpayer', {
                                    rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '纳税人识别号为18位大写字母和数字的组合'}],
                                })(
                                    <Input placeholder="输入纳税人识别号" type="search" />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <Form.Item style={{marginBottom: 0, marginLeft: 96}}>
                                <Button className="hz-btn-width-default" type="primary" onClick={this.handleSubmit}>
                                    <Icon type="search"/>
                                    搜索
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Page.ContentAdvSearch>
            <Table 
                style={{marginTop: 16}}
                columns={columns}
                dataSource={taxpayersData}
                pagination={false} 
                rowKey="id"
            />
            {taxpayersPagination.rows_found > 0 &&
                <Pagination
                    className="ant-table-pagination"
                    current={pager.offset}
                    total={taxpayersPagination.rows_found}
                    showTotal={(total) => `共 ${total} 条`} 
                    showQuickJumper={true} 
                    showSizeChanger={true}  
                    pageSize={pager.limit} 
                    pageSizeOptions= {['10', '20', '50', '100']}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.goToPage} />
            }
        </div>
    }
}
