/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import React from 'react'
import {
    Row,
    Checkbox,
    message,
    notification,
} from 'antd'
import PropTypes from "prop-types"
import styles from './index.less'
import {consumerHoc} from 'business/FullTypeMessage/dataManagement'
import LibModalWarp from 'business/FullTypeMessage/components/LibModalWarp'
import AddBlock from '../../AddBlock'
import QiniuUpload from 'components/QiniuUpload'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'
import {
    fileMaxSize,
    videoType,
    imageType,
    findFilenameExtension,
    sourceTypeMap,
    sourceTypeArray,
    setInitSource,
} from '../../../constant'
import {setStateFromProps, getFileName} from "../../../utils"

function setValues(values) {
    const newValues = Object.assign({}, values)

    return newValues
}

@consumerHoc({
    mapStoreToProps: (
        {
            typeValue,
            setStoreDeep,
            assignStoreByPath,
            setStoreByPath,
            setStore,
            contextProps,
            materialLibOption,
            store: {
                tabsActiveKey,
                index,
            },
        },
        props,
    ) => {
        const tabProps = props.tabProps || {}

        return {
            ...props,
            ...tabProps,
            ...{
                contextProps,
                tabsActiveKey,
                ref: props.tabRef,
                materialLibOption: tabProps.materialLibOption || contextProps.materialLibOption,
                materialLibModalOption: tabProps.materialLibModalOption || contextProps.materialLibModalOption,
            },
        }
    },
})
export default class FileContent extends React.PureComponent {
    static propTypes = {
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        materialLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            media_url: PropTypes.string.isRequired,//资源地址
            name: PropTypes.string,
        }),
        sourceType: PropTypes.oneOf(sourceTypeArray),
    }

    static defaultProps = {
        materialLibOption: {
            load: async (params) => {
                try {
                    const api = require('common/api/media').default
                    const {request} = require('utils')
                    const qs = require('qs')

                    const {data} = await request(`${api.media.url}?${qs.stringify(params)}`)
                    if(data) {
                        return data
                    }else {
                        throw new Error('请求错误')
                    }
                }catch(e) {
                    message.error('请求错误')
                }
            },
            loadTags: async () => {
                try {
                    const api = require('common/api/media').default
                    const {request} = require('utils')
                    const {data} = await request(api.tags.url)

                    if(data) {
                        return data
                    }else {
                        throw new Error('请求错误')
                    }
                }catch(e) {
                    message.error('请求错误')
                }
            },
        },
    }

    constructor(props) {
        super(props)

        this.state = {
            values: {
                media_url: '',
                name: '',
            },
            fileList: [],
            uploading: false,
            saveLib: false,
            ...setInitSource(props),
        }

        this.uploadRef = React.createRef()
    }

    static getDerivedStateFromProps(props, state) {
        let newState = null

        newState = setStateFromProps({
            name: 'values',
            preName: 'prevPropsValues',
            newState,
            props,
            state,
            setNewStateValue: (value) => {
                return setValues(value)
            },
        })

        newState = setStateFromProps({
            name: 'sourceType',
            preName: 'prevPropsSourceType',
            newState,
            props,
            state,
        })

        newState = setStateFromProps({
            name: 'sourceData',
            preName: 'prevPropsSourceData',
            newState,
            props,
            state,
        })

        return newState
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    componentWillUnmount() {
    }

    getValues = () => {
        return new Promise((resolve, reject) => {
            const {values, uploading} = this.state
            const newValues = this.setOutputValues()

            if(uploading) {
                reject(this.setError({
                    message: '上传中...',
                    values: newValues,
                }))
            }else {
                if(!values.media_url) {
                    reject(this.setError({
                        message: '文件不能为空',
                        values: newValues,
                    }))
                }else {
                    resolve(newValues)
                }
            }
        })
    }

    setOutputValues = () => {
        const {
            values,
            saveLib,
            sourceType,
            sourceData = {},
        } = this.state

        const newValues = Object.assign({}, values)
        if(this.showSaveLib()) {
            newValues.saveLib = saveLib
        }

        return {
            values: newValues,
            sourceData,
            sourceType,
        }
    }

    setError = ({message, values}) => {
        return {
            message,
            data: {
                values,
            },
        }
    }

    showSaveLib = () => {
        return sourceTypeMap.MATERIAL_LIB !== this.state.sourceType
    }

    handleCheckChange = (e) => {
        this.setState({
            saveLib: e.target.checked,
        })
    }

    renderFileIcon = (url) => {
        const suffix = url.substr(url.lastIndexOf('.'))
        const iconName = findFilenameExtension(suffix)
        try {
            return require(`./images/${iconName}.svg`)
        }catch(e) {
            return require(`./images/unknown.svg`)
        }
    }

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        const {
            title = '',
            media_url = '',
        } = _.get(item, 'mergeContent', {})

        return (
            <div
                className={styles.materialLibCell}
            >
                <div className={styles.imgBlock}>
                    <img
                        className={styles.suffixImg}
                        src={this.renderFileIcon(media_url)}
                        alt="文件"
                    />
                </div>
                <div className={styles.title}>
                    <EllipsisPopover
                        lines={1}
                        style={{
                            'maxWidth': '100%',
                        }}
                        content={title || '文件名称'}
                    />
                </div>
            </div>
        )
    }

    materialLibOk = (checkedItem) => {
        this.resetFileList(true)

        const {
            title = '',
            media_url = '',
        } = _.get(checkedItem, 'mergeContent', {})

        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            values: setValues({
                media_url,
                name: title,
            }),
        })
    }

    conversionItem = (item) => {
        if(item) {
            const {
                body: {
                    media_url = '',
                } = {},
                title = '',
                url = '',
            } = item

            item.mergeContent = {
                title: title,
                media_url: url || media_url,
            }
        }
        return item
    }

    getListFile = (info) => {
        const fileList = _.get(info, 'fileList')
        return fileList[fileList.length - 1]
    }

    handleChange = (info) => {
        this.setState({fileList: info.fileList})
        const fileList = this.getListFile(info)
        if(!fileList) {
            this.setState({uploading: false})
            return
        }
        if(fileList.status === 'uploading') {
            this.setState({uploading: true})
            return
        }
        if(fileList.status === 'done') {
            this.setState({
                uploading: false,
                sourceType: sourceTypeMap.USER,
                sourceData: fileList,
                values: this.onValuesChange({
                    media_url: _.get(fileList, 'response.url', ''),
                    name: getFileName(_.get(fileList, 'originFileObj.name', '')),
                }),
            })
        }
    }

    onValuesChange = (newValues) => {
        return Object.assign({}, this.state.formData, newValues)
    }

    resetFileList = (clearAll = false) => {
        const {fileList} = this.state
        const upload = _.get(this, 'uploadRef.current')
        const lastIndex = fileList.length - 1
        if(upload) {
            fileList.forEach((file, index) => {
                if(index !== lastIndex) {
                    upload.handleManualRemove(file)
                }else if(clearAll) {
                    upload.handleManualRemove(file)
                }
            })
        }
    }

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const ignoreType = [...imageType, ...videoType]
            const typeOk = !ignoreType.includes(file.type)

            if(!typeOk) {
                const ignoreStr = ignoreType.join(',')
                notification.error({
                    message: '文件格式错误',
                    description: `不支持上传${ignoreStr}格式文件`,
                })
                reject(new Error(`不支持上传${ignoreStr}格式文件`))
            }
            const sizeOk = file.size <= 1024 * 1024 * fileMaxSize
            if(!sizeOk) {
                notification.error({
                    message: '大小超出限制',
                    description: `文件大小不能超过${fileMaxSize}`,
                })
                reject(new Error(`文件大小不能超过${fileMaxSize}`))
            }

            this.resetFileList()
            resolve()
        })
    }

    render() {
        const {
            values: {
                media_url,
                name,
            },
            saveLib,
            fileList,
            uploading,
        } = this.state
        const {
            materialLibOption,
            materialLibModalOption,
            type,
        } = this.props

        const materialLibWarpOption = {
            ...materialLibOption,
            columnWidth: 116,
            gutterSize: 16,
            height: 300,
            overscanByPixels: 20,
            scrollingResetTimeInterval: 200,
            type,
            renderCell: this.renderMaterialLibCell,
            handleOk: this.materialLibOk,
        }

        return (
            <Row className={styles.FileContent}>
                <div className={styles.left}>
                    <div className={styles.imgBlock}>
                        {
                            uploading ? (
                                <div className={styles.loading}>
                                    上传中...
                                </div>
                            ) : (
                                media_url ? (
                                    <div className={styles.imgBlock}>
                                        <img
                                            className={styles.suffixImg}
                                            src={this.renderFileIcon(media_url)}
                                            alt="文件"
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.imgBlock}>
                                        <img
                                            className={styles.default}
                                            src={require('./images/file-default.png')}
                                            alt="文件"
                                        />
                                    </div>
                                )
                            )
                        }
                    </div>
                    <div className={styles.imgName}>
                        <EllipsisPopover
                            lines={1}
                            style={{
                                'maxWidth': '100%',
                            }}
                            content={name || '文件名称'}
                        />
                    </div>
                    <div className={styles.onlyBar}>
                        {
                            this.showSaveLib() && (
                                <Checkbox
                                    value={saveLib}
                                    className={styles.mine}
                                    onChange={this.handleCheckChange}
                                >
                                    保存到素材库
                                </Checkbox>
                            )
                        }
                    </div>
                </div>
                <div className={styles.right}>
                    <AddBlock
                        buttons={[
                            {
                                render: (renderBtn) => {
                                    return (
                                        <QiniuUpload
                                            fileList={fileList}
                                            accept={'*'}
                                            key={'qiniuUpload'}
                                            showUploadList={false}
                                            onChange={this.handleChange}
                                            beforeUpload={this.beforeUpload}
                                            multiple={false}
                                            uploadRef={this.uploadRef}
                                        >
                                            {renderBtn({
                                                name: media_url ? '重新上传' : '上传文件',
                                            })}
                                        </QiniuUpload>
                                    )
                                },
                            },
                            {
                                render: (renderBtn) => {
                                    return (
                                        <LibModalWarp
                                            conversionItem={this.conversionItem}
                                            key={'materialLib'}
                                            renderBtn={(setTrue) => {
                                                return renderBtn({
                                                    name: '从素材库选择',
                                                    onClick: setTrue,
                                                })
                                            }}
                                            checkedIconClassName={styles.checkedIconClassName}
                                            {...materialLibWarpOption}
                                            modalOption={{
                                                title: '文件素材选择',
                                                ...materialLibModalOption,
                                            }}
                                        />
                                    )
                                },
                            },
                        ]}
                    />
                </div>
            </Row>
        )
    }
}
