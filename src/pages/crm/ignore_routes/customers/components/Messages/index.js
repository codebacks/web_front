/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/24
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
import FullTypeMessageModal from 'business/FullTypeMessageModal'
import {getTabName, MsgContent} from 'business/FullTypeMessage'
import styles from './index.less'
import {hot} from "react-hot-loader"
import _ from 'lodash'

@hot(module)
@connect(({crm_createMass}) => ({
    crm_createMass,
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {

    }

    move = (record, preIndex, nextIndex) => {
        const {
            messages: list,
        } = this.props.crm_createMass
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord - 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord + 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }

        this.props.dispatch({
            type: 'crm_createMass/edit',
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
                    type: 'crm_createMass/delete',
                    payload: {id: record.id},
                })
                message.success('删除成功')
            },
            onCancel() {
            },
        })
    }

    officialAccountsCardWarning = (type)=>{
        if(type === 9){
            message.warning(`提示：公众号名片群发时优先检测是否已关注，如未关注将自动关注该公众号后延迟10秒再发送消息，如出现执行成功但未发送该公众号名片的情况，为保证群发成功率，建议手动关注后再做群发`)
        }
    }

    render() {
        const {
            crm_createMass,
        } = this.props
        const {
            messages: list,
        } = crm_createMass

        const columns = [
            {
                title: '消息类型',
                dataIndex: 'type',
                width: 100,
                render: (text, record, index) => {
                    return getTabName(_.get(record, 'common_msg_content.type'))

                },
            },
            {
                title: '内容',
                dataIndex: 'content',
                render: (text, record, index) => {
                    return (
                        <div className={styles.msgContent}>
                            <MsgContent
                                type={_.get(record, 'common_msg_content.type')}
                                values={_.get(record, 'common_msg_content.values')}
                            />
                        </div>
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
                                showTabs={[
                                    {
                                        type: 1,
                                        tabProps: {
                                            useInsertWxPlaceholder: true,
                                        },
                                    },
                                    2, 3, 6, 7, 9, 5, 4, 8
                                ]}
                                tabsActiveKey={record.common_msg_content.type}
                                typeValue={{
                                    type: record.common_msg_content.type,
                                    values: record.common_msg_content.values,
                                }}
                                handleOk={({data, handleCancel}) => {
                                    const formData = {
                                        common_msg_content: data,
                                        id: record.id,
                                    }
                                    this.props.dispatch({
                                        type: 'crm_createMass/edit',
                                        payload: formData,
                                    })
                                    message.success('更新成功！')
                                    this.officialAccountsCardWarning(data.type)

                                    handleCancel()
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
                                    title: '编辑消息',
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
            <div className={styles.messages}>
                <div className={styles.content}>
                    <div className={styles.option}>
                        <FullTypeMessageModal
                            showTabs={[
                                {
                                    type: 1,
                                    tabProps: {
                                        useInsertWxPlaceholder: true,
                                    },
                                },
                                2, 3, 6, 7, 9, 5, 4, 8
                            ]}
                            handleOk={({data, handleCancel}) => {
                                const formData = {
                                    common_msg_content: data,
                                }
                                this.props.dispatch({
                                    type: 'crm_createMass/add',
                                    payload: formData,
                                })
                                message.success('创建成功！')
                                this.officialAccountsCardWarning(data.type)

                                handleCancel()
                            }}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            if(list.length >= 10) {
                                                message.warning('请勿设置超过10条的回复')
                                                return
                                            }
                                            setTrue()
                                        }}
                                        icon="plus"
                                    >
                                        添加消息
                                    </Button>
                                )
                            }}
                            modalOption={{
                                title: '新建消息',
                            }}
                        />
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => {
                                return record.id
                            }}
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
