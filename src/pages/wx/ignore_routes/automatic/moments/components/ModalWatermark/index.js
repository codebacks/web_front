/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/16
 */
import React, {PureComponent} from 'react'
import {
    Col,
    message,
    Row,
    Icon,
} from 'antd'
import {ReactComponent as Checked} from './images/checked.svg'
import PropTypes from 'prop-types'
import Watermark from 'wx/components/Watermark'
import {calculateAllWatermarkUrlInfo} from 'wx/components/Watermark/qiniuTools'
import modalWarp from 'hoc/modalWarp'
import styles from './index.less'
import Helper from 'wx/utils/helper'
import {hot} from "react-hot-loader"
import classNames from 'classnames'

@hot(module)
@modalWarp()
export default class Index extends PureComponent {
    static propTypes = {
        previewArr: PropTypes.array,
        watermarkActive: PropTypes.number,
        watermarkHandleOk: PropTypes.func,
        watermarkClick: PropTypes.func,
        previewSelect: PropTypes.func,
        onOkChange: PropTypes.func,
    }

    static defaultProps = {
        previewArr: [],
        watermarkActive: 0,
    }

    constructor(props) {
        super(props)
        this.watermarkRef = React.createRef()
        props.setModalOkFn(this.handleOk)
    }

    handleOk = () => {
        if(this.watermarkRef) {
            this.watermarkRef.current.getWatermarkTemplateData(async () => {
                let {
                    textWatermarkValue,
                    qrCodeChecked,
                    previewArr,
                    onOkChange,
                } = this.props

                onOkChange(true)
                try {
                    previewArr = previewArr.filter(item => item.selected).map((item) => {
                        item.waterMarksData = {
                            uid: item.uid,
                        }
                        return item
                    })
                    if(previewArr.length === 0) {
                        message.warning('请选择应用于哪些图片')
                    }else {
                        const watermarks = await calculateAllWatermarkUrlInfo({
                            previewArr,
                            textWatermarkValue,
                            qrCodeChecked,
                        })
                        this.props.watermarkHandleOk(watermarks)
                        this.handleCancel()
                    }
                }catch(e) {
                    console.log(e)
                    message.error('水印批量参数生成出错')
                }finally {
                    onOkChange(false)
                }
            })
        }
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    renderOther = () => {
        return (
            <Row>
                <Col span={4} className={styles.title}>
                    应用于：
                </Col>
                <Col offset={4} span={20} className={styles.previewArr}>
                    {this.renderPreviewArr()}
                </Col>
            </Row>
        )
    }

    watermarkClick = (item, index, flag, event) => {
        event.stopPropagation()
        this.props.watermarkClick(item, index, flag, event)
    }

    previewSelect = (index, event) => {
        this.props.previewSelect(index, event)
    }

    renderPreviewArr = () => {
        const {previewArr, watermarkActive} = this.props

        return previewArr.map((item, index) => {
            const cls = classNames(styles.previewItem, index === watermarkActive && styles.selected)
            return (
                <div
                    className={cls}
                    key={index}
                    onClick={() => {
                        this.previewSelect(index, event)
                    }}
                >
                    <div className={styles.previewItemInner}>
                        <img
                            className={styles.previewItemImg}
                            alt={'预览'}
                            src={Helper.getThumb(item.url)}
                        />
                        {
                            item.selected ? (
                                <Icon
                                    className={styles.imgSelect}
                                    component={Checked}
                                    style={{fontSize: '28px', color: '#4391FF'}}
                                    onClick={(event) => {
                                        this.watermarkClick(item, index, false, event)
                                    }}
                                />
                            ) : (
                                <div
                                    className={`${styles.imgSelect} ${styles.cyclo}`}
                                    onClick={(event) => {
                                        this.watermarkClick(item, index, true, event)
                                    }}
                                />
                            )
                        }
                    </div>
                </div>
            )
        })
    }

    getPreviewUrl = () => {
        const {previewArr, watermarkActive} = this.props
        if(previewArr.length) {
            return previewArr[watermarkActive].url
        }
    }

    render() {
        const {
            textWatermarkValue,
            qrCodeChecked,
            onTextWatermarkValueChange,
            ontQrCodeCheckedChange,
        } = this.props

        return (
            <div className={styles.ModalWatermark}>
                <Watermark
                    previewUrl={this.getPreviewUrl()}
                    textWatermarkValue={textWatermarkValue}
                    qrCodeChecked={qrCodeChecked}
                    getLeoRef={this.watermarkRef}
                    onTextWatermarkValueChange={onTextWatermarkValueChange}
                    ontQrCodeCheckedChange={ontQrCodeCheckedChange}
                    renderOther={() => {
                        return this.renderOther()
                    }}
                />
            </div>
        )
    }
}
