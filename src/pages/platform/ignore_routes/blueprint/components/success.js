/**
 **@Description:晒图红包-创建/编辑活动
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { Button, Icon, Input, message } from 'antd'
import styles from "../index.less"
import _ from 'lodash'
import LinkQr from '../modals/linkQr'
import { getQrCodeUrl } from '../../../services/blueprint'
import router from 'umi/router'
import { connect } from 'dva'
import QRCode from 'qrcode.react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import DownloadSvg from '../../../../../assets/font_icons/download.svg'

@connect(({ base, platform_blueprint }) => ({
    base, platform_blueprint
}))
export default class Create_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            downloadVisible: false,
        }
    }

    showDownloadConfirm = () => {
        this.setState({
            downloadVisible: true
        })
    }

    handleDownloadCancel = (e) => {
        this.setState({
            downloadVisible: false
        })
    }

    generateDownloadUrl = (id) => {
        return getQrCodeUrl(`/public/packets/activities/${id}/fans`)
    }

    goList = () => {
        router.push('/platform/blueprint')
    }

    render() {
        const { downloadItemID, downloadItemName } = this.props
        return (
            <div>
                <div className={styles.success}>
                    <div className={styles.successContent}>
                        <div className={styles.successTitle}>
                            <Icon type="check-circle" theme="outlined" className={styles.successIcon} />
                            <span >活动保存成功！</span>
                        </div>
                        <div className={styles.successDeatil}>活动启用后会自动获取推广链接及推广二维码，请确保付款公众号/红包余额充足！若余额不足，审核时将无法发放红包，请及时补充资金 。</div>

                        <div className={styles.downQrcode}>
                            <p>微信扫一扫，查看/参与活动</p>
                            <QRCode value={this.generateDownloadUrl(downloadItemID)} className={styles.downQrcodeImg} />
                            <Button className='hz-margin-small-bottom' onClick={() => { this.showDownloadConfirm(downloadItemID, downloadItemName) }}>
                                <Icon component={DownloadSvg} style={{ fontSize: '16px' }}/>下载二维码</Button>
                        </div>
                    </div>

                    <div className={styles.linkAddresss}>
                        <div className={styles.link}>
                            <p>活动链接地址：</p>
                            <Input readOnly className={styles.shortLink} value={this.generateDownloadUrl(downloadItemID)} />
                        </div>
                        <CopyToClipboard
                            text={this.generateDownloadUrl(downloadItemID)}
                            onCopy={() => { message.success('复制链接成功！') }}
                        >
                            <Button type="primary" ghost>复制</Button>
                        </CopyToClipboard>
                    </div>
                    <Button type="primary" onClick={this.goList} className={styles.successBack}>返回活动列表</Button>
                </div>
                <LinkQr url={this.generateDownloadUrl(downloadItemID)} visible={this.state.downloadVisible} name={downloadItemName} onClose={this.handleDownloadCancel} />
            </div >
        )
    }
}


