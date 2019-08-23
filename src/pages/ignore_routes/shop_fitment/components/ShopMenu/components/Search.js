import React from 'react'
import styles from '../index.less'
import { Icon } from 'antd'

const DefaultModel = (props) =>{
    return <div className={styles.default} 
        style={{height:116}}
        onClick={(e)=>{props.onSelect && props.onSelect(props.model,e)}}>
        <h3>{props.model.text}默认样式</h3>
        <div className={styles.img_search}>
            <Icon type='search' style={{fontSize: '15px', marginRight: '4px'}} />
            <span>文字</span>
        </div>
    </div>
}

export  default DefaultModel
 