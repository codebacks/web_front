import React, {Component, Fragment} from 'react'
import {Button, Checkbox, Icon, notification, message} from 'antd'
import QiniuUpload from 'components/QiniuUpload'
import config from 'wx/common/config'
import helper from "wx/utils/helper"
import Edit from '../Edit'
import Info from '../Info'
import UploadingList from '../UploadingList'
import utils from '../../utils'
import {imageType, imageMaxSize} from '../../config'

import styles from './index.scss'

const {DefaultImage, materialType} = config

export default class Image extends Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    componentDidMount() {}

    componentWillUnmount() {}

    getInitialState = () => {
        return {
            editVisible: false,
            record: {},
            parent: '',
            fileList: [],
        }
    }

    handleShowEdit = (type, record) => {
        this.setState({
            editVisible: true,
            record: record,
            parent: `materialLibrary${type}Edit${record.id}`,
        })
    }

    handleEditOk = (record, payload) => {
        this.handleHideEdit()
        this.props.onEditOk(record, payload)
    }

    handleHideEdit = () => {
        this.setState({
            editVisible: false,
            record: {},
            parent: '',
        })
    }

    handleUploadChange = ({file, fileList}) => {
        const status = file.status
        if (status !== 'error') {
            this.props.onUploadChange(materialType.image.type, fileList)
            if (status === 'done') {
                if (helper.isUploadComplete(fileList)) {
                    this.props.onCreate(materialType.image.type, fileList)
                }
            }
        } else {
            this.props.onUploadChange(materialType.image.type, fileList.filter((item) => {
                return item.status !== 'error'
            }))
            message.error('图片上传失败')
        }
    }

    render() {
        const {list, fileList, selectedMaterials,
            onSelectMaterial, onRemove, onTagManagement, onImagePreview,
            listLoading, createLoading, removeLoading,
        } = this.props
        const {editVisible, record, parent} = this.state
        const imageTypeText = imageType.join('/').replace(/image\//g, '')

        const uploadProps = {
            accept: imageType.join(','),
            beforeUpload: (file) => {
                return new Promise((resolve, reject) => {
                    const fileType = file.type
                    const typeOk = imageType.includes(fileType)
                    if (!typeOk) {
                        notification.error({
                            message: '图片格式错误',
                            description: `仅能上传${imageTypeText}格式图片`,
                        })
                        reject(file)
                        return
                    }
                    const sizeOk = file.size <= 1024 * 1024 * imageMaxSize
                    if (!sizeOk) {
                        notification.error({
                            message: '图片大小超出限制',
                            description: `图片大小不能超过${imageMaxSize}M`,
                        })
                        reject(file)
                        return
                    }
                    resolve(file)
                })
            },
            onChange: this.handleUploadChange,
            showUploadList: false,
            fileList: fileList,
            multiple: true,
        }

        return  (
            <div className={styles.imageWrap}>
                <div className={styles.operation}>
                    <QiniuUpload {...uploadProps} className={styles.create}>
                        <Button type="primary" disabled={fileList.length}>上传素材</Button>
                    </QiniuUpload>
                </div>
                <div className={styles.boxes}>
                    {
                        fileList.length && !listLoading ? <UploadingList type={materialType.image.type}
                            fileList={fileList}
                            createLoading={createLoading}
                        /> : null
                    }
                    {
                        list.map((item)=>{
                            return <div key={item.id} className={styles.box}>
                                {
                                    item.is_operable ? <div className={styles.checkbox}>
                                        <Checkbox checked={utils.isSelected(selectedMaterials, item.id)}
                                            onChange={(e)=>{onSelectMaterial(item.id, e)}}
                                        />
                                    </div> : null
                                }
                                <div className={styles.wrapper}>
                                    <div className={styles.coverWrap}>
                                        <img className={styles.cover}
                                            src={helper.getThumbLimit(helper.getMediaUrl(item), 512) || DefaultImage}
                                            onClick={()=>{onImagePreview(helper.getMediaUrl(item))}}
                                            onError={(e) => {
                                                e.target.src = DefaultImage
                                            }}
                                            alt=""
                                        />
                                        <a href={utils.getDownloadUrl(helper.getMediaUrl(item), item.title)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download="图片"
                                            className={styles.download}
                                        />
                                    </div>
                                    <div className={styles.titleWrap}>
                                        <span className={styles.title}>{item.title}</span>
                                        {
                                            item.is_operable ? <Fragment><Icon type="edit"
                                                className={styles.edit}
                                                id={`materialLibraryImageEdit${item.id}` }
                                                onClick={()=>{this.handleShowEdit('Image', item)}}
                                            />{
                                                editVisible && record.id === item.id ? <Edit {...this.props}
                                                    visible={editVisible}
                                                    record={record}
                                                    parent={parent}
                                                    onOk={this.handleEditOk}
                                                    onCancel={this.handleHideEdit}
                                                /> : null
                                            }</Fragment>: null
                                        }
                                    </div>
                                    <Info type={materialType.image.type}
                                        item={item}
                                        record={this.props.record}
                                        removeLoading={removeLoading}
                                        onRemove={onRemove}
                                        onTagManagement={onTagManagement}
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        )
    }
}

