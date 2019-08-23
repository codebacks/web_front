/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Button,
    message,
    Table,
    Modal,
    Divider,
    Row,
    Col,
    Input,
    Select,
} from 'antd'
import {connect} from "dva/index"
import Toggle from 'components/Toggle'
import ModalForm from './components/ModalForm'
import styles from './index.less'
import {hot} from "react-hot-loader"
import _ from 'lodash'

const matchType = {
    '0': '完全匹配',
    '1': '包含匹配',
}

const Option = Select.Option

@hot(module)
@connect(({base, community_groupRules, loading}) => ({
    base,
    community_groupRules,
    categoryUpdateLoading: loading.effects['community_groupRules/categoryUpdate'],
    categoryLoading: loading.effects['community_groupRules/category'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            match_type: -1,
            content: '',
        }
    }

    componentDidMount() {

    }

    setStateByPath = (path, value) => {
        value = value.trim()

        this.props.dispatch({
            type: 'community_groupRules/setStateByPath',
            payload: {
                path,
                value,
            },
        })
    }

    search = () => {
        const {match_type, content} = this.state

        this.props.dispatch({
            type: 'community_groupRules/search',
            payload: {match_type, content},
        })
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_groupRules.match_contents.current
        }
        this.props.dispatch({
            type: 'community_groupRules/setStateByPath',
            payload: {
                path: `match_contents.current`,
                value: page,
            },
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'community_groupRules/assignStateByPath',
            payload: {
                path: `match_contents`,
                value: {
                    current: 1,
                    limit: size,
                },
            },
        })
    }

    move = (record, preIndex, nextIndex) => {
        const {
            match_contents: {
                filter,
            },
        } = this.props.community_groupRules
        let ord = 0
        if(nextIndex === 0) {
            ord = filter[nextIndex].ord - 1
        }else if(preIndex === (filter.length - 1)) {
            ord = filter[preIndex].ord + 1
        }else {
            ord = (filter[preIndex].ord + filter[nextIndex].ord) / 2
        }

        this.props.dispatch({
            type: 'community_groupRules/edit',
            payload: {id: record.id, ord},
        })
        message.success('移动成功')
    }

    handleRemove = (record) => {
        Modal.confirm({
            title: '确定删除该内容？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'community_groupRules/delete',
                    payload: {id: record.id},
                })
                message.success('删除成功')
            },
            onCancel() {
            },
        })
    }

    change = (name, value) => {
        this.setState({
            [name]: value,
        })
    }

    render() {
        const {
            categoryUpdateLoading,
            categoryLoading,
            community_groupRules,
            dispatch,
            base,
        } = this.props
        const {
            match_contents: {
                filter,
                current,
                limit,
            },
            category,
        } = community_groupRules

        const {
            match_type,
            content,
        } = this.state

        const columns = [
            {
                title: '匹配规则',
                dataIndex: 'match_type',
                render: (text, record, index) => {
                    return matchType[text] || ''
                },
            },
            {
                title: '内容',
                dataIndex: 'content',
            },
            {
                title: '创建人',
                dataIndex: 'creator_name',
                render: (text, record, index)=>{
                    return text || _.get(base, 'initData.user.nickname', '')
                }
            },
            {
                title: '操作',
                key: 'operator',
                render: (text, record, index) => {
                    const idx = filter.findIndex(item => item.id === record.id)

                    return (
                        <div className={styles.operator}>
                            <Toggle>
                                {(
                                    {
                                        setTrue,
                                        status,
                                        setFalse,
                                    },
                                ) => (
                                    <>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={setTrue}
                                        >
                                            编辑
                                        </span>
                                        <ModalForm
                                            userId={_.get(base, 'initData.user.id')}
                                            dispatch={dispatch}
                                            record={record}
                                            modalOption={{
                                                visible: status,
                                                onCancel: setFalse,
                                                maskClosable: false,
                                                width: 640,
                                                destroyOnClose: true,
                                                title: '编辑关键内容',
                                            }}
                                        />
                                    </>
                                )}
                            </Toggle>
                            <Divider type="vertical"/>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    this.handleRemove(record)
                                }}
                            >
                                删除
                            </span>
                            {
                                idx !== 0 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={() => {
                                                this.move(record, idx - 2, idx - 1)
                                            }}
                                        >
                                            上移
                                        </span>
                                    </>
                                )
                            }
                            {
                                idx !== filter.length - 1 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={() => {
                                                this.move(record, idx + 1, idx + 2)
                                            }}
                                        >
                                            下移
                                        </span>
                                    </>
                                )
                            }
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.matchContents}>
                <Row className={styles.row}>
                    <Col span={4} className={styles.leftTip}>
                        <span className={styles.required}>*</span>问题描述：
                    </Col>
                    <Col span={12}>
                        <Input
                            disabled={categoryUpdateLoading || categoryLoading}
                            className={styles.des}
                            placeholder="请输入问题描述，50字以内"
                            value={category.des}
                            onChange={(e) => {
                                this.setStateByPath('category.des', e.target.value)
                            }}
                        />
                    </Col>
                    <Col span={8} className={styles.mark}>
                        例如：商品咨询
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className={styles.leftTip}>
                        <span className={styles.required}>*</span>关键内容：
                    </Col>
                    <Col span={16}>
                        <div className={styles.row}>
                            <Toggle>
                                {(
                                    {
                                        setTrue,
                                        status,
                                        setFalse,
                                    },
                                ) => (
                                    <>
                                        <Button
                                            type="primary"
                                            onClick={setTrue}
                                            icon="plus"
                                        >
                                            添加关键内容
                                        </Button>
                                        <ModalForm
                                            dispatch={dispatch}
                                            userId={_.get(base, 'initData.user.id')}
                                            loading={categoryUpdateLoading || categoryLoading}
                                            modalOption={{
                                                visible: status,
                                                onCancel: setFalse,
                                                maskClosable: false,
                                                width: 640,
                                                destroyOnClose: true,
                                                title: '新建关键内容',
                                            }}
                                        />
                                    </>
                                )}
                            </Toggle>
                        </div>
                        <Row className={styles.row}>
                            <Col span={10}>
                                <Input
                                    placeholder={'请输入关键内容'}
                                    className={styles.input}
                                    value={content}
                                    onChange={(e) => {
                                        this.change('content', e.target.value)
                                    }}
                                />
                            </Col>
                            <Col span={10}>
                                <Select
                                    value={match_type}
                                    className={styles.select}
                                    onChange={(e) => {
                                        this.change('match_type', e)
                                    }}
                                >
                                    <Option value={-1}>请选择匹配规则</Option>
                                    <Option value={0}>完全匹配</Option>
                                    <Option value={1}>包含匹配</Option>
                                </Select>
                            </Col>
                            <Col span={4}>
                                <Button
                                    type="primary"
                                    loading={categoryUpdateLoading || categoryLoading}
                                    onClick={this.search}
                                >
                                    搜索
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <div className={styles.content}>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={filter.slice(limit * (current - 1), limit * current)}
                            rowKey={(record) => {
                                return record.id
                            }}
                            loading={categoryUpdateLoading || categoryLoading}
                            pagination={filter.length ? {
                                total: filter.length,
                                current,
                                showQuickJumper: true,
                                showTotal: total => `共 ${total} 条`,
                                pageSize: limit,
                                showSizeChanger: true,
                                onChange: this.goPage,
                                onShowSizeChange: this.handleChangeSize,
                                pageSizeOptions: ['10', '20', '50', '100'],
                            } : false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
