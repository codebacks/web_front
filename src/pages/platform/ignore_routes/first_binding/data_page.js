import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import { connect } from 'dva'
import { Form, Card, DatePicker, Icon, Button, Popover } from 'antd'
import moment from 'moment'
import WeBox from '../../../home/components/WeBox'
import styles from './index.less'
import _ from 'lodash'

import echarts from 'echarts/lib/echarts'
import echartsTheme, { theme } from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'

@Form.create({})

@connect(({ base, platform_first_binding }) => ({
    base, platform_first_binding
}))
export default class Data extends React.PureComponent {
    state = {
        data: null,
        loading: true,
        begin_at: '',
        end_at: '',
        id: '',
        startValue: null,
        endValue: null,
        begin_at_status: '',
        begin_at_help: '',
        end_at_status: '',
        end_at_help: '',
    }

    componentDidMount() {
        let { id } = this.props.location.query
        if (id) {
            this.setState({
                id
            })

            this.getDetailsModal(id)
        }
    }

    getDuringByDate(begin, end) {
        const beginTime = moment(begin)
        const endTime = moment(end).add(1, 'days')

        const days = endTime.diff(beginTime, 'days')

        return this.getDuring(endTime, days).dates.map(item => ({
            date: item.format('YYYY-MM-DD'),
            view_count: 0,
            user_count: 0,
            bind_count: 0
        }))
    }

    getDuring(dateTime, days) {
        var date = dateTime

        var dates = []

        for (var i = days; i > 0; i--) {
            dates.push(moment(date).subtract(i, 'days'))
        }

        return {
            begin: dates[0],
            end: dates[dates.length - 1],
            dates: dates
        }
    }

    getDuringByHours() {
        return Array.from(Array(24), (v, k) => ({
            date: `${k + 1}:00`,
            view_count: 0,
            user_count: 0,
            bind_count: 0
        }))
    }

    getGraphicStatistics = (id) => {

        const { begin_at, end_at } = this.state
        const isSameDay = moment(begin_at).isSame(end_at, 'day')
        this.props.dispatch({
            type: 'platform_first_binding/graphicStatistics',
            payload: {
                id: id,
                begin_at: begin_at,
                end_at: end_at
            }, callback: ({ data }) => {
                let rawData = !isSameDay ? this.getDuringByDate(begin_at, end_at) : this.getDuringByHours()

                for (var item of rawData) {
                    // eslint-disable-next-line no-loop-func
                    var serverData = data.find(c => {
                        if (isSameDay) {
                            return item.date === c.hour + ':00'
                        } else {
                            return item.date === c.date
                        }
                    })

                    if (serverData) {
                        item.view_count = serverData.view_count
                        item.user_count = serverData.user_count
                        item.bind_count = serverData.bind_count
                    }
                }
                this.showChart(rawData)
            }
        })
    }

    getDetailsModal = (id) => {
        this.props.dispatch({
            type: 'platform_first_binding/activitiesDetail',
            payload: {
                activity_id: id,
            },
            callback: () => {
                const { activitiesDetailData } = this.props.platform_first_binding
                let begin_at = moment(activitiesDetailData.begin_at, "YYYY-MM-DD")
                let end_at = moment(activitiesDetailData.end_at, "YYYY-MM-DD")

                const now = moment()
                if (now.isBefore(end_at, 'day')) {
                    end_at = now.clone()
                }

                if (begin_at.isAfter(now, 'day')) {
                    begin_at = now.clone()
                }

                if (begin_at.isAfter(end_at, 'day')) {
                    begin_at = end_at.clone()
                }

                if (end_at.diff(begin_at, 'days') > 6) {
                    begin_at = end_at.clone().subtract(6, 'days')
                }


                this.setState({
                    startValue: begin_at,
                    endValue: end_at,
                    begin_at: begin_at.format('YYYY-MM-DD'),
                    end_at: end_at.format('YYYY-MM-DD'),
                    loading: false
                }, () => {
                    this.getGraphicStatistics(id)
                })
            }
        })
    }

    handleTimeChange = (e) => {
        const time = e.map(item => item.format('YYYY-MM-DD'))
        this.setState({
            begin_at: time[0],
            end_at: time[1]
        }, () => {
            this.getGraphicStatistics(this.state.id)
        })
    }

    showChart = (data) => {
        var myChart = echarts.init(document.getElementById('main'), echartsTheme)
        const viewCounts = data.map(c => c.view_count)
        const userCounts = data.map(c => c.user_count)
        const bindCounts = data.map(c => c.bind_count)

        const total = _.sum(viewCounts)

        const option = {
            grid: {
                left: '2%',
                right: '32px',
                top: '32px',
                bottom: '3%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(c => c.date)
            },
            yAxis: [
                {
                    type: 'value',
                    minInterval: 1,
                    min: total < 1 ? 5 : 0
                }
            ],
            series: [
                {
                    name: '浏览次数',
                    type: 'line',
                    data: viewCounts
                },
                {
                    name: '参与人数',
                    type: 'line',
                    data: userCounts
                },
                {
                    name: '绑定人数',
                    type: 'line',
                    data: bindCounts
                }
            ]
        }
        myChart.setOption(option)
    }

