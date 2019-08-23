/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {Component} from 'react'
import {
    Button,
    message,
    Table,
    Modal,
    Divider,
    Radio,
    InputNumber,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import styles from './index.less'
import _ from "lodash"
import {getTabName, MsgContent} from "components/business/FullTypeMessage"
import FullTypeMessageModal from "components/business/FullTypeMessageModal"
import {safeJsonParse} from "utils"
import PropTypes from "prop-types"

const RadioGroup = Radio.Group

@connect(({base, community_groupSetting_newFriends, loading}) => ({
    base,
    community_groupSetting_newFriends,
    getConfigLoading: loading.effects['community_groupSetting_newFriends/getConfig'],
    getOneConfigLoading: loading.effects['community_groupSetting_newFriends/getOneConfig'],
    setOneConfigLoading: loading.effects['community_groupSetting_newFriends/setOneConfig'],
    createOneContentLoading: loading.effects['community_groupSetting_newFriends/createOneContent'],
    deleteOneContentLoading: loading.effects['community_groupSetting_newFriends/deleteOneContent'],
    updateOneContentLoading: loading.effects['community_groupSetting_newFriends/updateOneContent'],
    oneMoveLoading: loading.effects['community_groupSetting_newFriends/oneMove'],
}))
export default class Index extends Component {
    static propTypes = {
        newFriendsFetchOption: PropTypes.object.isRequired,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        this.isFirstOneConfig = true
    }

    componentDidMount() {
        this.getOneConfig()
    }

    getCompanyConfig = () => {
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/getConfig',
            payload: {},
        })
    }

    handleOk = () => {
        const {
            newFriendsFetchOption,
        } = this.props
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/setOneConfig',
            payload: {
                ...newFriendsFetchOption,
            },
            callback: () => {
                // this.props.refresh()
                message.warning(
                    `群问候语设置更新覆盖成功，本次设置由 ${_.get(this, 'props.base.initData.user.nickname', ' ')} 修改保存`,
                )
            },
        })
    }

    getOneConfig = () => {
        const {
            newFriendsFetchOption,
        } = this.props
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/getOneConfig',
            payload: {
                ...newFriendsFetchOption,
                init: this.isFirstOneConfig,
            },
        })
        if(this.isFirstOneConfig) {
            this.isFirstOneConfig = false
        }
    }

    onChange = (e) => {
        const group_setting_type = e.target.value
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/setProperty',
            payload: {
                group_setting_type,
            },
        })

        group_setting_type === '0' ? this.getCompanyConfig() : this.getOneConfig()
    }

    onAtChange = (e) => {
        const need_at = e.target.value
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/setProperty',
            payload: {need_at},
        })
    }

    changeStatus = (e) => {
        const {
            list,
            group_setting_type,
            companyList,
        } = this.props.community_groupSetting_newFriends
        const checked = e.target.checked
        const length = group_setting_type === '0' ? companyList.length : list.length

        if(!length && checked) {
            message.warning('请新建问候语')
            return
        }
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/setProperty',
            payload: {
                status: checked,
            },
        })
        if(checked) {
            message.success('启用成功')
        }else {
            message.warning('禁用成功')
        }
    }

    onInputNumberChange = (e) => {
        this.props.dispatch({
            type: 'community_groupSetting_newFriends/setProperty',
            payload: {
                greet_duration_minutes: e,
            },
        })
    }

    move = (record, preIndex, nextIndex) => {
        const {
            list,
        } = this.props.community_groupSetting_newFriends
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord - 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord + 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }

        const {
            newFriendsFetchOption,
        } = this.props

        this.props.dispatch({
            type: 'community_groupSetting_newFriends/oneMove',
            payload: {
                ...newFriendsFetchOption,
                row_id: record.id,
                ord,
            },
            callback: () => {
                this.getOneConfig()
                message.success('移动成功')
            },
        })
    }

    handleRemove = (record) => {
        const {
            newFriendsFetchOption,
        } = this.props
        Modal.confirm({
            title: '确定删除该内容？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve) => {
                    this.props.dispatch({
                        type: 'community_groupSetting_newFriends/deleteOneContent',
                        payload: {
                            ...newFriendsFetchOption,
                            row_id: record.id,
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

    formatter = (value) => {
        return String(value).replace('.', '')
    }

    renderCompanyTable() {
        const {
            getConfigLoading,
            community_groupSetting_newFriends,
        } = this.props
        const {
            companyList,
        } = community_groupSetting_newFriends

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

    getUpdateTime = () => {
        const {update_at} = this.props.community_groupSetting_newFriends
        let time = ''
        if(typeof update_at === 'number') {
            time = moment(update_at * 1000).format('YYYY-MM-DD HH:mm:ss')
        }

        return time
    }

    renderOneTable = () => {
        const {
            getOneConfigLoading,
            setOneConfigLoading,
            createOneContentLoading,
            community_groupSetting_newFriends,
            updateOneContentLoading,
            oneMoveLoading,
        } = this.props
        const {
            list,
        } = community_groupSetting_newFriends

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
                                handleOk={({data, handleCancel}) => {
                                    const {
                                        newFriendsFetchOption,
                                    } = this.props
                                    const formData = {
                                        ...newFriendsFetchOption,
                                        common_msg_content: data,
                                        row_id: record.id,
                                    }
                                    this.props.dispatch({
                                        type: 'community_groupSetting_newFriends/updateOneContent',
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
                <div className={styles.content}>
                    <div className={styles.option}>
                        <FullTypeMessageModal
                            handleOk={({data, handleCancel}) => {
                                const {
                                    newFriendsFetchOption,
                                } = this.props
                                const formData = {
                                    ...newFriendsFetchOption,
                                    common_msg_content: data,
                                }
                                this.props.dispatch({
                                    type: 'community_groupSetting_newFriends/createOneContent',
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

    renderSettingLevel() {
        const {
            newFriendsFetchOption: {
                setting_level,
            } = {},
        } = this.props

        switch(setting_level) {
            case 0:
                return null
            case 500:
                return (
                    <div className={styles.changBar}>
                        <span className={styles.label}>
                            配置类型：
                        </span>
                        <span className={styles.changBarRight}>活动配置</span>
                    </div>
                )
            default:
                return null
        }
    }

    render() {
        const {
            community_groupSetting_newFriends,
            getConfigLoading,
            getOneConfigLoading,
            setOneConfigLoading,
            disabledSettings,
        } = this.props
        const {
            group_setting_type,
            operator,
            greet_duration_minutes,
            need_at,
        } = community_groupSetting_newFriends

        return (
            <div className={styles.newFriends}>
                {
                    this.renderSettingLevel()
                }
                {/*<div className={styles.title}>
                    {
                        operator && (
                            <>
                                ，上一次群问候语设置由 <span
                                className={styles.operator}>{operator}</span> 在 {this.getUpdateTime()} 修改保存
                            </>
                        )
                    }
                </div>*/}
                <div className={styles.atMember}>
                    <span className={styles.atTitle}>回复是否要@群成员：</span>
                    <RadioGroup
                        disabled={getConfigLoading || getOneConfigLoading || setOneConfigLoading}
                        onChange={this.onAtChange}
                        value={need_at}
                        className={styles.atRadioGroup}
                    >
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                    </RadioGroup>
                </div>
                <div className={styles.duration}>
                    <span className={styles.label}>
                        设置间隔时间：
                    </span>
                    <InputNumber
                        disabled={setOneConfigLoading || getOneConfigLoading}
                        className={styles.inputNumber}
                        min={0}
                        max={1440}
                        step={1}
                        value={greet_duration_minutes}
                        onChange={this.onInputNumberChange}
                        formatter={this.formatter}
                    />
                    分钟
                    <span className={styles.durationMark}>
                        间隔时间设置是用于避免在同一时间段重复发送多次问候语，默认120分钟，最少0分钟，最大1440分钟
                    </span>
                </div>
                <div className={styles.changBar}>
                    <span className={styles.label}>
                        模板选择：
                    </span>
                    <RadioGroup
                        disabled={getConfigLoading || getOneConfigLoading || setOneConfigLoading}
                        onChange={this.onChange}
                        value={group_setting_type}
                        className={styles.typeRadioGroup}
                    >
                        <Radio value="1">自定义</Radio>
                        <Radio value="0">全局</Radio>
                    </RadioGroup>
                </div>
                {
                    group_setting_type === '0' ? this.renderCompanyTable() : this.renderOneTable()
                }
                <div>
                    <Button
                        type="primary"
                        onClick={this.handleOk}
                        loading={getConfigLoading || getOneConfigLoading || setOneConfigLoading}
                    >
                        保存
                    </Button>
                </div>
                {
                    disabledSettings && <div className={styles.contentMask}/>
                }
            </div>
        )
    }
}
