import { Component, Fragment } from 'react'
import {connect} from 'dva'
import { Radio, Spin } from 'antd'
import moment from 'moment'
//引入echarts相关
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import styles from './index.less'

@connect(({base, home_overview}) => ({
    base,
    home_overview,
}))
export default class MyEcharts extends Component {
    state={
        active: '1',
        loading: false,
    }
    componentDidMount () {
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'home_overview/getStartEnd',
            payload: {},
            callback: ()=> {
                const { startEnd } = this.props.home_overview
                let began = startEnd.week.begin_at
                let end = startEnd.week.end_at
                this.props.dispatch({
                    type: 'home_overview/getEchartsData',
                    payload: {
                        begin_at: began,
                        end_at: end,
                        type: 1,
                    },
                    callback: (data)=> {
                        // console.log(data)
                        this.setState({
                            loading: false,
                        })
                        this.delay(() => this.showEcahrts())
                    }
                }) 
            }
        })
        this.showMemo()
    }
    componentWillUnmount () { 
        if (this.timer) { 
            clearTimeout(this.timer)
        }

    }
    delay = (action) => { 
        this.timer = setTimeout(() => { 
            action()
        }, 100)
    }
    showMemo = ()=>{
        const { active } = this.state
        if(active === '1'){
            let arr = []
            for(let i=7;i>0;i--){
                arr.push({
                    begin_at: moment().subtract(i, 'days').format('YYYY-MM-DD hh:mm:ss'),
                    pv: 0,
                    uv: 0, 
                })
            }
            return arr
        }else if(active === '2'){
            let arr = []
            for(let i=30;i>0;i--){
                arr.push({
                    begin_at: moment().subtract(i, 'days').format('YYYY-MM-DD hh:mm:ss'),
                    pv: 0,
                    uv: 0, 
                })
            }
            return arr
        }else if(active === '3'){
            //半年26个周
            let arr = []
            for(let i=26;i>0;i--){
                arr.push({
                    begin_at: moment().subtract(i, 'weeks').format('YYYY-MM-DD hh:mm:ss'),
                    pv: 0,
                    uv: 0, 
                })
            }
            return arr
        }else if(active === '4'){
            let arr = []
            for(let i=52;i>0;i--){
                arr.push({
                    begin_at: moment().subtract(i, 'weeks').format('YYYY-MM-DD hh:mm:ss'),
                    pv: 0,
                    uv: 0, 
                })
            }
            return arr
        }
    }
    //如果数据不全，则循环数据补全缺失的数据
    supplyData =(data, num, type)=>{
        let arr = []
        for(let i=num;i>0;i--){
            const myTime = moment().subtract(i, type).format('YYYY-MM-DD hh:mm:ss')
            let temp = {}
            data.forEach((val,key)=>{
                let a = val.begin_at.split(' ')[0]
                let b = myTime.split(' ')[0]
                if(a === b){
                    temp=val
                }
            })
            if(JSON.stringify(temp)!=='{}'){
                arr.push({
                    begin_at: temp.begin_at,
                    pv: temp.pv,
                    uv: temp.uv, 
                })
            }else{
                arr.push({
                    begin_at: myTime,
                    pv: 0,
                    uv: 0, 
                })
            }
        }
        return arr  
    }
    supplyWeek =(data, start, num,  type)=>{
        let arr = []
        for (let i = 1; i <= num; i++) {
            // 如果时间为周一
            const myTime = moment(start).add(i, type).format('YYYY-MM-DD hh:mm:ss')
            if (moment(myTime).weekday() === 0) { 
                let temp = {}
                data.forEach((val,key)=>{
                    let a = val.begin_at.split(' ')[0]
                    let b = myTime.split(' ')[0]
                    if(a === b){
                        temp=val
                    }
                })
                if(JSON.stringify(temp)!=='{}'){
                    arr.push({
                        begin_at: temp.begin_at,
                        pv: temp.pv,
                        uv: temp.uv, 
                    })
                }else{
                    arr.push({
                        begin_at: myTime,
                        pv: 0,
                        uv: 0, 
                    })
                }
            }
        }
        return arr  
    }
    checkData =(data)=> {
        const { active } = this.state
        if(active === '1'){
            if(data.length === 7){
                return data
            }else{
                return this.supplyData(data, 7, 'days') 
            }
        }else if(active === '2'){
            if(data.length === 30){
                return data
            }else{
                return this.supplyData(data, 30, 'days') 
            }
        }else if(active === '3'){
            if(data.length === 13){
                return data
            } else {
                let start = moment().subtract(3, 'months').format('YYYY-MM-DD hh:mm:ss')
                let dayNum = moment().dayOfYear() - moment().subtract(3, 'months').dayOfYear()
                return this.supplyWeek(data, start, dayNum, 'days') 
            }
        }else if(active === '4'){
            if(data.length === 26){
                return data
            } else {
                let start = moment().subtract(6, 'months').format('YYYY-MM-DD hh:mm:ss')
                let dayNum = moment().dayOfYear() - moment().subtract(6, 'months').dayOfYear()
                return this.supplyWeek(data, start, dayNum, 'days') 
            }
        }
    }
    showEcahrts = () => {
        let { stat_mpa, stat_goods } = this.props.home_overview
        let temp1 = stat_mpa.slice()
        let temp2 = stat_goods.slice()
        // console.log(stat_mpa)
        // console.log(stat_goods)
        // 如果数据为空，则显示默认数据
        stat_mpa =  stat_mpa ? this.checkData(stat_mpa) : this.showMemo()
        stat_goods = stat_goods ? this.checkData(stat_goods) : this.showMemo()
        // console.log(stat_mpa)
        // console.log(stat_goods)
        // 基于准备好的dom，初始化echarts实例
        if (!this.echartsRef)  return
        const myChart = echarts.init(this.echartsRef, echartsTheme)
        // 绘制图表
        const options = {
            //图表样式，设置边距
            grid:[{
                x: '5%', y: '20%', width: '90%', height: '70%' 
            }],
            //
            legend: {
                icon:'line',
                itemWidth: 10,
                itemHeight: 10,
                borderRadius: '100%',
                right: '5%',
                data: ['浏览量','访客数','商品浏览量']
            },
            //辅助线
            tooltip: {
                trigger: 'axis',
                axisPointer: {            
                    type: 'line'
                } 
            },
            //X轴显示内容
            xAxis: {
                data: stat_mpa.map(item=>{
                    return item.begin_at.split(' ')[0]
                })
            },
            yAxis: [
                {
                    type : 'value',
                    minInterval: 1,
                    splitNumber: 5,
                    min: (temp1.length===0&&temp2.length===0) ? 5 : 0
                }
            ],
            //数据，多列数据使用逗号隔开
            series: [
                {
                    name: '浏览量',
                    type: 'line',
                    data: stat_mpa.map(item=>{
                        return item.pv
                    })
                },
                {
                    name: '访客数',
                    type: 'line',
                    data: stat_mpa.map(item=>{
                        return item.uv
                    })
                },
                {
                    name: '商品浏览量',
                    type: 'line',
                    data: stat_goods.map(item=>{
                        return item.pv
                    })
                }
            ]
        }
        myChart.setOption(options)

        window.onresize = function () {
            myChart.resize()
        }
    }
    onTabChange = (e)=> {
        const value = e.target.value
        this.setState({
            active: value
        })
        //请求接口，更新数据
        const { startEnd } = this.props.home_overview
        // console.log(startEnd)
        let begin_at = ''
        let end_at = ''
        let type = ''
        if(value === '1'){// 7天
            begin_at = startEnd.week.begin_at
            end_at = startEnd.week.end_at
            type = 1
        }else if(value === '2'){// 30天
            begin_at = startEnd.month.begin_at
            end_at = startEnd.month.end_at
            type = 1
        }else if(value === '3'){// 三个月
            begin_at = startEnd.threeMonth.begin_at
            end_at = startEnd.threeMonth.end_at
            type = 2
        }else if(value === '4'){// 半年
            begin_at = startEnd.sixMonth.begin_at
            end_at = startEnd.sixMonth.end_at
            type = 2
        }
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'home_overview/getEchartsData',
            payload: {
                begin_at: begin_at,
                end_at: end_at,
                type: type,
            },
            callback: (data)=> {
                // console.log(data)
                this.setState({
                    loading: false,
                })
                this.showEcahrts()
            }
        })
    }
    render () {
        const { loading } = this.state
        return (
            <Fragment>
                <div className={styles.echartsOperate}>
                    <Radio.Group defaultValue={this.state.active} onChange={this.onTabChange}>
                        <Radio.Button value="1" style={{width: '90px', textAlign: 'center'}}>7天</Radio.Button>
                        <Radio.Button value="2" style={{width: '90px', textAlign: 'center'}}>30天</Radio.Button>
                        <Radio.Button value="3" style={{width: '90px', textAlign: 'center'}}>三个月</Radio.Button>
                        <Radio.Button value="4" style={{width: '90px', textAlign: 'center'}}>半年</Radio.Button>
                    </Radio.Group>
                </div>
                <Spin spinning={loading}>
                    <div ref={node => this.echartsRef = node} style={{width: '100%', height: 300}} className={styles.echartsCon}></div>
                </Spin>
            </Fragment>
        )
    }
}