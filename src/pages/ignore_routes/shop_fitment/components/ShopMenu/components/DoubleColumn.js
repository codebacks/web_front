import React from 'react'
import styles from '../index.less'
const biserial = require('../../../asserts/biserial.png')
// import Product from '../../Product'

const DefaultModel = (props) =>{
    return <div style={{overflow: 'auto',height:'100%'}}>
        <div className={styles.product_d}
            style={{padding:'8px'}}
            onClick={(e) => { props.onSelect && props.onSelect(props.model, e) }}>
            <h3>{props.model.text}样式</h3>
            <img src={biserial}  alt='' />
        </div>
    </div>
}

export  default DefaultModel
 