import React from 'react'
import {Collapse,Button,Icon,Form, Divider,Modal,message,} from 'antd'
import {connect} from 'dva'
import styles from './index.less'
import ChooseCategory from './ChooseCategory'

const imgUrl = 'https://image.51zan.com/'

const {Panel} = Collapse
const {confirm, warning} = Modal
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
            inputValue: '',
            visible: false
        }
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
    }

    handleClick = (e) =>{
        e.preventDefault()
        const {model,handleData,index} = this.props
        model.data.push({"label":`ICON ${model.data.length + 1}`,type:`${index}_${model.data.length}`, data:[], _data:[]})
        handleData(model,index)
    }
    currentIndex = 0
    handleChooseCategory = (_index) => {
        this.currentIndex =_index
        this.setState({
            visible: true
        })
    } 

    handleModalCancel = () => {
        this.setState({
            visible: false
        })
    }

    handleChosen = (value) => {
        let {model,handleData,index} = this.props
        let _data = model.data
        if(_data.some(i => Array.isArray(i.data) && i.data[0] &&  i.data[0].id === value.id)){
            warning({
                title:'您已经选择过该目录，不能重复选择'
            })
            return
        }
        model.data[this.currentIndex].data = [{
            "cover_url": imgUrl + value.icon_url,
            "id": value.id,
            "name": value.name
        }]
        
        handleData(model,index)
        this.setState({
            visible: false
        })
    }

    render(){
        let { model, index } = this.props
        if(!model.data.length){
            model.data = [{
                label: 'ICON',
                type: `${index}_0`,
                data: []
            }]
        }
        
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
            <Collapse bordered={false} defaultActiveKey={['0']} expandIcon={(panelProps)=>{
                return <Icon 
                    style={{fontSize:'14px',color:'#556675'}} 
                    type={panelProps.isActive ? 'caret-down':'caret-right'} />
            }}>
                {
                    model.data && model.data.map((item, _i) => {
                        return <Panel
                            header={action(item.label, _i)} key={_i + ''} >
                            
                            <div className={styles.add_category}>
                                <Button type='primary' onClick={()=>this.handleChooseCategory(_i)}>{item.data.length === 0 ? '添加类目': '更换类目'}</Button>
                                {
                                    item.data.length > 0 &&
                                    <div className={styles.category_content}>
                                        <img src={item.data[0].cover_url} alt=''></img>
                                        <div>{item.data[0].name}</div>
                                    </div>
                                }
                            </div>
                        </Panel>
                    })
                }
            </Collapse>
            <ChooseCategory visible={this.state.visible} onCancel={this.handleModalCancel} onChosen={this.handleChosen}/>
        </div>
    }
}
