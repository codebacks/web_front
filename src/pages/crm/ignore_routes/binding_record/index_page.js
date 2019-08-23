import React from 'react'
import {Button, Table, Form, Row, Col, Input, Select} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import RangeDatePicker from 'components/RangeDatePicker'
import config from "crm/common/config"
import moment from 'moment'
import DepartmentSelect from "business/DepartmentSelect"
import UserSelect from "business/UserSelect"

const {pageSizeOptions, DateTimeFormat} = config
const FormItem = Form.Item
const Search = Input.Search
const Option = Select.Option

const statusMap = {
    '1': '已绑定',
    '0': '待确认',
    '-1': '失败',
}

@hot(module)
@connect(({base, crm_bindingRecord, loading}) => ({
    base,
    crm_bindingRecord,
    tableLoading: loading.effects['crm_bindingRecord/details'],
}))
@documentTitleDecorator()
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_bindingRecord/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage()
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'crm_bindingRecord/setStateByPath',
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
        let params = {...this.props.crm_bindingRecord.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        this.props.dispatch({
            type: 'crm_bindingRecord/setParams',
            payload: {params: params},
        })
    }

    getStoreTypeOptions = () => {
        const {initData: config} = this.props.base
        const options = [
            <Option key="all" value="">
                全部平台
            </Option>,
        ]
        const _types = config.store_types || []
        _types.forEach((item) => {
            options.push(
                <Option
                    key={item.id + ''}
                    value={item.id + ''}
                >
                    {item.name}
                </Option>,
            )
        })

        return options
    }

    findPlatformName = (id) => {
        const {initData: config} = this.props.base
        const store_types = config.store_types || []
        const findItem = store_types.find(item => Number(item.id) === Number(id))

        if (findItem) {
            return findItem.name
        }

        return '未知'
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'crm_bindingRecord/resetParams',
        })
        this.goPage(1)
    }

    getStatusOptions = () => {
        const options = [
            <Option
                key="all"
                value=""
            >
                全部状态
            </Option>,
        ]

        Object.keys(statusMap).forEach((key, index) => {
            options.push(
                <Option
                    key={key + ''}
                    value={key + ''}
                >
                    {statusMap[key]}
                </Option>,
            )
        })

        return options
    }

    render() {
        const {tableLoading, crm_bindingRecord} = this.props
        const {list, current, total, params = {}} = crm_bindingRecord

        const columns = [
            {
                title: '绑定信息',
                dataIndex: 'remark',
            },
            // {
            //     title: '平台',
            //     dataIndex: 'platform',
            //     render: (text, record, index) => {
            //         return this.findPlatformName(text)
            //     },
            // },
            {
                title: '好友',
                dataIndex: 'customer',
                render: (text = {}, record, index) => {
                    return text.wechat_remark || text.wechat_nickname
                },
            },
            {
                title: '所属微信',
                dataIndex: 'wechat',
                render: (text = {}, record, index) => {
                    return text.remark || text.nickname
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record, index) => {
                    return statusMap[text]
                },
            },
            {
                title: '执行时间',
                dataIndex: 'create_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '旺旺号',
                dataIndex: 'platform_user_id',
                render: (text, record, index) => {
                    return text
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <div className={styles.content}>
                    <div className={styles.searchWrap}>
                        <Form {...formItemLayout}>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem
                                        label="绑定信息："
                                        colon={false}
                                    >
                                        <Search
                                            placeholder="输入绑定信息"
                                            value={params.remark}
                                            onChange={(e) => {
                                                this.handleChange('remark', e)
                                            }}
                                            onSearch={this.handleSearch}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        label="状态："
                                        colon={false}
                                    >
                                        <Select
                                            onChange={(e) => {
                                                this.handleChange('status', e)
                                            }}
                                            placeholder="全部状态"
                                            value={params.status + ''}
                                        >
                                            {this.getStatusOptions()}
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        label="好友："
                                        colon={false}
                                    >
                                        <Search
                                            placeholder="输入好友备注/昵称"
                                            value={params.friend}
                                            onChange={(e) => {
                                                this.handleChange('friend', e)
                                            }}
                                            onSearch={this.handleSearch}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem
                                        label="所属部门："
                                        colon={false}
                                    >
                                        <DepartmentSelect
                                            departmentId={params.department_id}
                                            onChange={(value)=>{this.handleChange('department_id', value)}}
                                        />
                                    </FormItem>
                                    {/*<FormItem*/}
                                    {/*    label="平台："*/}
                                    {/*    colon={false}*/}
                                    {/*>*/}
                                    {/*    <Select*/}
                                    {/*        onChange={(e) => {*/}
                                    {/*            this.handleChange('platform', e)*/}
                                    {/*        }}*/}
                                    {/*        placeholder="全部平台"*/}
                                    {/*        value={params.platform + ''}*/}
                                    {/*    >*/}
                                    {/*        {this.getStoreTypeOptions()}*/}
                                    {/*    </Select>*/}
                                    {/*</FormItem>*/}
                                </Col>
                                <Col span={8}>
                                    {/*<FormItem*/}
                                    {/*    label="执行时间："*/}
                                    {/*    colon={false}*/}
                                    {/*>*/}
                                    {/*    <RangeDatePicker*/}
                                    {/*        maxToday={true}*/}
                                    {/*        value={params.create_time}*/}
                                    {/*        onChange={(value) => {*/}
                                    {/*            this.handleChange('create_time', value.slice())*/}
                                    {/*        }}*/}
                                    {/*    />*/}
                                    {/*</FormItem>*/}
                                    <FormItem
                                        label="所属员工："
                                        colon={false}
                                    >
                                        <UserSelect
                                            departmentId={params.department_id}
                                            userId={params.user_id}
                                            onChange={(value)=>{this.handleChange('user_id', value)}}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        label="所属微信："
                                        colon={false}
                                    >
                                        <WeChatSelectSingle
                                            uin={params.from_uin}
                                            onChange={(value) => {
                                                this.handleChange('from_uin', value)
                                            }}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={8} className={styles.operateBtn}>
                                    <Col offset={4} style={{paddingLeft: '0px'}}>
                                        <Button
                                            className={styles.search}
                                            type="primary"
                                            icon="search"
                                            onClick={this.handleSearch}
                                        >
                                            搜索
                                        </Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => record.id}
                            loading={tableLoading}
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
                                        pageSizeOptions,
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
