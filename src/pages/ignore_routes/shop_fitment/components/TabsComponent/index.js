import React from 'react'
import {connect} from 'dva'
import Container from '../Container'
import Product from '../Product'
import styles from './index.less'

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
        if(model.active && (!data || !data[0])){
            data = [{
                label:model.text,
                type:model.data[0].type? model.data[0].type : `${index}_${0}`,
                data:[]  
            }]
        }else if(!data || !data.length){
            data = [{
                label:'文字',
                type:`${index}_${0}`,
                data:[]  
            },{
                label:'文字',
                type:`${index}_${1}`,
                data:[]
            },{
                label:'文字',
                type:`${index}_${2}`,
                data:[]
            }]
        }

        const { products , theme} =this.props.shop_fitment

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
                            <Product theme={theme}  data={products[item.type] || []} type={productType} active={model.active}/>
                        </li>)
                    }
                </ul>
            </div>
        </Container>
    }
}
