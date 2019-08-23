'use strict'

import React from 'react'
import {Popover, Icon} from 'antd'
import styles from './index.scss'

class Desc extends React.PureComponent {
    render() {
        const {desc} = this.props
        const content = <div className={styles.desc}>
            <p className={styles.title}>列表数据说明</p>
            {
                desc.map((item, index)=> {
                    return <div key={index} className={styles.row}>
                        <span className={styles.label}>{item.label}：</span>{item.text}
                    </div>
                })
            }
        </div>

        const questionStyle = {
            color: '#4391FF',
            marginLeft: '4px',
            paddingLeft: '12px'
        }

        return (
            <Popover placement="bottomLeft"
                title={null}
                content={content}
            >
                <Icon type="question-circle" theme="outlined" style={questionStyle}/>
            </Popover>
        )
    }
}
export default Desc