    searchSubmitHandle = () => {
        if (!this.state.startValue) {
            this.setState({
                begin_at_status: 'error',
                begin_at_help: '请选择开始时间'
            })
        }

        if (!this.state.endValue) {
            this.setState({
                end_at_status: 'error',
                end_at_help: '请选择结束时间'
            })
        }

        if (this.state.startValue && this.state.endValue) {
            const diff = moment(this.state.endValue).diff(this.state.startValue, 'days')
            if (diff > 30) {
                this.setState({
                    begin_at_status: 'error',
                    begin_at_help: '折线图最多可以展示30天数据'
                })
            } else {
                this.setState({
                    begin_at: this.state.startValue.format('YYYY-MM-DD'),
                    end_at: this.state.endValue.format('YYYY-MM-DD')
                }, () => {
                    this.getGraphicStatistics(this.state.id)
                })
            }
        }
    }

    // 活动时间
    disabledStartDate = (startValue) => {
        const now = moment()
        if (startValue > now) {
            return true
        }

        const { activitiesDetailData } = this.props.platform_first_binding

        if (startValue < moment(activitiesDetailData.begin_at)) {
            return true
        }
 
        if ((!this.state.startValue)) {

            return startValue < moment(activitiesDetailData.begin_at) || startValue > moment(activitiesDetailData.end_at).subtract(-1, 'days')
        }

        return startValue < moment(activitiesDetailData.begin_at) || startValue > moment(activitiesDetailData.end_at)

    }



    disabledEndDate = (endValue) => {
        const now = moment()
        if (endValue > now) {
            return true
        }

        const { activitiesDetailData } = this.props.platform_first_binding
        if (endValue > moment(activitiesDetailData.end_at).add(1, 'days')) {
            return true
        }

        if (this.state.startValue && this.state.endValue) {
            if (endValue > moment(activitiesDetailData.end_at)) {
                return true
            }
        } else if (!this.state.startValue) {
            return endValue < moment(activitiesDetailData.begin_at) || endValue > moment(activitiesDetailData.end_at).subtract(-1, 'days')

        }

        const startValueClone = this.state.startValue.clone()
        const maxEndValue = startValueClone.add(30, 'days')

        return endValue > maxEndValue || endValue < this.state.startValue.clone()

    }

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        })
    }

    onStartChange = (value) => {
        if (value) {
            this.setState({
                begin_at_status: '',
                begin_at_help: ''
            })
        }
        this.onChange('startValue', value)
    }

    onEndChange = (value) => {
        if (value) {
            this.setState({
                end_at_status: '',
                end_at_help: ''
            })
        }
        this.onChange('endValue', value)
    }

    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({
                endOpen: true,
                endValue: null
            })
        }
    }

    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open })
    }

    render() {
        const { activitiesDetailData } = this.props.platform_first_binding
        const { startValue, endValue, endOpen } = this.state

        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 18,
            },
        }
        return (
            <DocumentTitle title="活动数据">
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '活动列表',
                            path: '/platform/first_binding'
                        }, {
                            name: '活动数据'
                        }]}
                    />
                    <WeBox {...this.props} title="活动概况">
                        <ul className={styles.data}>
                            <li>
                                <div>
                                    <p>
                                        <Icon type="book" />
                                        <span>浏览次数</span>
                                    </p>
                                    <p>{activitiesDetailData.view_count}</p>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <p>
                                        <Icon type="usergroup-add" />
                                        <span>参与人数</span>
                                    </p>
                                    <p>{activitiesDetailData.user_count}</p>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <p>
                                        <Icon type="user-add" />
                                        <span>绑定人数</span>
                                    </p>
                                    <p>{activitiesDetailData.bind_count}</p>
                                </div>
                            </li>
                        </ul>
                    </WeBox>
                    <WeBox {...this.props} title="数据统计">
                        <Card>
                            <div className={styles.statisticsTitle}>
                                <Form.Item label="选择时间" {...formItemLayout} style={{ width: '70%' }}>
                                    <div style={{ display: 'flex' }}>
                                        <Form.Item
                                            validateStatus={this.state.begin_at_status}
                                            help={this.state.begin_at_help}
                                        >
                                            <DatePicker
                                                disabledDate={this.disabledStartDate}
                                                format="YYYY-MM-DD"
                                                value={startValue}
                                                placeholder="开始时间"
                                                onChange={this.onStartChange}
                                                onOpenChange={this.handleStartOpenChange}
                                            />
                                        </Form.Item>
                                        <span className="hz-margin-small-left-right">~</span>
                                        <Form.Item
                                            validateStatus={this.state.end_at_status}
                                            help={this.state.end_at_help}
                                        >
                                            <DatePicker
                                                disabledDate={this.disabledEndDate}
                                                format="YYYY-MM-DD"
                                                value={endValue}
                                                placeholder="结束时间"
                                                onChange={this.onEndChange}
                                                open={endOpen}
                                                onOpenChange={this.handleEndOpenChange}
                                            />
                                        </Form.Item>
                                        <div>
                                            <Button className="hz-btn-width-default hz-margin-base-left" style={{ marginTop: 2 }} type="primary" htmlType="submit" onClick={this.searchSubmitHandle}>
                                                <Icon type="search" />
                                                搜索
                                            </Button>
                                            <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>折线图最多可以展示30天数据</div>}>
                                                <Icon className={styles.questionCircle} type="question-circle" />
                                            </Popover>
                                        </div>
                                    </div>
                                </Form.Item>
                                <div>
                                    <span className={`${styles.blueStatus} hz-margin-base-right`}>浏览次数</span>
                                    <span className={`${styles.greenStatus} hz-margin-base-right`}>参与人数</span>
                                    <span className={styles.yellowStatus}>绑定人数</span>
                                </div>
                            </div>
                            <div id="main" style={{ width: '100%', height: '386px' }}></div>
                        </Card>
                    </WeBox>
                </Page>
            </DocumentTitle >
        )
    }
}