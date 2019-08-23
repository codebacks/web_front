import React from 'react'
import {Input,Form} from 'antd'
// import UploadContanier from '../UploadContanier'
// import PhoneModal from './PhoneModal'
import {connect} from 'dva'
// import TextAreaCount from 'components/TextAreaCount'
import styles from '../Banner/index.less'
import styles_product from '../ProductsModel/index.less'

// dan 20 duo 21
@connect(({shop_fitment}) => ({
    shop_fitment
}))
@Form.create()
export default class extends React.Component {
    state = {
        text: ''
    }
    textAreaCountBlur = (e) =>{
        const {model,handleData,index} = this.props
        let value = e.target.value
        if(!model.data[0].data[0]){
            model.data[0].data[0] = {}
        }
        
        model.data[0].data[0].text = value
        handleData(model,index)
    }
    textAreaCountChange = (e) =>{
        let value = e.target.value
        this.props.form.setFieldsValue({ text: value })
    }
    render(){
        const {model,index} = this.props
        let I = 0
        let _data = model.data[I] || []
        if(_data.data) _data = _data.data
        if(!model.data[0]){
            model.data = [{
                label: 'label',
                type: `${index}_0`,
                data: []
            }]
        }
        const { getFieldDecorator } = this.props.form
        return <div className={styles_product.product_content}>
            <div className={styles.lable} style={{ width: 92 }}>文案编辑：</div>
            <div className={styles.lable_right} >
                {
                    getFieldDecorator('text',{
                        initialValue:_data[0] && _data[0].text
                    })(<Input
                        onChange={(value) => this.textAreaCountChange(value)} 
                        onBlur={(value) => this.textAreaCountBlur(value)}
                        maxLength={10}
                        style={{ width: 275 }} />)
                }
                
            </div>
        </div>
    }
}
