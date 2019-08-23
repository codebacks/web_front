import React from 'react'
import {connect} from 'dva'
import Content from '../Banner/Content'
import styles from '../ProductCollapse/index.less'
@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    render(){
        let { model, index ,handleData} = this.props
        if(!model.data.length){
            model.data = [{
                label: 'label',
                type: `${index+ parseInt(Math.random()*10000)}_0`,
                _data: [],
                data: []
            }]
        }
        const { products } =this.props.shop_fitment
        return <div className={styles.product_content}>
            <Content
                model={model}
                data={products[model.data[0] && model.data[0].type]||[]}
                handleData={handleData}
                index={index} />
        </div>
    }
}
