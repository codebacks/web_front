import React from 'react'
import { Button, Divider , Modal} from 'antd'
import ProductDataModel from '../ProductDataModel'
import {connect} from 'dva'
import styles from './index.less'

const {confirm} = Modal

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    state= {
        productIds:[],
        visible:false,
        productList:[]
    }
    onClick = () =>{
        this.setState({
            visible:true
        })
    }
    onClose= () =>{
        this.setState({
            visible:false
        })
    }
    getProductList = (productIds) => {
        const {model,index,childrenIndex,handleData} = this.props
        let _index = 0
        if(childrenIndex && childrenIndex !==0){
            _index = childrenIndex
        }
        
        model.data[_index].data = productIds
        let param = model.data[_index]
        this.props.dispatch({
            type:'shop_fitment/getProductList',
            payload: {
                main: [{
                    type: param.type,
                    mark: param.mark,
                    data: param.data
                }]
            },
            callback:()=>{
                this.onClose()
            }
        })
        handleData(model,index,true)
    }
    getProductIds = () =>{
        let {model,childrenIndex,type,data} = this.props
        let I = 0
        if(type === 'tabs'){
            I = childrenIndex
        }
        let ids =  (model.data[I] && model.data[I].data) || []
        let _ids = []
        data && data.forEach(item => {
            if(ids.indexOf(item.id)>-1){
                _ids.push(item.id)
            }
        })
        return _ids
    }
    
    handleProductIds = (productIds) =>{
        this.getProductList(productIds)
    }
    
    onMove = (item,_type,e,i) => {
        e.preventDefault()
        const {model,childrenIndex,type,handleData,index} = this.props
        let ids = this.getProductIds()
        let _index = ids.indexOf(item.id)
        if(_index > -1){
            let I = 0
            if(type === 'tabs'){
                I = childrenIndex
            }
            let data = model.data[I].data
            let current = data[_index]
            let pos = 0
            if(_type === 'up'){
                let prev = data[_index - 1]
                if(prev){
                    model.data[I].data[ _index - 1] = current
                    model.data[I].data[_index] = prev
                    pos = -1
                }
            }else{
                let next = data[_index+1]
                if(next){
                    model.data[I].data[_index+1] = current
                    model.data[I].data[_index] = next
                    pos = 1
                }
            }
            this.props.dispatch({
                type:'shop_fitment/moveProducts',
                payload:{
                    type:model.data[I].type,
                    index:i,
                    pos
                }
            })
            handleData(model,index)
        }
    }
    render(){

        function onDelete(item,e){
            const {model,childrenIndex,type,handleData,index} = this.props
            let ids = this.getProductIds()
            let _index = ids.indexOf(item.id)
            if(_index > -1){
                let I = 0
                if(type === 'tabs'){
                    I = childrenIndex
                }
                let _this = this
                confirm({
                    title: '删除此数据无法恢复，是否确认删除?',
                    onOk() {
                        model.data[I].data.splice(_index,1)
                        _this.props.dispatch({
                            type:'shop_fitment/clearProducts',
                            payload:{
                                type:model.data[I].type,
                                id:item.id
                            }
                        })
                        handleData(model,index)
                    },
                    onCancel() {}
                })
                
            }
        }
        // const {productList} = this.state
        let { data,model} = this.props
        // let { products } = this.props.shop_fitment
        let productIds = this.getProductIds()
        return <div className={styles.product_content}>
            <Button type="primary" onClick={this.onClick}>添加商品</Button>
            <ul>
                {
                    data && data.map((item, i) => <li key={i}>
                        <img src={item.cover_url} alt='' />
                        <div className={styles.product_right}>
                            <h3>{item.name}</h3>
                            <div className={styles.lable}>
                                <span onClick={(e)=> onDelete.call(this,item,e)} >删除</span>
                                <Divider style={{ marginTop: 5 }} type="vertical" />
                                <span onClick={(e)=>this.onMove(item,'up',e,i)}>上移</span>
                                <Divider style={{ marginTop: 5 }} type="vertical" />
                                <span onClick={(e)=>this.onMove(item,'down',e,i)}>下移</span>
                            </div>
                        </div>
                    </li>)
                }
            </ul>
            <ProductDataModel 
                visible={this.state.visible} 
                productIds={productIds||[]} 
                data={data} 
                model={model}
                onClose={this.onClose} 
                onOk={this.handleProductIds} />
        </div>
    }
}
