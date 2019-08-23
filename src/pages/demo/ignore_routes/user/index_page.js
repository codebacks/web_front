import React from 'react'
import { Button, Popover, Icon, Row, Col, Table, Tooltip, Divider , Modal } from 'antd'
import {Form, Select, Input} from 'antd'
import Page from 'components/business/Page'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'

const Option = Select.Option

@Form.create()
@connect(({demo_user_index }) => ({
    demo_user_index 
}))
export default class Index extends React.PureComponent {
    state = {
        loading: false,
        currentPageSize: 10,
        currentPageIndex: 1
    }

    componentDidMount(){
        this.getListData()
    }

    createUserHandler = () => {
        router.push('/demo/user/create')
    }

    deleteHandler = (item) => {
        Modal.confirm({
            title: '系统提示',
            content: '删除后，与用户相关的数据将全部删除，是否确定解除？', 
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
                this.deleteUser(item.id)
            },
            onCancel() {
            }
        })
    }

    deleteUser = (id) => {
        this.props.dispatch({
            type: 'demo_user_index/delete',
            payload: {
                id
            },
            callback: () => {
                Modal.success({
                    title: '系统提示',
                    content: '删除成功',
                    onOk: () => {
                        this.getListData()
                    }
                })
            }
        })
    }

    editHandler = (item) => {
        router.push(`/demo/user/edit/${item.id}`)
    }

    searchFormSubmitHandler = (e) => {
        e.preventDefault()

        this.setState({
            currentPageIndex: 1
        }, () => {
            this.getListData()
        })
    }

    resetSearchHandler = (e) => {
        this.props.form.resetFields()
        this.getListData()
    }

    getListData(){
        this.setState({
            loading: true
        })

        this.props.form.validateFields((err, values) => {
            if (!err) {
                const condition = values

                this.props.dispatch({
                    type: 'demo_user_index/query',
                    payload: {
                        condition: condition,
                        pageOptions: {
                            pageSize: this.state.currentPageSize,
                            pageIndex: this.state.currentPageIndex
                        }
                    },
                    callback: () => {
                        this.setState({
                            loading: false
                        })
                    }
                })
            }
        })

        
    }

    changeSizeHandler = (current, size) => {
        this.setState({
            currentPageIndex: 1,
            currentPageSize: size
        }, () => {
            this.getListData()
        })
    }

    changePageHandler = (page, pageSize) => {
        this.setState({
            currentPageIndex: page
        }, () => {
            this.getListData()
        })
    }

    getStatusText(status){
        if(status === 1) {
            return "正常"
        }else{
            return "锁定"
        }
    }

    getGenderText(gender){
        if(gender === 1) {
            return "男"
        }else if(gender === 2){
            return "女"
        }else{
            return "未知"
        }
    }

    render() {

        const { demo_user_index } = this.props
        const { list, pagination } = demo_user_index

        const { form } = this.props
        const { getFieldDecorator } = form

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 190,
        },
        {
            title: '账号',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => this.getGenderText(gender)
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => this.getStatusText(status)
        },
        {
            title: (<span>手机号 <Popover content="请注意保密">
                <Icon className="hz-text-primary" type="question-circle"></Icon></Popover></span>),
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: '创建时间',
            dataIndex: 'dataCreated',
            key: 'dataCreated',
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 210,
            render: (text, record) => (
                <span>
                    <Tooltip title="编辑此信息">
                        <a href="javascript:void(0);" onClick={()=> this.editHandler(record)}>编辑</a>
                    </Tooltip>
                    <Divider type="vertical"/>
                    <a href="javascript:void(0);" onClick={() => this.deleteHandler(record)}>删除</a>
                    <Divider type="vertical"/>
                    <a href="javascript:void(0);" className="ant-dropdown-link">
                    更多 <Icon type="down"/>
                    </a>
                </span>
            ),
        }
        ]

        const action = (<div>
            <Button type="primary" onClick={this.createUserHandler}><Icon type="plus"/>创建用户</Button>
            <span className="hz-page-content-action-description">
                <Popover placement="bottomLeft" content={<div><p>为保证所有功能正常,</p><p>授权时请保持默认选择，把权限统一授权给51赞</p></div>}>
                    <Icon className="hz-text-primary hz-icon-size-default" type="question-circle"/> 使用教程
                </Popover>
            </span>
            
        </div>)

        const data = list
        const total = pagination.rows_found

        return (
            <DocumentTitle title="用户管理">
                <Page>
                    <Page.ContentHeader
                        
                        title="用户列表"
                        titleHelp = {<Popover placement="bottomLeft" content={<div><p>为保证所有功能正常,</p><p>授权时请保持默认选择，把权限统一授权给51赞</p></div>}>
                            <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o"/>
                        </Popover>}
                        action={action}
                    />

                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search" onSubmit={this.searchFormSubmitHandler}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label="名称" {...formItemLayout}>
                                        {getFieldDecorator("name",{})(
                                            <Input placeholder="输入名称关键字"/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="状态" {...formItemLayout}>
                                        {getFieldDecorator("status",{})(
                                            <Select
                                                placeholder="请选择"
                                                optionFilterProp="children"
                                            >
                                                <Option value="1">正常</Option>
                                                <Option value="2">锁定</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="性别"  {...formItemLayout}>
                                        {getFieldDecorator("gender",{})(
                                            <Select
                                                placeholder="请选择"
                                                optionFilterProp="children"
                                            >
                                                <Option value="">请选择</Option>
                                                <Option value="1">男</Option>
                                                <Option value="2">女</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{width: '80px'}}></Col>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit">
                                            <Icon type="search"/>
                                            搜索
                                        </Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left" htmlType="reset" onClick={this.resetSearchHandler}>
                                            重置
                                        </Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>

                    <Table columns={columns} pagination={false} dataSource={data} rowKey="id" loading={this.state.loading} />
                    
                    <Page.Pagination 
                        current={this.state.currentPageIndex}
                        total={total}
                        pageSize={this.state.currentPageSize} 
                        onShowSizeChange={this.changeSizeHandler}
                        onChange={this.changePageHandler}
                    />
                </Page>
            </DocumentTitle>
        )
    }
}