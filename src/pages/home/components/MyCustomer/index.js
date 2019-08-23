import React from 'react'
import {Card, Row, Col, Radio, Popover, Icon } from 'antd'
import WeBox from '../WeBox'
import NumberTrend from '../NumberTrend'
import TopSell from './TopSell'
import _ from 'lodash'
import moment from 'moment'
import classnames from 'classnames'
import {connect} from 'dva'

import styles from './index.less'
import { getPerformances, getTopSells, getSetting } from "../../services/wechat-customer"
import { amount, jine } from "../../../../utils/display"
import Setting from './Setting'

const DURINGS = [{
    name: 'yesterday',
    displayText: '昨天',
    text: '天',
    hasPrev: true,
    isTip: false,
    getDring: () => {
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
        return [
            yesterday,
            yesterday
        ]
    }
},{
    name: 'week',
    displayText: '上周',
    text: '周',
    hasPrev: true,
    isTip: true,
    getTip: () => {
        const now = moment()
        return `${now.clone().isoWeekday(-6).format('YYYY-MM-DD')} ~ ${now.clone().isoWeekday(0).format('YYYY-MM-DD')}`
    },
    getDring: () => {
        const now = moment()
        return [
            now.clone().isoWeekday(-6).format('YYYY-MM-DD'),
            now.clone().isoWeekday(0).format('YYYY-MM-DD')
        ]
    }
},{
    name: 'month',
    displayText: '上月',
    text: '月',
    hasPrev: true,
    isTip: true,
    getTip: () => {
        return moment().subtract(1,'month').format('YYYY年MM月')
    },
    getDring: () => {
        const month = moment().subtract(1,'month')
        const start = month.format('YYYY-MM-01')
        const end = moment(start).add(1, 'month').subtract(1, 'days').format('YYYY-MM-DD')
        return [
            start,
            end
        ]
    }
},{
    name: 'total',
    displayText: '总计',
    text: '',
    hasPrev: false,
    isTip: false,
    getDring: () => {
        const WEB_START_DATE = '2018-08-31'
        return [
            WEB_START_DATE,
            moment().subtract(1, 'days').format('YYYY-MM-DD')
        ]
    }
}]

@connect(({base, }) => ({
    base
}))
export default class Index extends React.PureComponent{
    state = {
        loading: true,
        hasPrev: true,
        duringText: '天',
        active: 'yesterday',
        currentData: {
            isStaticticsing: false,
            successTradingCustomers: {},
            successTradingOrderNumber: {},
            turnover: {},
            paySuccessTradingCustomers: {},
            paySuccessTradingOrderNumber: {},
            payTurnover: {}
        },
        topSells: {
            isStaticticsing: false,
        },
        topSellsStaticticsData: {
            statistics: null,
            settings: {
                overview_mode: 1
            }
        },
        topSellsStaticticsLoading: true,
        setting: {
            visiable: false,
            mode: 1
        }
    }

    isTongjieStaticticsing = () => {
        return true
    }

    isTopSellNoData = () => {
        return !this.isTopSellStaticticsing() && this.state.topSellsStaticticsData.statistics.length === 0
    }

    isTopSellStaticticsing = () => {
        return this.state.topSellsStaticticsData.statistics === null
    }

    isTopSellDataModeByPay = () => {
        return this.state.topSellsStaticticsData.settings.overview_mode === 1
    }

    data = {}
    topSellsData = {}

    componentDidMount(){
        this.getSettingData().then(() => {
            this.getTypeStaticticsData(this.state.active)
            this.getTopSellsStaticticsData(this.state.active)
        })
    }

    getSettingData = () => {
        return getSetting().then(({data}) => {
            this.setState((prevState) => {
                return {
                    setting: {
                        ...prevState.setting,
                        mode: data.overview_mode
                    }
                }
            })
        })
    }

    tabChangeHandle = (e) => {
        var type = e.target.value

        this.setState({
            active: type
        })

        this.getTypeStaticticsData(type)
        this.getTopSellsStaticticsData(type)
    }

