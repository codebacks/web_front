import React, {Component, Fragment} from 'react'
import {connect} from 'dva'
import {Form, Input, DatePicker, Select, Button, Icon, Modal, Radio, Checkbox, notification, message, Spin, Alert} from 'antd'
import moment from 'moment'
import router from 'umi/router'
import _ from 'lodash'
import QiniuUpload from 'components/QiniuUpload'
import {urlSafeBase64Encode, urlSafeBase64Decode} from "qiniu-js/src/base64"
import {calculateAllWatermarkUrlInfo} from "wx/components/Watermark/qiniuTools"
import Editor from 'components/Face/components/Editor'
import MomentEditor from 'wx/components/Editor'
import safeSetState from 'hoc/safeSetState'
import helper from 'wx/utils/helper'
import config from 'wx/common/config'
import baseConfig from 'config'
import styles from './index.scss'
import WeChatSelectMulti from '@huzan/hz-wechat-select'
import '@huzan/hz-wechat-select/style/index'
import ImagePreview from "components/business/ImagePreview"
import VideoPreview from 'components/business/VideoPreview'
import PhotoWatermark from '../ModalWatermark'
import VideoWatermark from '../VideoWatermark'
import VideoCut from 'wx/components/VideoCut'
import SortItem from './SortItem'
import WeChatTable from './WeChatTable'
import Materials from "wx/components/Materials"
import Goods from '../Goods'
import utils from '../../utils'
import {contentType,imageMaxSize, videoMaxSize, editorLimit, commentEditorLimit} from '../../config'
import uploadProps from './uploadProps'

const FormItem = Form.Item
const {Option} = Select
const RadioGroup = Radio.Group
const { TextArea } = Input
const confirm = Modal.confirm

const {materialType} = config

const executeTimeFormat = 'YYYY-MM-DD HH:mm' // 执行时间格式化
const timeFormat = 'HH:mm' // 时间格式化
const imageMaxLen = 9
const delay = 15 // 执行时间选择延后分钟数
const videoMaxDuration = 16 // 限制16s以内
const articleTitleLen = 40 // 文章标题长度限制
const maxTaskCount = 8 // 发朋友圈限制

const shareLimitMap = {
    all: {
        code: 0,
        text: '全部可见'
    },
    part: {
        code: 2,
        text: '部分可见'
    },
    block: {
        code: 3,
        text: '屏蔽标签好友'
    },
    self: {
        code: 1,
        text: '仅自己可见'
    }
}

const contentSourceType = {
    hzMall: 4, // 虎赞小店
    linkConversion: 5, // 微转淘
}

const openShopStatus = 6
const JDProductVersion = 16

