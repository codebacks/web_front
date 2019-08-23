/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/12
*/
import React, {PureComponent} from 'react'
import { Form, Input, Button, Row, Col, Table, Pagination, Modal, Switch, Icon, InputNumber, message } from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'community/common/config'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'
import {hot} from "react-hot-loader"
import ContentHeader from 'business/ContentHeader'
import UpdateDivide from './components/UpdateDivide'
import styles from './index.less'

const FormItem = Form.Item
const {pageSizeOptions} = config
const confirm = Modal.confirm


@hot(module)
@connect(({community_groupDivide, loading}) => ({
    community_groupDivide,
    queryLoading: loading.effects['community_groupDivide/query'],
}))
@documentTitleDecorator()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    componentWillUnmount() {
        this.resetParams()
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupDivide.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupDivide/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_groupDivide/query',
            payload: {page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupDivide/resetParams',
        })
    }

    refresh = () => {
        const { current } = this.props.community_groupDivide
        this.goPage(current || 1)
    }

    deleteDivide = (record) => {
        if(record?.chatroom_cnt) {
            message.warning('请先前往群管理将该分组下的群都设置为未分组后再做删除！')
            return
        }
        confirm({
            title: '删除分组',
            content: '确定要删除该分组？',
            onOk: () => {
                return new Promise((resolve, reject) => {
                    this.props.dispatch({
                        type: 'community_groupDivide/deleteDivide',
                        payload: {
                            id: record?.id
                        },
                        callback: () => {
                            resolve()
                            this.refresh()
                        }
                    })
                })

            },
        })
    }

    updateDivideOk = (parameter) => { // 由UpdateDivide组件传出来的parameter
        let { record, type, title, remark } = parameter
        if(!title || !title.trim()) {
            message.warning('请输入分组名称')
            return false
        }
        if(type === 'add') {
            this.props.dispatch({
                type: 'community_groupDivide/add',
                payload: {
                    body: {
                        title,
                        remark,
                    },
                },
                callback: () => {
                    message.success('创建成功！', 1)
                    this.refresh()
                }
            })
        }
        if(type === 'update') {
            this.props.dispatch({
                type: 'community_groupDivide/update',
                payload: {
                    id: record?.id,
                    body: {
                        title,
                        remark,
                    },
                },
                callback: () => {
                    message.success('修改成功！', 1)
                    this.refresh()
                }
            })
        }
        return true
    }

    render() {
        const { params, total, current, list } = this.props.community_groupDivide
        const { queryLoading, } = this.props

        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 16}, }
        const columns = [
            {
                title: '分组名称',
                dataIndex: 'title',
                className: styles.title,
            },
            {
                title: '分组备注',
                dataIndex: 'remark',
                className: styles.remark,
                render: (text, record) => {
                    return <EllipsisPopover content={text} lines={2} ellipsisClassName={styles.txt}/>
                }
            },
            {
                title: '数量',
                dataIndex: 'chatroom_cnt',
                className: styles.chatroomCnt,
                align: 'center',
            },
            {
                title: '操作',
                dataIndex: 'edit',
                className: styles.edit,
                render: (text, record) => {
                    return (<>
                            <UpdateDivide
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.canEdit}
                                            style={{marginRight: 20}}
                                            onClick={() => {setTrue()}}
                                        >修改</span>
                                    )
                                }}
                                record={record}
                                type='update'
                                onOk={this.updateDivideOk}
                                modalOption={{
                                    title: '编辑分组'
                                }}
                            />
                            <span className={styles.canEdit} onClick={() => this.deleteDivide(record)}>删除</span>
                        </>)
                }
            },
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BE%A4%E5%88%86%E7%BB%84.md',
                    }}
                />
                <div className={styles.groupDivide}>
                    <div className={styles.top}>
                        <UpdateDivide
                            renderBtn={(setTrue) => {
                                return (
                                    <Button type='primary' onClick={() => {setTrue()}}>创建分组</Button>
                                )
                            }}
                            type='add'
                            refresh={this.refresh}
                            onOk={this.updateDivideOk}
                            modalOption={{
                                title: '创建分组'
                            }}
                        />
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            rowKey={(record, index) => record?.id}
                            pagination={false}
                            loading={this.props.queryLoading}
                        />
                    </div>
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
                    ) : ('')}
                </div>
            </div>
        )
    }
}
