import React from 'react'
import { Collapse } from 'antd'
import classNames from 'classnames'
import styles from './index.less'
const Panel = Collapse.Panel

export default class Index extends React.Component { 
    render () { 
        const { title,style,className } = this.props
        return (
            <Collapse defaultActiveKey={['1']} bordered={false} style={{ ...style }} className={classNames(styles.collapse,className)}>
                <Panel header={title} key="1" style={{border: 0}}>
                    {this.props.children}
                </Panel>
            </Collapse>
        )
    }
}