@connect(({base, wx_moments, wx_material_moments, loading}) => ({
    base,
    wx_moments,
    sendLoading: loading.effects['wx_moments/shareMoments'],
    coverLoading: loading.effects['wx_moments/getArticleExtract'],
    labelsLoading: loading.effects['wx_moments/getLabels'],
    videoInfoLoading: loading.effects['wx_moments/getVideoInfo'],
    createMaterialLoading: loading.effects['wx_material_moments/create'],
    materialLoading: loading.effects['wx_material_moments/detail'],
    videoVerifyLoading: loading.effects['wx_moments/verifyVideo'],
}))
@safeSetState()
export default class SentMoments extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            fileList: [],
            cover: null, // 文章封面
            coverUploading: false,
            coverFileList: [],
            addressChange: false,
            previewVisible: false,
            previewImage: '',
            videoCut: '',
            videoRange: [0, 15],
            videoDuration: 0,
            videoCutVisible: false,
            videoFileList: [],
            wxVisible: false,
            submit: false,
            selectedList: [],
            body: {
                content_type: 'photo', // 内容类型
                executeType: 1, // 执行时间类型
                share_limit: 0, // 可见范围（全部可见）
            },
            comments: [''], // 评论
            labels: [], // 标签
            selectedLabels: [],
            videoInfo: {},
            executeTimeError: '',
            descError: '',
            commentErrors: {},
            addressError: '',
            coverError: '',

            defaultWatermark: {},

            usePhotoWatermark: false,
            photoWatermarkVisible: false,
            photoWatermarkConfirmLoading: false,
            previewPhotos: [],
            currentPreviewPhotos: [],
            photoQrCodeChecked: false,
            currentPhotoQrCodeChecked: false,
            photoTextWatermarkValue: '',
            currentPhotoTextWatermarkValue: '',
            photoWatermarkActive: 0,
            photoWatermarks: [],
            usePhotoWatermarkTimes: 0,

            videoWatermarkVisible: false,
            videoWatermarkConfirmLoading: false,
            useVideoWatermark: false,
            previewVideos: [],
            videoTextWatermarkValue: '',
            currentVideoTextWatermarkValue: '',
            videoQrCodeChecked: false,
            currentVideoQrCodeChecked: false,
            videoWatermarks: [],
            videoPreviewVisible: false,
            videoPreview: '',
            videoWatermarkLoading: false,

            calculateAllWatermarkLoading: false,

            saveAsMaterialOnly: false, //仅保存为素材
            materialsVisible: false, // 素材库
            currentMaterialType: materialType.text.type, // 素材库类型

            isEnableHZMall: false, // 是否启用虎赞小店
            goodsVisible: false,

            attachedData: [], // 从虎赞小店选择

            initData: {}, // 配置
            taskCount: 0, // 今日发圈任务数
        }
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true

        this.loadInitData((data)=>{
            const initData = data

            this.loadTaskCount(initData)

            const materialId = helper.getUrlParams('material', this.props.location)
            if (!materialId || isNaN(parseInt(materialId, 10))) {
                this.checkMomentFormat() // 验证格式
            } else {
                this.loadMaterial(materialId) // 朋友圈素材
            }

            if (_.get(initData, 'company.product_version.id') !== JDProductVersion) {
                this.loadProcedure()
            }
        })
    }

    componentWillUnmount() {
        this._isMounted = false
        this.clearMoment()
    }

    loadInitData = (callback) => {
        this.props.dispatch({
            type: 'wx_moments/getInitData',
            payload: {},
            callback: (data) => {
                if(this._isMounted) {
                    this.setState({
                        initData: data
                    })
                    callback && callback(data)
                }
            }
        })
    }

    loadTaskCount = (initData) => {
        this.props.dispatch({
            type: 'wx_moments/taskCount',
            payload: {},
            callback: (data) => {
                if (this._isMounted) {
                    const taskCount = data.count || 0
                    this.setState({
                        taskCount: taskCount
                    })
                    const noFunctionLimit = _.get(initData, 'setting.no_function_limit')
                    if (!noFunctionLimit && taskCount >= maxTaskCount) {
                        message.warning(`今日次数已用完`)
                    }
                }
            }
        })
    }

    loadProcedure = () => {
        this.props.dispatch({
            type: 'wx_moments/getProcedure',
            payload: {},
            callback: (data) => {
                if (this._isMounted) {
                    if (data.status === openShopStatus) {
                        this.loadMerchant()
                    }
                }
            }
        })
    }

    loadMerchant = () => {
        this.props.dispatch({
            type: 'wx_moments/getMerchant',
            payload: {},
            callback: (data) => {
                if (this._isMounted) {
                    // 有版本号并且状态为1的时候一定是发布成功的
                    const mpa = data.mpa
                    const templateVersion = mpa && mpa.template_version
                    const status = mpa && mpa.status
                    if (status === 1 && templateVersion) {
                        this.setState({
                            isEnableHZMall: true
                        })
                    }
                }
            }
        })
    }

    loadMaterial = (materialId) => {
        this.props.dispatch({
            type: 'wx_material_moments/detail',
            payload: {
                id: materialId
            },
            callback: (data) => {
                if(this._isMounted) {
                    this.fillContent('material', data)
                    if(!this.hasWatermarking(data.content_watermark)) {
                        this.loadDefaultWatermark()
                    }
                }
            }
        })
    }

    fill = (prefix, data) => {
        const type = data.content_type
        let fileList = []
        let previewPhotos = []
        let currentPreviewPhotos = []
        let videoFileList = []
        let coverFileList = []
        let cover = null
        let body = {...this.state.body}
        body.content_type = type
        if (data.content_desc) {
            body.content_desc = Editor.msgToHtml(data.content_desc)
        }
        let content = data.content
        if(type === 'photo' || type === 'video') {
            content = utils.getResponseFormat(prefix, content)
        }
        if (type === 'photo') {
            fileList = content
            const photos = this.getPreviewPhotos(content)
            previewPhotos = _.cloneDeep(photos)
            currentPreviewPhotos = _.cloneDeep(photos)
            let attachedData = []
            if(Array.isArray(data.attached_data) && data.attached_data.length) {
                attachedData = data.attached_data.filter((v) => {
                    return v.source_type === contentSourceType.hzMall
                })
            }

            this.fillPhotoContentWatermark(fileList, previewPhotos, data.content_watermark)
            this.setState({
                fileList: fileList,
                attachedData: attachedData,
            })
            if(!data.content_watermark.length) {
                this.setState({
                    previewPhotos: previewPhotos,
                    currentPreviewPhotos: currentPreviewPhotos,
                })
            }

        } else if (type === 'video') {
            videoFileList = content
            this.getVideoInfo(data.content[0], (info)=>{
                this.setState({
                    videoSourceDuration: info.duration
                })
                this.setState({
                    videoFileList: videoFileList,
                })
                this.fillVideoContentWatermark(videoFileList, data.content_watermark, info)
            })

        } else if (type === 'article') {
            body.contentAddress = data.content[0]
            cover = {
                cover: data.cover,
                title:  data.title
            }
            coverFileList = utils.getResponseFormat('封面', [data.cover])
            this.setState({
                coverFileList: coverFileList,
                cover: cover,
            })
        }
        this.setState({
            body: body,
        })
    }

    setFollowDefaultWatermark = (defaultWatermark) => {
        const {textWatermarkValue, qrCodeChecked} = defaultWatermark
        this.setState({
            defaultWatermark: defaultWatermark,
            photoTextWatermarkValue: textWatermarkValue,
            currentPhotoTextWatermarkValue: textWatermarkValue,
            photoQrCodeChecked: qrCodeChecked,
            currentPhotoQrCodeChecked: qrCodeChecked,
            videoTextWatermarkValue: textWatermarkValue,
            currentVideoTextWatermarkValue: textWatermarkValue,
            videoQrCodeChecked: qrCodeChecked,
            currentVideoQrCodeChecked: qrCodeChecked,
        })
    }

    getFollowDefaultWatermark = (contentWatermark) => {
        const watermark = contentWatermark.find((v)=>{ return this.hasWatermarkPolicy(v) })
        const textWatermarkValue = helper.utf8Decode(urlSafeBase64Decode(watermark.text_base64))
        const qrCodeChecked = !!watermark.image_base64
        return {
            textWatermarkValue,
            qrCodeChecked,
        }
    }

    fillPhotoContentWatermark = (fileList, previewPhotos, contentWatermark) => {
        if(contentWatermark.length) {
            if(this.hasWatermarking(contentWatermark)) {
                // 将跟圈和保存素材时的水印规则设置为当前默认水印
                const defaultWatermark = this.getFollowDefaultWatermark(contentWatermark)
                const {textWatermarkValue, qrCodeChecked} = defaultWatermark
                this.setFollowDefaultWatermark(defaultWatermark)

                this.setState({
                    usePhotoWatermark: true,
                })

                previewPhotos = previewPhotos.map((v, index) => {
                    return {
                        ...v,
                        ...{selected: this.hasWatermarkPolicy(contentWatermark[index])}
                    }
                })

                this.createFollowPhotoWatermark(fileList, previewPhotos, contentWatermark, textWatermarkValue, qrCodeChecked)
            }
        }
    }

    fillVideoContentWatermark = (videoFileList, contentWatermark, videoInfo) => {
        if(contentWatermark.length) {
            if(this.hasWatermarking(contentWatermark)) {
                // 将跟圈和保存素材时的水印规则设置为当前默认水印
                const defaultWatermark = this.getFollowDefaultWatermark(contentWatermark)
                const {textWatermarkValue, qrCodeChecked} = defaultWatermark
                this.setFollowDefaultWatermark(defaultWatermark)

                this.setState({
                    useVideoWatermark: true,
                })
                this.createFollowVideoWatermark(videoFileList, textWatermarkValue, qrCodeChecked, videoInfo)
            }
        }
    }

    checkMomentFormat = () => {
        const {moment} = this.props.wx_moments
        if(moment && Object.keys(moment).length) {
            if(this.checkMoment(moment)){
                this.fillContent('reuse', moment)
                if(!this.hasWatermarking(moment.content_watermark)) {
                    this.loadDefaultWatermark()
                }

            } else {
                message.warning('不支持旧格式')
                this.loadDefaultWatermark()
            }
        } else {
            this.loadDefaultWatermark()
        }
    }

    clearMoment = () => {
        this.props.dispatch({
            type: 'wx_moments/setProperty',
            payload: {
                moment: {}
            }
        })
    }

    checkMoment = (moment) => {
        const type = moment.content_type
        const content = moment.content
        const comments = utils.getComments(moment)
        const reg = /^http(s)?:\/\//
        if (comments.length && comments[0].length > commentEditorLimit) {
            return false
        }
        if (type === 'photo' || type === 'video') {
            if (!helper.isQiniu(content[0]) || !reg.test(content[0])) {
                return false
            }
        } else if (type === 'article') {
            const coverUrl = moment.cover
            if (!coverUrl || !moment.title || !reg.test(coverUrl)) {
                return false
            }
        }
        return true
    }

    fillContent = (prefix, moment) => {
        this.fill(prefix, moment)
        let comments = utils.getComments(moment, true)
        comments = comments.map((item) => {
            return Editor.msgToHtml(item)
        })
        this.setState({
            comments: comments,
        })
    }

    loadDefaultWatermark = () => {
        this.props.dispatch({
            type: 'wx_moments/getDefaultWatermark',
            payload: {
                params: {type: 1}
            },
            callback: (data) => {
                if(this._isMounted) {
                    if (data && data.attached_data) {
                        const {textWatermarkValue, qrCodeChecked} = data.attached_data
                        this.setState({
                            defaultWatermark: data.attached_data,
                            photoTextWatermarkValue: textWatermarkValue,
                            currentPhotoTextWatermarkValue: textWatermarkValue,
                            photoQrCodeChecked: qrCodeChecked,
                            currentPhotoQrCodeChecked: qrCodeChecked,
                            videoTextWatermarkValue: textWatermarkValue,
                            currentVideoTextWatermarkValue: textWatermarkValue,
                            videoQrCodeChecked: qrCodeChecked,
                            currentVideoQrCodeChecked: qrCodeChecked,
                        })
                    }
                }
            }
        })
    }

    hasDefaultWatermark = (defaultWatermark) => {
        if (defaultWatermark && Object.keys(defaultWatermark).length) {
            // 视频图片水印不计入
            const {body: {content_type: contentType}} = this.state
            if(contentType === 'video') {
                return !!defaultWatermark.textWatermarkValue
            }
            return defaultWatermark.qrCodeChecked || !!defaultWatermark.textWatermarkValue
        }
        return false
    }

    handleSubmit = e => {
        e.preventDefault()
        let {submit, body, saveAsMaterialOnly} = this.state
        if (saveAsMaterialOnly) {
            this.handleSaveMaterial(submit, body)
            return
        }
        this.handleSentMoment(submit, body)
    }

    handleSaveMaterial = (submit, body) => {
        if(this.props.createMaterialLoading) {
            return
        }
        if(!submit){
            this.setState({
                submit: true,
            })
        }
        if(this.checkMaterial()){
            const {dispatch} = this.props
            const params = this.setMaterialParams(body)

            // console.log('保存素材', params)

            dispatch({
                type: 'wx_material_moments/create',
                payload: {
                    body: params,
                },
                callback: () => {
                    message.success('保存成功')
                    router.push('/wx/material/moments')
                },
            })
        }
    }

    handleSentMoment = (submit, body) => {
        if(this.props.sendLoading){
            return
        }
        if(!submit){
            this.setState({
                submit: true,
            })
        }
        if(this.checkSubmit()){
            const params = this.setParams(body)

            // console.log('发送朋友圈', params)

            if (params.content_type === 'video') {
                this.handleVideoMoment(params)
            } else {
                this.sentMoment(params)
            }
        }
    }

    handleVideoMoment = (params) => {
        const url = params.content[0]

        this.verifyVideo(url, (data) => {
            const url = data.url
            params.content = [url]
            const {useVideoWatermark} = this.state
            const {content_watermark} = params
            if (useVideoWatermark) {
                if (Array.isArray(content_watermark) && content_watermark.length) {
                    params.content_watermark[0].url = url

                    this.getVerifyVideoWatermark(url).then((watermarks)=>{
                        params.content_watermark[0].policy = this.parseVideoWatermarkPolicy(watermarks[0])
                        this.sentMoment(params)
                    }).catch((err)=>{
                        this.sentMoment(params)
                    })
                    return
                }
            }
            this.sentMoment(params)
        })
    }

    getVerifyVideoWatermark = async (url) => {
        let videoCover = helper.getVideoCover(url)
        const previewVideos = [{
            uid: new Date().getTime(),
            selected: true,
            url: videoCover
        }]
        let {videoTextWatermarkValue, videoQrCodeChecked} = this.state

        this.setState({videoWatermarkLoading: true})
        try {
            const watermark = await calculateAllWatermarkUrlInfo({
                previewArr: previewVideos,
                textWatermarkValue: videoTextWatermarkValue,
                qrCodeChecked: videoQrCodeChecked,
            })
            this.setState({videoWatermarkLoading: false})
            return watermark
        } catch (e) {
            console.log(e)
            this.setState({videoWatermarkLoading: false})
        }
    }

    verifyVideo = (url, callback) => {
        this.props.dispatch({
            type: 'wx_moments/verifyVideo',
            payload: {
                body: {
                    url: url
                },
            },
            callback: (data) => {
                if(this._isMounted) {
                    callback && callback(data)
                }
            },
        })
    }

    sentMoment = (params) => {
        const {dispatch} = this.props

        // console.log(params)

        dispatch({
            type: 'wx_moments/shareMoments',
            payload: {
                body: params,
            },
            callback: () => {
                this.handleReset()
            },
        })
    }

    checkMaterial = () => {
        const {body, fileList, videoFileList, videoInfo,
            descError, addressError, coverError
        } = this.state
        const {coverLoading, videoInfoLoading} = this.props
        let correct = true
        if (descError) {
            correct = false
        }
        if(fileList.length && fileList.some((item)=>{ return item.status === 'uploading'})) {
            correct = false
        }
        if(videoFileList.length
            && (videoFileList.some((item)=>{return item.status === 'uploading'}) || videoInfoLoading)){
            correct = false
        }
        if(coverLoading) {
            correct = false
        }
        if (body['content_type'] === 'photo' && !this.setPhotoContentUrl(fileList).length) {
            correct = false
        }
        if (body['content_type'] === 'video') {
            if (!this.setVideoContentUrl(videoFileList).length) {
                correct = false
            } else if (!Object.keys(videoInfo)) {
                correct = false
            } else if (!videoInfo.duration || (videoInfo.duration && videoInfo.duration >= videoMaxDuration)) {
                correct = false
            }
        }
        if (body['content_type'] === 'article' && (addressError || coverError)) {
            correct = false
        }
        return correct
    }

    setMaterialParams = (values) => {
        const body = {}
        const {fileList,
            videoFileList,
            usePhotoWatermark,
            useVideoWatermark,
            cover,
            comments,
            attachedData,
        } = this.state
        if (values['content_desc']) {
            body['content_desc'] = Editor.computeMsgLength(values['content_desc'])
                ? Editor.htmlToMsg(values['content_desc'])
                : undefined
        }

        if (values['content_type'] === 'photo') {
            if (usePhotoWatermark) {
                const photoContentWatermark = this.setPhotoContentWatermark(fileList)
                if (this.hasWatermarking(photoContentWatermark)) {
                    body['content_watermark'] = photoContentWatermark
                }
            }
        } else if (values['content_type'] === 'video') {
            if (useVideoWatermark) {
                const videoContentWatermark = this.setVideoContentWatermark(videoFileList)
                if (this.hasWatermarking(videoContentWatermark)) {
                    body['content_watermark'] = videoContentWatermark
                }
            }
        }

        body['content_comments'] = this.setComments(comments)
        body['content_type'] = values['content_type']
        if (body['content_type'] === 'article' && values['contentAddress']) {
            body['content'] = [values['contentAddress']]
            body['cover'] = cover['cover']
            body['title'] = cover['title'].replace(/\s*$/g, '')
        } else if (body['content_type'] === 'photo' && fileList.length) {
            const photoContent = this.setPhotoContentUrl(fileList)
            body['content'] = this.setPhotoContentUrl(fileList)

            body['attached_data'] = this.getAttachedData(photoContent, attachedData)
        } else if (body['content_type'] === 'video' && videoFileList.length) {
            body['content'] = this.setVideoContentUrl(videoFileList)

        } else if (body['content_type'] === 'text') {
            body['content'] = []
        }
        return body
    }

    checkSubmit = () => {
        const {body, fileList, videoFileList, selectedList, videoInfo,
            selectedLabels,
            descError, commentErrors, addressError, coverError,
            calculateAllWatermarkLoading,
        } = this.state
        const rangeType = body.share_limit
        const {coverLoading, videoInfoLoading, labelsLoading} = this.props
        let correct = true
        if (!selectedList.length) {
            correct = false
        }
        if (body['executeType'] === 1 && !this.checkExecuteTime(body['execute_time'])) {
            correct = false
        }
        if (descError) {
            correct = false
        }
        if (Object.keys(commentErrors).length) {
            correct = false
        }
        if(fileList.length && fileList.some((item)=>{ return item.status === 'uploading'})) {
            correct = false
        }
        if(videoFileList.length
            && (videoFileList.some((item)=>{return item.status === 'uploading'}) || videoInfoLoading)){
            correct = false
        }
        if(coverLoading) {
            correct = false
        }
        if((rangeType === shareLimitMap.part.code || rangeType === shareLimitMap.block.code)
            && (labelsLoading || !selectedLabels.length)) { // 标签
            correct = false
        }
        if (body['content_type'] === 'photo' && !this.setPhotoContentUrl(fileList).length) {
            correct = false
        }
        if (body['content_type'] === 'video') {
            if (!this.setVideoContentUrl(videoFileList).length) {
                correct = false
            } else if (!Object.keys(videoInfo)) {
                correct = false
            } else if (!videoInfo.duration || (videoInfo.duration && videoInfo.duration >= videoMaxDuration)) {
                correct = false
            }
        }
        if (body['content_type'] === 'article' && (addressError || coverError)) {
            correct = false
        }
        if(calculateAllWatermarkLoading) {
            correct = false
        }
        return correct
    }


    setParams = (values) => {
        const body = {}
        const {fileList, usePhotoWatermark,
            videoFileList, useVideoWatermark,
            cover,
            comments,
            selectedLabels,
            attachedData
        } = this.state
        if (values['content_desc']) {
            body['content_desc'] = Editor.computeMsgLength(values['content_desc']) ? Editor.htmlToMsg(values['content_desc']) : undefined
        }
        body['content_type'] = values['content_type']
        body['execute_time'] = values['executeType'] === 1 ? values['execute_time'].format(executeTimeFormat) : ''
        body['uins'] = this.filterSelectedList()
        const materialId = helper.getUrlParams('material', this.props.location)
        if (materialId && !isNaN(parseInt(materialId, 10))) {
            body['is_save_to_media'] = 0
        } else {
            body['is_save_to_media'] = 1
        }
        if (body['content_type'] === 'article' && values['contentAddress']) {
            body['content'] = [values['contentAddress']]
            body['cover'] = cover['cover']
            body['title'] = cover['title'].replace(/\s*$/g, '')
        } else if (body['content_type'] === 'photo' && fileList.length) {
            const photoContent = this.setPhotoContentUrl(fileList)
            body['content'] = photoContent

            body['attached_data'] = this.getAttachedData(photoContent, attachedData)
            // 图片水印
            if (usePhotoWatermark) {
                const photoContentWatermark = this.setPhotoContentWatermark(fileList)
                if(this.hasWatermarking(photoContentWatermark)) {
                    body['content_watermark'] = photoContentWatermark
                }
            }
        } else if (body['content_type'] === 'video' && videoFileList.length) {
            body['content'] = this.setVideoContentUrl(videoFileList)
            // 视频水印
            if(useVideoWatermark) {
                const videoContentWatermark = this.setVideoContentWatermark(videoFileList)
                if(this.hasWatermarking(videoContentWatermark)) {
                    body['content_watermark'] = videoContentWatermark
                }
            }
        } else if(body['content_type'] === 'text'){
            body['content'] = []
        }
        body['content_comments'] = this.setComments(comments)
        body['share_limit'] = values['share_limit']
        if (values['share_limit'] === shareLimitMap.part.code || values['share_limit'] === shareLimitMap.block.code) {
            body['tags'] = selectedLabels
        }
        return body
    }

    getAttachedData = (photos, rawAttachedData) => {
        return photos.map((photo) => {
            let addition = rawAttachedData.find((v) => {
                return v.url === photo
            })
            if (addition) {
                return {
                    ...addition,
                    ...{
                        source_type: contentSourceType.hzMall
                    }
                }
            }
            return {
                url: photo
            }
        })
    }

    hasWatermarking = (watermark) => {
        if (Array.isArray(watermark) && watermark.length) {
            return watermark.some((v) => {
                return this.hasWatermarkPolicy(v)
            })
        }
        return false
    }

    hasWatermarkPolicy = (v) => {
        return !!(v.text_base64 || v.image_base64)
    }

    isShowPhotoWatermarkTag = (previewPhoto) => {
        const {photoWatermarks} = this.state
        if(previewPhoto) {
            if (previewPhoto.selected) {
                const watermark = photoWatermarks.find((v)=>{ return v.uid === previewPhoto.uid })
                return !!(_.get(watermark, 'info.policy',  ''))
            }
        }
        return false
    }

    setPhotoContentUrl = (fileList) => {
        const content = []
        fileList.forEach((item) => {
            if (item && item.response && item.response.url) {
                let url = item.response.url
                if (!utils.isYQX(url)) {
                    url = helper.getThumbLimit(item.response.url)
                }
                content.push(url)
            }
        })
        return content
    }

    setPhotoContentWatermark = (fileList) => {
        const {photoWatermarks} = this.state
        const contentWatermark = []
        fileList.forEach((item) => {
            if (item && item.response && item.response.url) {
                let url = helper.getThumbLimit(item.response.url)
                let photoWatermark = photoWatermarks.find((v)=>{
                    let key = helper.getUrlKey(v.url)
                    return url.indexOf(key) !== -1 && item.uid === v.uid
                })
                if (photoWatermark) {
                    let policy = photoWatermark.info.policy
                    contentWatermark.push({
                        url: url,
                        policy: policy,
                        text_base64: photoWatermark.info.text_base64,
                        image_base64: photoWatermark.info.image_base64
                    })
                } else {
                    contentWatermark.push({
                        url: url
                    })
                }
            }
        })
        return contentWatermark
    }

    setVideoContentWatermark = (videoFileList) => {
        const {videoWatermarks, videoCut} = this.state
        const contentWatermark = []
        videoFileList.forEach((item, index) => {
            if (item && item.response && item.response.url) {
                let url = videoCut || item.response.url
                if(videoWatermarks.length) {
                    let videoWatermark = videoWatermarks[index]
                    const {text_base64, image_base64} = videoWatermark.info
                    let policy = this.parseVideoWatermarkPolicy(videoWatermark)
                    contentWatermark.push({
                        url: url,
                        policy: policy,
                        text_base64: text_base64,
                        // 去掉视频二维码水印
                        // image_base64: image_base64,
                    })
                }
            }
        })
        return contentWatermark
    }

    parseVideoWatermarkPolicy = (videoWatermark) => {
        let fops = videoWatermark.info.fopArr
        let policy = ''
        const prefix = 'wm'
        const {text_base64, image_base64} = videoWatermark.info
        fops.forEach((fop)=>{
            // 图片 去掉视频图片水印
            // if (fop.mode === 1) {
            //     if (policy.indexOf('avthumb') !== -1) {
            //         policy += '|avthumb/mp4'
            //     } else {
            //         policy += 'avthumb/mp4'
            //     }
            //     Object.keys(fop).forEach((k) => {
            //         let value = fop[k]
            //         switch (k) {
            //         // case 'image':
            //         //     policy += `/${prefix}Image/${image_base64}`
            //         //     break
            //
            //         case 'gravity':
            //             policy += `/${prefix}Gravity/${value}`
            //             break
            //         case 'dx':
            //             policy += `/${prefix}OffsetX/-${value}`
            //             break
            //         case 'dy':
            //             policy += `/${prefix}OffsetY/-${value}`
            //             break
            //         default:
            //         }
            //     })
            // } else
            if (fop.mode === 2) { // 文字
                if (policy.indexOf('avthumb') !== -1) {
                    policy += '|avthumb/mp4'
                } else {
                    policy += 'avthumb/mp4'
                }
                Object.keys(fop).forEach((k) => {
                    let value = fop[k]
                    switch (k) {
                        case 'text':
                            policy += `/${prefix}Text/${text_base64}`
                            break
                        case 'gravity':
                            policy += `/${prefix}GravityText/${value}`
                            break
                        case 'font':
                            policy += `/${prefix}Font/${urlSafeBase64Encode(value)}`
                            break
                        case 'fontsize':
                            policy += `/${prefix}FontSize/${Math.round(value/20)}` // 单位缇
                            break
                        case 'fill':
                            policy += `/${prefix}FontColor/${urlSafeBase64Encode(value)}`
                            break
                        case 'dx':
                            policy += `/${prefix}OffsetX/-${value}`
                            break
                        case 'dy':
                            policy += `/${prefix}OffsetY/-${value}`
                            break
                        default:
                    }
                })
            }
        })
        return policy
    }

    setVideoContentUrl = (fileList) => {
        const content = []
        const {videoCut} = this.state
        if (videoCut) {
            content.push(videoCut)
        } else {
            fileList.forEach((item) => {
                if (item && item.response && item.response.url) {
                    content.push(item.response.url)
                }
            })
        }
        return content
    }

    setComments = (comments) => {
        const contentComments = []
        comments.forEach((item)=>{
            if(item && Editor.computeMsgLength(item)) {
                contentComments.push(Editor.htmlToMsg(item))
            }
        })
        return contentComments
    }

    filterSelectedList = () => {
        return this.state.selectedList.map((item)=>{
            return parseInt(item.uin, 10)
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

    handleImageUploadChange = ({file, fileList}) => {
        const status = file.status
        const {previewPhotos} = this.state
        if (status !== 'error') {
            this.setState({
                fileList: fileList,
            })
            if(status === 'done') {
                if (helper.isUploadComplete(fileList)) {
                    const photos = this.getPreviewPhotos(fileList, previewPhotos)
                    this.setState({
                        previewPhotos: _.cloneDeep(photos),
                        currentPreviewPhotos: _.cloneDeep(photos),
                    })
                }
            }
        } else {
            this.setState({
                fileList: fileList.filter((item) => {
                    return item.status !== 'error'
                })
            })
            message.error('图片上传失败')
        }
    }

    getPreviewPhotos = (fileList, previewPhotos = []) => {
        if (previewPhotos.length) {
            previewPhotos = previewPhotos.filter((item) => {
                return fileList.find((v) => {
                    return v.uid === item.uid
                })
            })
        }
        return fileList.map((item) => {
            let selected = false
            let url = helper.getThumbLimit(item.response ? item.response.url : '')

            if(previewPhotos.length) {
                const index = previewPhotos.findIndex((v) => {
                    return url.indexOf(v.url) !== -1
                })
                if (index !== -1) {
                    selected = previewPhotos[index].selected
                }
            }
            return {
                uid: item.uid,
                url: url,
                selected: selected
            }
        })
    }

    handleVideoUploadChange = ({file, fileList}) => {
        this.setState({videoFileList: fileList})
        if (!fileList.length) {
            this.setState({
                videoCut: '',
                videoDuration: 0,
                videoSourceDuration: 0,
                videoInfo: {},
                useVideoWatermark: false,
                videoWatermarks: [],
            })
        } else {
            if (file.status === 'done') {
                this.getVideoInfo(file.response.url, (format)=>{
                    this.setState({
                        videoSourceDuration: format.duration
                    })
                })
            }
        }
    }

    getVideoInfo = (url, callback) => {
        this.props.dispatch({
            type: 'wx_moments/getVideoInfo',
            payload: {
                url: `${url}?avinfo`
            },
            callback: (data) => {
                if(this._isMounted) {
                    const duration = Number(_.get(data, 'format.duration', 0))
                    if (duration) {
                        this.setState({
                            videoInfo: data.format,
                        })
                        callback && callback(data.format)
                    } else {
                        this.setState({videoFileList: []})
                        if (_.get(data, 'error.responseJson.error') === 'unknown format') {
                            notification.error({
                                message: '格式未知',
                                description: '请上传正确格式的视频',
                            })
                        } else if (duration === 0) {
                            notification.error({
                                message: '无效视频',
                                description: '视频长度不能为0',
                            })
                        }
                    }
                }
            }
        })
    }

    formatVideoDuration = (duration) => {
        return Math.ceil(duration)
    }

    getCurrentVideoCover = () => {
        const {videoFileList, videoCut, videoInfo} = this.state
        if (videoCut) {
            return helper.getVideoCover(videoCut)
        }
        if (videoInfo && Object.keys(videoInfo).length) {
            if (videoFileList.length && videoFileList[0].response) {
                return helper.getVideoCover(videoFileList[0].response.url)
            }
        }
        return ''
    }

    handleShowVideoCut = (duration) => {
        this.setState({
            videoCutVisible: true,
            videoDuration: parseInt(duration, 10),
        })
    }

    handleHideVideoCut = () => {
        this.setState({
            videoCutVisible: false,
        })
    }

    handleVideoCutOk = (url, range) => {
        this.handleHideVideoCut()
        this.setState({
            videoCut: url,
            videoRange: range
        },()=>{
            this.getVideoInfo(url)
        })
    }

    handleVideoCutCancel = () => {
        this.handleHideVideoCut()
    }

    handleCoverUploadChange = ({file, fileList}) => {
        const status = file.status
        if (status !== 'error') {
            this.setState({
                coverFileList: fileList
            })
            if (status === 'done') {
                let cover = {...this.state.cover}
                cover['cover'] = this.getFinalCover(file.response.url)
                this.setState({
                    cover: cover
                })
                this.checkCover(cover)
            }
        } else {
            this.setState({
                coverFileList: fileList.filter((item) => {
                    return item.status !== 'error'
                })
            })
            message.error('图片上传失败')
        }
    }

    getFinalCover = (coverUrl) => {
        return this.getCutThumb(coverUrl, 160)
    }

    getCutThumb = (url, size) => {
        if (url) {
            size = size || 160
            if (helper.isQiniu(url)) {
                return `${url.split('?')[0]}?imageView2/1/w/${size}/h/${size}`
            }
            return url
        }
        return ''
    }

    disabledDate = (current) => {
        return current && current <= moment().startOf('day')
    }

    checkExecuteTime = (val) => {
        let {body, executeTimeError} = this.state
        let correct = true
        if (body.executeType === 1) {
            if (!val) {
                executeTimeError = '请选择执行时间'
                correct = false
            } else if (val.isBefore(moment().add(delay, 'minutes'))) {
                executeTimeError = `需大于当前时间+${delay}分钟`
                correct = false
            } else {
                executeTimeError = ''
            }
        } else {
            executeTimeError = ''
        }
        this.setState({
            executeTimeError: executeTimeError
        })
        return correct
    }

    showConfirm = () => {
        const {body, fileList, videoFileList} = this.state
        if (body['content_desc'] || (fileList.length || videoFileList.length)) {
            confirm({
                title: '编辑的内容尚未提交，确定取消？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    this.handleReset()
                },
                onCancel: () => {},
            })
        } else {
            this.handleReset()
        }
    }

    handleReset = () => {
        this.props.handleCancel()
    }

    handleShowSelect = () => {
        this.setState({
            wxVisible: true,
        })
    }

    handleCancelSelect = () => {
        this.setState({
            wxVisible: false,
        })
    }

    handleSelectOk = (list) =>{
        this.setState({
            wxVisible: false,
            selectedList : list
        },()=>{
            const uins = this.filterSelectedList()
            if(this.state.labels.length) {
                this.updateLabels(uins)
            } else {
                this.loadLabels(uins)
            }
        })
    }

    loadLabels = (uins, callback) => {
        this.props.dispatch({
            type: 'wx_moments/getLabels',
            payload: {
                uin: uins.join(',')
            },
            callback: (data) => {
                if(this._isMounted) {
                    data = data || {}
                    let labels = this.parseLabels(data)
                    this.setState({
                        labels: labels
                    })
                    callback && callback(labels)
                }
            }
        })
    }

    parseLabels = (data) => {
        let uniqueLabels = []
        let keys = Object.keys(data)
        if (keys.length) {
            let labels = keys.map((key)=>{return data[key]}).reduce((a, b) => a.concat(b))
            uniqueLabels = Array.from(new Set(labels.map((item)=>{return item.name})))
        }
        return uniqueLabels
    }

    updateLabels = (uins) => {
        this.loadLabels(uins, (labels)=>{
            let selectedLabels = _.cloneDeep(this.state.selectedLabels)
            selectedLabels = selectedLabels.filter((item) => {
                let index = _.findIndex(labels, (v) => {
                    return v === item
                })
                return index !== -1
            })
            this.setState({
                selectedLabels: selectedLabels
            })
        })
    }

    handleSelectCancel =() => {
        this.handleCancelSelect()
    }

    deleteSelectedWeChat = (uin, callback) => {
        const selectedList = this.state.selectedList.filter((item)=>{
            return item.uin !== uin
        })
        this.setState({
            selectedList: selectedList
        }, () => {
            callback && callback(selectedList)
            const {body} = this.state
            if(!selectedList.length){
                body['share_limit'] = shareLimitMap.all.code
                this.setState({
                    body: body,
                    labels: [],
                    selectedLabels: [],
                })
            } else {
                const uins = this.filterSelectedList()
                this.updateLabels(uins)
            }
        })
    }

    handleSortItems = (items) => {
        const {previewPhotos, photoWatermarks} = this.state
        const newPreviewPhotos = this.getPreviewPhotos(items, previewPhotos)
        let newPhotoWatermarks = []

        newPreviewPhotos.forEach((item)=>{
            const watermark = photoWatermarks.find((v) => {
                return item.uid === v.uid
            })
            if(watermark) {
                newPhotoWatermarks.push(watermark)
            }
        })

        this.setState({
            fileList: items,
            previewPhotos: _.cloneDeep(newPreviewPhotos),
            currentPreviewPhotos: _.cloneDeep(newPreviewPhotos),
            photoWatermarks: newPhotoWatermarks,
        })
    }

    handleShowPreview = (file) => {
        const {body, photoWatermarks, usePhotoWatermark} = this.state
        let previewImage = file.response.url
        if (body['content_type'] === 'photo') {
            previewImage = helper.getThumbLimit(previewImage)
            // 水印预览
            if (usePhotoWatermark) {
                const photoWatermark = photoWatermarks.find((v) => {
                    let key = helper.getUrlKey(v.url)
                    // 同一张图片多次上传
                    return previewImage.indexOf(key) !== -1 && v.uid === file.uid
                })
                if (photoWatermark) {
                    const policy = photoWatermark.info.policy
                    previewImage = helper.getPolicyUrl(previewImage, policy)
                }
            }
        } else if (body['content_type'] === 'article') {
            previewImage = this.getFinalCover(previewImage)
        }
        this.setState({
            previewImage: previewImage,
            previewVisible: true,
        })
    };

    handleCancelPreview = () =>{
        this.setState({
            previewImage: '',
            previewVisible: false,
        })
    }

    handleRemoveImage = (file) => {
        const previewPhotos = _.cloneDeep(this.state.previewPhotos)
        let photoWatermarks = this.state.photoWatermarks
        let fileList =  _.cloneDeep(this.state.fileList)
        fileList = fileList.filter((item)=>{
            return item.uid !== file.uid
        })
        photoWatermarks = photoWatermarks.filter((item)=>{
            return item.uid !== file.uid
        })
        const newPreviewPhotos = this.getPreviewPhotos(fileList, previewPhotos)

        let {usePhotoWatermark, usePhotoWatermarkTimes} = this.state
        if (!fileList.length && usePhotoWatermark) {
            usePhotoWatermark = false
            usePhotoWatermarkTimes = 0
        }

        this.setState({
            fileList: fileList,
            previewPhotos: _.cloneDeep(newPreviewPhotos),
            currentPreviewPhotos: _.cloneDeep(newPreviewPhotos),
            photoWatermarks: photoWatermarks,
            usePhotoWatermark: usePhotoWatermark,
            usePhotoWatermarkTimes: usePhotoWatermarkTimes,
        })
    }

    handleExecuteTypeChange = (e) => {
        let type = e.target.value
        let body = {...this.state.body}
        body['executeType'] = type
        let {executeTimeError} = this.state
        if (type === 0 && body['execute_time']) {
            body['execute_time'] = ''
            executeTimeError = ''
        }
        this.setState({
            body:  body,
            executeTimeError: executeTimeError,
            saveAsMaterialOnly: type === -1
        })
    }

    handleTimeChange = (key, e) => {
        let body = {...this.state.body}
        body[key] = e
        if (key === 'execute_time') {
            this.checkExecuteTime(e)
        }
        this.setState({
            body: body
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target){
            val = e.target.value
        }else {
            val = e
        }
        let body = _.cloneDeep(this.state.body)
        let content_type = body['content_type']
        body[key] = val
        this.setState({
            body:  body
        }, () => {
            if (key === 'content_desc') {
                if (content_type === 'text') {
                    this.checkEditor(val)
                } else {
                    this.checkEditorLimit(val)
                }
            } else if (key === 'contentAddress') {
                this.checkAddress(val)
                this.setState({
                    cover: null,
                    addressChange: true
                })
            }
        })
    }

    handleCommentChange = (val, index) => {
        let comments = _.cloneDeep(this.state.comments)
        comments[index] = val
        this.setState({
            comments: comments
        }, () => {
            this.checkCommentEditorLimit(val, index)
        })
    }

    // 朋友圈类型
    handleTypeChange = (e) => {
        let val = e.target.value
        let body = {...this.state.body}
        body['content_type'] = val
        this.setState({
            body:  body
        },()=>{
            if(val === 'text'){
                this.checkEditor(body['content_desc'])
            } else {
                if (val === 'article') {
                    this.checkAddress(body['contentAddress'])
                }
                this.checkEditorLimit(body['content_desc'])
            }
        })
    }

    handleRangeChange = (e) => {
        const type = e.target.value
        if (this.checkRange(type)) {
            let body = {...this.state.body}
            body['share_limit'] = type
            this.setState({
                body: body
            })
        }
    }

    checkRange = (type) => {
        if ((type === shareLimitMap.part.code || type === shareLimitMap.block.code) && !this.state.selectedList.length) {
            message.warning('请先选择微信')
            return false
        }
        return true
    }

    handleLabelSelect = (values) => {
        this.setState({
            selectedLabels: values
        })
    }

    // 编辑器验证
    checkEditor = (value) => {
        let descError = ''
        let len = Editor.computeMsgLength(value)
        if (!value || !len) {
            descError = '请输入朋友圈内容'
        } else if (utils.isOverEditorLimit(value, editorLimit)) {
            descError = `字数不超过${editorLimit}字`
        }
        this.setState({
            descError: descError
        })
    }

    checkEditorLimit = (value) => {
        let descError = ''
        let len = Editor.computeMsgLength(value)
        if(value && len){
            if(utils.isOverEditorLimit(value, editorLimit)){
                descError = `字数不超过${editorLimit}字`
            } else {
                descError = ''
            }
        }
        this.setState({
            descError: descError
        })
    }

    checkCommentEditorLimit = (value, index) => {
        let commentErrors = _.cloneDeep(this.state.commentErrors)
        let commentError = ''
        let len = Editor.computeMsgLength(value)
        if (value && len) {
            if(utils.isOverEditorLimit(value, commentEditorLimit)) {
                commentError = `字数不超过${commentEditorLimit}个字`
            }
        }
        if(commentError) {
            _.assign(commentErrors, {[index]: commentError})
        } else {
            commentErrors = _.omit(commentErrors, [index])
        }

        this.setState({
            commentErrors: commentErrors
        })
    }

    // 地址验证
    checkAddress = (value) => {
        let addressError = ''
        const reg = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/
        if (value) {
            if (!reg.test(value)) {
                addressError = '请填写正确的链接地址'
            }
        } else {
            addressError = '请填写链接'
        }

        this.setState({
            addressError: addressError
        })
    }

    handleRemoveCoverUpload = () => {
        this.setState({
            coverFileList: []
        })
        const cover = {...this.state.cover}
        cover['cover'] = ''
        this.setState({
            cover: cover
        })
        this.checkCover(cover)
    }

    handleArticleTitleChange = (e) => {
        const cover = {...this.state.cover}
        cover['title'] = e.target.value.replace(/^\s*/g, '')
        this.setState({
            cover: cover
        })
        this.checkCover(cover)
    }

    handleArticleBlur = () => {
        const {body, addressError, addressChange} = this.state
        if(!addressError && addressChange){
            this.setState({
                addressChange: false
            })
            this.getArticleExtract(body['contentAddress'])
        }
    }

    getArticleExtract = (url) => {
        let params = {url: url}
        this.props.dispatch({
            type: 'wx_moments/getArticleExtract',
            payload: {
                body: params
            },
            callback: (data) => {
                if(this._isMounted) {
                    this.checkCover(data)

                    let coverFileList = []
                    if (data.cover) {
                        coverFileList = utils.getResponseFormat('cover', [data.cover])
                    }
                    if (data.title) {
                        data.title = data.title.substr(0, articleTitleLen)
                    }
                    this.setState({
                        cover: data,
                        coverFileList: coverFileList
                    })
                }
            }
        })
    }

    checkCover = (data) => {
        let coverError = ''
        if(!data.cover && !data.title) {
            coverError = '请上传文章封面和标题'
        }else if (!data.cover && data.title) {
            coverError = '请上传文章封面'
        } else if (data.cover && !data.title) {
            coverError = '请输入文章标题'
        }
        this.setState({
            coverError: coverError
        })
    }

    handleAddComment = () => {
        let comments = _.cloneDeep(this.state.comments)
        comments.push('')
        this.setState({
            comments: comments
        })
    }

    handleRemoveComment = (index) => {
        let comments = _.cloneDeep(this.state.comments)
        comments.splice(index, 1)
        this.setState({
            comments: comments
        })
    }

    handleUseWatermarkChange = (type, e) => {
        const checked = e.target.checked
        if (type === 'photo') {
            this.setState({
                usePhotoWatermark: checked
            })
            if (checked) {
                let {usePhotoWatermarkTimes} = this.state
                if (usePhotoWatermarkTimes === 0) {
                    let {fileList, previewPhotos, photoTextWatermarkValue, photoQrCodeChecked} = this.state
                    this.createPhotoWatermark(fileList, previewPhotos, photoTextWatermarkValue, photoQrCodeChecked)
                }
            } else {
                this.setState({
                    usePhotoWatermarkTimes: 0
                })
            }
        } else if (type === 'video') {
            this.setState({
                useVideoWatermark: checked
            })
            if(checked) {
                this.calculateVideoWatermark()
            } else {
                this.setState({
                    videoWatermarks: []
                })
            }
        }
    }

    createPhotoWatermark = async (fileList, previewPhotos, photoTextWatermarkValue, photoQrCodeChecked) => {
        try {
            this.setState({calculateAllWatermarkLoading: true})
            const previewArr = previewPhotos.map((item) => {
                item.waterMarksData = {
                    uid: item.uid,
                }
                return item
            })
            const watermarks = await calculateAllWatermarkUrlInfo({
                previewArr: previewArr,
                textWatermarkValue: photoTextWatermarkValue,
                qrCodeChecked: photoQrCodeChecked,
            })
            this.setState({calculateAllWatermarkLoading: false})
            this.handlePhotoWatermarkOk(watermarks)
            this.selectedPreviewPhotos(fileList)
        } catch (e) {
            console.log(e)
            message.error('水印批量参数生成出错')
        }
    }

    createFollowPhotoWatermark = async (fileList, previewPhotos, contentWatermark, photoTextWatermarkValue, photoQrCodeChecked) => {
        try {
            this.setState({calculateAllWatermarkLoading: true})
            const previewArr = previewPhotos.filter(item => item.selected).map((item) => {
                item.waterMarksData = {
                    uid: item.uid,
                }
                return item
            })
            const watermarks = await calculateAllWatermarkUrlInfo({
                previewArr: previewArr,
                textWatermarkValue: photoTextWatermarkValue,
                qrCodeChecked: photoQrCodeChecked,
            })
            this.setState({calculateAllWatermarkLoading: false})
            this.handlePhotoWatermarkOk(watermarks)
            this.setState({
                previewPhotos: _.cloneDeep(previewPhotos),
                currentPreviewPhotos: _.cloneDeep(previewPhotos)
            })
        } catch (e) {
            console.log(e)
            message.error('水印批量参数生成出错')
        }
    }

    calculateVideoWatermark = async () => {
        let {videoFileList, videoTextWatermarkValue, videoQrCodeChecked, videoInfo} = this.state
        let videoCover = ''
        let previewVideos = []

        if (videoInfo && Object.keys(videoInfo).length) {
            if (videoFileList.length && videoFileList[0].response) {
                videoCover = helper.getVideoCover(videoFileList[0].response.url)
                previewVideos = [{
                    uid: videoFileList[0].uid,
                    selected: true,
                    url: videoCover
                }]
            }
        }

        try {
            this.setState({calculateAllWatermarkLoading: true})

            const watermarks = await calculateAllWatermarkUrlInfo({
                previewArr: previewVideos,
                textWatermarkValue: videoTextWatermarkValue,
                qrCodeChecked: videoQrCodeChecked,
            })
            this.setState({calculateAllWatermarkLoading: false})

            this.handleVideoWatermarkOk(watermarks)
        } catch(e) {
            console.log(e)
            message.error('水印批量参数生成出错')
        }
    }

    createFollowVideoWatermark = async (videoFileList, videoTextWatermarkValue, videoQrCodeChecked, videoInfo) => {
        let videoCover = ''
        let previewVideos = []

        if (videoInfo && Object.keys(videoInfo).length) {
            if (videoFileList.length && videoFileList[0].response) {
                videoCover = helper.getVideoCover(videoFileList[0].response.url)
                previewVideos = [{
                    uid: videoFileList[0].uid,
                    selected: true,
                    url: videoCover
                }]
            }
        }

        try {
            this.setState({calculateAllWatermarkLoading: true})

            const watermarks = await calculateAllWatermarkUrlInfo({
                previewArr: previewVideos,
                textWatermarkValue: videoTextWatermarkValue,
                qrCodeChecked: videoQrCodeChecked,
            })

            this.setState({calculateAllWatermarkLoading: false})

            this.handleVideoWatermarkOk(watermarks)
        } catch(e) {
            console.log(e)
            message.error('水印批量参数生成出错')
        }
    }

    selectedPreviewPhotos = (fileList) => {
        const previewPhotos =  fileList.map((item) => {
            let url = helper.getThumbLimit(item.response ? item.response.url : '')
            return {
                uid: item.uid,
                url: url,
                selected: true
            }
        })
        this.setState({
            previewPhotos: _.cloneDeep(previewPhotos),
            currentPreviewPhotos: _.cloneDeep(previewPhotos)
        })
    }

    handleShowWatermark = (type) => {
        if (type === 'photo') {
            const {previewPhotos, photoTextWatermarkValue, photoQrCodeChecked} = this.state
            this.setState({
                photoWatermarkVisible: true,
                currentPreviewPhotos: _.cloneDeep(previewPhotos),
                currentPhotoTextWatermarkValue: photoTextWatermarkValue,
                currentPhotoQrCodeChecked: photoQrCodeChecked,
            })
        } else if(type === 'video'){
            const {videoTextWatermarkValue, videoQrCodeChecked} = this.state
            this.setState({
                videoWatermarkVisible: true,
                currentVideoTextWatermarkValue: videoTextWatermarkValue,
                currentVideoQrCodeChecked: videoQrCodeChecked,
            })
        }
    }

    handleHideWatermark = (type, e) => {
        if (typeof e !== 'undefined') {
            if (type === 'photo') {
                const {currentPhotoTextWatermarkValue, currentPhotoQrCodeChecked} = this.state
                this.setState({
                    previewPhotos: _.cloneDeep(this.state.currentPreviewPhotos),
                    photoTextWatermarkValue: currentPhotoTextWatermarkValue,
                    photoQrCodeChecked: currentPhotoQrCodeChecked,
                })
            } else if (type === 'video') {
                const {currentVideoTextWatermarkValue, currentVideoQrCodeChecked} = this.state
                this.setState({
                    videoTextWatermarkValue: currentVideoTextWatermarkValue,
                    videoQrCodeChecked: currentVideoQrCodeChecked,
                })
            }
        }
        if (type === 'photo') {
            this.setState({
                photoWatermarkVisible: false,
            })
        } else if(type === 'video'){
            this.setState({
                videoWatermarkVisible: false
            })
        }
    }

    handleTextWatermarkValueChange = (type, val) => {
        if (type === 'photo') {
            this.setState({
                photoTextWatermarkValue: val
            })
        } else if (type === 'video') {
            this.setState({
                videoTextWatermarkValue: val
            })
        }
    }

    handleQrCodeCheckedChange = (type, e) => {
        const val = e.target.checked
        if (type === 'photo') {
            this.setState({
                photoQrCodeChecked: val
            })
        } else if (type === 'video') {
            this.setState({
                videoQrCodeChecked: val
            })
        }
    }

    handlePhotoWatermarkClick = (item, index, flag, event) => {
        const {previewPhotos} = this.state
        const arr = previewPhotos.map((item, idx) => {
            if (index === idx) {
                item.selected = flag
            }
            return item
        })
        this.setState({
            previewPhotos: arr,
        })
    }

    handlePhotoPreviewSelect = (index) => {
        this.setState({
            photoWatermarkActive: index,
        })
    }

    handlePhotoWatermarkOkChange = (value) => {
        this.setState({
            photoWatermarkConfirmLoading: value,
        })
    }

    handleVideoWatermarkOkChange = (value) => {
        this.setState({
            videoWatermarkConfirmLoading: value,
        })
    }

    handlePhotoWatermarkOk = (watermarks) => {
        let {usePhotoWatermarkTimes} = this.state
        if(usePhotoWatermarkTimes === 0) {
            usePhotoWatermarkTimes += 1
        }
        // console.log('photo', watermarks)
        watermarks = watermarks.map((item)=>{
            let policy = item.info.policy
            if (policy.endsWith('|')) {
                item.info.policy = policy.slice(0, policy.lastIndexOf('|'))
            }
            return item
        })
        this.setState({
            photoWatermarks: watermarks,
            usePhotoWatermarkTimes: usePhotoWatermarkTimes,
        })
    }

    handleVideoWatermarkOk = (watermarks) => {
        // console.log('video', watermarks)
        watermarks = watermarks.filter((item) => {
            return item.info && item.info.fopArr && item.info.fopArr.length
        })
        this.setState({
            videoWatermarks: watermarks
        })
    }

    handleShowMaterials = (type) => {
        this.setState({
            materialsVisible: true,
            currentMaterialType: type,
        })
    }

    handleHideMaterials = () => {
        this.setState({
            materialsVisible: false
        })
    }

    handleMaterialsOk = (materials) => {
        this.handleHideMaterials()
        this.parseMaterials(materials)
    }

    parseMaterials = (materials) => {
        const type = this.state.currentMaterialType
        let body = {...this.state.body}

        if (type === materialType.text.type) {
            body.content_desc = Editor.msgToHtml(materials[0].desc || '')
            this.setState({
                body: body
            })
            return
        }

        const prefix = 'moment-material'
        let content = []

        if (type === materialType.image.type || type === materialType.video.type) {
            const urls = materials.map((v) => {
                return v.url
            })
            content = utils.getResponseFormat(prefix, urls)
        }
        if (type === materialType.image.type) {
            let fileList = [...this.state.fileList]
            let previewPhotos = [...this.state.previewPhotos]
            fileList = fileList.concat(content)
            const photos = this.getPreviewPhotos(fileList, previewPhotos)
            this.setState({
                fileList: fileList,
                previewPhotos: _.cloneDeep(photos),
                currentPreviewPhotos: _.cloneDeep(photos),
            })
        } else if (type === materialType.video.type) {
            let videoFileList = [...this.state.videoFileList]
            videoFileList = content
            this.getVideoInfo(materials[0].url, (data) => {
                this.setState({
                    videoSourceDuration: data.duration,
                    videoCut: '',
                    videoFileList: videoFileList,
                    useVideoWatermark: false,
                    videoWatermarks: [],
                })
            })
        } else if (type === materialType.webPage.type) {
            let coverFileList = []
            let cover = {}

            if (materials.length) {
                let material = materials[0]
                body.contentAddress = material.url
                if (body.contentAddress) {
                    const title = material.title
                    cover = {
                        cover: material.thumb_url,
                        title: title ? title.substr(0, articleTitleLen) : ''
                    }
                    if (cover.cover) {
                        coverFileList = utils.getResponseFormat('cover', [cover.cover])
                    }
                }
                this.setState({
                    body: body,
                    cover: cover,
                    coverFileList: coverFileList
                }, () => {
                    this.checkAddress(body.contentAddress)
                    if(cover) {
                        this.checkCover(cover)
                    }
                })
            }
        }
    }

    handleShowVideoPreview = (videoPreview) => {
        this.setState({
            videoPreviewVisible: true,
            videoPreview: videoPreview
        })
    }

    handleHideVideoPreview = () => {
        this.setState({
            videoPreviewVisible: false,
            videoPreview: ''
        })
    }

    handleShowGoods = () => {
        this.setState({
            goodsVisible: true,
        })
    }

    handleGoodsOk = (data=[]) => {
        this.handleHideGoods()

        const urls = data.map((v) => {
            return v.url
        })
        let attachedData = _.cloneDeep(this.state.attachedData)
        attachedData = attachedData.concat(data)
        const content = utils.getResponseFormat('hz-mall', urls)
        let fileList = _.cloneDeep(this.state.fileList)
        let previewPhotos = _.cloneDeep(this.state.previewPhotos)
        fileList = fileList.concat(content)
        const photos = this.getPreviewPhotos(fileList, previewPhotos)
        this.setState({
            attachedData: attachedData,
            fileList: fileList,
            previewPhotos: _.cloneDeep(photos),
            currentPreviewPhotos: _.cloneDeep(photos),
        })
    }

    handleHideGoods = () => {
        this.setState({
            goodsVisible: false,
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {
                span: 2,
            },
            wrapperCol: {span: 10},
        }

        const uploadFormLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 12},
        }

        const submitFormLayout = {
            labelCol: {
                span: 0,
            },
            wrapperCol: {
                span: 10,
                offset: 2
            },
        }

        const {
            previewVisible, previewImage,
            videoDuration,
            videoCut,
            videoRange,
            videoCutVisible,
            videoFileList,
            videoSourceDuration,
            videoInfo,
            cover,
            coverFileList,
            wxVisible, selectedList, submit,
            body,
            comments,
            labels,
            selectedLabels,
            executeTimeError,
            descError,
            commentErrors,
            addressError,
            coverError,

            defaultWatermark,

            photoWatermarkVisible,
            usePhotoWatermark,
            photoWatermarkConfirmLoading,
            previewPhotos,
            photoQrCodeChecked,
            photoTextWatermarkValue,
            photoWatermarkActive,

            videoWatermarkVisible,
            videoWatermarkConfirmLoading,
            useVideoWatermark,
            // previewVideos,
            videoTextWatermarkValue,
            // videoQrCodeChecked,
            videoPreviewVisible,
            videoPreview,
            videoWatermarkLoading,

            calculateAllWatermarkLoading,

            saveAsMaterialOnly,

            materialsVisible,
            currentMaterialType,

            isEnableHZMall,
            goodsVisible,

            initData,
            taskCount,

        } = this.state

        const rangeType = body.share_limit

        let fileList = this.state.fileList.length > imageMaxLen ? this.state.fileList.slice(0, imageMaxLen) : this.state.fileList

        const {sendLoading, labelsLoading, videoInfoLoading, materialLoading, videoVerifyLoading, coverLoading} = this.props

        const uploadButton = (<Button icon="upload"> 点击上传</Button>)

        const coverUploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">点击上传</div>
            </div>
        )

        const hideHZMall = _.get(initData, 'company.product_version.id') === JDProductVersion
        // 群发白名单
        const noFunctionLimit = _.get(initData, 'setting.no_function_limit')

        const imageUploadProps = uploadProps.imageUploadProps(fileList, this.handleImageUploadChange)
        const videoUploadProps = uploadProps.videoUploadProps(videoFileList, this.handleVideoUploadChange)
        const coverUploadProps = uploadProps.coverUploadProps(coverFileList, this.handleCoverUploadChange)

        const videoCover = this.getCurrentVideoCover()

        return (
            <Spin spinning={!!materialLoading}>
                <div className={styles.sentMoments} id="automatedTaskSent">
                    {
                        noFunctionLimit ? null : <Alert message={
                            <span className={styles.topTip}>为避免频繁发圈影响朋友圈内容质量，每个账号每日仅支持创建【{maxTaskCount}次】当日执行的朋友圈</span>}
                                                        type="warning" showIcon icon={<Icon className={styles.warningIcon} type="warning" theme="filled" />} />
                    }
                    <Form>
                        <FormItem {...formItemLayout}
                            label="类型"
                            required={true}
                        >
                            <RadioGroup value={body['content_type']} onChange={this.handleTypeChange}>
                                {
                                    Object.keys(contentType).map((key) => {
                                        return  <Radio key={key} value={key}>{contentType[key]}</Radio>
                                    })
                                }
                            </RadioGroup>
                        </FormItem>
                        <FormItem {...formItemLayout} label="朋友圈内容" required={body['content_type'] === 'text'}>
                            <div className={`${styles.editor} ${styles.descEditorWrap}`}>
                                <MomentEditor placeholder="限制1500个字"
                                    value={body.content_desc}
                                    onChange={(e)=>{this.handleChange('content_desc', e)}}
                                    extend={<span className={styles.editorExtend}
                                        onClick={()=>{this.handleShowMaterials(materialType.text.type)}}>从素材库选择</span>}
                                    disableKeyDown={true}
                                    className={styles.descEditor}
                                />
                            </div>
                            { descError ?
                                <p className={styles.errorMsg}>{descError}</p> : ''
                            }
                        </FormItem>
                        {
                            body['content_type'] === 'text' ? '' :
                                body['content_type'] === 'article' ?
                                    <FormItem
                                        {...formItemLayout}
                                        label="地址"
                                        className={styles.addressItem}
                                        required={true}
                                    >
                                        <div className={styles.articleMaterial}>
                                            <Input value={body['contentAddress']}
                                                onChange={(e)=>{this.handleChange('contentAddress', e)}}
                                                onBlur={this.handleArticleBlur}
                                            />
                                            <Button className={styles.materialBtn}
                                                onClick={()=>{this.handleShowMaterials(materialType.webPage.type)}}
                                            >从素材库选择</Button>
                                        </div>
                                        { addressError ?
                                            <p className={styles.errorMsg}>{addressError}</p> : ''
                                        }
                                        <div className={styles.coverWrap}>
                                            {!addressError ? <div className={styles.spinWrap}>
                                                <Spin size="small" spinning={!!coverLoading}>
                                                    {
                                                        cover ? <Fragment>
                                                            <div className={styles.coverContent}>
                                                                <div className={styles.coverFileList}>
                                                                    <div className={styles.coverUpload}>
                                                                        <QiniuUpload {...coverUploadProps}>
                                                                            {coverFileList.length >= 1 ? null : coverUploadButton}
                                                                        </QiniuUpload>
                                                                    </div>
                                                                    {
                                                                        coverFileList.map((item) => {
                                                                            if(item.status === 'uploading') {
                                                                                return <div key={item.uid} className={`${styles.fileItem} ${styles.uploading}`}>
                                                                                    图片上传中
                                                                                </div>
                                                                            }
                                                                            return (
                                                                                item.response ?
                                                                                    <div key={item.uid} className={styles.fileItem}>
                                                                                        <div className={styles.card}>
                                                                                            <img src={item.response.url}
                                                                                                rel="no-referrer"
                                                                                                alt="封面"/>
                                                                                            <div
                                                                                                className={styles.action}>
                                                                                                <Icon type="eye-o"
                                                                                                    className={styles.icon}
                                                                                                    onClick={() => {
                                                                                                        this.handleShowPreview(item)
                                                                                                    }}
                                                                                                />
                                                                                                <Icon type="delete"
                                                                                                    className={styles.icon}
                                                                                                    onClick={this.handleRemoveCoverUpload}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div> : ''
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                                <TextArea className={styles.coverTitle}
                                                                    placeholder={`请输入分享标题，限${articleTitleLen}个字`}
                                                                    rows={2}
                                                                    maxLength={articleTitleLen}
                                                                    value={cover && cover['title']}
                                                                    onChange={this.handleArticleTitleChange}
                                                                />
                                                            </div>
                                                            <p className={`${styles.tip} ${styles.coverTip}`}>建议尺寸：160×160像素；支持jpg、jpeg、png格式，图片大小不超过1MB</p>
                                                        </Fragment> :  ''
                                                    }
                                                </Spin>
                                            </div> : ''
                                            }
                                            { coverError && !addressError ? <p className={styles.errorMsg}>{coverError}</p> : ''}
                                        </div>

                                    </FormItem> :
                                    body['content_type'] === 'photo' ?
                                        <FormItem
                                            {...uploadFormLayout}
                                            label="上传图片"
                                            className={styles.uploadItem}
                                            required={true}
                                        >
                                            <div className={styles.uploadOperation}>
                                                <QiniuUpload {...imageUploadProps}>
                                                    { fileList.length >= imageMaxLen ? null : uploadButton}
                                                </QiniuUpload>
                                                {fileList.length >= imageMaxLen ? null : <Fragment>
                                                    <Button className={styles.materialBtn}
                                                        onClick={() => {this.handleShowMaterials(materialType.image.type)}}
                                                    >从素材库选择</Button>
                                                    { hideHZMall ? null : <Button className={styles.materialBtn}
                                                        disabled={!isEnableHZMall}
                                                        onClick={this.handleShowGoods}
                                                    >从虎赞小店选择</Button>}
                                                </Fragment>
                                                }
                                            </div>
                                            {
                                                fileList.length ? <Spin spinning={calculateAllWatermarkLoading}>
                                                    <div className={styles.fileList}>
                                                        {
                                                            fileList.map((item, i) => {
                                                                if (item.status === 'uploading') {
                                                                    return <div key={i}
                                                                        className={`${styles.fileItem} ${styles.uploading}`}>图片上传中</div>
                                                                } else {
                                                                    const previewPhoto = previewPhotos.find((v) => {
                                                                        return item.uid === v.uid
                                                                    })

                                                                    return item.response ? <SortItem
                                                                        className={styles.fileItem}
                                                                        key={i}
                                                                        onSortItems={this.handleSortItems}
                                                                        items={fileList}
                                                                        sortId={i}>
                                                                        <div className={`${styles.card} ${usePhotoWatermark && this.isShowPhotoWatermarkTag(previewPhoto) ? styles.watermark : null}`}>
                                                                            <img src={helper.getThumb(item.response.url)} alt="缩略图"/>
                                                                            <div className={styles.action}>
                                                                                <Icon type="eye-o"
                                                                                    className={styles.icon}
                                                                                    onClick={()=>{this.handleShowPreview(item, i)}}
                                                                                />
                                                                                <Icon type="delete"
                                                                                    className={styles.icon}
                                                                                    onClick={()=>{this.handleRemoveImage(item)}}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </SortItem> : null
                                                                }
                                                            })
                                                        }
                                                    </div>
                                                    {
                                                        fileList.length && fileList.every((item)=>{return item.status === 'done'})
                                                            ? <div className={styles.watermarkOperation}>
                                                                <Checkbox checked={usePhotoWatermark}
                                                                    onChange={(e)=>{this.handleUseWatermarkChange('photo', e)}}>使用水印</Checkbox>
                                                                {
                                                                    usePhotoWatermark ? (this.hasDefaultWatermark(defaultWatermark) ? <span className={styles.stress}
                                                                        onClick={()=>{this.handleShowWatermark('photo')}}>点击可修改</span>
                                                                        : <span className={styles.stress} onClick={()=>{this.handleShowWatermark('photo')}}>点击编辑水印</span> ) : null
                                                                }
                                                            </div> : null
                                                    }
                                                </Spin> : null
                                            }
                                            {submit && body['content_type'] === 'photo' && !fileList.length ?
                                                <p className={styles.errorMsg}>请上传图片</p> : null}
                                            <div className={`${styles.tip} ${styles.photoTip}`}>
                                                <p>最多{imageMaxLen}张图；格式：jpg、jpeg、png；图片大小不能超过{imageMaxSize}M</p>
                                                <p>(上传图片时，如出现浏览器卡死的情况，请尝试关闭输入法)</p>
                                            </div>
                                        </FormItem> :
                                        <FormItem
                                            {...formItemLayout}
                                            label="上传视频"
                                            required={true}
                                            className={styles.uploadItem}
                                        >
                                            <div className={styles.uploadOperation}>
                                                <QiniuUpload {...videoUploadProps}
                                                    getKey={this.getVideoKey}>
                                                    {!videoFileList.length && <Button icon="upload"> 点击上传</Button>}
                                                </QiniuUpload>
                                                <Button className={styles.materialBtn}
                                                    onClick={()=>{this.handleShowMaterials(materialType.video.type)}}
                                                >从素材库选择</Button>
                                            </div>
                                            {!videoFileList.length && <span className={`${styles.tip} ${styles.videoTip}`}>文件大小不能超过{videoMaxSize}M</span>}
                                            {
                                                videoFileList.length && videoFileList[0].response ?
                                                    <Spin spinning={calculateAllWatermarkLoading}>
                                                        <div className={styles.videoWrap}>
                                                            {videoCover ? <div className={styles.left}>
                                                                <img className={styles.videoCover}
                                                                    src={videoCover}
                                                                    onClick={()=>{this.handleShowVideoPreview(videoCut || videoFileList[0].response.url)}}
                                                                    alt="缩略图"
                                                                />
                                                            </div> : null
                                                            }
                                                            { videoInfoLoading ? <Spin size="small" style={{width: '100%'}}/> :
                                                                (videoInfo && Object.keys(videoInfo).length ? <div className={styles.right}>
                                                                    <p>视频长度：{parseInt(videoInfo.duration || 0, 10)}秒</p>
                                                                    {
                                                                        videoInfo.duration && Number(videoInfo.duration) >= videoMaxDuration ?
                                                                            <p className={styles.errorTip}>朋友圈只能分享15秒以内的视频，请进行编辑</p> : null
                                                                    }
                                                                    <span className={styles.stress} onClick={() => this.handleShowVideoCut(videoSourceDuration)}>编辑视频</span>
                                                                </div> : null)
                                                            }
                                                        </div>
                                                        {(videoInfo.duration && Number(videoInfo.duration) < videoMaxDuration) || videoCut
                                                            ? (
                                                                videoFileList.length && videoFileList[0].status === 'done'
                                                                    ? <div className={styles.watermarkOperation}>
                                                                        <Checkbox checked={useVideoWatermark}
                                                                            onChange={(e)=>{this.handleUseWatermarkChange('video', e)}}>使用水印</Checkbox>
                                                                        {
                                                                            useVideoWatermark ? (this.hasDefaultWatermark(defaultWatermark)? <span className={styles.stress}
                                                                                onClick={()=>{this.handleShowWatermark('video')}}>点击可修改</span>
                                                                                : <span className={styles.stress} onClick={()=>{this.handleShowWatermark('video')}}>点击编辑水印</span> ) : null
                                                                        }
                                                                    </div> : null
                                                            ) : null}
                                                    </Spin>
                                                    : null
                                            }
                                            {submit && body['content_type'] === 'video' && !videoFileList.length ?
                                                <p className={styles.errorMsg}>请上传视频</p> : null}
                                        </FormItem>
                        }
                        <FormItem {...formItemLayout}
                            label="延时评论"
                            className={styles.commentItem}>
                            {
                                comments.map((comment, index)=>{
                                    return  <div key={index} className={styles.commentWrap}>
                                        <div className={`${styles.editor} ${styles.commentEditorWrap}`}>
                                            <Editor placeholder={`限制${commentEditorLimit}个字`}
                                                value={comment}
                                                onChange={(val)=>{this.handleCommentChange(val, index)}}
                                                disableKeyDown={true}
                                                className={styles.commentEditor}
                                            />
                                        </div>
                                        {
                                            index ? <Icon type="delete"
                                                className={styles.deleteComment}
                                                onClick={()=>{this.handleRemoveComment(index)}}
                                            /> : null}
                                        { commentErrors[index] ? <p className={styles.errorMsg}>{commentErrors[index]}</p> : null}
                                    </div>
                                })
                            }
                            <span className={`${styles.tip} ${styles.commentTip}`}>在朋友圈内容下方显示自己评论的内容，发送成功后10~20秒评论</span>
                            <div className={styles.addComment}>
                                <Button type="dashed"
                                    disabled={comments.length >= 10}
                                    onClick={this.handleAddComment}
                                ><Icon type="plus"/>添加评论内容</Button>
                            </div>
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="执行时间"
                            required={true}
                            className={styles.timeItem}
                        >
                            <RadioGroup defaultValue={body['executeType']} onChange={this.handleExecuteTypeChange}>
                                <Radio value={0}>立即执行</Radio>
                                <Radio value={1}>定时执行</Radio>
                                <Radio value={-1}>仅保存为素材</Radio>
                            </RadioGroup>
                            { body['executeType'] === 1 ? <div className={styles.datePicker}><DatePicker
                                showTime={{format: timeFormat}}
                                format={executeTimeFormat}
                                disabledDate={this.disabledDate}
                                style={{width: 200}}
                                getCalendarContainer={() => document.getElementById('automatedTaskSent')}
                                onChange={(e) => {
                                    this.handleTimeChange('execute_time', e)
                                }}
                            /></div> : null }
                            {!saveAsMaterialOnly && body['executeType'] === 1 && executeTimeError ?
                                <p style={{marginLeft: '100px'}} className={styles.errorMsg}>{executeTimeError}</p> : null}
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="选择微信"
                            required={true}
                            className={styles.selectItem}>
                            <div className={styles.addUin}>
                                <Button icon="plus"
                                    onClick={this.handleShowSelect}
                                    disabled={saveAsMaterialOnly}
                                >添加微信</Button>
                                {!saveAsMaterialOnly && submit && !selectedList.length ? <p className={styles.errorMsg}>请选择微信</p> : null}
                            </div>
                        </FormItem>
                        {
                            selectedList.length ? <div  className={`${styles.tableItem} ${ saveAsMaterialOnly ? styles.disabled : null}`}>
                                <WeChatTable list={selectedList} onRemove={this.deleteSelectedWeChat}/>
                            </div>: null
                        }
                        <FormItem {...formItemLayout}
                            label="可见范围"
                            required={true}
                            className={styles.rangeItem}
                        >
                            <RadioGroup value={rangeType}
                                className={styles.rangeGroup}
                                onChange={this.handleRangeChange}
                                disabled={saveAsMaterialOnly}
                            >
                                {
                                    Object.keys(shareLimitMap).map((key) => {
                                        let item = shareLimitMap[key]
                                        return <Radio key={item.code} value={item.code}>{item.text}
                                            {rangeType === shareLimitMap.self.code && item.code === rangeType ?
                                                <div className={styles.rangeTip}>仅自己可见不支持评论</div> : null}
                                        </Radio>
                                    })
                                }
                            </RadioGroup>
                            {
                                rangeType === shareLimitMap.part.code || rangeType === shareLimitMap.block.code ?
                                    <div className={styles.rangeSelect}>
                                        <Select mode="multiple"
                                            optionFilterProp="children"
                                            placeholder="请选择标签"
                                            disabled={saveAsMaterialOnly}
                                            value={selectedLabels}
                                            onChange={this.handleLabelSelect}
                                            notFoundContent={labelsLoading ? <Spin size="small"/>
                                                : labels.length ? null : <p>未找到标签</p>}
                                        >
                                            {
                                                labels.map((item)=>{
                                                    return <Option key={item}>{item}</Option>
                                                })
                                            }
                                        </Select>
                                        {!saveAsMaterialOnly && selectedList.length && !labelsLoading && !labels.length ?
                                            <p className={styles.errorMsg}>所选微信号均未设置标签内容，请修改可见范围为全部可见或仅自己可见</p> : ''}
                                        {!saveAsMaterialOnly && submit && labels.length && !selectedLabels.length ? <p className={styles.errorMsg}>请选择标签</p>: ''}
                                    </div> : ''
                            }
                        </FormItem>
                        { noFunctionLimit ? null : <p className={styles.restTip}>今日执行的朋友圈剩余创建次数：{maxTaskCount - taskCount >= 0 ? maxTaskCount - taskCount : 0} 次</p>}
                        <FormItem {...submitFormLayout} className={styles.btns}>
                            <Button type="primary"
                                icon={(videoVerifyLoading || sendLoading || videoWatermarkLoading) ? 'loading' : null}
                                disabled={videoVerifyLoading || sendLoading || videoWatermarkLoading}
                                onClick={this.handleSubmit}>保存</Button>
                            <Button style={{marginLeft: 16}} onClick={this.showConfirm}>取消</Button>
                        </FormItem>
                    </Form>
                    <PhotoWatermark
                        onOkChange={this.handlePhotoWatermarkOkChange}
                        watermarkHandleOk={this.handlePhotoWatermarkOk}
                        watermarkActive={photoWatermarkActive}
                        watermarkClick={this.handlePhotoWatermarkClick}
                        textWatermarkValue={photoTextWatermarkValue}
                        qrCodeChecked={photoQrCodeChecked}
                        previewArr={previewPhotos}
                        previewSelect={this.handlePhotoPreviewSelect}
                        onTextWatermarkValueChange={(e)=>{this.handleTextWatermarkValueChange('photo', e)}}
                        ontQrCodeCheckedChange={(e)=>{this.handleQrCodeCheckedChange('photo', e)}}
                        modalOption={{
                            visible: photoWatermarkVisible,
                            onCancel: (e)=>{this.handleHideWatermark('photo', e)},
                            width: '920px',
                            destroyOnClose: true,
                            maskClosable: false,
                            confirmLoading: photoWatermarkConfirmLoading,
                            title: '图片水印设置',
                        }}
                    />
                    <VideoWatermark
                        onOkChange={this.handleVideoWatermarkOkChange}
                        previewUrl={videoCover}
                        onOk={this.handleVideoWatermarkOk}
                        textWatermarkValue={videoTextWatermarkValue}
                        onTextWatermarkValueChange={(e)=>{this.handleTextWatermarkValueChange('video', e)}}
                        // 视频水印去掉图片二维码
                        qrCodeChecked={false}
                        showQrCode={false}
                        // qrCodeChecked={videoQrCodeChecked}
                        // onQrCodeCheckedChange={(e)=>{this.handleQrCodeCheckedChange('video', e)}}
                        modalOption={{
                            visible: videoWatermarkVisible,
                            onCancel: (e)=>{this.handleHideWatermark('video', e)},
                            width: '920px',
                            destroyOnClose: true,
                            maskClosable: false,
                            confirmLoading: videoWatermarkConfirmLoading,
                            title: '视频水印设置',
                        }}
                    />
                    <WeChatSelectMulti
                        visible={wxVisible}
                        apiHost={`${baseConfig.apiHost}/api`}
                        accessToken={this.props.base.accessToken}
                        filterBySerialno={true}
                        searchOption={['query', 'group_id', 'online']}
                        onCancel={this.handleSelectCancel}
                        onOk={this.handleSelectOk}/>

                    {videoCutVisible ? <VideoCut {...this.props}
                        visible={videoCutVisible}
                        source={videoFileList[0].response.url}
                        duration={videoDuration}
                        range={videoRange}
                        onOk={this.handleVideoCutOk}
                        onCancel={this.handleVideoCutCancel}
                    /> : null}
                    {materialsVisible ? <Materials
                        visible={materialsVisible}
                        type={currentMaterialType}
                        remainder={imageMaxLen - fileList.length}
                        onOk={this.handleMaterialsOk}
                        onCancel={this.handleHideMaterials}
                    /> : null}
                    <ImagePreview visible={previewVisible}
                        imageUrl={previewImage}
                        onCancel={this.handleCancelPreview}
                    />
                    <VideoPreview visible={videoPreviewVisible}
                        source={videoPreview}
                        onCancel={this.handleHideVideoPreview}
                    />
                    {
                        goodsVisible ? <Goods visible={goodsVisible}
                            remainder={imageMaxLen - fileList.length}
                            onOk={this.handleGoodsOk}
                            onCancel={this.handleHideGoods}
                        /> : null
                    }
                </div>
            </Spin>
        )
    }
}

