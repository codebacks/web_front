/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Button,
    Checkbox,
    message,
    Table,
    Modal,
    Divider,
    Radio,
} from 'antd'
import modalWarp from 'hoc/modalWarp'
import {connect} from "dva/index"
import styles from './index.less'
import {hot} from "react-hot-loader"
import {getTabName, MsgContent} from "components/business/FullTypeMessage"
import FullTypeMessageModal from "components/business/FullTypeMessageModal"
import _ from "lodash"
import {safeJsonParse} from "utils"

const RadioGroup = Radio.Group

@hot(module)
@connect(({base, wx_weChatsNewFriends, loading}) => ({
    base,
    wx_weChatsNewFriends,
    getConfigLoading: loading.effects['wx_weChatsNewFriends/getConfig'],
    getOneConfigLoading: loading.effects['wx_weChatsNewFriends/getOneConfig'],
    setOneConfigLoading: loading.effects['wx_weChatsNewFriends/setOneConfig'],
    createOneContentLoading: loading.effects['wx_weChatsNewFriends/createOneContent'],
    deleteOneContentLoading: loading.effects['wx_weChatsNewFriends/deleteOneContent'],
    updateOneContentLoading: loading.effects['wx_weChatsNewFriends/updateOneContent'],
    oneMoveLoading: loading.effects['wx_weChatsNewFriends/oneMove'],
}))
@modalWarp()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        const wx_setting_type = String(this.props.record.auto_greet.wx_setting_type)
        this.props.dispatch({
            type: 'wx_weChatsNewFriends/setProperty',
            payload: {
                wx_setting_type,
            },
        })
        wx_setting_type === '0' ? this.getCompanyConfig() : this.getOneConfig()
    }

    getCompanyConfig = () => {
        this.props.dispatch({
            type: 'wx_weChatsNewFriends/getConfig',
            payload: {},
        })
    }

    handleOk = ()=>{
        this.props.onModalCancel()
        this.props.refresh()
    }

    getOneConfig = () => {
        this.props.dispatch({
            type: 'wx_weChatsNewFriends/getOneConfig',
            payload: {
                uin: this.getUin(),
            },
        })
    }

    onChange = (e) => {
        const wx_setting_type = Number(e.target.value)
        this.props.dispatch({
            type: 'wx_weChatsNewFriends/setOneConfig',
            payload: {
                uin: this.getUin(),
                wx_setting_type,
            },
        })
        if(wx_setting_type === 0){
            this.getCompanyConfig()
        }
    }

    getUin = () => {
        return this.props.record.uin
    }

    changeStatus = (e) => {
        const {list} = this.props.wx_weChatsNewFriends
        const checked = e.target.checked
        if(!list.length && checked){
            message.warning('请新建问候语')
            return
        }
        this.props.dispatch({
            type: 'wx_weChatsNewFriends/setOneConfig',
            payload: {
                status: checked,
                uin: this.getUin(),
            },
            callback: ()=>{
                if(checked){
                    message.success('启用成功')
                }else{
                    message.warning('禁用成功')
                }
            }
        })
    }

    move = (record, preIndex, nextIndex) => {
        const {
            list,
        } = this.props.wx_weChatsNewFriends
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord - 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord + 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }

        this.props.dispatch({
            type: 'wx_weChatsNewFriends/oneMove',
            payload: {
                id: record.id,
                ord,
                uin: this.getUin(),
            },
            callback: () => {
                this.getOneConfig()
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
                        type: 'wx_weChatsNewFriends/deleteOneContent',
                        payload: {
                            id: record.id,
                            uin: this.getUin(),
                        },
                        confirmLoading: this.props.deleteOneContentLoading,
                        callback: () => {
                            this.getOneConfig()
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

    renderCompanyTable() {
        const {
            getConfigLoading,
            wx_weChatsNewFriends,
        } = this.props
        const {
            companyList,
            companyStatus,
        } = wx_weChatsNewFriends

        const columns = [
            {
                title: '回复类型',
                dataIndex: 'msg_type',
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
        ]

        return (
            <>
                <div>
                    <span>
                        状态：{companyStatus ? '开启' : '关闭'}
                    </span>
                </div>
                <div className={styles.content}>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={companyList}
                            rowKey={record => record.id}
                            pagination={false}
                            loading={getConfigLoading}
                        />
                    </div>
                </div>
            </>
        )
    }

    renderOneTable = () => {
        const {
            getOneConfigLoading,
            setOneConfigLoading,
            createOneContentLoading,
            wx_weChatsNewFriends,
            updateOneContentLoading,
            oneMoveLoading,
        } = this.props
        const {
            list,
            status,
        } = wx_weChatsNewFriends

        const columns = [
            {
                title: '回复类型',
                dataIndex: 'msg_type',
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
                                        uin: this.getUin(),
                                    }
                                    this.props.dispatch({
                                        type: 'wx_weChatsNewFriends/updateOneContent',
                                        payload: formData,
                                        callback: () => {
                                            this.getOneConfig()
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
                                    confirmLoading: updateOneContentLoading,
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
            <>
                <div>
                    <Checkbox
                        disabled={setOneConfigLoading}
                        checked={status}
                        onChange={this.changeStatus}
                    >
                        开启此功能
                    </Checkbox>
                    <span className={styles.mark}>
                        开启后，会自动推送问候信息给新加入的好友
                    </span>
                </div>
                <div className={styles.content}>
                    <div className={styles.option}>
                        <FullTypeMessageModal
                            handleOk={({data, handleCancel}) => {
                                const formData = {
                                    common_msg_content: data,
                                    uin: this.getUin(),
                                }
                                this.props.dispatch({
                                    type: 'wx_weChatsNewFriends/createOneContent',
                                    payload: formData,
                                    callback: () => {
                                        this.getOneConfig()
                                        message.success('创建成功！')
                                        handleCancel()
                                    },
                                })
                            }}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        type="primary"
                                        loading={getOneConfigLoading || setOneConfigLoading}
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
                                confirmLoading: createOneContentLoading,
                            }}
                        />
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={record => record.id}
                            pagination={false}
                            loading={getOneConfigLoading || setOneConfigLoading || oneMoveLoading}
                        />
                    </div>
                </div>
            </>
        )
    }

    render() {
        const {wx_setting_type} = this.props.wx_weChatsNewFriends

        return (
            <div className={styles.newFriends}>
                <div className={styles.changBar}>
                    <span>
                        问候新好友：
                    </span>
                    <RadioGroup
                        disabled={this.props.setOneConfigLoading}
                        onChange={this.onChange}
                        value={wx_setting_type}
                    >
                        <Radio value="0">默认规则</Radio>
                        <Radio value="1">自定义</Radio>
                    </RadioGroup>
                </div>
                {
                    wx_setting_type === '0' ? this.renderCompanyTable() : this.renderOneTable()
                }
            </div>
        )
    }
}
