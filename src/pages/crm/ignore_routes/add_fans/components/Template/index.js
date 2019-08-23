
/** @description 加粉模板列表
 * @author liyan
 * @date 2018/12/17
 */
import React, {Component} from 'react'
import {Form, Select, Input, Button, Row, Col, Table, Popconfirm, message, Badge, Divider} from 'antd'
import {connect} from 'dva'
import router from 'umi/router'
import config from 'crm/common/config'
import styles from './index.scss'

const FormItem = Form.Item
const Search = Input.Search
const Option = Select.Option

const {pageSizeOptions} = config

@connect(({ base, loading, crm_add_fans_template}) => ({
    base,
    crm_add_fans_template,
    listLoading: loading.effects['crm_add_fans_template/list']
}))
export default class Template extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.handleSearch()
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target) {
            val = e.target.value.trim()
        }else {
            val = e
        }
        let params = {...this.props.crm_add_fans_template.params}
        params[key] = val
        this.props.dispatch({
            type: 'crm_add_fans_template/setParams',
            payload: {
                params: params
            }
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_add_fans_template/list',
            payload: {page: page}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_add_fans_template.params}
        params.limit = size
        this.props.dispatch({
            type: 'crm_add_fans_template/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSetEnabled = (record) => {
        const {id, enabled} = record
        const payload = {
            id: id,
            body: {
                enabled: !enabled
            }
        }
        this.props.dispatch({
            type: 'crm_add_fans_template/update',
            payload: payload,
            callback: () => {
                const enabledText = this.getEnabledText(!enabled)
                message.success(`${enabledText}成功`)
                this.reload()
            }
        })
    }

    reload = () => {
        const {current} = this.props.crm_add_fans_template
        this.goPage(current)
    }

    handleGoToTemplate = (id) => {
        const query = id ? {id: id} : {}
        router.push({
            pathname: '/crm/add_fans/template',
            query: query,
        })
    }

    getEnabledText = (status) => {
        return status ? '启用' : '禁用'
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'crm_add_fans_template/resetParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }

    render() {

        const {params, list, total, current} = this.props.crm_add_fans_template
        const {listLoading} = this.props

        const columns = [
            {
                title: '模板标题',
                dataIndex: 'title',
            },
            {
                title: '状态',
                dataIndex: 'enabled',
                render: (enabled) => {
                    if(enabled){
                        return <Badge status="success" text="启用"/>
                    }
                    return <Badge status="error" text="禁用"/>
                }
            },
            {
                title: '累计加粉成功数',
                dataIndex: 'success_count',
            },
            {
                title: '在用微信号数',
                dataIndex: 'wechat_count',
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    const enabled = record.enabled
                    const enabledText = this.getEnabledText(!enabled)
                    return <div className={styles.stress}>
                        <span onClick={()=>{this.handleGoToTemplate(record.id)}}>编辑</span>
                        <Divider type="vertical"/>
                        <Popconfirm
                            placement="top"
                            title={`确认要${enabledText}该模板？`}
                            onConfirm={()=>{this.handleSetEnabled(record)}}
                            okText="确定"
                            cancelText="取消"
                        >
                            <span>{enabledText}</span>
                        </Popconfirm>
                    </div>
                }
            }
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <div className={styles.templateWrapper}>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="搜索模板："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入模板标题"
                                    value={params.title}
                                    onChange={(e)=>{this.handleChange('title', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="状态："
                                colon={false}
                            >
                                <Select
                                    placeholder="请选择"
                                    value={params.enabled}
                                    onChange={(e)=>{this.handleChange('enabled', e)}}
                                >
                                    <Option value="">全部</Option>
                                    <Option value={1}>启用</Option>
                                    <Option value={0}>禁用</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <div className={styles.btns}>
                            <Button type="primary"
                                icon="search"
                                className={styles.searchBtn}
                                onClick={this.handleSearch}>搜索</Button>
                            <Button onClick={this.resetSearch}>重置</Button>
                        </div>
                    </Row>
                </Form>
                <div className={styles.create}>
                    <Button type="primary" onClick={()=>{this.handleGoToTemplate()}}>创建加粉模板</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={listLoading}
                    rowKey={(record) => record.id}
                    pagination={
                        list.length ? {
                            size: 'middle',
                            total: total,
                            current: current,
                            showQuickJumper: true,
                            pageSizeOptions: pageSizeOptions,
                            showTotal: total => `共${total}条记录`,
                            pageSize: params.limit,
                            showSizeChanger: true,
                            onShowSizeChange: this.handleChangeSize,
                            onChange: this.goPage,
                        } : false
                    }
                />
            </div>
        )
    }
}
