import React from 'react'
import {connect} from 'dva'
import Container from '../Container'
import Product from '../Product'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    render() {
        let { model ,index} = this.props
        let { data ,productType} = model
        let type = data[0] && data[0].type 
        const { products, theme } =this.props.shop_fitment

        return <Container {...this.props}>
            {/* products[item.type] */}
            <Product key={index} theme={theme}  data={ products[type]} type={productType} />
        </Container>
    }
}
