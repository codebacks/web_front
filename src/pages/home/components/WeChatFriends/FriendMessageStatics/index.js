import React from  'react'
import { Card } from 'antd'
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import styles from "../index.less"
import numeral from 'numeral'

export default class Friend extends React.PureComponent {

    state = {
        loading: true, 
        model: {
            name: '',
            total: 8956,
            data: [{
                name: '接受消息',
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
                name: '发送消息',
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
        const model = data || this.state.model
        const { total } = model
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                icon: 'circle',
                itemWidth: 7,
                itemHeight: 7,
                itemGap: 15,
                borderRadius: 4,
                textStyle: {
                    fontSize: 12
                },
                show: true,
                right: '3%',
                top: 0,
                data: model.data.map(c=> c.name)
            },
            grid: {
                left: '0',
                right: '4%',
                bottom: '3%',
                top: '64px',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: model.data[0].data.map(i => i.name)
            },
            yAxis: [
                {
                    type: 'value',
                    minInterval: 1,
                    min: total < 1 ? 5: 0
                }
            ],
            series: model.data.map(c => ({
                name: c.name,
                data: c.data.map(i => i.value),
                type:'bar',
                barGap: 0
            }))
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
                return total + item.data.sendMessageCount + item.data.receiveMessageCount
            }, 0),
            data: [
                {
                    name: '接受消息',
                    data: data.map(item => ({
                        name: item.date.format('MM/DD'),
                        value: item.data.receiveMessageCount
                    }))
                },
                {
                    name: '发送消息',
                    data: data.map(item => ({
                        name: item.date.format('MM/DD'),
                        value: item.data.sendMessageCount
                    }))
                }
                
            ]
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
                <div className={styles.friendMessage}>
                    <div ref={ID => this.ID = ID} style={{width: '100%', height:'332px'}}></div>
                </div>
            </Card>
        )
    }
}