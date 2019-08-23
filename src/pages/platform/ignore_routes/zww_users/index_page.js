/*
 * @Author: sunlizhi 
 * @Date: 2018-11-28 10:30:03 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-05 16:59:41
 */

// import { PureComponent } from 'react'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Table, Pagination, Form, Row, Col, Input, DatePicker ,message} from 'antd'
import styles from './index.less'
import moment from 'moment'

const { RangePicker } = DatePicker

const DEFAULT_CONDITION = {
    wx_nickname: '',
    mobile: '',
    beginAt: '',
    endAt: '',
    order_by: '',
}


@Form.create()
@connect(({zww_users, base}) =>({
    zww_users, base
}))
export default class extends Page.ListPureComponent {
    state = {
        loading: true,
        sortedInfo: {},
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { wx_nickname, mobile, beginAt, endAt, order_by } = condition

        this.getPageData(condition, pager, isSetHistory)
        
        this.props.form.setFieldsValue({
            'wx_nickname': wx_nickname,
            'phoneNoInput': mobile,
            'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [],
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {

        if(condition.mobile && !/^1[0-9]{10}$/.test(condition.mobile)){
            if(!this.isMessage){
                this.isMessage = true
                message.error('请输入正确的手机号码').then(()=> this.isMessage = false)
            }
            return
        }
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        
        this.props.dispatch({
            type: 'zww_users/getUserManagementList',
            payload: {
                offset: (pager.current - 1)* pager.pageSize,
                limit: pager.pageSize,
                wx_nickname: condition.wx_nickname,
                begin_at: condition.beginAt,
                end_at: condition.endAt,
                mobile: condition.mobile,
                order_by: condition.order_by
            },
            callback: (data) => {
                const sortedInfo = {}
                if (condition.order_by) {
                    let order_by = condition.order_by.split(' ')
                    sortedInfo.field = order_by[0]
                    sortedInfo.order = order_by[1] === 'desc' ? 'descend' : 'ascend'
                }
                this.setState({
                    sortedInfo,
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    searchData = () => {
        const { form } = this.props
        
        form.validateFields((error,value) => {

            let beginAt = '', endAt = ''
            
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    wx_nickname: value.wx_nickname,
                    mobile: value.phoneNoInput || '',
                    endAt: endAt,
                    beginAt: beginAt,
                }
            }

            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            
            this.getPageData(condition, pager)
        })
    }


    /* 事件处理 */
    onSubmit = (e) => {
        e.preventDefault()
        this.searchData()
    }

    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }

    // 点击编辑跳转用户信息
    routerEdit = (id) => {
        router.push({
            pathname: '/platform/zww_users/account_record',
            query: {
                uid: id
            }
        })
    }

    // 表格排序
    onTableChange = (pagination, filters, sorter) => {
        let { condition, pager } = this.state

        if (sorter.field) {
            condition.order_by = sorter.field + (sorter.order === 'descend' ? ' desc' : ' asc')
        } else {
            condition.order_by = ''
        }
        pager.current = 1

        this.getPageData(condition, pager)

        this.setState({
            sortedInfo: sorter
        })
    }

    render () {
        const { getFieldDecorator } = this.props.form
        const { userManagementList, count } = this.props.zww_users
        const { current, pageSize } = this.state.pager
        const { sortedInfo } = this.state

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const longItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            }
        }

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'wx_nickname'
            },
            {
                title: '发送虎赞账号',
                dataIndex: 'user',
                render:(user,row)=> user && user.nickname
            },
            {
                title: '创建日期',
                dataIndex: 'created_at'
            },
            {
                title: '手机号',
                dataIndex: 'mobile',
            },
            {
                title: '最后登录时间',
                dataIndex: 'last_login_at'
            },
            {
                title: '已消费游戏币',
                dataIndex: 'consumed_coin_count',
                sorter: true,
                align:'center',
                sortOrder: sortedInfo.field === 'consumed_coin_count' && sortedInfo.order,
            },
            {
                title: '剩余游戏币',
                dataIndex: 'left_coin_count',
                align:'center',
                sorter: true,
                sortOrder: sortedInfo.field === 'left_coin_count' && sortedInfo.order,
            },
            {
                title: '账户记录',
                dataIndex: 'action',
                render: (text, record) => {
                    return (
                        <a href='javascript:;' onClick={()=>this.routerEdit(record.doll_id)}>查看</a>
                    )
                }
            },
        ]

        return (
            <DocumentTitle title='用户管理'>
                <Page>
                    <Page.ContentHeader
                        title='用户管理'
                        helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%A4%A9%E5%A4%A9%E6%8A%93%E5%A8%83%E5%A8%83.md'
                    />
                    <Page.ContentAdvSearch >
                        <Form onSubmit={this.onSubmit} layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='微信昵称' {...formItemLayout}>
                                        {getFieldDecorator('wx_nickname',{})(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='手机号' {...longItemLayout}>
                                        {getFieldDecorator('phoneNoInput',{})(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='创建日期' {...formItemLayout}>
                                        {getFieldDecorator('rangePicker',{})(
                                            <RangePicker/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button type='primary' icon="search" style={{marginLeft: '80px'}} htmlType='submit'>搜索</Button>
                            <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                        </Form>
                    </Page.ContentAdvSearch>
                    
                    <Table
                        className={styles.table}
                        columns={columns}
                        dataSource={userManagementList}
                        onChange={this.onTableChange}
                        // loading={this.state.loading}
                        pagination={false}
                        rowKey='id'
                    />
                    {parseFloat(count) ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={parseFloat(count)}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleListPageChangeSize}
                            onChange={this.handleListPageChange} />
                        : ''
                    }
                </Page>
            </DocumentTitle>
        )
    }
}
