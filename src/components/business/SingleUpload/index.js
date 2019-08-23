/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import {
    Modal,
    Icon,
} from 'antd'
import styles from './index.less'
// import PropTypes from 'prop-types'
import QiniuUpload from 'components/QiniuUpload'
import _ from "lodash"

export default class Index extends React.PureComponent {
    static extra = QiniuUpload.extra

    constructor(props) {
        super(props)
        this.state = {
            previewImage: '',
            previewVisible: false,
        }
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    handleShowPreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        })
    }

    handleCancelPreview = () => {
        this.setState({
            previewImage: '',
            previewVisible: false,
        })
    }

    render() {
        const props = this.props
        const {previewImage, previewVisible} = this.state

        const uploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">点击上传</div>
            </div>
        )

        return (
            <div
                className={styles.singleUpload}
            >
                <QiniuUpload
                    {...props}
                    onPreview={this.handleShowPreview}
                    listType={'picture-card'}
                >
                    {_.get(props, 'fileList.length', 0) === 0 ? uploadButton : null}
                </QiniuUpload>
                <Modal
                    visible={previewVisible}
                    footer={null}
                    onCancel={this.handleCancelPreview}
                >
                    <img
                        style={{width: '100%'}}
                        src={previewImage}
                        alt="image"
                    />
                </Modal>
            </div>
        )
    }
}
