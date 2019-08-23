import React from  'react'
import { Card }  from 'antd'
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/bar'
import styles from "../index.less"
import numeral from 'numeral'

export default class Friend extends React.PureComponent {

    state = {
        loading: true,
        model: {
            name: '',
            total: 8888,
            data: [{
                name: '08/01',
                value: 10
            },{
                name: '08/02',
                value: 52
            },{
                name: '08/03',
                value: 200
            },{
                name: '08/04',
                value: 334
            },{
                name: '08/05',
                value: 390
            },{
                name: '08/06',
                value: 330
            },{
                name: '昨日',
                value: 220
            }]
        }
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

    renderWeChatCharts = (data) => {
        const model  = data || this.state.model
        const {total} = model
        const option = {
            color: ['#4391FF'],
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '32px',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : model.data.map(item => item.name),
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    minInterval: 1,
                    min: total < 1 ? 5: 0
                }
            ],
            series : [
                {
                    name: model.name,
                    data: model.data.map(item => item.value),
                    type:'bar',
                    barWidth: '60%'
                }
            ]
        }
       
        if(this.ID){
            let myChart = echarts.init(this.ID, echartsTheme)
            myChart.setOption(option)
        }
    }

    convertDataToModel(data){
        if(!data) {
            return {}
        }
        
        return {
            total: data.reduce((total, item) => {
                return total + item.data.newCount
            }, 0),
            data: data.map(item => ({
                name: item.date.format('MM/DD'),
                value: item.data.newCount
            }))
        }
    }

    render() {
        const { 
            name,
            loading, 
            data,
            isDebugMode
        } = this.props

        var model = {
            ...this.state.model,
            name
        }

        if(isDebugMode !== true){
            model = {
                ...model,
                ...this.convertDataToModel(data)
            }
        }
    
        if(data){
            this.delayCall(() => this.renderWeChatCharts(model))
        }

        return (
            <Card bordered={false} bodyStyle={{padding: '0'}} loading={loading}>
                <dl className={styles.tiphead}>
                    <dt>{model.name}</dt>
                    <dd>{numeral(model.total).format('0,0')}</dd>
                </dl>
                <div ref={ID => this.ID = ID} style={{width: '100%', height:'300px'}}></div>
            </Card>
        )
    }
}