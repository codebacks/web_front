import React from 'react'
import {Card,Row,  Col} from 'antd'
import echarts from 'echarts/lib/echarts'
import echartsTheme, { theme } from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import { number } from '../../../../../utils/display'

import styles from './index.less'


export default class XiaoHongBao extends React.PureComponent {
    

    state = {
        loading: true
    }

    model = {
        data: [{
            name: '发送金额',
            data: [{
                name: '08/01',
                value: 160
            },{
                name: '08/02',
                value: 530
            },{
                name: '08/03',
                value: 720
            },{
                name: '08/04',
                value: 210
            },{
                name: '08/05',
                value: 375
            },{
                name: '08/06',
                value: 180
            },{
                name: '昨日',
                value: 250
            }]
        },{
            name: '成功领取',
            data: [{
                name: '08/01',
                value: 150
            },{
                name: '08/02',
                value: 300
            },{
                name: '08/03',
                value: 550
            },{
                name: '08/04',
                value: 210
            },{
                name: '08/05',
                value: 280
            },{
                name: '08/06',
                value: 960
            },{
                name: '昨日',
                value: 250
            }]
        }]
    }

    componentDidMount() {

    }

    componentWillUnmount(){
        if(this.timeoutHandle){
            clearTimeout(this.timeoutHandle)
        }
    }

    delayCall = (action) => {
        this.timeoutHandle = setTimeout(() => {
            action()
        }, 100)
    }

    convertDataToModel(data){
        return data
    }

    showChart = (data, total) => {

        // const {color} = this.props
        const model = data || this.model


        const option = {
            grid: {
                left: '0',
                right: '4%',
                bottom: '3%',
                top: '32px',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis'
            },
            // color: color,
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: model.data[0].data.map(item => item.name)
            },
            yAxis: [
                {
                    type: 'value',
                    min: total < 1 ? 5: 0
                }
            ],
            series: model.data.map(c => ({
                name: c.name,
                data: c.data.map(i => i.value),
                type: 'line',
                smooth: false,
                //barGap: 0
            }))
        }

        
        if(this.ID){
            let myChart = echarts.init(this.ID, echartsTheme)
            myChart.setOption(option)
        }
    }

    getColor(index) {
        return theme.color[index]
    }

    getData(model, index){
        const { data } = model

        return data[index]
    }

    getTotal = (data) => {

        const { onTotalFormatter } = this.props

        var result = data.reduce((total, item)=>{
            return total + item.value
        }, 0)

        if(onTotalFormatter){
            return onTotalFormatter(result)
        }else{
            return number(result)
        }
    }

    render(){

        const { 
            loading, 
            data,
            isDebugMode
        } = this.props

        var model = {
            ...this.model,
        }
        
        if(isDebugMode !== true){
            model = {
                ...model,
                ...this.convertDataToModel(data)
            }
        }
    
        const firstTotal = this.getTotal(this.getData(model, 0).data)
        const secondTotal = this.getTotal(this.getData(model, 1).data)
        if(data){
            this.delayCall(() => this.showChart(model, firstTotal + secondTotal))
        }

        return(
            <Card bordered={false} bodyStyle={{padding: '0'}} loading={loading}>
                <Row>
                    <Col span={8}>
                        <dl className={styles.tiphead}>
                            <dt><i className={styles.ciricon} style={{backgroundColor: this.getColor(0)}}></i>{this.getData(model, 0).name}</dt>
                            <dd>{firstTotal}</dd>
                        </dl>
                    </Col>
                    <Col  span={8}>
                        <dl className={styles.tiphead}>
                            <dt><i className={styles.ciricon} style={{backgroundColor: this.getColor(1)}}></i>{this.getData(model, 1).name}</dt>
                            <dd>{secondTotal}</dd>
                        </dl>
                    </Col>
                </Row>
                <div ref={id => this.ID = id} style={{ width:'100%', height:'250px'}}></div>
            </Card>
        )
    }
}
