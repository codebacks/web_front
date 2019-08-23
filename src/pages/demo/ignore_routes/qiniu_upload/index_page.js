import React from 'react'
import {
    Icon,
    Modal,
} from 'antd'
import Upload from './components/QiniuUpload'
import styles from './index.less'

export default class QiniuUploadTest extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: [],
        }
    }



    handleCancel = () => this.setState({previewVisible: false})

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        })
    }

    handleChange = ({fileList}) => this.setState({fileList})

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            resolve()
        })
    }

    render() {
        const {previewVisible, previewImage, fileList} = this.state
        const uploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">Upload</div>
            </div>
        )

        return (
            <div className={styles.container}>
                <h1>七牛上传DEMO</h1>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    beforeUpload={this.beforeUpload}
                    multiple={true}
                >
                    {uploadButton}
                </Upload>
                <Modal
                    visible={previewVisible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img
                        alt="example"
                        style={{width: '100%'}}
                        src={previewImage}
                    />
                </Modal>
            </div>
        )
    }
}
