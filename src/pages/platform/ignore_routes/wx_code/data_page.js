/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import Page from '@/components/business/Page'
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import documentTitleDecorator from 'hoc/documentTitle'
import { Table, Pagination,Radio,Button,Icon,message} from 'antd'
import style from './data.scss'
import DownloadSvg from '../../../../assets/font_icons/download.svg'
import { getQrCodeUrl } from '../../services/blueprint'

@connect(({platform_qrcodeData, base}) => ({
    platform_qrcodeData,
    base,
}))
@documentTitleDecorator({
    title:'新码数据'
})
export default class Index_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            //当前页
            offset: 1,
            index: '3',
            id:'',
            //每页条数
            limit: 10,
            type:'',
            timeIntervalLoading:false,
        }
    }
    componentDidMount () {
        this.setState({
            id:this.props.location.query.id,
            type:Number(this.props.location.query.type)
        },function () {
            this.getQrcodeData()
            this.getQrcodeWechat(this.state.offset,this.state.limit)
        })

    }

    toSelectchange = (value,pageSize) =>{
        this.setState({
            offset:value,
            limit: pageSize
        })
        this.getQrcodeWechat(value,pageSize)

    }
    handleTableChange = (value) => {
        this.setState({
            offset:value
        })
        this.getQrcodeWechat(value,this.state.limit)
    }
    //获取新码统计数据
    getQrcodeData = () => {        
        const { dispatch } = this.props
        dispatch({
            type: 'platform_qrcodeData/qrcodeData',
            payload: {
                id:this.state.id,
                type:this.state.index
            },
            callback:() =>{
                const {echartData} = this.props.platform_qrcodeData
                const {type} = this.state
                let series = [],arr = [],newArr = [],displayCountArr = [],addCountArr = []
                for(var k = echartData.length-1;k>=0;k--){
                    displayCountArr.push({
                        total:echartData[k].displayCount,
                        time:echartData[k].createdAt
                    })
                    addCountArr.push({
                        total:echartData[k].addCount,
                        time:echartData[k].createdAt
                    })
                }
                arr[0] = displayCountArr
                if(type === 1){
                    series = ['展示数','添加数']
                    arr[1] = addCountArr
                }else{
                    series = ['展示数']
                } 
                arr.map((item,i) =>{
                    newArr.push({
                        data:arr[i],
                        name:series[i]
                    })
                })
                this.showChart(newArr)
            }
        })
    }
    //获取微信号统计
    getQrcodeWechat = (offset, limit ) => {
        const { dispatch } = this.props
        dispatch({
            type: 'platform_qrcodeData/qrcodeWechat',
            payload: {
                id:this.state.id,
                offset: offset-1,
                limit: limit
            },
            callback:() =>{
            }
        })
    }
    showChart= (arr) => {
        const {type} = this.state
        const colorList = ['#1890FF','#52C41A']
        var myChart = echarts.init(document.getElementById('main'), echartsTheme)
        var option = {
            tooltip : {
                trigger: 'axis',
                formatter: function (params) {
                    var htmlStr ='<div style="padding:10px 10px 5px;font-family: MicrosoftYaHei;font-size: 12px;border-radius:2px">'
                    htmlStr += params[0].name + '<br/>'//x轴的名称
                    for(var i = 0; i < params.length;i++){
                        //为了保证和原来的效果一样，这里自己实现了一个点的效果
                        htmlStr += '<span style="margin-right:5px;display:inline-block;width:6px;height:6px;border-radius:6px;background-color:'+params[i].color+';"></span>'

                        //添加一个汉字，这里你可以格式你的数字或者自定义文本内容
                        htmlStr += params[i].seriesName + ': '+params[i].value + '<br/>'
                    }
                    if(type === 1){
                        if(params[0].value === 0 || params[1].value === 0 ){
                            htmlStr +='<p style="margin-left: 10px">转化率：0%</p></div>'
                        }else{
                            var percent = (params[1].value*100/params[0].value).toFixed(2)
                            htmlStr +='<p style="margin-left: 10px">转化率：'+ percent + '%</p></div>'
                        }
                    }
                    return htmlStr
                },
            },
            legend:{
                icon: 'circle',
                itemWidth: 7,
                itemHeight: 7,
                itemGap: 15,
                borderRadius: 4,
                textstyles: {
                    fontSize: 12
                },
                show: true,
                right: '3%',
                top: 0,
                data: arr.map(c=> c.name)
            },
            grid: {
                left: '2%',
                right: '30px',
                top:'10%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data:arr[0].data.map(i => i.time.slice(5,10).replace('-','.'))
                }
            ],
            yAxis : [
                {
                    type : 'value',
                }
            ],
            series: arr.map((c,i) => ({
                name: c.name,
                itemStyle:{
                    color:colorList[i]
                },
                emphasis:{
                    itemStyle: {
                        // 高亮时点的颜色。
                        color: colorList[i]
                    },
                },
                data: c.data.map(i =>i.total),
                type: 'line',
                // smooth: false,
            }))
        }
        myChart.setOption(option)
    }
    change= (e) =>{
        this.setState({
            index:e.target.value
        },function(){
            this.getQrcodeData()
        })
       
    }
    checkData = (displayNum,addNum) =>{
        const {type} = this.state
        return (<div>
            {
                type === 2 ? <span style={{color:'#1890FF'}}>{displayNum}</span> : <span style={{color:'#1890FF'}}>{displayNum}/<span style={{color:'#52C41A'}}>{addNum}</span></span>
            }
        </div>)
    }
    // 导出数据
    downExportsList = () =>{
        this.checkTimeInterval()
    }
    // 检查下载时间间隔
    checkTimeInterval = () =>{
        this.props.dispatch({
            type:'platform_qrcodeData/timeInterval',
            payload:{
                qrCodeId:this.props.location.query.id
            },
            callback:(res) =>{
                if(res.meta && res.meta.code === 200){
                    window.open(getQrCodeUrl(`/api/qrcodes/exportExecl/${this.props.location.query.id}`),'_blank')
                }
            }
        })
        
    }
    // 下载报表
    downExports = () =>{
        this.props.dispatch({
            type:'platform_qrcodeData/downloadExports',
            payload:{
                qrCodeId:this.props.location.query.id
            },
            callback:(res) =>{
                console.log(res)
                if(res.meta && res.meta.code === 200){
                    message.success('数据下载成功')
                   
                }
            }
        })
    }
    render() {

        const { wechat,rows_found,loading,title} = this.props.platform_qrcodeData
        const {limit, offset,index ,type} = this.state
        // const TabPane = Tabs.TabPane
        const columns = [{
            title: type === 1 ? '微信号' : '二维码名称',
            dataIndex: 'name',
            key: 'name',
        },{
            title: title[6],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[6].displayCount,record.data[6].addCount)
            )
        },{
            title:title[5],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[5].displayCount,record.data[5].addCount)
            )
        },{
            title:title[4],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[4].displayCount,record.data[4].addCount)
            )
        },{
            title: title[3],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[3].displayCount,record.data[3].addCount)
            )
        },{
            title: title[2],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[2].displayCount,record.data[2].addCount)
            )
        },{
            title: title[1],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[1].displayCount,record.data[1].addCount)
            )
        },{
            title: title[0],
            align:'center',
            render: (text, record) => (
                this.checkData(record.data[0].displayCount,record.data[0].addCount)
            )
        }]
        return (
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '新码',
                        path: '/platform/wx_code'
                    }, {
                        name: '新码数据'
                    }]}
                />
                <div className={style.data}>
                    {/* <div className={style.header}>新码数据</div> */}
                    <div className={style.echartsBox}>
                        <div className={style.echarts}>
                            <div style={{display:'flex', justifyContent:'space-between',width:'100%'}}>
                                <div  className={style.tip}>
                                    <Radio.Group
                                        value={index}
                                        onChange={this.change}
                                    >
                                        <Radio.Button value="3">近7天</Radio.Button>
                                        <Radio.Button value="4" >近30天</Radio.Button>
                                        <Radio.Button value="5">近90天</Radio.Button>
                                    </Radio.Group>
                                </div>
                            </div>
                            <div id="main" className={style.echart}></div>
                        </div>
                    </div>
                    <div className={style.downLoadWrap}>
                        <Button type="primary" ghost onClick={this.downExportsList}>
                            <Icon component={DownloadSvg} style={{ fontSize: '16px' }}/>
                            导出近90天数据
                        </Button>
                    </div>
                    <div className={style.tableList}>
                        <div style={{lineHeight:"75px",height:'75px',marginBottom:8}}>
                            <div className={style.titles}>
                                {
                                    type === 1 ?  '微信号统计' : '自定义二维码展示数统计'
                                } 
                            </div>
                            <div style={{float:'left'}}  >
                                <p className={style.seven}>展示最近7天统计数据</p>
                            </div>
                            <div style={{float:'right'}}  >
                                <span className={style.show}>展示数</span>
                                {
                                    type === 1 ? <span className={style.add}>添加数</span> : ''
                                }
                                
                            </div>
                        </div>

                        <Table  
                            columns={columns} 
                            dataSource={wechat} 
                            loading= {loading}
                            pagination= {false}  
                            rowKey={(record,index) => index+1}
                        />
                        {wechat.length? (
                            <Pagination
                                className="ant-table-pagination"
                                total={rows_found}
                                current={offset}
                                pageSizeOptions= {['10','20','50','100']}
                                showQuickJumper={true}
                                showTotal={total => `共${rows_found}条记录`}
                                pageSize={limit}
                                showSizeChanger={true}
                                onShowSizeChange={this.toSelectchange.bind(this)}
                                onChange={this.handleTableChange.bind(this)}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    { type === 1 ? <div className={style.btm}>
                        新码统计中微信的添加数来源为：被扫一扫添加。该数据仅供商家参考；同一微信号被添加在不同新码内，添加数统计数据会合并计算，可能出现添加数大于展示数的情况。
                    </div> 
                        : ''
                    } 
                </div>
            </Page>
        )
    }
}
