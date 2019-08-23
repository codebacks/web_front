import React from 'react'
import {Collapse,Button,Icon,Form, InputNumber, Divider,Modal,message,Radio} from 'antd'
import {connect} from 'dva'
import Content from './Content'
import styles from '../ProductCollapse/index.less'
import localStyles from './index.less'
import debounce from 'lodash/debounce'
const {Panel} = Collapse
const {confirm} = Modal
const RadioGroup = Radio.Group
@connect(({shop_fitment}) => ({
    shop_fitment
}))
@Form.create()
export default class extends React.Component {
    constructor(props){
        super()
        this.state= {
            productIds:[],
            value: 'other',
            disabled: true,
            inputValue: ''
        }
    }
    inputValue = ''
    onChange = (value) =>{
        if(!value) value = 176
        this.inputValue = value
        this.setState({
            inputValue: value
        })
    }
    radioChange = (e) =>{
        let value = e.target.value
        let {model,handleData,index} = this.props
        if(value !=='other'){
            model.height = value
            this.setState({
                inputValue: '',
                disabled : true
            })
        }else {
            this.inputValue = 176
            this.setState({
                inputValue: 176,
                disabled:false
            })
            model.height = 176
        }
        this.setState({ value })
        handleData && handleData(model,index,true)
    }
    onBlur = ()=>{
        let {model,handleData,index} = this.props
        model.height = this.inputValue || 0
        handleData && handleData(model,index,true)
    }
    isActive = false
    componentDidUpdate(prevProps){
        let {model} = this.props
        if(!this.isActive){
            this.isActive = true
            if( !model.height ||  model.height>0){
                this.setState({
                    value: 'other',
                    inputValue: model.height || 176,
                    disabled:false
                })
            }else if(model.height === 0){
                this.setState({
                    value: 0,
                    inputValue: ''
                })
            }  
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
                handleData && handleData(model, index,true)
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
        handleData && handleData(model, index,true)
        this.setForm(model.data)
    }

    handleClick = (e) =>{
        e.preventDefault()
        const {model,handleData,index} = this.props
        let _this = this
        if(model.data.length === 10){
            if(!_this.warning){
                _this.warning = true
                message.warning('标签不能多于10个',3,()=>{
                    _this.warning = false
                })
            }
            return
        }
        model.data.push({"label":`轮播图 ${model.data.length + 1}`,type:`${index + parseInt(Math.random()*10000)}_${model.data.length}`, data:[], _data:[]})
        handleData(model,index,true)
    }

    render(){
        let { model, index ,handleData} = this.props
        if(!model.data.length){
            model.data = [{
                label: '轮播图 1',
                type: `${index + parseInt(Math.random()*10000)}_0`,
                _data: [],
                data: []
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
        
        const { products } =this.props.shop_fitment
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
                <Icon type="plus" />添加
            </Button>
            <Form.Item label='轮播图高度：' {...formItemLayout}>
                <div className={localStyles.content_banner}>
                    <RadioGroup onChange={this.radioChange} size='small' value={this.state.value}>
                        <Radio value={'other'}>
                            <InputNumber
                                disabled={this.state.disabled}
                                placeholder='自定义'
                                min={10}
                                max={999}
                                step={1}
                                precision={0}
                                value={this.state.inputValue}
                                onBlur={this.onBlur}
                                onChange={(value) => this.onChange(value)}
                                style={{ width: 80, marginLeft: 4 }} />
                        </Radio>
                        <Radio value={0}>100%</Radio>
                    </RadioGroup>
                </div>
            </Form.Item>
            <Collapse bordered={false} defaultActiveKey={['0']} expandIcon={(panelProps)=>{
                return <Icon 
                    style={{fontSize:'14px',color:'#556675'}} 
                    type={panelProps.isActive ? 'caret-down':'caret-right'} />
            }}>
            
                {
                    model.data && model.data.map((item, _i) => {
                        return <Panel
                            header={action(item.label, _i)} key={_i + ''} >
                            
                            <Content type='multi' model={model} data={products[item.type]||[]} handleData={handleData} index={index} childrenIndex={_i} />
                        </Panel>
                    })
                }
            </Collapse>
        </div>
    }
}
