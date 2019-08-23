import React from 'react'
import {Button, Modal} from 'antd'
import createFaceHtml from 'components/Face/createFaceHtml'
import styles from './index.scss'

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    handleCancel = () =>{
        this.props.onCancel()
    };

    render() {
        const {messages, visible} = this.props

        return (
            <Modal
                centered
                width = {560}
                visible={visible}
                title="群发内容"
                wrapClassName={styles.messageWrapper}
                onCancel={this.handleCancel}
                footer={[
                    <Button key="cancel" onClick={this.handleCancel}>关闭</Button>
                ]}>
                <ul className={styles.list}>
                    {
                        messages.map((item, index)=>{
                            return  <li className={styles.item} key={index}>
                                <span className={styles.label}>消息{index + 1}：</span>
                                {/* 1文本，3图片 */}
                                <div className={styles.content}>
                                    {
                                        item.type === 1
                                            ? createFaceHtml({tagName: 'div', tagProps: {className: styles.text}, values: item.content})
                                            : <img className={styles.image} src={item.content} alt="image"/>
                                    }
                                </div>
                            </li>
                        })
                    }
                </ul>
            </Modal>
        )
    }
}
