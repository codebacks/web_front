import React from 'react'
import {Button,Form,Divider,Modal} from 'antd'
import UploadContanier from '../UploadContanier'
import ProductDataModel from '../ProductDataModel'
import {connect} from 'dva'
import styles from './index.less'
import styles_product from '../ProductsModel/index.less'

const {confirm} = Modal

@Form.create()
@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    state={
        visible:false
    }
    onClick = (e) => {
        e.preventDefault()
        this.setState({
            visible:true
        })
    }
    onClose= () => {
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
        model.data[_index]._data = productIds
        // if(model.data[_index]._data)
        let param = model.data[_index]
        this.props.dispatch({
            type:'shop_fitment/getProductList',
            payload: {
                main: [{
                    type: param.type,
                    data: param._data
                }]
            },
            callback:() => {
                this.onClose()
            }
        })
        handleData && handleData(model,index,true)
    }
    handleProductIds = (productIds) =>{
        this.getProductList(productIds)
    }
    getFile = (fileList) =>{
        const {model,index,childrenIndex,handleData,type} = this.props
        let I = 0
        if(type === 'multi'){
            I = childrenIndex
        }
        if(!model.data[I].data[0]){
            model.data[I].data[0] = {}
        }
        if(Array.isArray(fileList)){
            model.data[I].data[0].img_url = fileList[0] && fileList[0].url
        }else {
            model.data[I].data[0].img_path = fileList
        }
        
        handleData && handleData(model,index,true)
    }
    onDelete = (item,e) => {
        e.preventDefault()
        const {model,childrenIndex,type,handleData,index} = this.props
        let I = 0
        if(type === 'multi'){
            I = childrenIndex
        }
        
        let _this = this
        confirm({
            title: '删除此数据无法恢复，是否确认删除?',
            onOk() {
                _this.props.dispatch({
                    type:'shop_fitment/clearProducts',
                    payload:{
                        type:model.data[I].type
                    }
                })
                model.data[I]._data = []
                handleData(model,index,true)
            },
            onCancel() {}
        })
        
    }
    render(){
        const {model,childrenIndex,data,type} = this.props
        let I = 0
        if(type === 'multi'){
            I = childrenIndex
        }
        let _data = model.data[I].data
        return <div>
            <UploadContanier
                form={this.props.form}
                {...this.props}
                getFile={this.getFile}
                data={_data}
                fileList={_data[0] && _data[0].img_url ? [{
                    uid: '-1',
                    name: _data[0].img_url,
                    status: 'done',
                    url: _data[0].img_url
                }] : []} />
            <div className={styles_product.product_content}>
                <div className={styles.lable} >添加链接：</div>
                <div className={styles.lable_right} > <Button type='primary' onClick={this.onClick}>更换商品</Button> </div>
                <ul>
                    {
                        data && data.map((item, i) => <li key={i}>
                            <img src={item.cover_url} alt='' />
                            <div className={styles_product.product_right}>
                                <h3>{item.name}</h3>
                                <div className={styles_product.lable}>
                                    <span style={{textAlign: 'right'}} onClick={(e)=>this.onDelete(item,e)} >删除</span>
                                </div>
                            </div>
                        </li>)
                    }
                </ul>
            </div>

            <ProductDataModel 
                visible={this.state.visible} 
                productIds={[]}
                data={data} 
                model={model}
                onClose={this.onClose} 
                onOk={this.handleProductIds} />
        </div>
    }
}