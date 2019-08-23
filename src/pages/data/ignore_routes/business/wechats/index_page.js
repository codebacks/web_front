/**
 * Created by lin on 19-3-6.
 */
import React from 'react'
import {Table, Button, Form, Row, Card, Col, Input, Select, Checkbox, Popover, Icon, Divider} from 'antd'
import {connect} from 'dva'
import styles from './index.scss'
import ContentHeader from 'components/business/ContentHeader'
import {Radio} from "antd/lib/radio"
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import helper from 'data/utils/helper'
import config from "data/common/config"
import moment from 'moment'
import qs from 'qs'
import API from 'data/common/api/business'
import documentTitleDecorator from 'hoc/documentTitle'

import { DatePicker } from 'antd'
import _ from "lodash"

const FormItem = Form.Item
const Option = Select.Option
const {DateTimeFormat} = config


@connect(({ base, data_business_wechat_report }) => ({
    base,
    data_business_wechat_report,
}))
@documentTitleDecorator({
    title: '微信报表',
})
export default class extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        let params = {
            last_sync_db_time: undefined,
            low_battery: undefined,
            department_id: undefined,
            query: undefined,
            im_online_status: "",
            valid_boot_time: undefined,
            valid_version: undefined
        }
        this.props.dispatch({
            type: 'data_business_wechat_report/setProperty',
            payload: {params: params},
        })
        this.props.dispatch({
            type: 'data_business_wechat_report/overview',
            payload: {params: params},
        })
        this.props.dispatch({
            type: 'data_business_wechat_report/query',
            payload: {params: params},
        })

    }
    handleChange(key, e) {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_business_wechat_report.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'data_business_wechat_report/setProperty',
            payload: {params: params},
        })
    }
    handleTimeChange = (date) => {
        let params = {...this.props.data_business_wechat_report.params}
        if (date != null){
            params['last_sync_db_time'] = date.format('YYYY-MM-DD 23:59:59')
        }
        else {
            params['last_sync_db_time'] = undefined
        }


        this.props.dispatch({
            type: 'data_business_wechat_report/setProperty',
            payload: {params: params},
        })
    }
    handleSearch = () => {
        let params = {...this.props.data_business_wechat_report.params}

        this.props.dispatch({
            type: 'data_business_wechat_report/query',
            payload: {params: params},
        })

    }

    handleCheckChange = (key, e) => {
        let params = {...this.props.data_business_wechat_report.params}
        let checked = e.target.checked
        if (checked) {
            params[key] = '1'
        } else {
            params[key] = undefined
        }
        this.props.dispatch({
            type: 'data_business_wechat_report/setProperty',
            payload: {
                params: params,
                key: e.target.checked
            }
        })
        setTimeout(()=>{
            this.handleSearch()
        }, 0)
    }
    cardChange = (type) => {
        let params = {
            last_sync_db_time: undefined,
            low_battery: undefined,
            department_id: undefined,
            query: undefined,
            im_online_status: "",
            valid_boot_time: undefined,
            valid_version: undefined
        }
        if (type === 'im_online_status') {
            params['im_online_status'] = 0
        } else if (type === 'low_battery') {
            params['low_battery'] = 1
            params['im_online_status'] = 0
        } else {
            params[type] = 1
        }
        this.props.dispatch({
            type: 'data_business_wechat_report/setProperty',
            payload: {
                params: params,
            }
        })
        setTimeout(()=>{
            this.handleSearch()
        }, 0)
    }

    treeToArray  = (tree, name, currentName, data, level, index) => {
        currentName = currentName || []
        name = name || []
        data = data || []
        for(let i = 0; i < tree.length; i++) {
            if(i !== 0) {
                currentName.pop()
            }
            if (tree[i].name === ""){
                currentName.push(tree[i].nick_name)
            }
            else {
                currentName.push(tree[i].name)
            }

            if (tree[i].children && tree[i].children.length) {
                this.treeToArray(tree[i].children, name, currentName, data, level, index + 1)
            } else {
                if (currentName !== ''){
                    name.push(currentName.slice(0))
                }
                if (index === level) {
                    let item = tree[i]
                    delete item.children
                    data.push(item)
                } else {
                    data.push({})
                }
            }
        }

        currentName.pop()
        return name
    }

    // 报表
    parseData = (trees) => {
        let tableData = []
        if (trees && trees.length) {
            let tree = trees[0].children
            let name = []
            let currentName = []
            let data = []
            this.treeToArray(tree, name, currentName, data, 5, 1) // 固定到第4级
            tableData = name.map((item, index) => {
                let department = {}
                item.forEach((v, idx) => {
                    let filed = ''
                    if (idx === 0) {
                        filed = 'area'
                    } else if (idx === 1) {
                        filed = 'city'
                    } else if (idx === 2) {
                        filed = 'manager'
                    } else if (idx === 3) {
                        filed = 'name'
                    } else if (idx === 4) {
                        filed = 'nickname'
                    }
                    department[filed] = v
                })
                return {...department, ...data[index]}
            })
        }
        return tableData
    }

    checkColSpan = (array) => {
        let result = []
        let start = 0
        for (let i in array) {
            if (i === 0) {
                result[i] = 1
                continue
            }

            if (array[i] === array[i - 1]) {
                result[start]++
                result[i] = 0
            } else {
                result[i] = 1
                start = i
            }
        }
        return result
    }

    getExportUrl = (params) => {
        const accessToken = this.props.base.accessToken
        return `${API.wechatsReportsExportExcel.url}?${qs.stringify(params)}&access_token=${accessToken}`
    }

    render() {
        let params = {...this.props.data_business_wechat_report.params}
        let {low_battery, valid_version, valid_boot_time} = params
        let {loading} = {...this.props.data_business_wechat_report}

        let {resData, overviewData} = {...this.props.data_business_wechat_report}
        const tableData = this.parseData(resData)
        const colSpanCountArea = this.checkColSpan(tableData.map(item => item.area))
        const colSpanCountCity = this.checkColSpan(tableData.map(item => item.city))
        const colSpanCountManager = this.checkColSpan(tableData.map(item => item.manager))
        const colSpanCountName = this.checkColSpan(tableData.map(item => item.name))


        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const getStats = () => {
            return (
                <div className={styles.total}>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}} onClick={() => this.cardChange('')}>
                            <h3>微信号总数</h3>
                            <div className={styles.num}>{overviewData.wechat_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}} onClick={() => this.cardChange('im_online_status')}>
                            <h3>离线微信总数</h3>
                            <div className={styles.num}>{overviewData.wechat_offline_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}} onClick={() => this.cardChange('low_battery')}>
                            <h3>设备断电离线</h3>
                            <div
                                className={styles.num}>{ overviewData.device_outage_offline_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}} onClick={() => this.cardChange('valid_version')}>
                            <h3>版本异常</h3>
                            <div className={styles.num}>{overviewData.version_invalid_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}} onClick={() => this.cardChange('valid_boot_time')}>
                            <h3>开机时间异常</h3>
                            <div className={styles.num}>{overviewData.boot_invalid_count}</div>
                        </Card>
                    </div>

                </div>)
        }

        const columns = [
            {
                title: '区域',
                dataIndex: 'area',
                key: 'area',
                render: (text, record, index) => {
                    return {
                        children: text,
                        props: {
                            rowSpan: colSpanCountArea[index]
                        },
                    }
                }
            },
            {
                title: '城市',
                dataIndex: 'city',
                key: 'city',
                render: (text, record, index) => {
                    return {
                        children: text,
                        props: {
                            rowSpan: colSpanCountCity[index]
                        },
                    }
                }
            },
            {
                title: '片区经理',
                dataIndex: 'manager',
                key: 'manager',
                render: (text, record, index) => {
                    return {
                        children: text,
                        props: {
                            rowSpan: colSpanCountManager[index]
                        },
                    }
                }
            },
            {
                title: '门店名称',
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => {
                    return {
                        children: text,
                        props: {
                            rowSpan: colSpanCountName[index]
                        },
                    }
                }
            },
            {
                title: '微信号信息',
                dataIndex: 'nickname',
                key: 'nickname',
                render: (text, record, index) => {
                    return <Row>
                        <Col span="7" className={styles.head}>
                            <img src={record.head_img_url} alt="" width={'100%'}/>
                        </Col>
                        <Col span="17" className={styles.head}>
                            <h3>{record.nickname}</h3>
                            <div>{record.mobile}</div>
                            <div>{record.alias || record.username || ''}</div>
                        </Col>
                    </Row>
                }
            },
            {
                title: '序列号',
                dataIndex: 'serialno',
                key: 'serialno',
                render: (text) => {
                    const val = text || '未知'
                    return (
                        <div>
                            <p>{val}</p>
                        </div>
                    )
                }
            },
            {
                title: '版本信息',
                dataIndex: 'system_version',
                key: 'system_version',
                render: (text, record) => {
                    const system_version = record.system_version || '未知'
                    const cloud_control_version = record.cloud_control_version || '未知'
                    const wechat_version = record.wechat_version || '未知'
                    return (
                        <div>
                            <p>rom版本：{system_version}</p>
                            <p>牛客服：{cloud_control_version} </p>
                            <p>微信：{wechat_version} </p>
                        </div>
                    )
                }
            },
            {
                title: '电量',
                dataIndex: 'battery',
                key: 'battery',

                render: (text) => {
                    const val = text || '未知'
                    return (
                        <div>
                            <p>{val}</p>
                        </div>
                    )
                }
            },
            {
                title: '可用存储',
                dataIndex: 'available_flash',
                key: 'available_flash',

                render: (text) => {
                    const val = text || '未知'
                    return (
                        <div>
                            <p>{val}</p>
                        </div>
                    )
                }

            },
            {
                title: '网络',
                dataIndex: 'net_status',
                key: 'net_status',

                render: (text) => {
                    const val = text || '未知'
                    return (
                        <div>
                            <p>{val}</p>
                        </div>
                    )
                }

            },
            {
                title: '信号强度',
                dataIndex: 'wifi_signal',
                key: 'wifi_signal',

                render: (text) => {
                    const val = text || '未知'
                    return (
                        <div>
                            <p>{val}</p>
                        </div>
                    )
                }

            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                key: 'im_online_status',
                render: (record) => {
                    return record === true? '在线':'离线'
                }

            },

            {
                title: '最后同步时间',
                dataIndex: 'last_sync_db_time',
                key: 'last_sync_db_time',
                render: (text) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '开机时间',
                dataIndex: 'boot_time',
                key: 'boot_time',
                render: (text) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '上次断线时间',
                dataIndex: 'im_last_offline_time',
                key: 'im_last_offline_time',
                render: (text, record) => {
                    if (text) {
                        return moment(record.im_last_offline_time * 1000).format(DateTimeFormat)
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '恢复上线时间',
                dataIndex: 'im_last_online_time',
                key: 'im_last_online_time',
                render: (text, record) => {
                    if (text ) {
                        return moment(record.im_last_online_time  * 1000).format(DateTimeFormat)
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '激活状态',
                dataIndex: 'is_activate',
                key: 'is_activate',
                render: (text) => {
                    return text === 1? '已激活':'未激活'
                }
            },
        ]

        return (
            <div className={styles.wechat_baiguoyuan}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: "微信报表",
                    }}

                />
                <div className={styles.totalWrap}>
                    {getStats()}
                </div>
                <div className={styles.searchWrap}>
                    <Form className="ant-advanced-search-form">

                        <Row gutter={20}>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                    <DepartmentSelect
                                        departmentId={params.department_id}
                                        onChange={(value)=>{this.handleChange('department_id', value)}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                    <UserSelect
                                        departmentId={params.department_id}
                                        userId={params.user_id}
                                        onChange={(value)=>{this.handleChange('user_id', value)}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                    <Input onChange={(e) => {
                                        this.handleChange('query', e)
                                    }} value={params.query} placeholder="输入昵称、备注或微信号"/>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label="在线状态：" colon={false}>
                                    <Select value={params.im_online_status} onChange={(value) => {
                                        this.handleChange('im_online_status', value)
                                    }}>
                                        <Option value="">全部【状态】</Option>
                                        <Option value={1}>在线</Option>
                                        <Option value={0}>离线</Option>
                                    </Select>
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label="最后同步时间：" colon={false}>
                                    <DatePicker
                                        format="YYYY-MM-DD"
                                        showToday={false}
                                        maxToday={true}
                                        placeholder="最后同步时间在此之前"
                                        onChange={(e) => this.handleTimeChange(e)}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <Checkbox checked={low_battery} onChange={(value)=>this.handleCheckChange('low_battery', value)} className={styles.filterTab}>电量低于10%
                                </Checkbox>
                                <Checkbox checked={valid_version} onChange={(value)=>this.handleCheckChange('valid_version', value)} className={styles.filterTab}>版本异常
                                </Checkbox>
                                <Checkbox checked={valid_boot_time} onChange={(value)=>this.handleCheckChange('valid_boot_time', value)} className={styles.filterTab}>开机时间在5天前
                                </Checkbox>
                                <div className={styles.searchBtn}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>查询</Button>
                                </div>
                                <div className={styles.export}>
                                    <Button >
                                        <a target="_blank" rel="noopener noreferrer" href={this.getExportUrl({...params})}
                                        >导出数据</a>
                                    </Button>
                                </div>

                            </Col>
                        </Row>
                    </Form>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataSource={tableData}
                        rowKey={(record, index) => index}
                        bordered
                        pagination={false}
                    />
                </div>
            </div>

        )
    }
}
