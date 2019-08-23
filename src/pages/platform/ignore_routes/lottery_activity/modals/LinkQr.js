import React from 'react'
import { Modal, Input, Button, Popover, Row, Col, Icon, message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from '@/components/QrCode'

import styles from "../index.less"

const QR_DOWNLOAD_SIZES = [{
    text: "小尺寸",
    description: <div><p>适用于屏幕类，宣传册类</p> <p>边长8cm（258*258px）</p></div>,
    size: 258
}, {
    text: "中尺寸",
    description: <div><p>适用于海报，展架等</p> <p>（430px*430px）</p></div>,
    size: 430
}, {
    text: "大尺寸",
    description: <div><p>适用于幕布，大型广告等</p> <p>边长50cm（1417*1417px）</p></div>,
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
            title,
            isShowCopy
        } = this.props

        return (
            <Modal
                title={title || "链接二维码"}
                visible={visible}
                footer={null}
                width={900}
                onCancel={this.onCancelHandler}
            >
                <div style={{ textAlign: 'center', paddingBottom: '32px',overflow:'auto' }}>
                    <div className={styles.left}>
                        <QRCode useDevicePixelRatio={false} value={url} className={styles.qrUrlImg} />
                    </div>
                    <div className={styles.right}>
                        <div style={{ marginBottom: '24px' }}>
                            复制短连接：<Input readOnly className={styles.shortLink} value={url} />
                            <CopyToClipboard
                                text={url}
                                onCopy={() => { message.success('复制链接成功！') }}
                            >
                                <Button type="primary" style={{ verticalAlign: 'middle', width: '80px',marginLeft:8 }}>复制</Button>
                            </CopyToClipboard>
                            
                        </div>
                        <div className={styles.downloadSize}>
                            {
                                QR_DOWNLOAD_SIZES.map((item, index) => {
                                    return (<Row key={index} className={styles.downloadSizeType}>
                                        <Col span={4} >{item.text}</Col>
                                        <Col span={16}>
                                            {item.description}
                                        </Col>
                                        <Col span={4}>
                                            <span className={styles.downloadSizeBtn} title='下载二维码' onClick={(e) => this.download(e)}>
                                                <Icon type="download" theme="outlined" />
                                                <span style={{ display: 'none' }}>
                                                    <QRCode useDevicePixelRatio={false} size={item.size} value={url} />
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>)
                                })
                            }
                        </div>
                    </div>
                    
                </div>
            </Modal>
        )
    }
}
