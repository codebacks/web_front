import React, {Component, Fragment} from 'react'
import {Button, Checkbox, Icon, notification, message} from 'antd'
import QiniuUpload from 'components/QiniuUpload'
import config from 'wx/common/config'
import helper from "wx/utils/helper"
import Edit from '../Edit'
import Info from '../Info'
import UploadingList from '../UploadingList'
import utils from '../../utils'
import {videoMaxSize} from '../../config'

import styles from './index.scss'
const {DefaultImage, materialType} = config

export default class Video extends Component {
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

    getVideoKey = (file, hash, token)=>{
        let idx = file.name.lastIndexOf('.')
        let ext = ''
        if (idx !== -1) {
            ext = file.name.substr(idx).toLocaleLowerCase()
        }
        return `${token.user_dir}${hash}${ext}`
    }

    handleUploadChange = ({file, fileList}) => {
        const status = file.status
        if (status !== 'error') {
            this.props.onUploadChange(materialType.video.type, fileList)
            if (status === 'done') {
                if (helper.isUploadComplete(fileList)) {
                    this.props.onCreate(materialType.video.type, fileList)
                }
            }
        } else {
            this.props.onUploadChange(materialType.video.type, fileList.filter((item) => {
                return item.status !== 'error'
            }))
            message.error('视频上传失败')
        }
    }

    render() {
        const {list, fileList, selectedMaterials,
            onSelectMaterial, onRemove, onTagManagement, onVideoPreview,
            listLoading, createLoading, removeLoading,
        } = this.props
        const {editVisible, record, parent} = this.state

        const uploadProps = {
            accept: 'video/mp4',
            beforeUpload: (file)=>{
                return new Promise((resolve, reject) => {
                    const typeOk = file.type === 'video/mp4'
                    if (!typeOk) {
                        notification.error({
                            message: '视频格式错误',
                            description: '仅能上传mp4视频文件!',
                        })
                        reject(file)
                        return
                    }
                    const sizeOk = file.size <= 1024 * 1024 * videoMaxSize
                    if (!sizeOk) {
                        notification.error({
                            message: '视频大小超出限制',
                            description: `视频大小不能超过${videoMaxSize}M`,
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
            <div className={styles.videoWrap}>
                <div className={styles.operation}>
                    <QiniuUpload {...uploadProps} getKey={this.getVideoKey} className={styles.create}>
                        <Button type="primary" disabled={fileList.length}>上传素材</Button>
                    </QiniuUpload>
                </div>
                <div className={styles.boxes}>
                    {
                        fileList.length && !listLoading ? <UploadingList type={materialType.video.type}
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
                                            onChange={(e)=>{onSelectMaterial(item.id, e)}}/>
                                    </div> : null
                                }
                                <div className={styles.wrapper}>
                                    <div className={styles.coverWrap}>
                                        <img className={styles.cover}
                                            src={helper.getVideoCover(helper.getMediaUrl(item)) || DefaultImage}
                                            onError={(e) => {
                                                e.target.src = DefaultImage
                                            }}
                                            alt=""
                                        />
                                        <a href={utils.getDownloadUrl(helper.getMediaUrl(item), item.title)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download="视频"
                                            className={styles.download}
                                        />
                                    </div>
                                    <div className={styles.play}
                                        onClick={()=>{onVideoPreview(helper.getMediaUrl(item))}}/>
                                    <div className={styles.titleWrap}>
                                        <span className={styles.title}>{item.title}</span>
                                        {
                                            item.is_operable ? <Fragment><Icon type="edit"
                                                className={styles.edit}
                                                id={`materialLibraryVideoEdit${item.id}` }
                                                onClick={()=>{this.handleShowEdit('Video', item)}}
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
                                    <Info type={materialType.video.type}
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

