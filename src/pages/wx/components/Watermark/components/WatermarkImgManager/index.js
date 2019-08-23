/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/20
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {calculateWatermarkUrlInfo} from '../../qiniuTools'
import {captureException, warpExtra} from 'utils/raven'
import _ from 'lodash'
import {message} from "antd"

class ImgManager extends PureComponent {
    static displayName = 'WatermarkImgManager'

    static propTypes = {
        defaultSrc: PropTypes.string,
        errorSrc: PropTypes.string,
        loadingSrc: PropTypes.string,
        render: PropTypes.func,
        previewUrl: PropTypes.string,
        textWatermarkValue: PropTypes.string,
        qrCodeChecked: PropTypes.bool,
        processTextWatermarkValue: PropTypes.func,
        wait: PropTypes.number,
    }

    static defaultProps = {
        defaultSrc: '',
        wait: 200,
        render(imgSrc) {
            return <img alt={''} src={imgSrc}/>
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            imgSrc: props.defaultSrc,
            imgState: 'init',
        }
        this.img = null
        this.watermarkUrlInfo = null
        this.loadImg = _.debounce(this.loadImgWarp, props.wait)
    }

    componentDidMount() {
        this._isMounted = true
        this.loadImg()
    }

    componentDidUpdate(prevProps) {
        const props = this.props
        if(
            (prevProps.previewUrl !== props.previewUrl) ||
            (prevProps.textWatermarkValue !== props.textWatermarkValue) ||
            (prevProps.qrCodeChecked !== props.qrCodeChecked)
        ) {
            this.loadImg()
        }
    }

    componentWillUnmount() {
        this._isMounted = false
        this.destroyImg()
    }

    imgLoad = () => {
        if(this._isMounted) {
            this.setState({
                imgSrc: _.get(this.watermarkUrlInfo, 'url', ''),
                imgState: 'load',
            })
        }
    }

    getImgSrc(imgSrc) {
        return imgSrc || this.props.defaultSrc
    }

    imgError = () => {
        captureException('水印处理出错', {extra: warpExtra(this.watermarkUrlInfo)})
        if(this._isMounted) {
            this.setState(() => {
                return {
                    imgSrc: this.props.errorSrc,
                    imgState: 'error',
                }
            })
        }
    }

    async loadImgWarp() {
        let {
            previewUrl,
            textWatermarkValue,
            qrCodeChecked,
            loadingSrc,
            processTextWatermarkValue,
        } = this.props
        try {
            if(processTextWatermarkValue) {
                textWatermarkValue = processTextWatermarkValue(textWatermarkValue)
            }
            const watermarkUrlInfo = await calculateWatermarkUrlInfo({previewUrl, textWatermarkValue, qrCodeChecked})

            if(_.get(watermarkUrlInfo, 'url', '') !== _.get(this.watermarkUrlInfo, 'url', '')) {
                this.watermarkUrlInfo = watermarkUrlInfo
                this.destroyImg()
                const img = this.img = new Image()
                img.addEventListener('load', this.imgLoad, false)
                img.addEventListener('error', this.imgError, false)
                img.src = watermarkUrlInfo.url

                this.setState(() => {
                    return {
                        imgSrc: loadingSrc,
                        imgState: 'loading',
                    }
                })
            }
        }catch(e) {
            console.log(e)
            message.error('水印参数生成出错')
            captureException('水印参数生成出错', {extra: warpExtra(e)})
        }
    }

    destroyImg() {
        if(this.img) {
            this.img.removeEventListener('load', this.imgLoad, false)
            this.img.removeEventListener('error', this.imgError, false)
            this.img.src = ''
            this.img = null
        }
    }

    render() {
        const {render} = this.props
        const {imgSrc, imgState} = this.state
        return render(this.getImgSrc(imgSrc), imgState)
    }
}

export default ImgManager
