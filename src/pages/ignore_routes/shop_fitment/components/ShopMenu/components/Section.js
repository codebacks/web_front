import React from 'react'
import styles from '../index.less'
// const default_icon = require('../../../asserts/tuwen.png')

const DefaultModel = (props) =>{
    return <div style={{overflow: 'auto',height:'100%'}}>
        <div className={styles.product_d}
            style={{padding:'8px'}}
            onClick={(e) => { props.onSelect && props.onSelect(props.model, e) }}>
            <h3>{props.model.text}样式</h3>
            <br />
            <div style={{color: '#9EA8B1',padding: '12px 18px'}}>文字内容</div>
        </div>
    </div>
}

export  default DefaultModel
 