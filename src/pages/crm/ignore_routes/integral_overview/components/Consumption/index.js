/**
 **@time: 2018/12/18
 **@Description:积分获取组件 第一期暂不做展示
 **@author: zhousong
 */

import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Row, Col, DatePicker, Select, Table } from 'antd'
import { connect } from 'dva'

const { RangePicker } = DatePicker
const Option = Select.Option

const DEFAULT_CONDITION = {
}

@documentTitleDecorator()
@Form.create()
@connect(({ base }) => ({
    base
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)

    }

    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })

    }

    /**公共方法 */

    /**页面事件 */

    render() {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [
            {
                title: '消耗时间',
                dataIndex: 'time'
            },
            {
                title: '奖品名称',
                dataIndex: 'name'
            },
            {
                title: '奖品类型',
                dataIndex: 'type'
            },
            {
                title: '参与用户数',
                dataIndex: 'users_count'
            },
            {
                title: '消耗积分',
                dataIndex: 'cost_integral'
            },
        ]
        const { getFieldDecorator } = this.props.form
        return (
            <>
                {/*搜索条件框*/}
                <Page.ContentAdvSearch>
                    <Form>
                        <Row>
                            <Col span={8}>
                                <Form.Item label='获取时间' {...formItemLayout}>
                                    {getFieldDecorator('rangePicker', {})(
                                        <RangePicker />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='获取类型' {...formItemLayout}>
                                    {getFieldDecorator('select', {})(
                                        <Select>
                                            <Option value=''>全部类型</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Table
                    columns={columns}
                    pagination={false}
                    rowKey='id'
                />
            </>
        )
    }
}
