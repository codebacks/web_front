/*
 * @Author: sunlzhi 
 * @Date: 2018-11-13 17:31:05 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-13 20:10:04
 */

import React, {Component} from 'react'
import {Modal ,Icon} from 'antd'
import styles from '../index.less'

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    // 页面加载调用
    componentDidMount() {
    }

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    render() {
        const invoice_url_arr = this.props.record.invoice_url_arr
        const invoice_url_li = invoice_url_arr && invoice_url_arr.map((url, index) => <li key={index}><a href={'https://document.51zan.com/'+url} target="_blank" rel="noopener noreferrer"><Icon type="file-pdf"/> {url.split('/')[url.split('/').length-1]}</a></li>)

        return <Modal
            title="下载发票"
            width={540}
            centered
            className={styles.PDFpreview}
            footer={null}
            visible={this.props.visible}
            destroyOnClose={true}
            onCancel={this.handleCancel}>
            <div>
                <ul className={styles.logisticsInfoList}>
                    {invoice_url_li}
                </ul>
            </div>
        </Modal>
    }
}
