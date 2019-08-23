import React from 'react'
import styles from '../index.less'
const default_icon = require('../../../asserts/line.svg')

const DefaultModel = (props) =>{
    return <div className={styles.default} 
        style={{height:116}}
        onClick={(e)=>{props.onSelect && props.onSelect(props.model,e)}}>
        <h3>{props.model.text}默认样式</h3>
        <div className={styles.img_line}>
            <img className={styles.line} src={default_icon} alt='' />
        </div>
    </div>
}

export  default DefaultModel
 