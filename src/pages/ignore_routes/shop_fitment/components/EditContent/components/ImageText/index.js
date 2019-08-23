import React from 'react'
import {Button,Form,Modal,Input} from 'antd'
import UploadContanier from '../UploadContanier'
import PhoneModal from './PhoneModal'
import {connect} from 'dva'
import TextAreaCount from 'components/TextAreaCount'
import styles from '../Banner/index.less'
import styles_product from '../ProductsModel/index.less'

const {confirm} = Modal

@Form.create()
@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    state={
        visible:false,
        text:'',
        textHead:'',
        phone:''
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const {model,childrenIndex} = nextProps
        let _index = 0
        if(childrenIndex && childrenIndex !==0){
            _index = childrenIndex
        }
        if(model.data[_index] && model.data[_index].data[0]){
            let o = {}
            o.phone = model.data[_index].data[0] && model.data[_index].data[0].phone
            return o
        }
        return null
    }
    onClick = (e) => {
        e.preventDefault()
        this.setState({
            visible:true,
            phone:this.state.phone
        })
    }
    onClose= () => {
        this.setState({
            visible:false,
            phone:''
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
        handleData && handleData(model,index)
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
        
        handleData && handleData(model,index)
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
                handleData(model,index)
            },
            onCancel() {}
        })
        
    }
    textAreaCountBlur = (e,type) =>{
        const {model,handleData,index} = this.props
        let value = e.target.value
        if(!model.data[0].data[0]){
            model.data[0].data[0] = {}
        }
        if(type){
            model.data[0].data[0][type] = value
        } else {
            model.data[0].data[0].text = value
        }
        handleData(model,index)
    }
    textAreaCountChange = (e,type) =>{
        let value = e.target.value
        let o = {}
        if(type){
            o[type] = value
        } else {
            o.text = value
        }
        this.props.form.setFieldsValue({ ...o })
        // this.setState({ ...o })
    }
    onOk = (phone)=>{
        const {model,handleData,index} = this.props
        if(!model.data[0].data[0]){
            model.data[0].data[0] = {}
        }
        model.data[0].data[0].phone = phone
        handleData(model,index)
    }
    render(){
        const {model,index} = this.props
        const { getFieldDecorator } = this.props.form
        const {products} = this.props.shop_fitment
        let I = 0
        let _data = model.data[I] || []
        if(_data.data) _data = _data.data
        let data = products[ _data[0] && _data[0].type] || []
        if(!model.data[0]){
            model.data = [{
                label: 'label',
                type: `${index}_0`,
                _data: [],
                data: []
            }]
        }
        return <div>
            <UploadContanier
                form={this.props.form}
                {...this.props}
                getFile={this.getFile}
                data={_data}
                index={index}
                fileList={_data[0] && _data[0].img_url ? [{
                    uid: '-1',
                    name: _data[0].img_url,
                    status: 'done',
                    url: _data[0].img_url
                }] : []} />
            <div className={styles_product.product_content}>
                <div className={styles.lable} style={{width:92}}>文案编辑：</div>
                <div className={styles.lable_right} >
                    {
                        getFieldDecorator('textHead',{
                            initialValue:_data[0] && _data[0].textHead
                        })(<Input 
                            // value={this.state.textHead}
                            row={2}
                            onChange={(value)=>this.textAreaCountChange(value,'textHead')}
                            onBlur={(value)=>this.textAreaCountBlur(value,'textHead')}
                            maxLength={15}
                            style={{width:272}} />)
                    }
                </div>
            </div>
            <div className={styles_product.product_content}>
                <div className={styles.lable} style={{width:92}}></div>
                <div className={styles.lable_right} >
                    {
                        getFieldDecorator('text',{
                            initialValue:_data[0] && _data[0].text
                        })(
                            <TextAreaCount 
                                // value={this.state.text} 
                                onChange={(value)=>this.textAreaCountChange(value)} 
                                onBlur={(value)=>this.textAreaCountBlur(value)} 
                                limitSize={20} 
                                style={{width:272}}/>
                        )
                    }
                </div>
            </div>
            <br />
            <div className={styles_product.product_content}>
                <div className={styles.lable} style={{width:92}}>添加链接：</div>
                {/* <Button type='primary' onClick={this.onClick}>更换商品</Button> */}
                <div className={styles.lable_right} >  <Button type='primary' onClick={this.onClick}>拨打电话</Button></div>
            
            </div>
            <br />
            {_data[0] && _data[0].phone?<div className={styles_product.product_content}>
                <div className={styles.lable} style={{width:92}}>  </div>
                <div className={styles.lable_right} >  <Input value={_data[0] && _data[0].phone} style={{width:'100%'}} disabled={true} /> </div>
            </div>:null}
            
            
            <PhoneModal 
                phone={this.state.phone}
                visible={this.state.visible} 
                onOk={this.onOk} 
                onCancel={this.onClose} />
        </div>
    }
}
