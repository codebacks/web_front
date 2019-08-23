import React from 'react'
import {Collapse,Button,Icon,Form, Input, Divider,Modal,message} from 'antd'
import {connect} from 'dva'
import ProductsModel from '../ProductsModel'
import styles from './index.less'
import debounce from 'lodash/debounce'
const {Panel} = Collapse
const {confirm} = Modal

@connect(({shop_fitment}) => ({
    shop_fitment
}))
@Form.create()
export default class extends React.Component {
    constructor(props){
        super()
        this.state= {
            productIds:[]
        }
        this.onChange = debounce(this.onChange)
        this.warning = false
    }
    onChange = (value, i) =>{
        let {model,handleData,index} = this.props
        this.props.form.validateFields((errors,valuse)=>{
            if(!errors){
                model.data[i].label = value
                // model.data = model.data.slice()
                handleData && handleData(model,index)
            }
        })
    }
    componentDidUpdate(prevProps){
        let {model} = this.props
        if(model.data !== prevProps.model.data){
            this.setForm(model.data) 
        }
    }
    setForm = (data)=>{
        let o = {}
        data && data.forEach((item,i)=>{
            o[`key_${i}`] = item.label
        })
        this.props.form.setFieldsValue(o)
    }
    onDelete = (_index,e)=>{
        e.stopPropagation()
        const {model,handleData,index} = this.props
        let _this = this
        confirm({
            title: '删除此数据后无法恢复，是否确认删除?',
            onOk() {
                if(model.data.length === 1){
                    if(!_this.warning){
                        _this.warning = true
                        message.warning('标签不能少于1个',3,()=>{
                            _this.warning = false
                        })
                    }
                    return
                }
                model.data && model.data.splice(_index , 1)
                handleData && handleData(model, index)
                _this.setForm(model.data)
            },
            onCancel() {}
        })
    }
    onMove = (_index,type,e) =>{
        e.stopPropagation()
        const {model,handleData,index} = this.props
        let current = model.data && model.data[_index]
        if(type === 'up'){
            let prev = model.data[_index - 1]
            if(prev){
                model.data[_index-1] = current
                model.data[_index] = prev
            }
        }else{
            let next = model.data[_index + 1]
            if(next){
                model.data[_index + 1] = current
                model.data[_index] = next
            }
        }
        handleData && handleData(model, index)
        this.setForm(model.data)
    }
    handleClick = (e) =>{
        e.preventDefault()
        const {model,handleData,index} = this.props
        if(model.data.length >= 3){
            if(!this.warning){
                this.warning = true
                message.warning('标签不能超过3个',3,()=>{
                    this.warning = false
                })
            }
            return
        }
        model.data.push({"label":"文字","type":`${index}_${model.data.length}`,"data":[]})
        handleData(model,index)

    }
    render(){
        let { model, index ,handleData} = this.props
        if(!model.data.length){
            model.data = [{
                label:'文字',
                type:`${index + parseInt(Math.random()*10000)}_${0}`,
                data:[]
            },{
                label:'文字',
                type: `${index + parseInt(Math.random()*10000)}_${1}`,
                data:[]
            },{
                label:'文字',
                type: `${index + parseInt(Math.random()*10000)}_${2}`,
                data:[]
            }]
        }
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    textAlign: 'right',
                }
            },
            wrapperCol: {
                span: 18,
            }
        }
        const { getFieldDecorator } = this.props.form
        const { products } =this.props.shop_fitment
        let _this = this

        const action =(title,_index) =>{
            return <div className={styles.collapse_header}>
                <div className={styles.collapse_header_title}>{title}</div>
                <div className={styles.collapse_header_right}>
                    <span onClick={(e)=>this.onDelete(_index,e)}>删除</span>
                    <Divider style={{marginTop:5}} type="vertical"/>
                    <span onClick={(e)=>this.onMove(_index,'up',e)}>上移</span>
                    <Divider style={{marginTop:5}} type="vertical"/>
                    <span onClick={(e)=>this.onMove(_index,'down',e)}>下移</span>
                </div>
            </div>
        }

        return <div className={styles.product_content}>
            <Button type="primary" ghost onClick={this.handleClick}>
                <Icon type="plus" />添加标签
            </Button>
            <Collapse bordered={false} defaultActiveKey={['0']} expandIcon={(panelProps)=>{
                return <Icon 
                    style={{fontSize:'14px',color:'#556675'}} 
                    type={panelProps.isActive ? 'caret-down':'caret-right'} />
            }}>
                {
                    model.data && model.data.map((item, _i) =>{
                        return <Panel
                            header={action(item.label,_i)} key={_i + ''} >
                            <Form.Item label='标签名称：' {...formItemLayout}>
                                {
                                    getFieldDecorator(`key_${_i}`, {
                                        initialValue:item.label,
                                        rules:[{required:true,message:'标签名称不能为空'}]
                                    })(<Input placeholder='文字内容' onKeyUp={(e) => _this.onChange(e.target.value,_i)} maxLength={4}/>)
                                }
                            </Form.Item>
                            <ProductsModel type='tabs' model={model} data={products[item.type]} handleData={handleData} index={index} childrenIndex={_i}/>
                        </Panel>
                    })
                }
            </Collapse>
        </div>
    }
}
