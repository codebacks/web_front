import React from 'react'
import {Modal, message} from 'antd'
import PropTypes from 'prop-types'
import {calculateWatermarkUrlInfo} from 'wx/components/Watermark/qiniuTools'
import {captureException, warpExtra} from 'utils/raven'
import Watermark from 'wx/components/Watermark'
import styles from './index.scss'
import {hot} from "react-hot-loader"
import modalWarp from "hoc/modalWarp"

@hot(module)
@modalWarp()
export default class VideoCut extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.watermarkRef = React.createRef()
        props.setModalOkFn(this.handleOk)
    }

    static propTypes = {
        visible: PropTypes.bool,
        textWatermarkValue: PropTypes.string,
        previewUrl: PropTypes.string,
        qrCodeChecked: PropTypes.bool,
        showQrCode: PropTypes.bool,
        onTextWatermarkValueChange: PropTypes.func,
        onQrCodeCheckedChange: PropTypes.func,
        onOkChange: PropTypes.func,
    }

    static defaultProps = {
        visible: false,
        previewUrl: '',
        textWatermarkValue: '',
        qrCodeChecked: false,
        showQrCode: false,
        onTextWatermarkValueChange: ()=>{},
        onQrCodeCheckedChange: ()=>{},
        onOkChange: () => {},
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onTextWatermarkValueChange = (e) => {
        this.props.onTextWatermarkValueChange(e)
    }

    onQrCodeCheckedChange = (e) => {
        this.props.onQrCodeCheckedChange(e)
    }

    handleOk = () => {
        if(this.watermarkRef) {
            this.watermarkRef.current.getWatermarkTemplateData(async () => {
                const {
                    textWatermarkValue,
                    qrCodeChecked,
                    previewUrl,
                    onOkChange,
                } = this.props
                onOkChange(true)
                try {
                    const watermarks = await this.calculateAllWatermarkUrlInfo(previewUrl, textWatermarkValue, qrCodeChecked)
                    this.props.onOk(watermarks)
                    this.handleCancel()
                } catch (e) {
                    console.log(e)
                    message.error('水印生成出错')
                    captureException('水印生成出错', {extra: warpExtra(e)})
                }finally {
                    onOkChange(false)
                }
            })
        }
    }

    calculateAllWatermarkUrlInfo = async (previewUrl, textWatermarkValue, qrCodeChecked) => {
        const watermarks = []
        watermarks.push(calculateWatermarkUrlInfo({
            previewUrl: previewUrl,
            textWatermarkValue,
            qrCodeChecked,
        }))
        return Promise.all(watermarks)
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {previewUrl, textWatermarkValue, qrCodeChecked, showQrCode} = this.props

        return (
            <div className={styles.wrapper}>
                <Watermark
                    previewUrl={previewUrl}
                    textWatermarkValue={textWatermarkValue}
                    qrCodeChecked={qrCodeChecked}
                    getLeoRef={this.watermarkRef}
                    showQrCode={showQrCode}
                    onTextWatermarkValueChange={this.onTextWatermarkValueChange}
                    ontQrCodeCheckedChange={this.onQrCodeCheckedChange}
                />
            </div>
        )
    }
}
