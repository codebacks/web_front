import React from "react"
import { Modal, Row, Col, Icon, message } from "antd"
import styles from './index.less'

export default class extends React.Component {
    img = null
    changeDownsize = (sizeType) => {
        let imgUrl = this.props.imgUrl
        let downloadUrl = ''
        let downloadType = {
            1:'small_size_qrcode_url',
            2:'medium_size_qrcode_url',
            3:'large_size_qrcode_url'
        }
        if(imgUrl && imgUrl.small_size_qrcode_url){
            downloadUrl = imgUrl[downloadType[sizeType]]
        }
        window.open(downloadUrl,'_blank')
    }
  
    handleCancel = () => {
        this.props.onCancel && this.props.onCancel()
    }

    render() {
        const { visible } = this.props
        return <Modal
            title="下载二维码"
            visible={visible}
            footer={null}
            width={600}
            onCancel={this.handleCancel}
        >
            <div style={{ textAlign: 'center', paddingBottom: '20px' }}>

                <div className={styles.showDownloadType}>
                    <Row type="flex" justify="space-between" align="middle" className={styles.mb10}>
                        <Col span={4} className={styles.downsizeText}>小尺寸</Col>
                        <Col span={16}>
                            <p>适用于屏幕类，宣传册类</p>
                            <p>边长8cm（258*258px）</p>
                        </Col>
                        <Col span={4}>
                            <Icon type="download" theme="outlined" style={{ fontSize: '28px', color: '#4391FF' }} className={styles.downloadIcon} onClick={() => { this.changeDownsize(1) }} />
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between" align="middle" className={styles.mb10}>
                        <Col span={4} className={styles.downsizeText}>中尺寸</Col>
                        <Col span={16}>
                            <p>适用于海报，展架等</p>
                            <p>边长15cm（430*430px）</p>
                        </Col>
                        <Col span={4}>
                            <Icon type="download" theme="outlined" style={{ fontSize: '28px', color: '#4391FF' }} className={styles.downloadIcon} onClick={() => { this.changeDownsize(2) }} />
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col span={4} className={styles.downsizeText}>大尺寸</Col>
                        <Col span={16}>
                            <p>适用于幕布，大型广告等</p>
                            <p>边长50cm（1417*1417px）</p>
                        </Col>
                        <Col span={4}>
                            <Icon type="download" theme="outlined" style={{ fontSize: '28px', color: '#4391FF' }} className={styles.downloadIcon} onClick={() => { this.changeDownsize(3) }} />
                        </Col>
                    </Row>
                </div>
            </div>
        </Modal>
    }
}