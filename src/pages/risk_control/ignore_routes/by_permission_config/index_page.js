import React from 'react'
import { Button, Table, Popover, message, Modal, Popconfirm, Spin, Alert, } from 'antd'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader/index'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import EllipsisPopover from "components/EllipsisPopover"
import WeChatSelectMulti from '@huzan/hz-wechat-select'
import '@huzan/hz-wechat-select/style/index'
import baseConfig from 'config'
import config from "risk_control/common/constants"
import SearchBar from 'business/SearchBar'
import Helper from 'wx/utils/helper'
import styles from './index.less'

const { pageSizeOptions, DefaultAvatar } = config

@hot(module)
@connect(({base, risk_control_byPermissionConfig, loading}) => ({
    base,
    risk_control_byPermissionConfig,
    tableLoading: loading.effects['risk_control_byPermissionConfig/query'],
    getWxConigSummaryLoading: loading.effects['risk_control_byPermissionConfig/getWxConigSummary'],
}))
@documentTitleDecorator({
    overrideTitle: '按权限配置',
})
export default class Index extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            record: null,
            wxVisible: false, // 是否显示选择微信号的组件
        }
    }

    componentDidMount() {
        this.getWxConigSummary()
    }

    getWxConigSummary = () => {
        this.props.dispatch({
            type: 'risk_control_byPermissionConfig/getWxConigSummary',
            callback: () => {
                this.goPage(1)
            }
        })
    }

    goPage = (page) => {
        const { current, configKey } = this.props.risk_control_byPermissionConfig
        if(typeof configKey !== 'undefined') {
            if(typeof page === 'undefined') {
                page = current
            }
            this.props.dispatch({
                type: 'risk_control_byPermissionConfig/query',
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
            type: 'risk_control_byPermissionConfig/setStateByPath',
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
        let params = {...this.props.risk_control_byPermissionConfig.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_byPermissionConfig/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_byPermissionConfig/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_byPermissionConfig/setProperty',
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
        const { configKey } = this.props.risk_control_byPermissionConfig
        this.props.dispatch({
            type: 'risk_control_byPermissionConfig/moveOut',
            payload: {
                configKey: configKey,
                body: {
                    uins: selectedRowKeys,
                },
            },
            callback: () => {
                resolve && resolve()
                this.getWxConigSummary()
            }
        })
    }

    handleConfigKey = (currentKey, key) => {
        if(currentKey === key) {
            return
        }else{
            this.props.dispatch({
                type: 'risk_control_byPermissionConfig/setProperty',
                payload: {configKey: key},
            })
            this.props.dispatch({type: 'risk_control_byPermissionConfig/resetParams'})
            this.props.dispatch({type: 'risk_control_byPermissionConfig/clearSelectedRowKeys'})
            setTimeout(() => {
                this.goPage(1)
            }, 500)
        }
    }

    handleShowSelect = () => {
        this.setState({
            wxVisible: true,
        })
    }

    handleSelectCancel = () => {
        this.setState({
            wxVisible: false,
        })
    }

    handleSelectOk = (list) =>{
        const { configKey } = this.props.risk_control_byPermissionConfig
        let body = {
            uins: list.map((item) => item.uin),
            [configKey]: 1,
        }
        this.props.dispatch({
            type: 'risk_control_byPermissionConfig/addPermissionWechat',
            payload: {
                body: {
                    ...body,
                }
            },
            callback: () => {
                message.success('添加微信号成功')
                this.setState({
                    wxVisible: false,
                })
                this.getWxConigSummary()
            },
        })

    }

    render() {
        const { wxVisible } = this.state
        const { tableLoading, getWxConigSummaryLoading, risk_control_byPermissionConfig, base, } = this.props
        const { list, current, total, params = {}, selectedRowKeys, configKey, configKeyArr } = risk_control_byPermissionConfig
        const leftHeight = parseInt(base.winHeight - base.headerHeight - (60 + 16 + 50))

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        const columns = [
            {
                title: '微信号信息',
                dataIndex: 'msg',
                width: 270,
                className: styles.msgColumn,
                render: (text, record) => {
                    return (
                        <div className={styles.msgWrap}>
                            <div className={styles.head}>
                                {
                                    record?.head_img_url ? (<img
                                        className={styles.head}
                                        src={Helper.getWxThumb(record?.head_img_url).replace('http:', '')}
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
                                    <span style={{whiteSpace: 'pre-wrap'}}>{record.nickname}</span>
                                </div>
                                <div>
                                    {record.mobile}
                                </div>
                                <div>
                                    {record.alias || record.username}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: '微信号备注',
                dataIndex: 'remark',
                className: styles.remarkColumn,
                render: (text, record) => {
                    return <div className={styles.remark}>
                        {text ? (
                            <Popover
                                placement="topLeft"
                                content={<div style={{maxWidth: '200px'}}>{text}</div>}
                            >
                                <span
                                    className={styles.edit}
                                    onClick={() => {this.handleShowRemarkEdit(record)}}
                                >{text}</span>
                            </Popover>
                        ) : null
                        }
                    </div>

                },
            },
            {
                title: '分组',
                dataIndex: 'group',
                key: 'group',
                className: styles.divideColumn,
                render: (text, record) => {
                    return <span>{ text ? text : '未分组'}</span>
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                            title={null}
                            trigger="hover">
                            <div className={styles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                className: styles.userColumn,
            },
            {
                title: '设备信息',
                dataIndex: 'device',
                className: styles.deviceColumn,
                render: (text, record) => {
                    let cont = ''
                    if(Object.keys(text).length) {
                        cont = (
                            <>
                                <div>编号：{text?.number}</div>
                                <EllipsisPopover lines={2} content={text?.remark}/>
                            </>
                        )
                    }else{
                        cont = '-'
                    }
                    return cont
                },
            },
            {
                title: '设备当时所属客服',
                dataIndex: 'device.user',
                className: styles.devideKeepColumn,
                render: (text, record) => {
                    return <span>{text?.nickname || text?.username}</span>
                },
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
                                onConfirm={(e) => this.moveOut(false, [record.uin])}
                            >
                                <span className={styles.canEdit}>移出</span>
                            </Popconfirm>

                        </div>
                    )
                },
            },
        ]


        return (

            <div className={styles.byPermissionConfig}>

                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />

                <Alert message='仅支持登录在新方案note5/note7设备上的微信' type="info" showIcon style={{marginBottom: '12px'}} />

                <div className={styles.content}>
                    <Spin spinning={getWxConigSummaryLoading}>
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
                                                key: 'query',
                                                placeholder: '输入昵称、手机号、微信号',
                                            },
                                        },
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
                                                    userId={params.user_id}
                                                    placeholder={'选择员工'}
                                                    onChange={(value) => {
                                                        this.handleChange('user_id', value)
                                                    }}
                                                />
                                            ),
                                        },
                                    ],
                                },
                                {
                                    cols: [
                                        {
                                            type: 'inputSearch',
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                onSearch: this.handleSearch,
                                                key: 'device_query',
                                                placeholder: '设备信息',
                                            },
                                        },
                                        {
                                            component: (
                                                <UserSelect
                                                    departmentId={params.department_id}
                                                    userId={params.keep_user_id}
                                                    placeholder={'设备所属客服'}
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
                            >添加微信号</Button>
                            <Button
                                onClick={() => {this.moveOut(true, selectedRowKeys)}}
                                className={styles.batchBtn}
                            >移出</Button>
                        </div>
                        <div className={styles.table}>
                            <Table
                                columns={columns}
                                dataSource={list}
                                rowKey={(record) => record?.uin}
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

                <WeChatSelectMulti
                    visible={wxVisible}
                    apiHost={`${baseConfig.apiHost}/api`}
                    accessToken={base.accessToken}
                    filterBySerialno={true}
                    searchOption={['query', 'group_id']}
                    resetOnClose={true}
                    onCancel={this.handleSelectCancel}
                    onOk={this.handleSelectOk}
                />
            </div>

        )
    }
}
