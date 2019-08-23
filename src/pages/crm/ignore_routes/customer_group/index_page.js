import React from 'react'
import {
    Table,
    Form,
    Input,
    Button,
    Row,
    Col,
    Tag,
    Popconfirm,
    message,
} from 'antd'
import {connect} from 'dva'
import config from 'crm/common/config'
import documentTitleDecorator from 'hoc/documentTitle'
import RangeDatePicker from 'components/RangeDatePicker'
import ContentHeader from 'business/ContentHeader'
import styles from './index.less'
import {hot} from "react-hot-loader"
import moment from "moment"
import {Link} from "react-router-dom"
import EllipsisPopover from "components/EllipsisPopover"
import router from "umi/router"
import {filterContents} from './components/CustomersGroupsFilter/constant'
import _ from 'lodash'

const FormItem = Form.Item
const Search = Input.Search

const {pageSizeOptions} = config

@hot(module)
@connect(({crm_customerGroup, loading}) => ({
    crm_customerGroup,
    tableLoading: loading.effects['crm_customerGroup/list'],
}))
@documentTitleDecorator()
export default class extends React.PureComponent {
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
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.crm_customerGroup.params}
        params[key] = val

        this.props.dispatch({
            type: 'crm_customerGroup/setParams',
            payload: {params: params},
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_customerGroup/list',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_customerGroup.params}
        params.limit = size
        this.props.dispatch({
            type: 'crm_customerGroup/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'crm_customerGroup/resetParams',
        })
    }

    deleteCustomerGroups = (id) => {
        this.props.dispatch({
            type: 'crm_customerGroup/deleteCustomerGroups',
            payload: {
                id,
            },
            callback: () => {
                message.success('删除成功')
                this.goPage()
            },
        })
    }

    resetSearch = () => {
        this.resetParams()
        this.goPage(1)
    }

    goNewPage = () => {
        router.push('/crm/customer_group/new_group')
    }

    getOperation = (params) => {
        const operations = ['must', 'should']
        let contentObj = {}
        let operation = ''
        operations.forEach((key) => {
            if(params[key]) {
                contentObj = params[key]
                operation = key
            }
        })

        return {
            contentObj,
            operation,
        }
    }

    renderParams = (params) => {
        if(params) {
            const {
                contentObj = {},
            } = this.getOperation(params)

            return Object.keys(contentObj).map((key, i) => {
                const name = _.get(filterContents, [key, 'name'])
                if(name) {
                    return (
                        <Tag
                            key={i}
                            className={styles.tag}
                        >
                            {name}
                        </Tag>
                    )
                }
            })
        }
    }

    render() {
        const columns = [
            {
                title: '分组名称',
                dataIndex: 'name',
                render: (text, record) => {
                    return text
                },
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (text, record) => {
                    if(text) {
                        return moment((text || 0) * 1000).format('YYYY-MM-DD HH:mm:ss')
                    }
                },
            },
            {
                title: '创建人',
                dataIndex: 'created_by.nickname',
            },
            {
                title: '描述',
                dataIndex: 'description',
                render: (text, record) => {
                    return (
                        <EllipsisPopover
                            content={text}
                        />
                    )
                },
            },
            {
                title: '筛选条件',
                dataIndex: 'params',
                width: 600,
                render: (text, record) => {
                    return this.renderParams(text)
                },
            },
            {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <Link
                                to={`/crm/customer_group/edit/${record.id}`}
                                className={styles.operatorLink}
                            >
                                编辑
                            </Link>
                            <Link
                                to={`/crm/customer_group/details/${record.id}?title=${record.name}`}
                                className={styles.operatorLink}
                            >
                                分组详情
                            </Link>
                            <Popconfirm
                                placement="top"
                                title={"您是否确定删？"}
                                onConfirm={e => this.deleteCustomerGroups(record.id)}
                                okText="删除"
                                cancelText="取消"
                            >
                                <span
                                    className={styles.operatorLink}
                                >
                                删除
                            </span>
                            </Popconfirm>

                            {/*<Link*/}
                            {/*to={`/crm/mass_record/details/${record.id}`}*/}
                            {/*className={styles.operatorLink}*/}
                            {/*>*/}
                            {/*导出数据*/}
                            {/*</Link>*/}
                        </div>
                    )
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 18},
        }

        const {tableLoading, crm_customerGroup} = this.props
        const {
            params,
            list,
            total,
            current,
        } = crm_customerGroup

        return (
            <div className={styles.customerGroup}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    // help={{
                    //     url: 'http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E5%AE%A2%E6%88%B7.md',
                    // }}
                />
                <div className={styles.mass_record}>
                    <Form className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="搜索"
                                >
                                    <Search
                                        placeholder="输入分组名称、创建人"
                                        value={params.query}
                                        className={styles.search}
                                        onChange={(e) => {
                                            this.handleChange('query', e)
                                        }}
                                        onSearch={this.handleSearch}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="创建时间"
                                >
                                    <RangeDatePicker
                                        maxToday={true}
                                        value={params.create_time}
                                        onChange={(value) => {
                                            this.handleChange('create_time', value.slice())
                                        }}
                                    />
                                </FormItem>
                            </Col>
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
                    <div className={styles.option}>
                        <Button
                            type="primary"
                            onClick={this.goNewPage}
                            icon="plus"
                        >
                            创建分组
                        </Button>
                    </div>
                    <Table
                        className={styles.table}
                        columns={columns}
                        dataSource={list}
                        loading={tableLoading}
                        rowKey={(record, index) => index}
                        pagination={
                            list.length ? {
                                total: total,
                                current: current,
                                showQuickJumper: true,
                                pageSizeOptions: pageSizeOptions,
                                showTotal: total => `共${total}条`,
                                pageSize: params.limit,
                                showSizeChanger: true,
                                onShowSizeChange: this.handleChangeSize,
                                onChange: this.goPage,
                            } : false
                        }
                    />
                </div>
            </div>
        )
    }
}
