/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/8
 */

import React from 'react'
import {
    Form,
    Spin,
    Input,
    Row,
    Col,
    Checkbox,
    message,
} from 'antd'
import styles from './index.less'
import PropTypes from 'prop-types'
import constant from './constant'
import WatermarkImgManager from './components/WatermarkImgManager'
import {hot} from "react-hot-loader"
import {initValidator, validate, validateAll} from 'utils/formTools'
import helper from 'utils/helper'
import getRef from 'hoc/getRef'
import _ from 'lodash'

const FormItem = Form.Item
const wxPlaceholder = '<微信号>'
const wxPlaceholderName = `weixinhao`

@hot(module)
@getRef()
export default class Index extends React.PureComponent {
    static propTypes = {
        previewUrl: PropTypes.string,
        textWatermarkValue: PropTypes.string,
        qrCodeChecked: PropTypes.bool,
        onTextWatermarkValueChange: PropTypes.func.isRequired,
        ontQrCodeCheckedChange: PropTypes.func.isRequired,
        renderOther: PropTypes.func,
        showQrCode: PropTypes.bool,
    }

    static defaultProps = {
        previewUrl: constant.previewUrl,
        textWatermarkValue: '',
        qrCodeChecked: true,
        showQrCode: true,
    }

    constructor(props) {
        super(props)
        const {validator, formStates} = this.initValidator()

        this.validator = validator
        this.state = {
            formStates,
        }
        this.inputRef = React.createRef()
    }

    initValidator = () => {
        return initValidator({
            textWatermarkValue(rule, value, callback, source, options) {
                value = String(value).trim()
                const errors = []
                let index = 0
                const realText = value.replace(new RegExp(wxPlaceholder, 'g'), () => {
                    index++
                    return ''
                })

                if(helper.isEmojiCharacter(value)) {
                    errors.push(`不能有emoji表情`)
                }else if(realText.length > 10) {
                    errors.push('10个字以内')
                }else if(index > 1) {
                    errors.push(`变量${wxPlaceholder}已存在`)
                }

                callback(errors)
            },
        })
    }

    componentDidMount() {
        this.validate()
    }

    componentDidUpdate(prevProps, prevState) {
        this.validate({textWatermarkValue: prevProps.textWatermarkValue})
    }

    getWatermarkTemplateData = (callback) => {
        const {textWatermarkValue} = this.props
        validateAll({
            validator: this.validator,
            formData: {textWatermarkValue},
            beforeValidate: (formStates) => {
                this.setState({
                    formStates,
                })
            },
            callback: (errors, fields, formStates) => {
                if(!errors) {
                    callback(errors, fields)
                }

                this.setState({
                    formStates,
                })
            },
        })
    }

    validate(oldForm) {
        const {textWatermarkValue} = this.props
        validate({
            validator: this.validator,
            newForm: {textWatermarkValue},
            oldForm,
            beforeValidate: (formStates) => {
                this.setState({
                    formStates,
                })
            },
            callback: (errors, fields, formStates) => {
                this.setState({
                    formStates,
                })
            },
        })
    }

    renderError = () => {
        return (
            <div className={styles.error}>
                水印编辑出错，请重新编辑！
            </div>
        )
    }

    getCursorPosition = (obj) => {
        let cursorIndex = 0
        if(document.selection) {
            obj.focus()
            const range = document.selection.createRange()
            range.moveStart('character', -obj.value.length)
            cursorIndex = range.text.length
        }else if(typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            cursorIndex = obj.selectionStart
        }
        return cursorIndex
    }

    handleInsertClick = (e) => {
        const {
            textWatermarkValue,
            onTextWatermarkValueChange,
        } = this.props
        if(textWatermarkValue.indexOf(wxPlaceholder) > -1) {
            message.warning(`变量${wxPlaceholder}已存在`)
            return
        }

        const input = _.get(this, 'inputRef.current.input')
        if(input) {
            const cursorPosition = this.getCursorPosition(input)
            const value = `${textWatermarkValue.substring(0, cursorPosition)}${wxPlaceholder}${textWatermarkValue.substring(cursorPosition, textWatermarkValue.length)}`
            onTextWatermarkValueChange(value, e)
        }
    }

    handleTextWatermarkValueChange = (e) => {
        this.props.onTextWatermarkValueChange(e.target.value, e)
    }

    processTextWatermarkValue = (text) => {
        text = text.replace(wxPlaceholder, wxPlaceholderName)
        return text
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        }
        const {formStates} = this.state
        let {
            previewUrl,
            textWatermarkValue,
            qrCodeChecked,
            ontQrCodeCheckedChange,
            renderOther,
            showQrCode,
        } = this.props

        if(!showQrCode) {
            qrCodeChecked = false
        }

        return (
            <Row className={styles.watermark}>
                <Col span={12}>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="水印内容"
                            validateStatus={formStates.textWatermarkValue.validateStatus}
                            help={formStates.textWatermarkValue.help}
                            required={true}
                        >
                            <Input
                                ref={this.inputRef}
                                value={textWatermarkValue}
                                onChange={this.handleTextWatermarkValueChange}
                                placeholder="10字以内"
                            />
                        </FormItem>
                        <Row>
                            <Col offset={4} span={20}>
                                <div>
                                    {`插入`}
                                    <span
                                        onClick={this.handleInsertClick}
                                        className={styles.wxMark}
                                    >
                                        {wxPlaceholder}
                                    </span>
                                </div>
                                <div>
                                    {`插入变量后 "<>"中间的内容不可修改；`}
                                </div>
                                {
                                    showQrCode && (
                                        <>
                                            <div className={styles.code}>
                                                <Checkbox
                                                    checked={qrCodeChecked}
                                                    onChange={ontQrCodeCheckedChange}
                                                >
                                                    添加微信二维码
                                                </Checkbox>
                                            </div>
                                            <div>
                                                使用微信号管理中的二维码名片，若未上传则水印无效
                                            </div>
                                        </>
                                    )
                                }
                            </Col>
                        </Row>
                    </Form>
                    {
                        renderOther && renderOther()
                    }
                </Col>
                <Col span={12}>
                    <div className={styles.previewWarp}>
                        <WatermarkImgManager
                            previewUrl={previewUrl}
                            textWatermarkValue={textWatermarkValue}
                            processTextWatermarkValue={this.processTextWatermarkValue}
                            qrCodeChecked={qrCodeChecked}
                            render={(imgSrc, imgState) => {
                                if(imgState === 'loading') {
                                    return (
                                        <div className={styles.loading}>
                                            <Spin tip="Loading..."/>
                                        </div>
                                    )
                                }

                                if(imgState === 'error') {
                                    return this.renderError()
                                }

                                return (
                                    <img
                                        src={imgSrc}
                                        alt="预览"
                                        className={styles.preview}
                                    />
                                )
                            }}
                        />
                    </div>
                </Col>
            </Row>
        )
    }
}

