import React from 'react'
// import {Collapse,Button,Icon,Form, Input, Divider,Modal,message} from 'antd'
import {connect} from 'dva'
import ProductsModel from '../ProductsModel'
import styles from '../ProductCollapse/index.less'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    render(){
        let { model, index ,handleData} = this.props
        if(!model.data.length){
            let mark
            switch (model.active) {
                case 'pingtuan':
                    mark = 1
                    break
                case 'tejia':
                    mark = 2
                    break
                case 'tuijian':
                    mark = 3
                    break
                default:
                    break
            }
            let text = ''
            if(model.description)text = model.description
            model.data = [{
                label: text,
                type:`${index + parseInt(Math.random()*10000)}_${0}`,
                data:[{},{}],
                mark: mark
            },]
        }
        const { products } =this.props.shop_fitment
        return <div className={styles.product_content}>
            <ProductsModel model={model} data={products[model.data[0].type]} handleData={handleData} index={index} />
        </div>
    }
}