    getTypeStaticticsData = (type) => {
        var during = _.find(DURINGS, c => c.name === type)
        const dringRange = during.getDring()
        var typeData = this.data[type]

        this.setState({
            hasPrev: during.hasPrev,
            duringText: during.text
        })
        if(typeData){
            this.setState({
                currentData: typeData
            })
        } else {
            this.setState({
                loading: true
            })

            getPerformances({ start_at: dringRange[0], end_at: dringRange[1] }).then((data) => {
                // this.data[type] = data

                this.setState({
                    currentData: data,
                    loading: false
                })
            })
        }
    }

    getTopSellsStaticticsData = (type) => {
        const mode = this.state.setting.mode
        const during = _.find(DURINGS, c => c.name === type)
        const dringRange = during.getDring()
        const key = `${mode}-${type}`
        const typeData = this.topSellsData[key]

        if(typeData) {
            this.setState({
                topSellsStaticticsData: typeData
            })
        } else {
            this.setState({
                topSellsStaticticsLoading: true
            })
            getTopSells({ start_at: dringRange[0], end_at: dringRange[1] }).then(({data}) => {
                // this.topSellsData[key] = data
                this.setState({
                    topSellsStaticticsData: data,
                    topSellsStaticticsLoading: false
                })
            })
        }
    }

    totalFormatterHandler = (total) => {
        return amount(total, amount.format.default, amount.unit.Fen)
    }

    toggleSettingVisiableHandler = () => {
        this.setState((prevState) => {
            return {
                setting: {
                    ...prevState.setting,
                    visiable: !this.state.setting.visiable
                }
            }
        })
    }

    settingComplateHandler = (mode) => {
        this.setState((prevState) => {
            return {
                setting: {
                    ...prevState.setting,
                    visiable: false,
                    mode: mode || prevState.setting.mode
                }
            }
        },() => {
            if(mode) {
                this.getTypeStaticticsData(this.state.active)
                this.getTopSellsStaticticsData(this.state.active)
            }
        })
        
    }
    
