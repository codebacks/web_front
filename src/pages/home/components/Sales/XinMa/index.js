import React from 'react'
import {Card} from 'antd'
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import PropTypes from 'prop-types'
import { number } from '../../../../../utils/display'

import styles from './index.less'

export default class XiaoHongBao extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired
    }

    state = {
        loading: true
    }

    model = {
        name: '发送金额',
        total: 0,
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
            data,
            isDebugMode
        } = this.props

        var model = {
            ...this.model,
            name
        }
        
        if(isDebugMode !== true){

            model = {
                ...model,
                ...this.convertDataToModel(data)
            }
        }
    
        if(data){
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
