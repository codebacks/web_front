import React, { Fragment } from 'react'
import styles from './index.scss'

export default function ContentTable(props) {
    return (
        <div className={[styles.table_list,props.className].join(' ')} style={props.style}>
            {props.children}
        </div>
    )
}