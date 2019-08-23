import React from 'react'
import {connect} from 'dva'
import Container from '../Container'
import Product from '../Product'
import styles from '../TabsComponent/index.less'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends React.Component {
    state = {
        activeKey: 0
    }
    onChange = (activeKey) => {
        this.setState({ activeKey })
    }
    render() {
        let { model ,index} = this.props
        let { data ,productType} = model
        const {activeKey} = this.state
        const { products, theme } =this.props.shop_fitment
        if(model.active && data[0]){
            data[0].label = model.text
        }else if(!data[0]){
            data = [{
                label: model.description || model.text,
                type:`${index}_0`,
                data:[]
            }]
        }
        
        return <Container {...this.props}>
            <div className={`${styles.tabs } ${theme.type !=='default' ? `hz_theme_tabs_${theme.type}`:''}`}>
                <ul className={styles.tabs_label}>
                    {
                        data.map((i, index) => <li
                            key={index}
                            className={`${index === activeKey && data.length > 1 ? `${styles.active} active` : index === activeKey ? `${styles.active_bg} active_bg`  :''}`}
                            onClick={(e) => { this.onChange(index) }}>
                            {i.label}
                        </li>)
                    }
                </ul>
                <ul className={styles.tabs_content} style={{ width: data.length * 100 + '%', transform: `translateX(${activeKey > -1 ? -activeKey * (100 / data.length) + '%' : '0'})` }}>
                    {
                        data.map((item, index) => <li key={index}>
                            <Product theme={theme} data={products[item.type] || []} model={model} key={`k_${index}`} type={productType} active={model.active}/>
                        </li>)
                    }
                </ul>
            </div>
        </Container>
    }
}
