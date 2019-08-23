import React from 'react'
import { Modal, Input, Button, Popover, Row, Col, Icon, message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from '../../QrCode'
import styles from "./index.less"

import DownloadSvg from '../../../assets/font_icons/download.svg'

const QR_DOWNLOAD_SIZES = [{
    text: "小尺寸",
    description: '适用于屏幕类、宣传册类边长8cm（258*258px）',
    size: 258
}, {
    text: "中尺寸",
    description: '适用于海报类、展架类边长15cm（430*430px）',
    size: 430
}, {
    text: "大尺寸",
    description: '适用于幕布、大型广告边长50cm（1417*1417px）',
    size: 1417
}]
export default class LinkQr extends React.PureComponent {


    _qrContainer = null

    onCancelHandler = () => {
        const { onClose } = this.props

        onClose && onClose()
    }

    download = (e) => {
        const canvas = e.currentTarget.querySelector('canvas')
        this.canvasDownload(canvas)
    }

    /*下载二维码*/
    canvasDownload = (canvas) => {
        const { name } = this.props
        var type = 'png'
        var dataurl = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream")
        var filename = `${name}二维码_${(new Date()).getTime()}.${type}`
        this.saveFile(dataurl, filename)
    }

    static defaultProps = {
        isShowCopy: true
    }

    /**
    * 在本地进行文件保存
    * @param  {String} data     要保存到本地的图片数据
    * @param  {String} filename 文件名
    */
    saveFile = (data, filename) => {
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
        save_link.href = data
        save_link.download = filename

        var event = document.createEvent('MouseEvents')
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        save_link.dispatchEvent(event)
    }



    render() {
        const {
            visible,
            url,
            isShowCopy
        } = this.props

        const qrUrlContent = (
            <div>
                <QRCode useDevicePixelRatio={false} value={url} className={styles.qrUrlImg} />
            </div>
        )
        return (
            <Modal
                title="链接二维码"
                visible={visible}
                footer={null}
                width={480}
                onCancel={this.onCancelHandler}
            >
                <div>
                    <Row hidden={isShowCopy} style={{ marginBottom: '24px' }} type="flex" justify="start" align="middle">
                        <Col span={5} className={styles.itemTitle}>
                            复制短连接：
                        </Col>
                        <Col span={19}>
                            <Input readOnly className={styles.shortLink} value={url} />
                            <CopyToClipboard
                                text={url}
                                onCopy={() => { message.success('复制链接成功！') }}
                            >
                                <Button type="primary" style={{ verticalAlign: 'middle', width: '80px' ,marginLeft:'-1px'}} ghost>复制</Button>
                            </CopyToClipboard>
                            <Popover placement="bottomLeft" content={qrUrlContent}>
                                <img  alt="" src={require('../../../assets/icons/qrcode.svg')} className={styles.qrcodeIcon} />
                            </Popover>
                        </Col>
                    </Row>
                    <Row className={styles.downloadSize} type="flex" justify="start" align="top">
                        <Col span={5} className={styles.itemTitle}>
                            选择尺寸：
                        </Col>
                        <Col span={19}>
                            {
                                QR_DOWNLOAD_SIZES.map((item, index) => {
                                    return (<Row key={index} className={styles.downloadSizeType} >
                                        <Col span={22}>
                                            <div className={styles.size}>{item.text}</div>
                                            <div className={styles.description}>{item.description}</div> 
                                        </Col>
                                        <Col span={2} style={{textAlign:'right'}}>
                                            <span className={styles.downloadSizeBtn} title='下载二维码' onClick={(e) => this.download(e)}>
                                                <Icon component={DownloadSvg} style={{fontSize:'16px'}}/>
                                                <span style={{ display: 'none' }}>
                                                    <QRCode useDevicePixelRatio={false} size={item.size} value={url} />
                                                </span>
                                            </span>
                                        </Col>
                                        
                                    </Row>)
                                })
                            }
                        </Col>
                    </Row>
                   
                </div>
            </Modal>
        )
    }
}