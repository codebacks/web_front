import React, {Component, Fragment} from 'react'
import {Button, Checkbox, Icon, notification, message} from 'antd'
import QiniuUpload from 'components/QiniuUpload'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import Edit from '../Edit'
import Info from '../Info'
import UploadingList from '../UploadingList'
import utils from '../../utils'
import {filenameExtension, fileMaxSize, imageMaxSize, videoMaxSize, imageType, videoType} from '../../config'

import styles from './index.scss'

const {materialType} = config

export default class File extends Component {
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
            totalFileList: [],
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

    getKey = (file, hash, token)=>{
        let idx = file.name.lastIndexOf('.')
        let ext = ''
        if (idx !== -1) {
            if (file.type === 'video/mp4') {
                ext = file.name.substr(idx).toLocaleLowerCase()
            } else {
                ext = file.name.substr(idx)
            }
        }
        return `${token.user_dir}${hash}${ext}`
    }

    handleUploadChange = ({file, fileList}) => {
        const status = file.status
        if (status !== 'error') {
            this.sortFileList(fileList)
        } else {
            this.sortFileList(fileList)
            message.error('文件上传失败')
        }
    }

    sortFileList = (list) => {
        let fileList = []
        let imageFileList = []
        let videoFileList = []
        list.forEach((file) => {
            const fileType = file.type
            if (imageType.includes(fileType)) {
                imageFileList.push(file)
            } else if (videoType.includes(fileType)) {
                videoFileList.push(file)
            } else {
                fileList.push(file)
            }
        })
        const sortFileList = {
            [materialType.file.type]: fileList,
            [materialType.image.type]: imageFileList,
            [materialType.video.type]: videoFileList,
        }
        this.setState({
            sortFileList: sortFileList, // 分类
        })
        this.props.onCreate(list, sortFileList)
    }

    getCoverType = (url) => {
        const ext = utils.getFilenameExtension(url)
        if (filenameExtension.doc.includes(ext)) {
            return 'doc'
        } else if (filenameExtension.xls.includes(ext)) {
            return 'xls'
        } else if (filenameExtension.ppt.includes(ext)) {
            return 'ppt'
        } else if (filenameExtension.pdf.includes(ext)) {
            return 'pdf'
        } else if (filenameExtension.txt.includes(ext)) {
            return 'txt'
        } else if (filenameExtension.zip.includes(ext)) {
            return 'zip'
        } else {
            return ''
        }
    }

    render() {
        const {list, totalFileList, fileList, selectedMaterials,
            onSelectMaterial, onRemove, onTagManagement,
            listLoading, createLoading, removeLoading,
        } = this.props
        const {editVisible, record, parent} = this.state

        const uploadProps = {
            accept: '*',
            beforeUpload: (file) => {
                const fileType = file.type
                const fileSizeOk = file.size <= 1024 * 1024 * fileMaxSize
                const imageSizeOk = file.size <= 1024 * 1024 * imageMaxSize
                const videoSizeOk = file.size <= 1024 * 1024 * videoMaxSize
                return new Promise((resolve, reject) => {
                    // 图片素材类型
                    if(imageType.includes(fileType)) {
                        if(!imageSizeOk) {
                            notification.error({
                                message: '图片大小超出限制',
                                description: `图片大小不能超过${imageMaxSize}M`,
                            })
                            reject(file)
                            return
                        }
                    }

                    // 视频素材类型
                    if(videoType.includes(fileType)) {
                        if(!videoSizeOk) {
                            notification.error({
                                message: '视频大小超出限制',
                                description: `视频大小不能超过${videoMaxSize}M`,
                            })
                            reject(file)
                            return
                        }
                    }

                    // 其余类型
                    if (!fileSizeOk) {
                        notification.error({
                            message: '文件大小超出限制',
                            description: `文件大小不能超过${fileMaxSize}M`,
                        })
                        reject(file)
                        return
                    }
                    resolve(file)
                })
            },
            onChange: this.handleUploadChange,
            showUploadList: false,
            fileList: totalFileList,
            multiple: true,
        }

        return  (
            <div className={styles.fileWrap}>
                <div className={styles.operation}>
                    <QiniuUpload {...uploadProps} getKey={this.getKey} className={styles.create}>
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
                                        <span className={`${styles.cover} ${styles[this.getCoverType(helper.getMediaUrl(item))]}`} />
                                        <a href={utils.getDownloadUrl(helper.getMediaUrl(item), helper.getMediaTitle(item))}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download="文件"
                                            className={styles.download}
                                        />
                                    </div>
                                    <div className={styles.titleWrap}>
                                        <span className={styles.title}>{helper.getMediaTitle(item)}</span>
                                        {
                                            item.is_operable ? <Fragment><Icon type="edit"
                                                className={styles.edit}
                                                id={`materialLibraryFileEdit${item.id}` }
                                                onClick={()=>{this.handleShowEdit('File', item)}}
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
                                    <Info type={materialType.file.type}
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

