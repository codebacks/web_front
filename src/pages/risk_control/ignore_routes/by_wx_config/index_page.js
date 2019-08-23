import React from 'react'
import {Button, Table, Checkbox, Icon, Popover, message } from 'antd'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader/index'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import EllipsisPopover from "components/EllipsisPopover"
import config from "risk_control/common/constants"
import PermissionConfig from './components/PermissionConfig'
import SinglePermission from './components/SinglePermission'
import SearchBar from 'business/SearchBar'
import Helper from 'wx/utils/helper'
import styles from './index.less'

const { pageSizeOptions, DateTimeFormat, DefaultAvatar } = config

@hot(module)
@connect(({base, risk_control_byWxConfig, loading}) => ({
    base,
    risk_control_byWxConfig,
    tableLoading: loading.effects['risk_control_byWxConfig/query'],
    wxDivideOptionsLoading: loading.effects['risk_control_byWxConfig/wxDivideOptions'],
    getPermissionConfigLoading: loading.effects['risk_control_byWxConfig/getPermissionConfig'],
    setPermissionConfigLoading: loading.effects['risk_control_byWxConfig/setPermissionConfig'],
    getSinglePermissionLoading: loading.effects['risk_control_byWxConfig/getSinglePermission'],
    setSinglePermissionLoading: loading.effects['risk_control_byWxConfig/setSinglePermission'],
}))
@documentTitleDecorator({
    overrideTitle: '按微信号配置',
})
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
        this.props.dispatch({type: 'risk_control_byWxConfig/wxDivideOptions',})
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.risk_control_byWxConfig.current
        }
        this.props.dispatch({
            type: 'risk_control_byWxConfig/query',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_byWxConfig/setStateByPath',
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
        let params = {...this.props.risk_control_byWxConfig.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_byWxConfig/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_byWxConfig/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_byWxConfig/setProperty',
            payload: {
                selectedRowKeys,
            },
        })
    }

    selectedRowKeysCheck = ({setTrue, selectedRowKeys}) => {
        if (!selectedRowKeys.length) {
            message.warning('请先勾选微信号')
            return
        }
        setTrue()
    }

    render() {
        const {
            tableLoading,
            wxDivideOptionsLoading,
            getPermissionConfigLoading,
            setPermissionConfigLoading,
            getSinglePermissionLoading,
            setSinglePermissionLoading,
            risk_control_byWxConfig,
        } = this.props
        const { list, current, total, params = {}, selectedRowKeys, wxDivideOptionsMap } = risk_control_byWxConfig

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
                                    record.head_img_url ? (<img
                                        className={styles.head}
                                        src={Helper.getWxThumb(record.head_img_url).replace('http:', '')}
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
                            <SinglePermission
                                getLoading={getSinglePermissionLoading}
                                goPage={this.goPage}
                                uin={record?.uin}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.canEdit}
                                            onClick={setTrue}
                                        >微信权限配置</span>
                                    )
                                }}
                                modalOption={{
                                    confirmLoading: getSinglePermissionLoading || setSinglePermissionLoading,
                                }}
                            />
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.byWxConfig}>

                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />

                <div className={styles.content}>
                    <SearchBar
                        searchBlock={[
                            {
                                cols: [
                                    {
                                        type: 'inputSearch',
                                        formItemOption: {
                                            label: '搜索',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            onSearch: this.handleSearch,
                                            key: 'query',
                                            placeholder: '输入昵称、手机号、微信号、备注',
                                        },
                                    },
                                    {
                                        formItemOption: {
                                            label: '所属部门',
                                        },
                                        component: (
                                            <DepartmentSelect
                                                departmentId={params.department_id}
                                                onChange={(value) => {
                                                    this.handleChange('department_id', value)
                                                }}
                                            />
                                        ),
                                    },
                                    {
                                        formItemOption: {
                                            label: '所属员工',
                                        },
                                        component: (
                                            <UserSelect
                                                departmentId={params.department_id}
                                                userId={params.user_id}
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
                                        type: 'select',
                                        formItemOption: {
                                            label: '微信号分组',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            key: 'group_id',
                                            placeholder: '全部',
                                            optionsMap: wxDivideOptionsMap,
                                            loading: wxDivideOptionsLoading,
                                            showSearch: true,
                                            optionFilterProp: 'children',
                                            filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                        },
                                    },
                                    {
                                        type: 'inputSearch',
                                        formItemOption: {
                                            label: '设备信息',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            onSearch: this.handleSearch,
                                            key: 'device_query',
                                            placeholder: '设备编号、备注',
                                        },
                                    },
                                    {
                                        formItemOption: {
                                            label: '设备所属客服',
                                        },
                                        component: (
                                            <UserSelect
                                                departmentId={params.department_id}
                                                userId={params.keep_user_id}
                                                onChange={(value) => {
                                                    this.handleChange('keep_user_id', value)
                                                }}
                                            />
                                        ),
                                    },
                                ],
                            },
                            {
                                cols: [
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
                                        className={styles.batchBtn}
                                    >
                                        微信权限配置
                                    </Button>
                                )
                            }}
                            modalOption={{
                                confirmLoading: getPermissionConfigLoading || setPermissionConfigLoading,
                            }}
                        />
                        <span>仅支持登录在新方案note5/note7设备上的微信</span>
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
        )
    }
}
