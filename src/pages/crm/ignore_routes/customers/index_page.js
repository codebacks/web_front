/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {connect} from 'dva'
import {
    Table,
    Pagination,
    Popover,
    Tag,
    Spin,
    Button,
    Modal,
    Icon,
} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import router from 'umi/router'
import moment from 'moment'
import SearchForm from 'crm/components/Customers/Customers/SearchForm'
import styles from './index.scss'
import Insert from 'crm/components/Customers/Customers/Insert'
import Export from 'crm/components/Customers/Customers/Export'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/customer'
import config from 'crm/common/config'
import {safeJsonStringify} from 'utils'
import ContentHeader from 'business/ContentHeader'

const {pageSizeOptions, DateTimeFormat, DateFormat} = config

@connect(({base, crm_wechats, crm_customers, crm_perHistory, crm_plans, crm_messages, loading}) => ({
    base, crm_wechats, crm_customers, crm_perHistory, crm_plans, crm_messages,
    checkMassLoading: loading.effects['crm_customers/checkMass'],
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            showDetail: false,
            visibleCreatePlan: false,
            showInsert: false,
            showInsertAll: false,
            showExport: false,
            exportStatus: 'ready', // ready / pending / success
            customerIds: false,
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    handleSearch = () => {
        this.props.dispatch({
            type: 'crm_customers/query',
            payload: {params: {offset: 0}},
        })
    }

    handleDetail = (record) => {
        router.push({
            pathname: `/crm/customers/${record.id}`,
            query: {wxId: record.wx_id},
        })
    }

    handleCreatePlan = () => {
        this.props.dispatch({
            type: 'crm_plans/setProperty',
            payload: {createModal: true},
        })
        this.props.dispatch({
            type: 'crm_customers/query',
            payload: {params: {offset: 0, limit: this.props.crm_customers.total}},
            callback: (res) => {
                this.props.dispatch({
                    type: 'crm_plans/setProperty',
                    payload: {toCustomers: res},
                })
            },
            onlyCallback: true,
        })

    }
    handleCancelCreatePlan = () => {
        this.setState({visibleCreatePlan: false})

    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'crm_customers/setProperty',
            payload: {selectedRowKeys: selectedRowKeys},
            callback: () => {
            },
        })
    }

    handlePageChange = (page) => {
        this.props.dispatch({
            type: 'crm_customers/query',
            payload: {page: page},
        })
    }

    handleInsertAll = () => {
        this.props.dispatch({
            type: 'crm_customers/query',
            payload: {params: {offset: 0, limit: this.props.crm_customers.total}},
            callback: (res) => {
                let _ids = []
                res.forEach((item) => {
                    _ids.push(item.id)
                })
                this.setState({customerIds: _ids, showInsertAll: true})

            },
            onlyCallback: true,
        })
    }

    handleInsert = () => {
        this.setState({showInsert: true})
    }

    handleExport = () => {
        this.props.dispatch({
            type: 'crm_customers/exportCustomers',
            payload: {
                params: {
                    token: this.props.crm_customers.exportToken,
                },
            },
            callback: (res) => {
                if(res.error && res.error.responseJson && res.error.responseJson.meta && res.error.responseJson.meta.code === 5017) {
                    // 验证过期
                    this.setState({showExport: true})
                }else if(res.data && res.data.task_id) {
                    const task_id = res.data.task_id
                    window.localStorage.setItem('export_customers_task_id', task_id)
                    this.setState({exportStatus: 'pending'})
                    this.handleCancelExport()
                    this.queryExport()
                }
            },
        })
    }

    queryExport = () => {
        // 查询导出状态
        const task_id = window.localStorage.getItem('export_customers_task_id')
        if(task_id) {
            this.props.dispatch({
                type: 'crm_customers/queryExportCustomers',
                payload: {
                    task_id: task_id,
                },
                callback: async res => {
                    if(res && res.status) {
                        this.setState({
                            exportStatus: 'success',
                            showExport: false,
                        })
                        this.handleDownload()
                    }else {
                        await new Promise(resolve => setTimeout(resolve, 2000))
                        this.queryExport()
                    }
                },
            })
        }
    }

    handleDownload = () => {
        // 下载导出文件
        const task_id = window.localStorage.getItem('export_customers_task_id')
        const url = Helper.format(API.DOWNLOAD_EXPORT_CUSTOMERS.url, {task_id: task_id})
        this.setState({showExport: false})
        let a = document.createElement('a')
        a.download = `客户数据导出-${moment().format(DateFormat)}.xlsx`
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.localStorage.setItem('export_customers_task_id', '')
        this.setState({exportStatus: 'ready'})
    }

    handleCancelInsert = () => {
        this.setState({showInsert: false, showInsertAll: false})
    }

    handleCancelExport = () => {
        this.setState({showExport: false})
    }

    handleSendCode = (e) => {
        const {initData} = this.props.base
        const mobile = initData.user.username
        this.props.dispatch({
            type: 'crm_customers/registerSmsCode',
            payload: {
                mobile: mobile,
                type: 'verify_mobile',
            },
        })
    }

    handleExportOK = (e, code) => {
        const {initData} = this.props.base
        const mobile = initData.user.username
        this.props.dispatch({
            type: 'crm_customers/verifyMe',
            payload: {
                mobile: mobile,
                sms_code: code,
            },
            callback: (data) => {
                this.handleExport()
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_customers.params}
        params.limit = size
        this.props.dispatch({
            type: 'crm_customers/setProperty',
            payload: {params: params},
        })
        this.goPage(1) //重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_customers/query',
            payload: {page: page},
        })
    }

    toCreateMass = () => {
        const {searchParams = {}} = this.props.crm_customers

        this.props.dispatch({
            type: 'crm_customers/checkMass',
            callback: (data) => {
                if(data.no_function_limit) { // 无限制
                    router.push({
                        pathname: '/crm/customers/create_mass',
                        search: `searchParams=${encodeURIComponent(safeJsonStringify(searchParams))}`,
                    })
                }else { // 有限制
                    const content = <>
                        <div style={{marginBottom: '10px', color: '#FFAA16'}}>为避免频繁群发骚扰客户，每个商家每日仅支持【1次】好友群发</div>
                        <div>今日剩余次数：{data.left > 0 ? data.left : 0}次</div>
                    </>
                    Modal.confirm({
                        title: '好友群发',
                        content: content,
                        icon: <Icon type="warning" style={{fontSize: '20px'}}/>,
                        onOk: () => {
                            router.push({
                                pathname: '/crm/customers/create_mass',
                                search: `searchParams=${encodeURIComponent(safeJsonStringify(searchParams))}`,
                            })
                        },
                        okButtonProps: {
                            disabled: !data.allow
                        },
                    })
                }
            },
        })

    }

    render() {
        const {params, list, total, current, customerLoading, selectedRowKeys, exportCustomersLoading} = this.props.crm_customers
        const {createModal} = this.props.crm_plans
        const {checkMassLoading=false} = this.props
        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'wechat.nickname',
                className: styles.column,
            },
            {
                title: '微信备注',
                dataIndex: 'wechat.remark_name',
                className: styles.remarkColumn,
            },
            {
                title: '微信标签',
                dataIndex: 'tags',
                render: (tags) => {
                    return <div className={styles.tags}>
                        {
                            tags.map((tag, idx) => {
                                return <Tag key={idx} color="blue" className={styles.tag}>{tag}</Tag>
                            })
                        }
                    </div>
                },
            },
            {
                title: '姓名',
                dataIndex: 'name',
                className: `${styles.firstColumn} ${styles.nameColumn}`,
                render: (text, record, index) => {
                    if(text) {
                        return <div className={styles.nameWrap}>{text}</div>
                    }
                    return ''
                },
            },
            {
                title: '手机号',
                dataIndex: 'mobile',
                className: styles.column,
            },
            {
                title: '购物账号',
                dataIndex: 'members',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let content = ''
                    if(text && text.length) {
                        content = text.map((item) => {
                            return item.platform_user_id
                        }).join('，')

                        return (
                            <Popover
                                placement="topLeft"
                                content={
                                    <p
                                        className={styles.wholeDept}
                                    >
                                        {content}
                                    </p>
                                }
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                                        title={null} trigger="hover">
                            <div className={styles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                className: styles.column,
                render: (text, record, index) => {
                    if(text) {
                        return text
                    }
                    return record.user.username
                },
            },
            {
                title: '所属微信',
                dataIndex: 'service_wechat.nickname',
                className: styles.column,
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                className: styles.timeColumn,
                render: (text, record, index) => {
                    if(text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }else {
                        return ''
                    }
                },
            },
            {
                title: '客户备注',
                dataIndex: 'remark',
                className: styles.remarkColumn,
                render: (text, record, index) => {
                    if(text) {
                        return <Popover placement="topLeft" content={<p className={styles.wholeRemark}>{text}</p>}
                                        title={null} trigger="hover">
                            <div className={styles.remark}>{text}</div>
                        </Popover>
                    }
                },
            },
            {
                title: '操作',
                dataIndex: 'status',
                className: styles.operationColumn,
                render: (text, record, index) => {
                    return <span className={styles.look} onClick={() => {
                        this.handleDetail(record)
                    }}>查看</span>
                },
            },
        ]
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        const {initData} = this.props.base
        const {is_creator} = initData.user || {}
        const {exportStatus} = this.state

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                        description: '牛客服中所有好友，均自动转化为客户',
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E5%AE%A2%E6%88%B7.md',
                    }}
                />
                <div className={styles.customer}>
                    <SearchForm {...this.props} onSearch={this.handleSearch}/>
                    <div className={styles.createPlan}>
                        <Spin spinning={exportCustomersLoading}>
                            满足过滤条件共 <strong>{total}</strong> 个客户
                            {/*{is_creator ? (*/}
                            {/*<span>*/}
                            {/*<Divider type="vertical"/>*/}
                            {/*{exportStatus === 'ready' ? (<a onClick={this.handleExport}>【 导出数据 】</a>) : ''}*/}
                            {/*{exportStatus === 'pending' ? (<a disabled={true}>【 正在导出 】</a>) : ''}*/}
                            {/*{exportStatus === 'success' ? (*/}
                            {/*<a onClick={this.handleDownload}>【 下载导出文件 】</a>) : ''}*/}
                            {/*</span>*/}
                            {/*) : ''}*/}
                            <Button
                                onClick={this.toCreateMass}
                                className={styles.createMass}
                                type={'primary'}
                                loading={checkMassLoading}
                            >
                                创建群发
                            </Button>

                            {/*<Button size="small" disabled={!total} onClick={this.handleCreatePlan}>创建营销计划（{total}人）</Button>*/}
                            {/*<Button size="small" disabled={!total}*/}
                            {/*loading={customerLoading}*/}
                            {/*onClick={this.handleInsertAll}>添加到营销计划（{total}人）</Button>*/}
                            {/*<Button size="small" disabled={!selectedRowKeys.length}*/}
                            {/*loading={customerLoading}*/}
                            {/*onClick={this.handleCreatePlanSelect}>选择客户创建营销计划（{selectedRowKeys.length}人）</Button>*/}
                            {/*<Button size="small" disabled={!selectedRowKeys.length}*/}
                            {/*onClick={this.handleInsert}>选择客户添加到营销计划（{selectedRowKeys.length}人）</Button>*/}
                        </Spin>
                    </div>
                    <div className={styles.list}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            loading={customerLoading}
                            // rowSelection={rowSelection}
                            rowKey={record => record.id}
                            pagination={false}
                        />
                        {list.length ? <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共${total}条`}
                            pageSize={params.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.handlePageChange}
                        /> : ''
                        }
                    </div>
                    {this.state.showInsert ?
                        <Insert {...this.props} visible={this.state.showInsert} customer_ids={selectedRowKeys}
                                onCancel={this.handleCancelInsert}/>
                        : ''}
                    {this.state.showInsertAll ?
                        <Insert {...this.props} visible={this.state.showInsertAll} customer_ids={this.state.customerIds}
                                onCancel={this.handleCancelInsert}/>
                        : ''}
                    {this.state.showExport ?
                        <Export {...this.props} visible={this.state.showExport} mobile={initData.user.username}
                                onCancel={this.handleCancelExport} handleSendCode={this.handleSendCode}
                                handleExportOK={this.handleExportOK}/>
                        : ''}
                </div>
            </div>
        )
    }
}
