import React from 'react'
import styles from '../index.less'
const d = require('../../../asserts/product_d.png')
const c = require('../../../asserts/product_c.png')
const category = require('../../../asserts/category.png')
// import Product from '../../Product'

const DefaultModel = (props) =>{
    return <div style={{overflow: 'auto',height:'100%'}}>
        <div className={styles.product_d}
            style={{padding:'8px'}}
            onClick={(e) => { props.onSelect && props.onSelect({...props.model,...{name:'Category'}}, e) }}>
            <h3>{props.model.text}样式</h3>
            <img src={category}  alt='' />
        </div>

        {/* <div className={styles.product_d}
            onClick={(e) => { props.onSelect && props.onSelect({...props.model,...{name:'ProductCross',productType:'cross', template: 'doubleTabColumn'}}, e) }}>
            <h3>{props.model.text}样式二</h3>
            <img src={d}  alt='' />
            
        </div>
        <div className={styles.product_d}
            onClick={(e) => { props.onSelect && props.onSelect({...props.model,...{name:'ProductDirection',productType:'direction', template: 'singleTabColumn'}}, e) }}>
            <h3>{props.model.text}样式三</h3>
            <img src={c} alt='' />
        </div> */}

    </div>
}

export  default DefaultModel
 