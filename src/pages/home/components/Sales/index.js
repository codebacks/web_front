import React from 'react'
import { Card,  Radio, Row, Col} from 'antd'
import WeBox from '../WeBox'
import XiaoHongBao from './XiaoHongBao'
import XinMa from './XinMa'
import { getWeekStatistics as getXinMaWeekStatistics } from '../../services/xinma'
import { getWeekStatistics as getHongBaoWeekStatistics} from '../../services/hongbao'
import { jine } from '../../../../utils/display'
import css from "./index.less"


export default class Sales extends React.PureComponent {
    state = {
        active: 'hongbao',
        hongbaoDebugMode: false,
        hongbao: {
            loading: false,
            data: null
        },
        xinmaDebugMode: false,
        xinma: {
            loading: false,
            data: null,
        }
    }

    initedTabs = { [this.state.active]: true}

    getDataDelegate = {
        hongbao: getHongBaoWeekStatistics,
        xinma: getXinMaWeekStatistics
    }

    componentDidMount(){
        const { isOnlyXinMa } = this.props
        if(isOnlyXinMa === true) {
            this.setState({
                active: 'xinma'
            }, () => {
                this.getTypeStaticticsData(this.state.active)
                this.initedTabs['xinma'] = true
            })
        }else{
            this.getTypeStaticticsData(this.state.active)
        }
        
    }

    onChangeGroup = (e) => {
        const type = e.target.value
        this.initedTabs[type] = true

        this.setState({
            active: type
        })

        this.getTypeStaticticsData(type)
    }

    getTypeStaticticsData = (type) => {
        const stateData = this.state[type]

        if(stateData.data){

        }else {
            var delegate = this.getDataDelegate[type]

            this.setState({
                [type]:{
                    loading: true
                }
            })

            delegate().then(data => {
                this.setState({
                    [type]:{
                        loading: false,
                        data: data
                    }
                })
            }, error => {
                this.setState({
                    [type]:{
                        loading: false
                    }
                })
            })
        }
    }

    getXinMaDisplayData(data){

        return data && {
            total: data.displayTotalCount,
            data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.displayCount}))
        }
    }

    getXinMaAddData(data){
        return data && {
            total: data.addTotalCount,
            data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.addCount}))
        }
    }

    getHongBaoJineData(data){
        return data && {
            data: [{
                name: '发送金额(元)',
                data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.sendAmount}))
            },{
                name: '成功领取(元)',
                data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.takedSuccessAmount}))
            }]
        }
    }

    getHongBaoNumberData(data){
        return data && {
            data: [{
                name: '发送红包(个)',
                data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.sendNumber})) 
            },{
                name: '成功领取(个)',
                data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.takedSuccessNumber})) 
            }]
        }
    }

    getHongBaoPersonData(data){
        return data && {
            data: [{
                name: '领取人数(人)',
                data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.takedFailedNumber + item.data.takedSuccessNumber})) 
            },{
                name: '领取失败(人)',
                data: data.data.map(item => ({ name: item.date.format('MM/DD'), value: item.data.takedFailedNumber})) 
            }]
        }
    }
    

    render(){
        const { isOnlyXinMa } = this.props

        return (
            <WeBox {...this.props} title="营销统计" description="近7天数据">
                <Card >
                    <div>
                        <div className={css.action}>
                            <Radio.Group defaultValue={this.state.active} onChange={this.onChangeGroup}>
                                { isOnlyXinMa === true ? undefined: <Radio.Button value="hongbao"  style={{width: '90px', textAlign: 'center'}}>小红包</Radio.Button>}
                                <Radio.Button value="xinma"  style={{width: '90px', textAlign: 'center'}}>新码</Radio.Button>
                            </Radio.Group>
                        </div>
                        {
                            isOnlyXinMa === true ? undefined:
                                <Row className={css.chartRow} style={{display: this.state.active ==='hongbao'?'block':'none'}}>
                                    <Col span={8}>
                                        <XiaoHongBao isDebugMode={this.state.hongbaoDebugMode} onTotalFormatter={jine} data={this.getHongBaoJineData(this.state.hongbao.data)}   loading={this.state.hongbao.loading} />
                                    </Col>
                                    <Col span={8}>
                                        <XiaoHongBao isDebugMode={this.state.hongbaoDebugMode}  data={this.getHongBaoNumberData(this.state.hongbao.data)}   loading={this.state.hongbao.loading} />
                                    </Col>
                                    <Col span={8}>
                                        <XiaoHongBao isDebugMode={this.state.hongbaoDebugMode}  data={this.getHongBaoPersonData(this.state.hongbao.data)}   loading={this.state.hongbao.loading} />
                                    </Col>
                                </Row>
                        }
                        { 
                            this.initedTabs['xinma'] && 
                            <Row className={css.chartRow} style={{display: this.state.active ==='xinma'?'block':'none'}}>
                                <Col span={12}>
                                    <XinMa isDebugMode={this.state.xinmaDebugMode} data={this.getXinMaDisplayData(this.state.xinma.data)} loading={this.state.xinma.loading} name="展现次数" />
                                </Col>
                                <Col span={12}>
                                    <XinMa isDebugMode={this.state.xinmaDebugMode} data={this.getXinMaAddData(this.state.xinma.data)} loading={this.state.xinma.loading} name="添加人数" color={['#fa8c16']} />
                                </Col>
                            </Row>
                        }
                    </div>
                </Card>
            </WeBox>
        )
    }
}