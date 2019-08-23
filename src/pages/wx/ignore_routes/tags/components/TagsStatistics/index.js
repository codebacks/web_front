import React from 'react'
import {
    Table,
    Form,
    Input,
    Button,
    Row,
    Col,
    // Select,
    Alert,
    Icon,
} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import config from 'wx/common/config'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import Toggle from 'components/Toggle'
import StatisticsTable from "./components/StatisticsTable"
import {hot} from "react-hot-loader"
import _ from "lodash"
import qs from 'qs'
import API from 'wx/common/api/tags'

const FormItem = Form.Item
const Search = Input.Search

const {DateTimeFormat, pageSizeOptions} = config

@hot(module)
@connect(({wx_tagsStatistics, loading}) => ({
    wx_tagsStatistics,
    listLoading: loading.effects['wx_tagsStatistics/list'],
}))
@documentTitleDecorator({
    overrideTitle: '标签统计',
})
export default class TagsStatistics extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.handleSearch()
    }

    handleChange = (key, value) => {
        this.props.dispatch({
            type: 'wx_tagsStatistics/setStateByPath',
            payload: {
                path: `params[${key}]`,
                value,
            },
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_tagsStatistics/list',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_tagsStatistics/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'wx_tagsStatistics/resetParams',
        })
        this.goPage(1)
    }

    getExportUrl = (params) => {
        let query = _.cloneDeep(params)
        delete query.limit
        delete query.offset
        return `${API.statExport.url}?${qs.stringify(query)}&access_token=${_.get(this, 'props.base.accessToken')}&t=${new Date().getTime()}`
    }

    render() {
        const columns = [
            {
                title: '标签名称',
                dataIndex: 'name',
            },
            {
                title: '牛客服使用次数',
                dataIndex: 'times',
            },
            {
                title: '最近使用时间',
                dataIndex: 'use_time',
                render: (text) => {
                    if(text !== 0){
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                },
            },
            {
                title: '分布微信',
                dataIndex: 'wechat_count',
            },
            {
                title: '客户总数',
                dataIndex: 'customer_count',
            },
            {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                render: (text, record, index) => {
                    return (
                        <Toggle>
                            {(
                                {
                                    setTrue,
                                    status,
                                    setFalse,
                                },
                            ) => (
                                <>
                                    <span
                                        className={styles.operable}
                                        onClick={setTrue}
                                    >
                                        客户查询
                                    </span>
                                    <StatisticsTable
                                        record={record}
                                        modalOption={{
                                            visible: status,
                                            onCancel: setFalse,
                                        }}
                                    />
                                </>
                            )}
                        </Toggle>
                    )
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const {listLoading} = this.props
        const {
            params,
            list,
            total,
            current,
        } = this.props.wx_tagsStatistics

        return (
            <div>
                <Alert className={styles.alert}
                       type="info"
                       showIcon
                       message={'每天凌晨0点至2点统计标签数据入库'}/>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem
                                {...formItemLayout}
                                label="搜索标签："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入标签名称搜索"
                                    value={params.query}
                                    onChange={(e) => {
                                        this.handleChange('query', e.target.value)
                                    }}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        {/*<Col span={7}>*/}
                        {/*<FormItem*/}
                        {/*{...formItemLayout}*/}
                        {/*label="选择分组："*/}
                        {/*colon={false}*/}
                        {/*>*/}
                        {/*<Select*/}
                        {/*value={params.repeat_times}*/}
                        {/*onChange={(e)=>{this.handleChange('repeat_times', e)}}*/}
                        {/*>*/}
                        {/*<Option value="">请选择标签分组</Option>*/}
                        {/*<Option value="2">2个以上</Option>*/}
                        {/*<Option value="3">3个以上</Option>*/}
                        {/*<Option value="5">5个以上</Option>*/}
                        {/*<Option value="8">8个以上</Option>*/}
                        {/*<Option value="10">10个以上</Option>*/}
                        {/*</Select>*/}
                        {/*</FormItem>*/}
                        {/*</Col>*/}
                        <Button
                            type="primary"
                            icon="search"
                            className={styles.searchBtn}
                            onClick={this.handleSearch}
                        >
                            搜索
                        </Button>
                        <Button
                            onClick={this.resetSearch}
                        >
                            重置
                        </Button>
                    </Row>
                </Form>
                <div className={styles.tableTip}>
                    <a
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        href={this.getExportUrl(params)}
                    >
                        <Button
                            className={styles.downLoadButton}
                        >
                            <Icon type="download"/>
                            导出标签统计
                        </Button>
                    </a>
                </div>
                <Table
                    columns={columns}
                    dataSource={list}
                    loading={listLoading}
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
        )
    }
}
