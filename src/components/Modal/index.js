import React, {PureComponent} from 'react'
import {Modal} from 'antd'
import styles from './index.less'

export default class Modals extends PureComponent {
    render() {
        const prop = {
            ...this.props,
            title: (
                <div>
                    {this.props.title}
                    <span className={styles.subtitle}>{this.props.subTitle}</span>
                </div>
            ),
        }

        return (
            <Modal {...prop}>
                {this.props.children}
            </Modal>
        )
    }
}