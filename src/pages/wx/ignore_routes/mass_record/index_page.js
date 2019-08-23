import React from 'react'
import {
    Table,
    Form,
    Input,
    Button,
    Row,
    Col,
    Icon,
    Popconfirm,
} from 'antd'
import {connect} from 'dva'
import config from 'crm/common/config'
import documentTitleDecorator from 'hoc/documentTitle'
import RangeDatePicker from 'components/RangeDatePicker'
import styles from './index.less'
import {hot} from "react-hot-loader"
import ContentHeader from 'business/ContentHeader'
import moment from "moment"
import UserSelect from "components/business/UserSelect"
import {Link} from "react-router-dom"
import MsgContentModal from "business/FullTypeMessage/components/MsgContentModal"

const FormItem = Form.Item
const Search = Input.Search

const {pageSizeOptions} = config

@hot(module)
@connect(({wx_massRecord, loading}) => ({
    wx_massRecord,
    tableLoading: loading.effects['wx_massRecord/list'],
}))
@documentTitleDecorator()
export default class extends React.Component {
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
        let params = {...this.props.wx_massRecord.params}
        params[key] = val

        this.props.dispatch({
            type: 'wx_massRecord/setParams',
            payload: {params: params},
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_massRecord/list',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_massRecord.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_massRecord/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_massRecord/resetParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        this.goPage(1)
    }

    getResultMap = (result) => {
        const resultMap = {
            '2': 0,
            '1': 0,
            '0': 0,
            '-1': 0,
            '-2': 0,
        }
        result.forEach((item) => {
            resultMap[item.status] = item.num
        })
        return resultMap
    }

    cancelled = (id) => {
        this.props.dispatch({
            type: 'wx_massRecord/cancelled',
            payload: {
                id,
            },
            callback: () => {
                this.goPage()
            },
        })
    }

    render() {
        const columns = [
            {
                title: '群发名称',
                dataIndex: 'title',
                render: (text, record) => {
                    return text
                },
            },
            {
                title: '群发客户数',
                dataIndex: 'num',
                render: (text, record) => {
                    return text
                },
            },
            {
                title: '消息数',
                dataIndex: 'messages',
                render: (text, record) => {
                    return (
                        <MsgContentModal
                            contents={text}
                            transformItem={(data) => data}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={setTrue}
                                    >
                                        {text.length || 0}
                                    </span>
                                )
                            }}
                        />
                    )
                },
            },
            {
                title: '已发',
                dataIndex: 'result',
                key: 'sent',
                render: (text, record) => {
                    return this.getResultMap(text)['1']
                },
            },
            {
                title: '剩余未发',
                dataIndex: 'result',
                key: 'noSent',
                render: (text, record) => {
                    return this.getResultMap(text)['0']
                },
            },
            {
                title: '计划执行时间',
                dataIndex: 'execute_time',
                render: (text) => {
                    if(text) {
                        return moment((text || 0) * 1000).format('YYYY-MM-DD HH:mm:ss')
                    }
                },
            },
            {
                title: '可执行时间段',
                dataIndex: 'time_from',
                render: (text, record) => {
                    if(text && record?.time_to) {
                        return `${text}-${record?.time_to}`
                    }else{
                        return '不限制'
                    }
                },
            },
            {
                title: '创建人',
                dataIndex: 'user_dep',
                render: (text, record) => {
                    return _.get(record, 'created_by.nickname', '')
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
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                render: (text, record, index) => {
                    return (
                        <>
                            <Link
                                to={`/wx/mass_record/details/${record.id}`}
                            >
                                群发明细
                            </Link>
                            {
                                this.getResultMap(record.result)['0'] > 0 && (
                                    <Popconfirm
                                        placement="topLeft"
                                        title={'你确定要取消执行此消息？'}
                                        icon={
                                            <Icon type="question-circle-o" style={{color: 'red'}}/>
                                        }
                                        onConfirm={() => {
                                            this.cancelled(record.id)
                                        }}
                                    >
                                        <span className={styles.cancelled}>取消执行</span>
                                    </Popconfirm>
                                )
                            }
                        </>
                    )
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {tableLoading, wx_massRecord} = this.props
        const {
            params,
            list,
            total,
            current,
        } = wx_massRecord

        return (
            <div className={styles.content}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%A5%BD%E5%8F%8B%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.mass_record}>
                    <Form className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="搜索："
                                    colon={false}
                                >
                                    <Search
                                        placeholder="输入群发名称"
                                        value={params.title}
                                        className={styles.search}
                                        onChange={(e) => {
                                            this.handleChange('title', e)
                                        }}
                                        onSearch={this.handleSearch}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="创建人："
                                    colon={false}
                                >
                                    <UserSelect
                                        cls={styles.search}
                                        userId={params.user_id}
                                        onChange={(value) => {
                                            this.handleChange('user_id', value)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="创建时间："
                                    colon={false}
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
                        </Row>
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="执行时间："
                                    colon={false}
                                >
                                    <RangeDatePicker
                                        maxToday={true}
                                        value={params.execute_time}
                                        onChange={(value) => {
                                            this.handleChange('execute_time', value.slice())
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
                    <Table
                        className={styles.table}
                        columns={columns}
                        dataSource={list}
                        loading={tableLoading}
                        rowKey={(record, index) => index}
                        pagination={
                            list.length ? {
                                size: 'middle',
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
