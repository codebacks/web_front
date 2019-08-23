import React from 'react'
import {Button, Table, Icon, Divider, Modal, message, Badge} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import config from "risk_control/common/constants"
import moment from 'moment'
import SearchBlock from "./components/SearchBlock"
import PermissionConfig from "./components/PermissionConfig"
import SinglePermission from "./components/SinglePermission"
import ContentHeader from "business/ContentHeader"
import {getOptionsMap} from './utils'
import EllipsisPopover from "components/EllipsisPopover"

const {pageSizeOptions, DateTimeFormat} = config

@hot(module)
@connect(({base, risk_control_devicePermission, loading}) => ({
    base,
    risk_control_devicePermission,
    tableLoading: loading.effects['risk_control_devicePermission/details'],
    groupsAllLoading: loading.effects['risk_control_devicePermission/groupsAll'],
    devicesAttributesLoading: loading.effects['risk_control_devicePermission/devicesAttributes'],
    getPermissionConfigLoading: loading.effects['risk_control_devicePermission/getPermissionConfig'],
    setPermissionConfigLoading: loading.effects['risk_control_devicePermission/setPermissionConfig'],
    getSinglePermissionLoading: loading.effects['risk_control_devicePermission/getSinglePermission'],
    setSinglePermissionLoading: loading.effects['risk_control_devicePermission/setSinglePermission'],
}))
@documentTitleDecorator()
export default class Index_page extends React.Component {

    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.risk_control_devicePermission.current
        }
        this.props.dispatch({
            type: 'risk_control_devicePermission/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_devicePermission/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_devicePermission/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_devicePermission/setProperty',
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
            risk_control_devicePermission,
            dispatch,
            updateDevicesLoading,
            base,
            getPermissionConfigLoading,
            setPermissionConfigLoading,
            getSinglePermissionLoading,
            setSinglePermissionLoading,
        } = this.props
        const {list, current, total, params = {}, selectedRowKeys = []} = risk_control_devicePermission

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
                render: (text, record, index) => {
                    return text ? <Badge status="success" text="在线" /> : <Badge status="error" text="离线" />
                },
            },
            {
                title: '设备分组',
                dataIndex: 'group_name',
                render: (text, record) => {
                    return <span>{text ? text : '未分组'}</span>
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
                className: styles.columnBattery,
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
                title: '固定资产编号',
                dataIndex: 'custom_number',
            },
            {
                title: '设备备注',
                dataIndex: 'remark',
                className: styles.columnRemark,
                render: (text, record) => {
                    return (
                        <EllipsisPopover content={text} lines={2}/>
                    )
                },
            },
            {
                title: '操作',
                dataIndex: 'operate',
                fixed: 'right',
                render: (text, record, index) => {
                    return (
                        <>
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
                        </>
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
                            <PermissionConfig
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
                            />
                            <span>仅支持使用新方案的note5/note7设备</span>
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
