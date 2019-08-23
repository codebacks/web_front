import React from 'react'
import styles from './index.less'
import { Button, Icon, Collapse } from 'antd'

const Panel = Collapse.Panel

export default class extends React.Component {
    constructor (props) {
        super()
        this.state = {
            data: []
        }
    }
    handdleAdd = () => {
    }
    render () {
        const { data } = this.state
        return <div>
            <Button className={styles.default_button} onClick={this.handdleAdd}>
                <Icon type='plus' />
                添加
            </Button>
            <Collapse>
                {data.map((item, index) => {
                    return <Panel key={index}>{item}</Panel>
                })}
            </Collapse>
        </div>
    }
}
 