    render() {

        const {
            className
        } = this.props
        const { currentData } = this.state

        const {
            // cumulativeCustomerCustomers,
            successTradingCustomers,
            successTradingOrderNumber,
            turnover,
            paySuccessTradingCustomers,
            paySuccessTradingOrderNumber,
            payTurnover,
            isPayMode: performanceIsPayMode,
            isStaticticsing: performanceIsStaticticsing
        } = currentData
        
        const extra = <Radio.Group defaultValue={this.state.active} onChange={this.tabChangeHandle}>
            {
                DURINGS.map(dring => 
                    dring.isTip?
                        <Popover key={dring.name} content={dring.getTip()} placement="bottom">
                            <Radio.Button key={dring.name} value={dring.name}>{dring.displayText}</Radio.Button>
                        </Popover>
                        :
                        <Radio.Button key={dring.name} value={dring.name}>{dring.displayText}</Radio.Button>
                )
            }
        </Radio.Group>

        const explain = <div className={styles.tips}>
            {/* 牛客服中所有好友，均自动转化为客户 */}
            销售统计数据来源于数据中心-绩效报表-销售统计，规则如下： <br />
            <span>付款客户</span> 下单且付款(含货到付款)的客户数 <br />
            <span>付款订单</span> 客户下单且付款(含货到付款)的订单笔数 <br />
            <span>付款金额</span> 客户下单且付款(含货到付款)的订单总金额 <br />
            <span>成功交易客户</span> 订单完成的客户数 <br />
            <span>成功交易订单</span> 客户订单完成的订单笔数 <br />
            <span>成功交易金额</span> 客户订单完成的订单总金额 <br />
            <br />
            不同级别的系统用户，可查看如下销售统计数据：<br /> 
            <span>普通员工</span> 仅查看自己的销售业绩 <br />
            {/* <span>部门负责人</span> 查看管理部门内所有员工的销售业绩汇总 <br /> */}
            <span>管理员</span> 查看所有员工的销售业绩汇总<br />
        </div>

        return (

            <WeBox title="销售统计" explain={explain}  extra={extra} className={className} >
                <div className={styles.customer}>
                    <div className={styles.body}>
                        {
                            (this.props.base.user.isCreated || this.props.base.user.isManage) && 
                            <div className={styles.customerSetting}>
                                <Icon type="setting" className={styles.customerSettingIcon} onClick={this.toggleSettingVisiableHandler} />
                            </div>
                        }
                        <Card loading={this.state.loading} className={styles.card}>
                            {
                                performanceIsPayMode ? 
                                    <Row>
                                        <Col span={8}>
                                            <NumberTrend 
                                                title="付款客户(人)" 
                                                data={ paySuccessTradingCustomers} 
                                                duringText={this.state.duringText}
                                                hasPrev={this.state.hasPrev} 
                                                isStaticticsing={performanceIsStaticticsing}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <NumberTrend 
                                                title="付款订单(笔)" 
                                                data={ paySuccessTradingOrderNumber} 
                                                duringText={this.state.duringText}
                                                hasPrev={this.state.hasPrev}
                                                isStaticticsing={performanceIsStaticticsing}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <NumberTrend 
                                                title="付款金额(元)" 
                                                data={ payTurnover } 
                                                hasPrev={this.state.hasPrev} 
                                                duringText={this.state.duringText}
                                                isJine={true}
                                                onDiffFormatter = {this.totalFormatterHandler}
                                                hasDivider={false} 
                                                isStaticticsing={performanceIsStaticticsing}
                                            />
                                        </Col>
                                    </Row>
                                    :
                                    <Row>
                                        <Col span={8}>
                                            <NumberTrend 
                                                title="成功交易客户(人)" 
                                                data={ successTradingCustomers} 
                                                duringText={this.state.duringText}
                                                hasPrev={this.state.hasPrev} 
                                                isStaticticsing={performanceIsStaticticsing}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <NumberTrend 
                                                title="成功交易订单(笔)" 
                                                data={ successTradingOrderNumber} 
                                                duringText={this.state.duringText}
                                                hasPrev={this.state.hasPrev}  
                                                isStaticticsing={performanceIsStaticticsing}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <NumberTrend 
                                                title="成功交易金额(元)" 
                                                data={ turnover } 
                                                hasPrev={this.state.hasPrev} 
                                                duringText={this.state.duringText}
                                                isJine={true}
                                                onDiffFormatter = {this.totalFormatterHandler}
                                                hasDivider={false} 
                                                isStaticticsing={performanceIsStaticticsing}
                                            />
                                        </Col>
                                    </Row>
                            }
                        </Card>
                    </div>
                    <div className={classnames(styles.sells, this.isTopSellStaticticsing() ? styles.sellsStaticticsing: '', this.isTopSellNoData() ? styles.sellsNoData: '')}>
                        <Card loading={this.state.topSellsStaticticsLoading} className={styles.card}>
                            <div className={styles.content}>
                                <h5>销售排行榜（{ this.isTopSellDataModeByPay() ? '按付款金额排序': '按订单成功交易统计金额排序'}）</h5>
                                <p className={styles.sellsStaticticsingText}>销售业绩统计中，请您耐心等待…</p>
                                <p className={styles.sellsNoDataText}>还没有交易转化哦，小伙伴们要加油咯~</p>
                                <Row>
                                    <TopSell  key={1}  rank={1} data={this.state.topSellsStaticticsData.statistics === null ? null : this.state.topSellsStaticticsData.statistics[0]} isPayMode={this.isTopSellDataModeByPay()} />
                                    <TopSell  key={2}  rank={2} data={this.state.topSellsStaticticsData.statistics === null ? null : this.state.topSellsStaticticsData.statistics[1]} isPayMode={this.isTopSellDataModeByPay()} />
                                    <TopSell  key={3}  rank={3} data={this.state.topSellsStaticticsData.statistics === null ? null : this.state.topSellsStaticticsData.statistics[2]} isPayMode={this.isTopSellDataModeByPay()} />
                                </Row>
                            </div>
                        </Card>
                    </div>
                    { this.state.setting.visiable && <Setting mode={this.state.setting.mode} visiable={this.state.setting.visiable} onOk={this.settingComplateHandler} onCancel={this.settingComplateHandler} />}
                </div>
            </WeBox>
        )
    }
}