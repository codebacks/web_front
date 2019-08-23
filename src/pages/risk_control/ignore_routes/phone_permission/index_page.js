import React from 'react'
import { Button, Table, message, Modal, Popconfirm, Spin, Badge, } from 'antd'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader/index'
import DepartmentSelect from 'components/business/DepartmentSelect/index'
import UserSelect from 'components/business/UserSelect/index'
import EllipsisPopover from "components/EllipsisPopover/index"
import config from "risk_control/common/constants"
import SearchBar from 'business/SearchBar/index'
import DeviceSelectMulti from '@huzan/hz-device-select'
import '@huzan/hz-device-select/style/index'
import baseConfig from 'config'
import Helper from 'wx/utils/helper'
import styles from './index.less'

const { pageSizeOptions, DefaultAvatar } = config

@hot(module)
@connect(({base, risk_control_phonePermissionConfig, loading}) => ({
    base,
    risk_control_phonePermissionConfig,
    tableLoading: loading.effects['risk_control_phonePermissionConfig/query'],
    getPhoneConfigSummaryLoading: loading.effects['risk_control_phonePermissionConfig/getPhoneConfigSummary'],
}))
@documentTitleDecorator({
    title: '按权限配置',
})
export default class Index extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            record: null,
            deviceVisible: false, // 是否显示选择设备的组件
        }
    }

    componentDidMount() {
        this.getPhoneConfigSummary()
    }

    getPhoneConfigSummary = () => {
        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/getPhoneConfigSummary',
            callback: () => {
                this.goPage(1)
            }
        })
    }

    goPage = (page) => {
        const { current, configKey } = this.props.risk_control_phonePermissionConfig
        if(typeof configKey !== 'undefined') {
            if(typeof page === 'undefined') {
                page = current
            }
            this.props.dispatch({
                type: 'risk_control_phonePermissionConfig/query',
                payload: {
                    configKey: configKey,
                    page: page,
                },
            })
        }else{
            message.warning('微信权限配置为空')
        }
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.risk_control_phonePermissionConfig.params}
        params[key] = val
        if (key === 'department_id') {
            params['keep_user_id'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/setProperty',
            payload: {
                selectedRowKeys,
            },
        })
    }

    // 批量和单个移出
    moveOut = (isBatch, selectedRowKeys) => {
        if(isBatch) { // 批量
            if (!selectedRowKeys.length) {
                message.warning('请先勾选微信号')
                return
            }
            const content = <div>已选{selectedRowKeys.length}个微信号，确定要批量移出？</div>
            Modal.confirm({
                title: '移出',
                content: content,
                onOk: () => {
                    return new Promise((resolve) => {
                        this.moveOutDispatch(selectedRowKeys, resolve)
                    })
                },
            })
        }else{ // 单个
            this.moveOutDispatch(selectedRowKeys)
        }
    }

    moveOutDispatch = (selectedRowKeys, resolve) => {
        const { configKey } = this.props.risk_control_phonePermissionConfig
        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/moveOut',
            payload: {
                configKey: configKey,
                body: {
                    device_ids: selectedRowKeys,
                },
            },
            callback: () => {
                resolve && resolve()
                this.getPhoneConfigSummary()
            }
        })
    }

    handleConfigKey = (currentKey, key) => {
        if(currentKey === key) {
            return
        }else{
            this.props.dispatch({
                type: 'risk_control_phonePermissionConfig/setProperty',
                payload: {configKey: key},
            })
            this.props.dispatch({type: 'risk_control_phonePermissionConfig/resetParams'})
            this.props.dispatch({type: 'risk_control_phonePermissionConfig/clearSelectedRowKeys'})
            setTimeout(() => {
                this.goPage(1)
            }, 500)
        }
    }

    handleShowSelect = () => {
        this.setState({
            deviceVisible: true,
        })
    }

    handleSelectCancel = () => {
        this.setState({
            deviceVisible: false,
        })
    }

    handleSelectOk = (list) =>{
        const { configKey } = this.props.risk_control_phonePermissionConfig
        let body = {
            device_ids: list.map((item) => item.id),
            [configKey]: 1,
        }
        this.props.dispatch({
            type: 'risk_control_phonePermissionConfig/addPermissionDevice',
            payload: {
                body: {
                    ...body,
                }
            },
            callback: () => {
                message.success('添加设备成功')
                this.setState({
                    deviceVisible: false,
                })
                this.getPhoneConfigSummary()
            },
        })
    }

    render() {
        const { deviceVisible } = this.state
        const { tableLoading, getPhoneConfigSummaryLoading, risk_control_phonePermissionConfig, base, } = this.props
        const { list, current, total, params = {}, selectedRowKeys, configKey, configKeyArr } = risk_control_phonePermissionConfig
        const leftHeight = parseInt(base.winHeight - base.headerHeight - (60 + 16))

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        const columns = [
            {
                title: '编号',
                dataIndex: 'number',
                className: styles.numberColumn,
            },
            {
                title: '序列号',
                dataIndex: 'serialno',
                className: styles.serialnoColumn,
            },
            {
                title: '设备备注',
                dataIndex: 'remark',
                className: styles.remarkColumn,
                render: (text, record) => {
                    return <EllipsisPopover lines={2} content={text}/>
                },
            },
            {
                title: '状态',
                dataIndex: 'is_online',
                className: styles.onlineColumn,
                render: (text, record) => {
                    return text ? <Badge status="success" text="在线"/>
                        : <Badge status="error" text="离线"/>
                },
            },
            {
                title: '设备分组',
                dataIndex: 'group_name',
                className: styles.divideColumn,
                render: (text, record) => {
                    return <span>{ text ? text : '未分组'}</span>
                },
            },
            {
                title: '当前登录微信',
                dataIndex: 'wechat',
                width: 270,
                className: styles.msgColumn,
                render: (text, record) => {
                    return (
                        <div className={styles.msgWrap}>
                            <div className={styles.head}>
                                {
                                    text?.head_img_url ? (<img
                                        className={styles.head}
                                        src={Helper.getWxThumb(text?.head_img_url).replace('http:', '')}
                                        onError={(e) => {
                                            e.target.src = DefaultAvatar
                                        }}
                                        rel="noreferrer"
                                        alt=""
                                    />) : null
                                }
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
                className: styles.keepUserColumn,
            },
            {
                title: '操作',
                dataIndex: 'edit',
                className: styles.editColumn,
                render: (text, record) => {
                    return(
                        <div>
                            <Popconfirm
                                title={"移出该设备将失去此权限，确定要移出？"}
                                onConfirm={(e) => this.moveOut(false, [record.id])}
                            >
                                <span className={styles.canEdit}>移出</span>
                            </Popconfirm>

                        </div>
                    )
                },
            },
        ]


        return (
            <div className={styles.phonePermissionConfig}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />

                <div className={styles.content}>
                    <Spin spinning={getPhoneConfigSummaryLoading}>
                        <div className={styles.leftCont} style={{height: leftHeight}}>
                            {
                                configKeyArr.map((item, index) => {
                                    return (
                                        <div
                                            key={item.key}
                                            className={`${configKey === item.key ? styles.active : ''} ${styles.leftItem}`}
                                            onClick={() => {this.handleConfigKey(configKey, item?.key)}}
                                        >{item.desc}（{item.status}）</div>
                                    )
                                })
                            }
                        </div>
                    </Spin>

                    <div className={styles.rightCont}>
                        <SearchBar
                            searchBlock={[
                                {
                                    cols: [
                                        {
                                            type: 'inputSearch',
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                onSearch: this.handleSearch,
                                                key: 'keyword',
                                                placeholder: '输入序列号、备注、编号',
                                            },
                                        },
                                        {
                                            type: 'inputSearch',
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                onSearch: this.handleSearch,
                                                key: 'wechat_keyword',
                                                placeholder: '输入昵称、手机号、微信号',
                                            },
                                        },
                                        {
                                            type: 'select',
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                key: 'is_online',
                                                placeholder: '全部',
                                                optionsMap: {
                                                    '1': '在线',
                                                    '0': '离线',
                                                },
                                            },
                                        },
                                    ],
                                },
                                {
                                    cols: [
                                        {
                                            component: (
                                                <DepartmentSelect
                                                    departmentId={params.department_id}
                                                    placeholder={'选择部门'}
                                                    onChange={(value) => {
                                                        this.handleChange('department_id', value)
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            component: (
                                                <UserSelect
                                                    departmentId={params.department_id}
                                                    userId={params.keep_user_id}
                                                    placeholder={'选择员工'}
                                                    onChange={(value) => {
                                                        this.handleChange('keep_user_id', value)
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            type: 'search',
                                            searchBtnOption: {
                                                onClick: this.handleSearch,
                                            },
                                            resetBtnOption: {
                                                onClick: this.resetSearch,
                                            },
                                        },
                                    ],
                                },
                            ]}
                        />
                        <div className={styles.batchBtns}>
                            <Button
                                type='primary'
                                onClick={this.handleShowSelect}
                                className={styles.batchBtn}
                            >添加设备</Button>
                            <Button
                                onClick={() => {this.moveOut(true, selectedRowKeys)}}
                                className={styles.batchBtn}
                            >移出</Button>
                        </div>
                        <div className={styles.table}>
                            <Table
                                columns={columns}
                                dataSource={list}
                                rowKey={(record) => record?.id}
                                rowSelection={rowSelection}
                                loading={tableLoading}
                                pagination={
                                    list.length ? {
                                        total,
                                        current,
                                        showQuickJumper: true,
                                        showTotal: (total) => `共 ${total} 条`,
                                        pageSize: params.limit,
                                        showSizeChanger: true,
                                        onChange: this.goPage,
                                        onShowSizeChange: this.handleChangeSize,
                                        pageSizeOptions,
                                    } : false
                                }
                            />
                        </div>
                    </div>
                </div>

                <DeviceSelectMulti
                    visible={deviceVisible}
                    apiHost={`${baseConfig.apiHost}/api`}
                    accessToken={base.accessToken}
                    filterBySerialno={true}
                    searchOption={['keyword', 'group_id']}
                    resetOnClose={true}
                    onCancel={this.handleSelectCancel}
                    onOk={this.handleSelectOk}
                />
            </div>
        )
    }
}
