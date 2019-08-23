import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Select, Switch, Row, Col, Pagination, Icon, Popover, message, Tabs, Modal} from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import DivideSelect from 'components/business/DivideSelect'
import EllipsisPopover from 'components/EllipsisPopover'
import createFaceHtml from "components/Face/createFaceHtml"
import config from 'wx/common/config'
import styles from './index.less'
import NoticeModal from './components/NoticeModal'


const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions} = config

@connect(({base, community_groupNotice, loading}) => ({
    base, community_groupNotice,
    queryLoading: loading.effects['community_groupNotice/query'],
    checkMassLoading: loading.effects['community_groupNotice/checkMass'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowModal: false,
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'community_groupNotice/getGroupDivideOptions',
        })
        this.goPage(1)
    };

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'query' || key === 'notice') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_groupNotice.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_groupNotice/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupNotice.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupNotice/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_groupNotice/query',
            payload: {page: page},
        })
        this.props.dispatch({
            type: 'community_groupNotice/setProperty',
            payload: {
                onlyOne: undefined,
                selectedRows: [],
                selectedRowKeys: [],
            }
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupNotice/resetParams',
        })
    }

    refresh = () => {
        const {current} = this.props.community_groupNotice
        this.props.dispatch({type: 'community_groupNotice/resetEditBody',})
        this.props.dispatch({
            type: 'community_groupNotice/setProperty',
            payload: {
                onlyOne: undefined,
                selectedRows: [],
                selectedRowKeys: [],
            }
        })
        this.setState({
            isShowModal: false
        }, () => {
            this.goPage(current || 1)
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    handleItemShowModal = (item) => {
        this.props.dispatch({
            type: 'community_groupNotice/setProperty',
            payload: {
                selectedRows: [item],
                onlyOne: 1,
            }
        })
        setTimeout(() => {
            this.setState({
                isShowModal: true
            })
        }, 200)
    }

    handleBatchEdit = () => {
        const { selectedRows } = this.props.community_groupNotice

        if(selectedRows.length && selectedRows.length > 1) {

            this.props.dispatch({
                type: 'community_groupNotice/checkMass',
                callback: (data) => {
                    if(data.is_no_limit) { // 无限制
                        this.setState({isShowModal: true})
                    }else { // 有限制
                        const content = <>
                            <div style={{marginBottom: '10px', color: '#FFAA16'}}>为避免修改群公告骚扰客户，每个商家每日仅支持【1次】批量修改群公告</div>
                            <div>今日剩余次数：{data.left_count > 0 ? data.left_count : 0}次</div>
                        </>
                        Modal.confirm({
                            title: '批量修改群公告',
                            content: content,
                            icon: <Icon type="warning" style={{fontSize: '20px'}}/>,
                            onOk: () => {
                                this.setState({isShowModal: true})
                            },
                            okButtonProps: {
                                disabled: data.left_count <= 0
                            },
                        })
                    }
                },
            })

        }else if(selectedRows.length === 1) {
            this.props.dispatch({
                type: 'community_groupNotice/setProperty',
                payload: {onlyOne: 1}
            })
            this.setState({isShowModal: true})
        }else {
            message.warn('请先勾选要修改的群！')
        }
    }
    handleCancelModal = () => {
        this.setState({
            isShowModal: false
        })
    }


    render() {
        const {params, list, total, current, groupDivideOptionsHasAll} = this.props.community_groupNotice
        const {queryLoading, checkMassLoading=false} = this.props
        const { isShowModal } = this.state

        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: styles.groupName,
                render: (text, record) => {
                    return text ? text : record.target.display_name
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.display_name',
                key: 'target.owner.display_name',
                className: styles.owner,
                render: (text, record) => {
                    return text ? text : record.target.owner.nickname
                },
            },
            {
                title: '公告',
                dataIndex: 'target.notice',
                key: 'target.notice',
                className: styles.notice,
                render: (text, record) => {
                    const content = record?.target?.notice?.content
                    return (
                        <div>
                            { record.target.notice.content ?
                                <Popover
                                    getPopupContainer={()=>document.getElementById('table')}
                                    placement="topLeft"
                                    content={<p className={styles.noticePopover}>{createFaceHtml({
                                        tagName: 'div',
                                        tagProps: {className: styles.noticeCont},
                                        values: content,
                                        replace: (html) => {
                                            return _.unescape(html)
                                        }
                                    })}</p>}
                                    title={null}
                                    trigger="hover"
                                >
                                    <div className={styles.txt}>
                                        {
                                            createFaceHtml({
                                                tagName: 'div',
                                                tagProps: {className: styles.noticeCont},
                                                values: content,
                                                replace: (html) => {
                                                    return _.unescape(html)
                                                }
                                            })
                                        }
                                    </div>
                                </Popover>
                                : <span>无</span> }
                            <div className={styles.edit} onClick={() => this.handleItemShowModal(record)}>编辑</div>
                        </div>
                    )
                },
            },
            {
                title: '群分组',
                dataIndex: 'target.grouping',
                key: 'target.grouping',
                className: styles.groupDivide,
                render: (text, record) => {
                    return <span>{ text?.title ? text?.title : '未分组'}</span>
                },
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                className: styles.deptColumn,
                render: (text, record) => {
                    if(record.from.user && record.from.user.departments) {
                        let departments = record.from.user.departments
                        let content = ''
                        if(departments && departments.length) {
                            content = departments.map((item) => {
                                return item.name
                            }).join('，')
                            return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                                title={null} trigger="hover">
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                key: 'user.nickname',
                className: styles.forUser,
                render: (text, record) => {
                    if(record.from.user) {
                        return record.from.user.nickname
                    }
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.nickname',
                key: 'from.nickname',
                className: styles.forWx,
            },
            {
                title: '备注',
                dataIndex: 'target.remark',
                key: 'target.remark',
                className: styles.remark,
                render: (text, record) => {
                    return record.target.remark ? record.target.remark : '-'
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }


        const rowSelection = {
            columnWidth: '8%',
            selectedRowKeys: this.props.community_groupNotice.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.props.dispatch({
                    type: 'community_groupNotice/setProperty',
                    payload: {
                        selectedRows: selectedRows,
                        selectedRowKeys: selectedRowKeys,
                        onlyOne: selectedRows.length ? 0: undefined,
                    }
                })
            },
        }

        return (
            <Fragment>
                <div className={styles.groupNotice}>
                    <div className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem {...formItemLayout}
                                    label="搜索："
                                    colon={false}
                                >
                                    <Input placeholder="输入群名称、备注"
                                        value={params.query}
                                        onChange={(e) => {
                                            this.handleChange('query', e)
                                        }}
                                        onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                    <DepartmentSelect
                                        departmentId={params.department_id}
                                        onChange={(value) => {
                                            this.handleChange('department_id', value)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                    <UserSelect
                                        departmentId={params.department_id}
                                        userId={params.user_id}
                                        onChange={(value) => {
                                            this.handleChange('user_id', value)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                    <WeChatSelectSingle
                                        departmentId={params.department_id}
                                        userId={params.user_id}
                                        uin={params.uin}
                                        onChange={(value) => {
                                            this.handleChange('uin', value)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="公告搜索：" colon={false}>
                                    <Input placeholder="输入公告内容关键词搜索"
                                        value={params.notice}
                                        onChange={(e) => {
                                            this.handleChange('notice', e)
                                        }}
                                        onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="群分组：" colon={false}>
                                    <DivideSelect
                                        placeholder='全部分组'
                                        cls={styles.divideSelect}
                                        selectedId={params.grouping_id}
                                        data={groupDivideOptionsHasAll}
                                        onChange={(value) => {
                                            this.handleChange('grouping_id', value)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={8}>
                                <Col offset={8} style={{padding: "0"}}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.tableTop}>
                        <div className={styles.explain}>列表展示所管理微信号为群主的群，过滤员工微信号为非群主的群</div>
                        <Button
                            type="primary"
                            onClick={this.handleBatchEdit}
                            loading={checkMassLoading}
                        >批量修改群公告</Button>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            rowSelection={rowSelection}
                            dataSource={list}
                            size="middle"
                            loading={queryLoading}
                            rowKey={(record, index) => index}
                            pagination={false}
                            id='table'
                        />
                        {list.length ?
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
                            : ''}
                    </div>
                </div>
                <NoticeModal
                    visible={isShowModal}
                    onCancel={this.refresh}
                    refresh={this.refresh}
                />
            </Fragment>
        )
    }
}
