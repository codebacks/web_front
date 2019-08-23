/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/18
 */
import React, {PureComponent} from 'react'
import {Form, Input, Button, Row, Col, Table, Pagination, Modal, Switch, Select, Checkbox, Badge, Popover} from 'antd'
import {connect} from "dva/index"
import styles from './index.less'
import config from 'community/common/config'
import EllipsisPopover from 'components/EllipsisPopover'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import _ from 'lodash'

const FormItem = Form.Item
const {pageSizeOptions} = config

@connect(({base, community_autoPull, loading}) => ({
    base,
    community_autoPull,
    queryLoading: loading.effects['community_autoPull/queryAddWechatModal'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {}

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let addWechatParams = {...this.props.community_autoPull.addWechatParams}
        addWechatParams[key] = val
        this.props.dispatch({
            type: 'community_autoPull/setProperty',
            payload: {
                addWechatParams: addWechatParams,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let addWechatParams = {...this.props.community_autoPull.addWechatParams}
        addWechatParams.limit = size
        this.props.dispatch({
            type: 'community_autoPull/setProperty',
            payload: {addWechatParams: addWechatParams},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_autoPull/queryAddWechatModal',
            payload: {
                page: page,
                group_activity_id: this.state.group_activity_id,
            },
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_autoPull/resetAddWechatParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    handleOk = () => {
        this.props.onOk()
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    deleteAll = () => {
        this.props.dispatch({
            type: 'community_autoPull/setProperty',
            payload: {
                selectedRowKeys: [],
                selectedRows: []
            }
        })
    }
    deleteItem = (index) => {
        console.log(index)
        const {selectedRowKeys, selectedRows} = this.props.community_autoPull
        const newSelectedRowKeys = [...selectedRowKeys]
        const newSelectedRows = [...selectedRows]
        _.remove(newSelectedRowKeys, function (item, idx) {
            return index === idx
        })
        _.remove(newSelectedRows, function (item, idx) {
            return index === idx
        })
        this.props.dispatch({
            type: 'community_autoPull/setProperty',
            payload: {
                selectedRowKeys: newSelectedRowKeys,
                selectedRows: newSelectedRows
            }
        })
    }


    render() {
        const { addWechatParams, addWechatTotal, addWechatCurrent, addWechatList, selectedRows, } = this.props.community_autoPull
        const { visible } = this.props

        const formInputLayout = { labelCol: {span: 4}, wrapperCol: {span: 20}, }
        const formItemLayout = { labelCol: {span: 8}, wrapperCol: {span: 16}, }

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                className: styles.nickname,
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                className: styles.alias,
                render: (text, record) => {
                    return <span>{ text ? text : record?.username}</span>
                },
            },
            {
                title: '微信备注',
                dataIndex: 'remark',
                className: styles.remark,
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={<p style={{'maxWidth': '240px', 'wordBreak': 'break-all',}}>{content}</p>}
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user',
                className: styles.userColumn,
                render: (text, record) => {
                    return text.nickname
                },
            },
        ]
        const columns2 = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                className: styles.nickname,
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                className: styles.alias,
                render: (text, record) => {
                    return <span>{ text ? text : record?.username}</span>
                },
            },
            {
                title: '微信备注',
                dataIndex: 'remark',
                className: styles.remark,
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={<p style={{'maxWidth': '240px', 'wordBreak': 'break-all',}}>{content}</p>}
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user',
                className: styles.userColumn,
                render: (text, record) => {
                    return text.nickname
                },
            },
            {
                title: '操作',
                dataIndex: 'delete',
                className: styles.deleteItem,
                align: 'center',
                render: (text, record, index) => {
                    return <span className={styles.canEdit} onClick={() => this.deleteItem(index)}>删除</span>
                },
            },
        ]
        const rowSelection = {
            columnWidth: '8%',
            selectedRowKeys: this.props.community_autoPull.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.props.dispatch({
                    type: 'community_autoPull/setProperty',
                    payload: {
                        selectedRowKeys: selectedRowKeys,
                        selectedRows: selectedRows
                    }
                })
            },
            getCheckboxProps: record => ({
                disabled: !!record?.auto_group?.is_setted
            }),
        }

        return (
            <Modal
                title="添加微信号"
                width={1400}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <div className={styles.searchGroup}>
                    <div className={styles.left}>
                        <div className={styles.searchWrap}>
                            <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                                <Row gutter={20}>
                                    <Col span={24}>
                                        <FormItem {...formInputLayout} label="搜索：" colon={false} >
                                            <Input placeholder="搜索微信昵称/微信号/微信备注" value={addWechatParams.query} onChange={(e) => this.handleChange('query', e)} />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={12}>
                                        <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                            <DepartmentSelect
                                                departmentId={addWechatParams.department_id}
                                                onChange={(value) => {
                                                    this.handleChange('department_id', value)
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                            <UserSelect
                                                departmentId={addWechatParams.department_id}
                                                userId={addWechatParams.user_id}
                                                onChange={(value) => {
                                                    this.handleChange('user_id', value)
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row style={{marginBottom: 20}}>
                                    <Col>
                                        <Button type="primary" icon="search" onClick={this.handleSearch} style={{marginRight: 20}}>搜索</Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <div className={styles.tableWrap}>
                            <Table
                                columns={columns}
                                rowSelection={rowSelection}
                                dataSource={addWechatList}
                                size="middle"
                                rowKey={(record, index) => record?.id}
                                pagination={false}
                                loading={this.props.queryLoading}
                            />
                        </div>
                        {addWechatList.length ? (
                            <Pagination
                                className="ant-table-pagination"
                                total={addWechatTotal}
                                current={addWechatCurrent}
                                showQuickJumper={true}
                                pageSizeOptions={pageSizeOptions}
                                showTotal={addWechatTotal => `共 ${addWechatTotal} 条`}
                                pageSize={addWechatParams.limit}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goPage}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    <div className={styles.right}>
                        <div className={styles.rightTop}>
                            <div style={{marginRight: 20}}>已选微信号数量：{selectedRows.length}个</div>
                            <Button type='primary' onClick={this.deleteAll}>清空已选</Button>
                        </div>
                        <div className={styles.tableWrap}>
                            <Table
                                columns={columns2}
                                dataSource={selectedRows}
                                size="middle"
                                rowKey={(record, index) => index}
                                pagination={false}
                                scroll={{ y: 600 }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}
