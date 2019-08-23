import React from 'react'
import {Card} from 'antd'
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import { number } from '../../../../../utils/display'
import styles from './index.less'

export default class Index extends React.PureComponent {
    state = {
        loading: true
    }

    model = {
        name: '发送金额',
        total: 0,
        data: []
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


    showChart = (data) => {

        // const {color} = this.props
        const model = data || this.model
        const { total } = model

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
                data: model.data.map(c => c.name)
            },
            yAxis: {
                type: 'value',
                minInterval: 1,
                min: total < 1 ? 5: 0
            },
            series: [{
                name: model.name,
                type: 'line',
                smooth: false,
                data: model.data.map(c => c.value)
            }]
        }

        if(this.ID){
            let myChart = echarts.init(this.ID, echartsTheme)
            myChart.setOption(option)
        }
    }

    render(){

        const { 
            name,
            loading, 
            data
        } = this.props

        var model = {
            ...this.model,
            name,
            data: data,
            total: data.reduce((prev, item) => {
                console.log(prev)
                return prev + item.value
            },0)
        }
    
        if(data&& data.length){
            this.delayCall(() => this.showChart(model))
        }


        return(
            <Card bordered={false} bodyStyle={{padding: '0'}} loading={loading}>
                <dl className={styles.tiphead}>
                    <dt>{model.name}</dt>
                    <dd>{number(model.total)}</dd>
                </dl>
                <div ref={id => this.ID = id} style={{ width:'100%', height:'250px'}}></div>
            </Card>
        )
    }
}