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
} from 'antd'
import {connect} from "dva/index"
import {getTabName, MsgContent} from "components/business/FullTypeMessage"
import FullTypeMessageModal from 'business/FullTypeMessageModal'
import styles from './index.less'
import {hot} from "react-hot-loader"
import {safeJsonParse} from "utils"
import _ from 'lodash'

@hot(module)
@connect(({base, community_groupGreet, loading}) => ({
    base,
    community_groupGreet,
    getConfigLoading: loading.effects['community_groupGreet/getConfig'],
    setConfigLoading: loading.effects['community_groupGreet/setConfig'],
    createContentLoading: loading.effects['community_groupGreet/createContent'],
    deleteContentLoading: loading.effects['community_groupGreet/deleteContent'],
    updateContentLoading: loading.effects['community_groupGreet/updateContent'],
    moveLoading: loading.effects['community_groupGreet/move'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.getConfig()
    }

    getConfig = () => {
        this.props.dispatch({
            type: 'community_groupGreet/getConfig',
            payload: {},
        })
    }

    changeStatus = (e) => {
        const {list} = this.props.community_groupGreet
        const checked = e.target.checked
        if(!list.length && checked) {
            message.warning('请新建问候语')
            return
        }

        this.props.dispatch({
            type: 'community_groupGreet/setConfig',
            payload: checked,
            callback: () => {
                if(checked) {
                    message.success('启用成功')
                }else {
                    message.warning('禁用成功')
                }
            },
        })
    }

    move = (record, preIndex, nextIndex) => {
        const {
            list,
        } = this.props.community_groupGreet
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord - 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord + 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }

        this.props.dispatch({
            type: 'community_groupGreet/move',
            payload: {id: record.id, ord},
            callback: () => {
                this.getConfig()
                message.success('移动成功')
            },
        })
    }

    handleRemove = (record) => {
        Modal.confirm({
            title: '确定删除该内容？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve) => {
                    this.props.dispatch({
                        type: 'community_groupGreet/deleteContent',
                        payload: {id: record.id},
                        confirmLoading: this.props.deleteContentLoading,
                        callback: () => {
                            this.getConfig()
                            message.success('删除成功')
                            resolve()
                        },
                    })
                })
            },
            onCancel() {
            },
        })
    }

    render() {
        const {
            getConfigLoading,
            setConfigLoading,
            createContentLoading,
            community_groupGreet,
            updateContentLoading,
            moveLoading,
        } = this.props
        const {
            list,
        } = community_groupGreet

        const columns = [
            {
                title: '回复类型',
                dataIndex: 'type',
                width: 300,
                render: (text, record, index) => {
                    return getTabName(_.get(record, 'common_msg_content_type'))
                },
            },
            {
                title: '内容',
                dataIndex: 'content',
                render: (text, record, index) => {
                    return (
                        <MsgContent
                            type={_.get(record, 'common_msg_content_type')}
                            values={safeJsonParse(_.get(record, 'common_msg_content_values'))}
                        />
                    )
                },
            },
            {
                title: '操作',
                key: 'operator',
                width: 180,
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <FullTypeMessageModal
                                tabsActiveKey={_.get(record, 'common_msg_content_type')}
                                typeValue={{
                                    type: _.get(record, 'common_msg_content_type'),
                                    values: safeJsonParse(_.get(record, 'common_msg_content_values')),
                                }}
                                typeSourceType={{
                                    type: _.get(record, 'common_msg_content_type'),
                                    sourceType: _.get(record, 'common_msg_content_source_type'),
                                }}
                                handleOk={({data, handleCancel}) => {
                                    const formData = {
                                        common_msg_content: data,
                                        id: record.id,
                                    }
                                    this.props.dispatch({
                                        type: 'community_groupGreet/updateContent',
                                        payload: formData,
                                        callback: () => {
                                            this.getConfig()
                                            message.success('更新成功！')
                                            handleCancel()
                                        },
                                    })
                                }}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={setTrue}
                                        >
                                            编辑
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    title: '编辑问候语',
                                    confirmLoading: updateContentLoading,
                                }}
                            />
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
                                index !== 0 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={() => {
                                                this.move(record, index - 2, index - 1)
                                            }}
                                        >
                                            上移
                                        </span>
                                    </>
                                )
                            }
                            {
                                index !== list.length - 1 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={() => {
                                                this.move(record, index + 1, index + 2)
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
            <div className={styles.groupGreet}>
                <div>
                    {/*<Checkbox*/}
                    {/*disabled={getConfigLoading || setConfigLoading}*/}
                    {/*checked={status}*/}
                    {/*onChange={this.changeStatus}*/}
                    {/*>*/}
                    {/*开启此功能*/}
                    {/*</Checkbox>*/}
                    {/*<span className={styles.mark}>*/}
                    {/*开启后，会自动推送问候信息给新加入群的好友；单个群可在【<span className={styles.point}>群管理-智能管理</span>】重新配置*/}
                    {/*</span>*/}
                    该功能仅支持单群各自开启配置，可在【<span className={styles.point}>群管理-操作-群设置</span>】中进行开启和关闭，开启后，会自动推送问候信息给新加入群的好友；
                </div>
                <div className={styles.content}>
                    <div className={styles.option}>
                        <FullTypeMessageModal
                            handleOk={({data, handleCancel}) => {
                                const formData = {
                                    common_msg_content: data,
                                }
                                this.props.dispatch({
                                    type: 'community_groupGreet/createContent',
                                    payload: formData,
                                    callback: () => {
                                        this.getConfig()
                                        message.success('创建成功！')
                                        handleCancel()
                                    },
                                })
                            }}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        type="primary"
                                        loading={getConfigLoading || setConfigLoading}
                                        onClick={() => {
                                            if(list.length >= 10) {
                                                message.warning('请勿设置超过10条的问候语')
                                                return
                                            }
                                            setTrue()
                                        }}
                                        icon="plus"
                                    >
                                        新建问候语
                                    </Button>
                                )
                            }}
                            modalOption={{
                                title: '新建问候语',
                                confirmLoading: createContentLoading,
                            }}
                        />
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={record => record.id}
                            pagination={false}
                            loading={getConfigLoading || setConfigLoading || moveLoading}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
