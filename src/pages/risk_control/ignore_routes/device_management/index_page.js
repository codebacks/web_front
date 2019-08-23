import React from 'react'
import {Button, Table, Icon, Divider, Modal, message, Badge} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import config from "risk_control/common/constants"
import moment from 'moment'
import NewDevice from "./components/NewDevice"
import UpdateDeveice from "./components/UpdateDeveice"
import SetGroup from "./components/SetGroup"
import SwitchUser from "./components/SwitchUser"
import SearchBlock from "./components/SearchBlock"
import CheckUpdate from "./components/CheckUpdate"
import PermissionConfig from "./components/PermissionConfig"
import SinglePermission from "./components/SinglePermission"
import ContentHeader from "business/ContentHeader"
import {getOptionsMap} from './utils'
import EllipsisPopover from "components/EllipsisPopover"

const {pageSizeOptions, DateTimeFormat} = config

@hot(module)
@connect(({base, risk_control_deviceManagement, loading}) => ({
    base,
    risk_control_deviceManagement,
    tableLoading: loading.effects['risk_control_deviceManagement/details'],
    updateDevicesLoading: loading.effects['risk_control_deviceManagement/updateDevices'],
    groupsAllLoading: loading.effects['risk_control_deviceManagement/groupsAll'],
    switchUserLoading: loading.effects['risk_control_deviceManagement/switchUser'],
    devicesAttributesLoading: loading.effects['risk_control_deviceManagement/devicesAttributes'],
    notificationsBatchLoading: loading.effects['risk_control_deviceManagement/notificationsBatch'],
    getPermissionConfigLoading: loading.effects['risk_control_deviceManagement/getPermissionConfig'],
    setPermissionConfigLoading: loading.effects['risk_control_deviceManagement/setPermissionConfig'],
    getSinglePermissionLoading: loading.effects['risk_control_deviceManagement/getSinglePermission'],
    setSinglePermissionLoading: loading.effects['risk_control_deviceManagement/setSinglePermission'],
}))
@documentTitleDecorator()
export default class Index_page extends React.Component {

    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.risk_control_deviceManagement.current
        }
        this.props.dispatch({
            type: 'risk_control_deviceManagement/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_deviceManagement/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_deviceManagement/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_deviceManagement/setProperty',
            payload: {
                selectedRowKeys,
            },
        })
    }

    selectedRowKeysCheck = ({setTrue, selectedRowKeys}) => {
        if (!selectedRowKeys.length) {
            message.warning('请先勾选设备')
            return
        }

        setTrue()
    }

    render() {
        const {
            tableLoading,
            risk_control_deviceManagement,
            dispatch,
            updateDevicesLoading,
            base,
            getPermissionConfigLoading,
            setPermissionConfigLoading,
            getSinglePermissionLoading,
            setSinglePermissionLoading,
        } = this.props
        const {list, current, total, params = {}, selectedRowKeys = []} = risk_control_deviceManagement

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: (record) => {
                return {
                    disabled: !record.is_online,
                }
            },
        }

        const columns = [
            {
                title: '编号',
                dataIndex: 'number',
                fixed: 'left',
            },
            {
                title: '序列号',
                dataIndex: 'serialno',
                fixed: 'left',
            },
            {
                title: '在线状态',
                dataIndex: 'is_online',
                render: (text, record) => {
                    return text ? <Badge status="success" text="在线" /> : <Badge status="error" text="离线" />
                },
            },
            {
                title: '设备分组',
                dataIndex: 'group_name',
                render: (text, record) => {
                    return (
                        <SetGroup
                            {...this.props}
                            goPage={this.goPage}
                            selectedRowKeys={[record.id]}
                            renderBtn={(setTrue) => {
                                return (
                                    text ?
                                        (
                                            <span
                                                className={styles.operate}
                                                onClick={setTrue}
                                            >
                                                {text}
                                            </span>
                                        ) : (
                                            <Icon
                                                type="edit"
                                                onClick={setTrue}
                                            />
                                        )
                                )
                            }}
                        />
                    )
                },
            },
            {
                title: '当前登录微信',
                dataIndex: 'wechat',
                key: 'wx',
                render: (text = {}, record) => {
                    return (
                        <div className={styles.msg}>
                            <div className={styles.head}>
                                <img
                                    className={styles.head}
                                    src={text.head_img_url}
                                    rel="noreferrer"
                                    alt=""
                                />
                            </div>
                            <div>
                                <div>
                                    <span style={{whiteSpace: 'pre-wrap'}}>{text.nickname}</span>
                                </div>
                                <div>
                                    {text.mobile}
                                </div>
                                <div>
                                    {text.alias || text.username}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: '设备保管者',
                dataIndex: 'keep_user_nickname',
                render: (text = {}, record) => {
                    return (
                        <SwitchUser
                            {...this.props}
                            goPage={this.goPage}
                            record={record}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.operate}
                                        onClick={setTrue}
                                    >
                                        {text}
                                    </span>
                                )
                            }}
                        />
                    )
                },
            },
            {
                title: '微信版本',
                dataIndex: 'wechat_version',
            },
            {
                title: '牛客服版本',
                dataIndex: 'niukefu_version',
            },
            {
                title: 'ROM版本',
                dataIndex: 'rom_version',
            },
            {
                title: '助手版本',
                dataIndex: 'hook_version',
            },
            {
                title: '是否激活',
                dataIndex: 'is_active',
                render: (text, record) => {
                    return getOptionsMap('is_active')[Number(text)]
                },
            },
            {
                title: '电量',
                dataIndex: 'battery',
                render: (text, record) => {
                    return text > 20 ? `${text}%` : <span className={styles.batteryWarn}>{`${text}%`}</span>
                },
            },
            {
                title: '网络',
                dataIndex: 'net_status',
            },
            {
                title: '信号强度',
                dataIndex: 'wifi_rssi',
            },
            {
                title: '可用存储',
                dataIndex: 'available_flash_size',
                render: (text, record) => {
                    return text ? text : '未知'
                },
            },
            {
                title: '开机时间',
                dataIndex: 'boot_time',
            },
            {
                title: '品牌',
                dataIndex: 'brand',
            },
            {
                title: '型号',
                dataIndex: 'model',
            },
            {
                title: '系统OS',
                dataIndex: 'os',
            },
            {
                title: '地理位置',
                dataIndex: 'ip',
                render: (text, record) => {
                    return text
                },
            },
            {
                title: '接入时间',
                dataIndex: 'bind_time',
                render: (text, record) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '设备状态',
                dataIndex: 'is_delete',
                render: (text, record) => {
                    return getOptionsMap('is_delete')[Number(text)]
                },
            },
            {
                title: '固定资产编号',
                dataIndex: 'custom_number',
                render: (text, record) => {
                    return (
                        <UpdateDeveice
                            dispatch={dispatch}
                            record={record}
                            goPage={this.goPage}
                            formKey={'custom_number'}
                            label={'固定资产编号'}
                            renderBtn={(setTrue) => {
                                return (
                                    text ?
                                        (
                                            <span
                                                className={styles.operate}
                                                onClick={setTrue}
                                            >
                                                <EllipsisPopover
                                                    lines={2}
                                                    content={text}
                                                />
                                            </span>
                                        ) : (
                                            <Icon
                                                type="edit"
                                                onClick={setTrue}
                                            />
                                        )
                                )
                            }}
                            modalOption={{
                                title: '修改固定资产编号',
                                confirmLoading: updateDevicesLoading,
                            }}
                        />
                    )
                },
            },
            {
                title: '设备备注',
                dataIndex: 'remark',
                render: (text, record) => {
                    return (
                        <UpdateDeveice
                            dispatch={dispatch}
                            record={record}
                            goPage={this.goPage}
                            formKey={'remark'}
                            label={'设备备注'}
                            renderBtn={(setTrue) => {
                                return (
                                    text ?
                                        (
                                            <span
                                                className={styles.operate}
                                                onClick={setTrue}
                                            >
                                                <EllipsisPopover
                                                    lines={2}
                                                    content={text}
                                                />
                                            </span>
                                        ) : (
                                            <Icon
                                                type="edit"
                                                onClick={setTrue}
                                            />
                                        )
                                )
                            }}
                            modalOption={{
                                title: '修改设备备注',
                                confirmLoading: updateDevicesLoading,
                            }}
                        />
                    )
                },
            },
            {
                title: '操作',
                dataIndex: 'operate',
                fixed: 'right',
                render: (text, record) => {
                    return (
                        !record?.is_delete ? (
                            <>
                                {/*
                            <SinglePermission
                                getLoading={getSinglePermissionLoading}
                                goPage={this.goPage}
                                id={record?.id}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operate}
                                            onClick={setTrue}
                                        >权限</span>
                                    )
                                }}
                                modalOption={{
                                    confirmLoading: getSinglePermissionLoading || setSinglePermissionLoading,
                                }}
                            />
                            <Divider type="vertical"/>
                            */}
                                {
                                    record?.is_online ? (
                                        <>
                                            <CheckUpdate
                                                {...this.props}
                                                goPage={this.goPage}
                                                list={list}
                                                selectedRowKeys={[record.id]}
                                                renderBtn={(setTrue) => {
                                                    return (
                                                        <span
                                                            className={styles.operate}
                                                            onClick={setTrue}
                                                        >
                                            检查更新
                                                        </span>
                                                    )
                                                }}
                                            />
                                            <Divider type="vertical"/>
                                            <span
                                                className={styles.operate}
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: '确定重启该设备?',
                                                        okText: '确定',
                                                        cancelText: '取消',
                                                        onOk: () => {
                                                            return new Promise((resolve, reject) => {
                                                                dispatch({
                                                                    type: 'risk_control_deviceManagement/notifications',
                                                                    payload: {
                                                                        body: {
                                                                            uin: record.uin,
                                                                            imei: record.imei,
                                                                            type: 'phone_restart',
                                                                            body: {},
                                                                        },
                                                                    },
                                                                    callback: () => {
                                                                        message.success('指令已发送成功')
                                                                        this.goPage()
                                                                        resolve()
                                                                    },
                                                                })
                                                            })
                                                        },
                                                    })
                                                }}
                                            >重启设备</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>检查更新</span>
                                            <Divider type="vertical"/>
                                            <span>重启设备</span>
                                        </>
                                    )
                                }
                                <Divider type="vertical"/>
                                <span
                                    className={styles.operate}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: '确定删除本条记录吗?',
                                            okText: '确定',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: () => {
                                                return new Promise((resolve, reject) => {
                                                    dispatch({
                                                        type: 'risk_control_deviceManagement/removeDevices',
                                                        payload: {
                                                            id: record.id,
                                                        },
                                                        callback: () => {
                                                            message.success('删除成功')
                                                            this.goPage()
                                                            resolve()
                                                        },
                                                    })
                                                })
                                            },
                                        })
                                    }}
                                >删除</span>
                            </>
                        ) : '-'
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <div className={styles.content}>
                    <SearchBlock
                        {...this.props}
                        handleSearch={this.handleSearch}
                        resetSearch={this.resetSearch}
                    />
                    <div className={styles.helpBar}>
                        <div className={styles.left}>
                            <NewDevice
                                base={base}
                                dispatch={dispatch}
                                goPage={this.goPage}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            onClick={setTrue}
                                            type={'primary'}
                                            className={styles.btn}
                                        >
                                            新增设备
                                        </Button>
                                    )
                                }}
                            />
                            <SetGroup
                                {...this.props}
                                goPage={this.goPage}
                                selectedRowKeys={selectedRowKeys}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            onClick={() => {
                                                this.selectedRowKeysCheck({
                                                    setTrue,
                                                    selectedRowKeys,
                                                })
                                            }}
                                            className={styles.btn}
                                        >
                                            设置分组
                                        </Button>
                                    )
                                }}
                            />
                            <CheckUpdate
                                {...this.props}
                                goPage={this.goPage}
                                selectedRowKeys={selectedRowKeys}
                                list={list}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            onClick={() => {
                                                this.selectedRowKeysCheck({
                                                    setTrue,
                                                    selectedRowKeys,
                                                })
                                            }}
                                            className={styles.btn}
                                        >
                                            检查更新
                                        </Button>
                                    )
                                }}
                            />
                            {/*<PermissionConfig
                                getLoading={getPermissionConfigLoading}
                                goPage={this.goPage}
                                selectedRowKeys={selectedRowKeys}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            onClick={() => {
                                                this.selectedRowKeysCheck({
                                                    setTrue,
                                                    selectedRowKeys,
                                                })
                                            }}
                                            className={styles.btn}
                                        >
                                            权限配置
                                        </Button>
                                    )
                                }}
                                modalOption={{
                                    confirmLoading: getPermissionConfigLoading || setPermissionConfigLoading,
                                }}
                            />*/}
                        </div>
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => record.id}
                            loading={tableLoading}
                            rowSelection={rowSelection}
                            scroll={{
                                x: 'max-content',
                            }}
                            pagination={
                                list.length
                                    ? {
                                        total,
                                        current,
                                        showQuickJumper: true,
                                        showTotal: (total) => `共 ${total} 条`,
                                        pageSize: params.limit,
                                        showSizeChanger: true,
                                        onChange: this.goPage,
                                        onShowSizeChange: this.handleChangeSize,
                                        pageSizeOptions: pageSizeOptions,
                                    }
                                    : false
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }
}
