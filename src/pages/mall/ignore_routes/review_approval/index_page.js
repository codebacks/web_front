import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { connect } from 'dva'
import { Form, Row, Col, DatePicker, Button, Tabs, Pagination } from 'antd'
import moment from 'moment'
import Approved from './Approved'
const { RangePicker } = DatePicker
const DEFAULT_CONDITION = {
    beginAt: '',
    endAt: '',
    status: 1
}
const PanesList = [
    {
        tab: '未审批',
        key: 1
    },
    {
        tab: '已通过',
        key: 2
    },
    {
        tab: '未通过',
        key: 3
    }
]
const TabPane = Tabs.TabPane

@documentTitleDecorator({
    title: '评论审批'
})
@connect(({base, review_approval, trends_management}) => ({
    base,
    review_approval,
    trends_management,
}))
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { beginAt, endAt } = condition
        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [],
        })
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'review_approval/getApprovalList',
            payload: {
                page: pager.current,
                per_page: pager.pageSize,
                status: condition.status,
                begin_at: condition.beginAt,
                end_at: condition.endAt,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }
    searchData = () => {
        const { form } = this.props
        form.validateFields((error,value) => {
            let beginAt = '', endAt = '' 
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }
            const condition = {
                ...this.state.condition,
                ...{
                    endAt: endAt,
                    beginAt: beginAt,
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    onSearch = (e) => { 
        e.preventDefault()
        this.searchData()
    }
    onTabClick = (value) => {
        let {condition, pager} = this.state
        condition.status = value
        pager.current = DEFAULT_PAGER.current
        this.getPageData(condition, pager)
    }
    render () {
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
                style: {
                    marginRight: '40px'
                } 
            },
        }
        const { currentKey, tabCount, approvalList, currentPage, perPage, totalSize } = this.props.review_approval
        const { loading } = this.state
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E8%AF%84%E8%AE%BA%E5%AE%A1%E6%89%B9.md"
                />
                <Page.ContentAdvSearch multiple={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <Form.Item label="发布时间" {...formItemLayout}>
                                    {getFieldDecorator("rangePicker")(
                                        <RangePicker onChange={this.datePickerChange}></RangePicker>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="" {...formItemLayout}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>搜索</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Row>
                    <Tabs activeKey={currentKey.toString()} onTabClick={this.onTabClick}>
                        {
                            PanesList.map(item=>{
                                return (
                                    <TabPane tab={`${item.tab}${parseInt(currentKey, 10) === item.key ? `(${tabCount})` : ''}`} key={item.key}>
                                        <Approved key={item.key} loading={loading}/>
                                    </TabPane>
                                )
                            })
                        }
                    </Tabs>
                    {
                        approvalList.length>0&&(
                            <Pagination
                                className="ant-table-pagination"
                                current={currentPage}
                                total={totalSize}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}
                                pageSize={perPage} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            /> 
                        )
                    }
                </Row>
            </Page>
        )
    }
}
