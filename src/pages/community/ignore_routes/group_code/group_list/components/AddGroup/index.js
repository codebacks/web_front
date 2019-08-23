/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/18
 */
import React, {PureComponent} from 'react'
import {Form, Input, Button, Row, Col, Table, Pagination, Modal, Switch, Select, Checkbox, Badge} from 'antd'
import {connect} from "dva/index"
import styles from './index.less'
import config from 'community/common/config'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'

const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions} = config

@connect(({base, community_groupCodeGroupList, loading}) => ({
    base,
    community_groupCodeGroupList,
    queryLoading: loading.effects['community_groupCodeGroupList/queryModalList'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'key') {
            val = e.target.value
        } else {
            val = e
        }
        let addModalParams = {...this.props.community_groupCodeGroupList.addModalParams}
        addModalParams[key] = val
        this.props.dispatch({
            type: 'community_groupCodeGroupList/setProperty',
            payload: {
                addModalParams: addModalParams,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let addModalParams = {...this.props.community_groupCodeGroupList.addModalParams}
        addModalParams.limit = size
        this.props.dispatch({
            type: 'community_groupCodeGroupList/setProperty',
            payload: {addModalParams: addModalParams},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_groupCodeGroupList/queryModalList',
            payload: {
                page: page,
                group_activity_id: this.state.group_activity_id,
            },
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupCodeGroupList/resetAddModalParams',
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
            type: 'community_groupCodeGroupList/setProperty',
            payload: {
                selectedRowKeys: [],
                selectedRows: []
            }
        })
    }
    deleteItem = (index) => {
        const {selectedRowKeys, selectedRows} = this.props.community_groupCodeGroupList
        const newSelectedRowKeys = [...selectedRowKeys]
        const newSelectedRows = [...selectedRows]
        _.remove(newSelectedRowKeys, function (item, idx) {
            return index === idx
        })
        _.remove(newSelectedRows, function (item, idx) {
            return index === idx
        })
        this.props.dispatch({
            type: 'community_groupCodeGroupList/setProperty',
            payload: {
                selectedRowKeys: newSelectedRowKeys,
                selectedRows: newSelectedRows
            }
        })
    }

    updateRows = (changeRowKeys, changeRows) => {
        let selectedRows = _.cloneDeep(this.props.community_groupCodeGroupList?.selectedRows)

        // 先往selectedRows添加选中的
        if(changeRows?.length) {
            changeRows.forEach((row) => {
                const findItem = selectedRows.find(item => item?.chatroom_id === row?.chatroom_id)
                if(!findItem) {
                    selectedRows.push(row)
                }
            })
        }

        // 清理selectedRows中未选中的，（selectedRows循环体内删除selectedRows的item，需要重新赋值个变量）
        let newSelectedRows = [...selectedRows]
        selectedRows.forEach((item) => {
            const findItem = changeRowKeys.find(key => key === item?.chatroom_id)
            if(!findItem){
                const deleteIndex = newSelectedRows.indexOf(item)
                newSelectedRows.splice(deleteIndex, 1)
            }
        })
        return newSelectedRows
    }

    render() {
        const { addModalParams, addModalTotal, addModalCurrent, addModalList, selectedRowKeys, selectedRows, top } = this.props.community_groupCodeGroupList
        const { visible } = this.props

        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 18}, }

        const columns = [
            {
                title: '群名称',
                dataIndex: 'displayname',
                className: styles.displayname,
                render: (text, record, index) => {
                    return <span>{ text ? <EllipsisPopover lines={3} content={text} />: '' }</span>
                },
            },
            {
                title: '群备注',
                dataIndex: 'remark',
                className: styles.remark,
                render: (text, record, index) => {
                    return <span>{ text ? <EllipsisPopover lines={3} content={text} />: '' }</span>
                },
            },
            {
                title: '群主',
                dataIndex: 'roomowner_nickname',
                className: styles.owner,
                render: (text, record, index) => {
                    return <span>{ text ? <EllipsisPopover lines={3} content={text} />: '' }</span>
                },
            },
            {
                title: '群成员数',
                dataIndex: 'member_count',
                className: styles.memberCount,
                align: 'center',
                render: (text, record, index) => {
                    return <span>{ text }</span>
                },
            },
            {
                title: '群活动',
                dataIndex: 'group_activity_title',
                className: styles.activityTitle,
                render: (text, record, index) => {
                    return <span>{ text }</span>
                },
            },
        ]
        const columns2 = [
            {
                title: '群名称',
                dataIndex: 'displayname',
                className: styles.displayname,
                render: (text, record, index) => {
                    return <span>{ text ? <EllipsisPopover lines={3} content={text} />: '' }</span>
                },
            },
            {
                title: '群备注',
                dataIndex: 'remark',
                className: styles.remark,
                render: (text, record, index) => {
                    return <span>{ text ? <EllipsisPopover lines={3} content={text} />: '' }</span>
                },
            },
            {
                title: '群主',
                dataIndex: 'roomowner_nickname',
                className: styles.owner,
                render: (text, record, index) => {
                    return <span>{ text ? <EllipsisPopover lines={3} content={text} />: '' }</span>
                },
            },
            {
                title: '群成员数',
                dataIndex: 'member_count',
                className: styles.memberCount,
                align: 'center',
                render: (text, record, index) => {
                    return <span>{ text }</span>
                },
            },
            {
                title: '群活动',
                dataIndex: 'group_activity_title',
                className: styles.activityTitle,
                render: (text, record, index) => {
                    return <span>{ text }</span>
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
            selectedRowKeys: selectedRowKeys,
            onChange: (changeRowKeys, changeRows) => {
                // changeRowKeys支持所有页选中的keys，changeRows只支持当前页选中的rows，
                console.log('onChange')
                let newSelectedRows = this.updateRows(changeRowKeys, changeRows)

                this.props.dispatch({
                    type: 'community_groupCodeGroupList/setProperty',
                    payload: {
                        selectedRowKeys: changeRowKeys,
                        selectedRows: newSelectedRows
                    }
                })
            },
            getCheckboxProps: record => ({
                disabled: record?.group_activity_title === top?.group_activity?.title
            }),
        }

        return (
            <Modal
                title="添加群"
                width={1400}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <div className={styles.searchGroup}>
                    <div className={styles.left}>
                        <div className={styles.searchWrap}>
                            <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                                <Row>{'列表显示群主为员工微信号的群以及人数<95人的群'}</Row>
                                <Row style={{margin: 10}}>
                                    <Col>
                                        <span style={{color: '#f00'}}>*</span> 请选择要添加的群：
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={12}>
                                        <FormItem {...formItemLayout} label="搜索：" colon={false} >
                                            <Input placeholder="输入群名称、备注搜索" value={addModalParams.key} onChange={(e) => this.handleChange('key', e)} />
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...formItemLayout} label="群活动：" colon={false}>
                                            <Select
                                                style={{width: '100%'}}
                                                value={addModalParams.exclude_activty}
                                                onChange={(e) => {this.handleChange('exclude_activty', e)}}
                                                placeholder='全部'
                                            >
                                                <Option value={0}>全部</Option>
                                                <Option value={1}>未加入</Option>
                                                <Option value={2}>已加入</Option>
                                            </Select>
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
                                dataSource={addModalList}
                                size="middle"
                                rowKey={(record, index) => record?.chatroom_id}
                                pagination={false}
                                loading={this.props.queryLoading}
                                rowClassName={(record, index)=> record.group_activity_title ? styles.inActivityRow: ''}
                            />
                        </div>
                        {addModalList.length ? (
                            <Pagination
                                className="ant-table-pagination"
                                total={addModalTotal}
                                current={addModalCurrent}
                                showQuickJumper={true}
                                pageSizeOptions={pageSizeOptions}
                                showTotal={addModalTotal => `共 ${addModalTotal} 条`}
                                pageSize={addModalParams.limit}
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
                            <div style={{marginRight: 20}}>已选群数量：{selectedRows.length}个</div>
                            <Button type='primary' onClick={this.deleteAll}>清空已选</Button>
                        </div>
                        <div className={styles.tableWrap}>
                            <Table
                                columns={columns2}
                                dataSource={selectedRows}
                                size="middle"
                                rowKey={(record, index) => index}
                                pagination={false}
                                // scroll={{ y: 600 }}
                                rowClassName={(record, index)=> record.group_activity_title ? styles.inActivityRow: ''}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}
