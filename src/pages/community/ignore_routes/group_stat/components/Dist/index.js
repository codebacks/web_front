/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/12/03
 */
import React, {Component} from 'react'
import {Button, Form, Row, Col, Spin} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import Pie from 'community/components/Charts/Pie'
import styles from './index.less'

moment.locale('zh-cn')

const FormItem = Form.Item

@connect(({community_group_dist, loading}) => ({
    community_group_dist,
    distLoading: loading.effects['community_group_dist/query']
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            seriesData: []
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.loadData()
    }

    componentWillUnmount() {
        this._isMounted = false
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_group_dist/resetParams'
        })
    }

    handleChange(key, e) {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_group_dist.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_group_dist/setParams',
            payload: {params: params},
        })
    }

    handleSearch = () => {
        this.loadData()
    }

    loadData = () => {
        this.props.dispatch({
            type: 'community_group_dist/query',
            payload: {},
            callback: (data) => {
                if(this._isMounted) {
                    this.parseDist(data)
                }
            }
        })
    }

    parseDist = (data) => {
        let seriesData = []
        if (data.length) {
            seriesData = [
                {
                    name: '群成员好友',
                    value: data[0].friend_num || 0
                },
                {
                    name: '群成员非好友',
                    value: data[0].not_friend_num || 0
                }
            ]
        } else {
            seriesData = [
                {
                    name: '群成员好友',
                    value: 0
                },
                {
                    name: '群成员非好友',
                    value: 0
                }]
        }
        this.setState({
            seriesData: seriesData,
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const {params} = this.props.community_group_dist
        const {distLoading} = this.props
        const {seriesData} = this.state

        const distOption = {
            title: {
                text: '群好友比例',
                subtext: '统计群成员中已加好友的比例'
            },
            legend: {
                show: false,
            },
            label: {
                normal: {
                    formatter: '{b}\n{a}：{c}\n占比：{d}%',
                }
            },
            seriesLabelLine: true,
            seriesName: '人数',
            seriesData: seriesData,
            seriesItem: {
                center: ['50%', '55%'],
            },
            tooltip: {
                show: false
            },
            colorPalette: ['#C23531', '#2F4554']
        }

        const pieHeight = 500

        return (
            <div className={styles.groupDist}>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value)=>{this.handleChange('department_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value)=>{this.handleChange('user_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value)=>{this.handleChange('uin', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Button type="primary"
                            icon="search"
                            className={styles.btn}
                            onClick={this.handleSearch}>查询</Button>
                    </Row>
                </div>
                <Spin spinning={!!distLoading}>
                    <div className={styles.dist}>
                        <Pie option={distOption} height={pieHeight} />
                    </div>
                </Spin>
            </div>
        )
    }
}
