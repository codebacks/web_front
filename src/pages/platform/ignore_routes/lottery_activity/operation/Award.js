import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import { Link } from 'dva/router'
import router from 'umi/router'
import { Button,Table,Row,Col,message,Modal } from 'antd'
import { ACTIVIT_TYPE } from '../../../services/lottery_activity'
import AwardEditModal from '../modals/AwardEditModal'
import moment from 'moment'
const {confirm} = Modal
const ACTIVIT_TYPE_OBJECT = {}
ACTIVIT_TYPE.forEach(i=>{
    ACTIVIT_TYPE_OBJECT[i.value] = i.label
})
@connect(({ lottery_activity }) => ({ lottery_activity }))
export default class extends React.Component {
    constructor(props){
        super()
        let list = new Array(8).join('*').split('').map((_,i)=>{
            return {
                sort: i+1,
                name: '',
                type: void 0,
                img_path: '',
                number: '',
                prize_value:'',
                probability: ''
            }
        })
        list.push({
            sort: 8,
            name: '谢谢参与',
            type: 4,
            img_path: 'https://image.51zan.com/2019/05/09/FjYQF6N2SVJFgHmquuu77kGuukBa.png',
            number: '',
            prize_value:void 0,
            probability: 100
        })
        this.state ={
            list,
            visible:false,
            row:{},
            probability:100
        }

    }
    componentDidMount(){
        if(this.props.from && this.props.from.prizes){
            this.setState({list:this.props.from.prizes})
        }
    }
    handleClick = (row,e)=>{
        this.setState({
            visible:true,
            row
        })
    }
    onOk = (row) =>{
        let { list } = this.state
        let probability = 0
        list = list.slice().map(i=>{
            if(row.sort === i.sort){
                probability +=  Number(row.probability)
                return row
            }
            if(i.sort !== 8){
                probability += Number(i.probability)
            }else{
                i.probability = 100 - Number(probability)
            }
            return i
        })
        this.setState({list,probability:list[7].probability})
    }
    onCancel = () => {
        this.setState({
            visible:false,
            row:{}
        })
    }
    prevStep = () =>{
        let { list } = this.state
        list = list.slice()
        delete list[7]
        let { id } = this.props.location.query
        let flag =list.some(i=> i.name)
        if(id)  flag = false
        if(flag){
            confirm({
                title: '返回上一步，奖品数据将会丢失，是否继续?',
                onOk:()=> {
                    this.props.setStep(1,this.props.from)
                },
                onCancel:()=> {},
            })
        }else{
            let from = this.props.from
            from.prizes = this.state.list
            this.props.setStep(1,from)
        }
        
    }
    probabilityChange =(row) => {
        let { list } = this.state
        let probability = 0
        if(!row.probability)row.probability = 0
        list.forEach(i=>{
            if(row.sort === i.sort){
                probability += Number(row.probability)
            }else if(i.sort !== 8){
                probability += Number(i.probability)
            }else{
                probability = 100 - Number(probability)
            }
        })
        this.setState({probability})
    }
    validatorData=()=>{
        let { list } = this.state
        return list.some(i=>!i.name)
    }
    handleSubmit = () =>{
        if(this.validatorData()){
            message.error('您还有抽奖的奖品没有设置')
            return
        }
        const { id } = this.props.location.query
        let type = 'lottery_activity/postLotteryActivities'
        let payload = {...this.props.from}
        payload.prize_type = payload.prize_type.join(',')
        payload.begin_at = moment(payload.time[0]._d).format('YYYY-MM-DD HH:mm:ss')
        payload.end_at = moment(payload.time[1]._d).format('YYYY-MM-DD HH:mm:ss')
        let list = this.state.list
        list = list.map(i => {
            if(i.prize_value && i.prize_value > 0){
                i.prize_value *= 100
            }
            return i
        })
        delete payload.time
        
        payload.prizes = list
        if(id){
            type = 'lottery_activity/putLotteryActivities'
            payload.id = id
        }
        this.props.dispatch({
            type,
            payload,
            callback:(data)=>{
                if(data.meta.code ===200){
                    router.push(`/platform/lottery_activity/qrcode/${data.data.id}${id?`?id=${id}`:''}`)
                }
            }
        })
    }

    render(){
        const columns = [{
            title: '序号',
            dataIndex: 'sort',
        },{
            title: '奖品名称',
            dataIndex: 'name',
        },{
            title: '奖品类型',
            dataIndex: 'type',
            render:(type)=> ACTIVIT_TYPE_OBJECT[type]
        },{
            title: '奖品图片',
            dataIndex: 'img_path',
            render:(path)=> path ? <img src={path} width='48' height='48' alt=''/> :null
        },{
            title: '数量',
            dataIndex: 'number',
            align:'center',
            render:(data,row) => data ? data :row.name? '不限':''
        },{
            title: '概率(%)',
            dataIndex: 'probability',
            align:'center',
        },{
            title: '操作',
            dataIndex: 'opt',
            render:(_,row)=> row.sort !== 8 ? <a href="javascript:;" onClick={(e)=>this.handleClick(row,e)}>编辑</a> : <a href="javascript:;">-</a> 
        },]
        let { id } = this.props.location.query
        return <DocumentTitle title={id ?'编辑活动':'创建活动'}>
            <Page>
                <Page.ContentHeader
                    title={id ?'编辑活动':'创建活动'}
                />
                <p style={{color:'#9EA8B1'}}><span style={{color:'#0D1A26'}}>奖品设置：</span> 所有奖项概率之和需等于100%</p>
                <Row>
                    <Col span={16}>
                        <Table
                            pagination={false}
                            columns={columns}
                            dataSource={this.state.list}
                            rowKey="sort"
                        />
                    </Col>
                    <Col span={8}>
                        <img src={require('../../../assets/images/img_iphone.png')} alt='' width="280" height="560" style={{marginLeft: '80px'}} />
                        <h3 style={{marginLeft:180,fontSize:14,color:'#556675'}}>样例效果图</h3> 
                    </Col>
                </Row>
                
                <div className='hz-margin-base-top-bottom'>
                    <Button type="primary" htmlType="submit" onClick={() => this.handleSubmit()} disabled={this.state.isClickButton}>保存</Button>
                    <Button type="primary" ghost style={{ marginLeft: 16 }} onClick={() => this.prevStep()}>上一步</Button>
                    <Link to='/platform/lottery_activity'><Button style={{ marginLeft: 16 }}>取消</Button></Link>
                </div>
                <AwardEditModal
                    visible={this.state.visible}
                    probability={this.state.probability}
                    probabilityChange={this.probabilityChange}
                    row={this.state.row}
                    from={this.props.from}
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                />
            </Page>
        </DocumentTitle>
    }
}











