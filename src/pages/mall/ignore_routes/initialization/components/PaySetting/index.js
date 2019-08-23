/*
 * @Author: sunlzhi 
 * @Date: 2018-10-10 15:08:46 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-24 15:02:16
 */

import React, { Component } from 'react'
import { Button, Icon, Form, Input, Upload, message, Checkbox } from 'antd'
import _ from 'lodash'
import styles from './index.less'
import { connect } from 'dva'
import moment from 'moment'


const DEFAULT_EXPECTFILES = [{
    name: 'xxx_key.pem',
    matchName: '_key.pem',
    uploadedName: undefined,
    isUploaded: false
},{
    name: 'xxx_cert.pem',
    matchName: '_cert.pem',
    uploadedName: undefined,
    isUploaded: false
},{
    name: 'xxx_cert.p12',
    matchName: '_cert.p12',
    uploadedName: undefined,
    isUploaded: false
}]

@connect(({ initialization, base }) => ({ initialization, base }))
@Form.create({})
export default class Index extends Component {
    state = {
        isEdit: false,
        id: null,
        fileList: [],
        rest: [],
        fileName: "",
        expectFiles: [...DEFAULT_EXPECTFILES]
    }

    componentDidMount() {
        this.getToken()
    }

    // 获取文件上传token
    getToken = () =>{
        this.props.dispatch({
            type: 'initialization/getToken',
            payload: {
                type: 'document'
            },
        })
    }

    //添加数据
    getCreateData(paies) {
        this.props.dispatch({
            type: "initialization/create",
            payload: {
                paies: paies,
            },
            callback: () => {
                message.success(`添加支付配置成功`)
                this.setState({
                    fileList: [],
                    rest: []
                })
                // 向父组件传值，修改步骤数
                this.props.handleCurrent(2)
            }
        })
    }

    // 提交表单
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (this.state.fileList) {
                    var fileDocument = this.state.fileList
                    //上传字段对用接口字段
                    for (var i = 0; i < fileDocument.length; i++) {
                        var listDate = fileDocument[i].name.split(".")
                        var isCert = listDate[0].substr(listDate[0].length - 4)
                        var isKey = listDate[0].substr(listDate[0].length - 3)
                        if (listDate[1] === 'p12') {
                            var certP12 = this.state.fileList[i].response.key
                        } else if (listDate[1] === 'pem' && isCert === 'cert') {
                            var certPem = this.state.fileList[i].response.key
                        } else if (listDate[1] === 'pem' && isKey === 'key') {
                            var keyPem = this.state.fileList[i].response.key
                        }
                    }
                }
                var paies = {
                    key: values.key || '',
                    secret: values.secret || '',
                    cert_p12_url: certP12 || '',
                    cert_pem_url: certPem || '',
                    key_pem_url: keyPem || '',
                }
                // 发送表单数据
                this.getCreateData(paies)
            }
        })
    }

    // 上传
    handleChange = (info) => {
        let fileList = info.fileList

        // 1.限制文件上传，只显示最近上传的
        fileList = fileList.slice(-3)

        //2.组件显示url链接
        fileList = fileList.map((file) => {
            if (file.response) {
                // file.name = file.response.key
            }
            return file
        })

        // 3. Filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
            if (file.response) {
                return file.response.key
            }
            return true
        })
        this.setState({ fileList })
        this.validateExpectFiles(fileList)
    }

    handleRemoveExpectFile = (file) => {
        const expectFiles = this.state.expectFiles.map(item => {
            const isRemoveFile = item === file
            const isUploaded = isRemoveFile ? false: item.isUploaded
            return {
                ...item,
                isUploaded: isUploaded,
                uploadedName: isUploaded ? item.uploadedName: undefined
            }
        })

        const files = this.state.fileList.filter(item => {
            return item.name !== file.uploadedName
        })

        this.setState({
            expectFiles: expectFiles,
            fileList: files
        })

        this.onFileRemove(file.uploadedName)

    }

    validateExpectFiles = (files) => {
        const expectFiles = this.state.expectFiles.map(item => {
            const uploadFile = files.find(file => _.endsWith(file.name, item.matchName))
            const isUploaded = uploadFile !==undefined
            return {
                ...item,
                isUploaded: isUploaded,
                uploadedName: isUploaded ? uploadFile.name: undefined

            }
        })

        this.setState({
            expectFiles: expectFiles
        })
    }

    //商户密钥限制32位
    validateSecret = (rule, value, callback) => {
        if (!value) {
            callback('请输入微信支付商户密钥')
            return
        } else if (value.length !== 32) {
            callback('微信支付商户密钥限制32位')
            return
        }
        callback()
    }
    // 微信支付证书
    validateCert = (rule, value, callback) => {
        let rest = this.state.rest
        if (!value) {
            callback('请上传微信支付证书')
            return
        } else if (rest.indexOf('p12') === -1) {
            callback('.p12文件未上传')
            return
        } else if (rest.indexOf('certpem') === -1) {
            callback('cert.pem文件未上传')
            return
        }
        else if (rest.indexOf('keypem') === -1) {
            callback('key.pem文件未上传')
            return
        }
        callback()
    }

    getExtentsion = (name) => {
        const index = name.lastIndexOf('.')
        return name.substring(index + 1)
    }

    getCertFilename = (name) => {
        const index = name.lastIndexOf('/')
        return name.substring(index + 1)
    }

    formatCertFileInfo = (filename) => {
        
        let result = {
            type: '',
            name: this.getCertFilename(filename),
            fullname: filename
        }

        if (_.endsWith(filename, '_cert.p12')) {
            result.type = 'p12'
        } else if (_.endsWith(filename, '_cert.pem')) {
            result.type = 'certpem'
        } else if (_.endsWith(filename, '_key.pem')) {
            result.type = 'keypem'
        }

        return result
    }

    //商户密钥限制32位
    validateSecret = (rule, value, callback) => {
        if (!value) {
            callback('请输入微信支付商户密钥')
            return
        } else if (value.length !== 32) {
            callback('微信支付商户密钥限制32位')
            return
        }
        callback()
    }

    render() {
        //upload

        const that = this
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: '.pem,.p12',
            multiple: true,
            beforeUpload: (file) => {
                return new Promise(function (resolve, reject) {
                    const fileName = file.name
                    if (!(_.endsWith(fileName, '_cert.p12')) && !(_.endsWith(fileName, '_cert.pem')) && !(_.endsWith(fileName, '_key.pem'))) {
                        message.error('请上传正确的文件格式')
                        reject(file)
                        return
                    }
                    
                    var listDate = file.name.split(".")
                    var isCert = listDate[0].substr(listDate[0].length - 4)
                    var isKey = listDate[0].substr(listDate[0].length - 3)
                    var rest = that.state.rest
                    //上传格式
                    if (rest.indexOf(listDate[1]) !== -1) {
                        message.error('上传格式.p12已存在')
                        reject(file)
                    } else if (rest.indexOf(isCert + listDate[1]) !== -1) {
                        message.error('上传格式_cert.pem已存在')
                        reject(file)
                    } else if (rest.indexOf(isKey + listDate[1]) !== -1) {
                        message.error('上传格式_key.pem已存在')
                        reject(file)
                    } else {
                        // 无同上传格式,数组添加一个元素
                        if (listDate[1] === 'p12') {
                            rest.push(listDate[1])
                        } else if (listDate[1] === 'pem' && isCert === 'cert') {
                            rest.push(isCert + listDate[1])
                        } else if (listDate[1] === 'pem' && isKey === 'key') {
                            rest.push(isKey + listDate[1])
                        }
                    }
                    that.setState({ rest: rest })
                    resolve(file)
                })
            },
            headers: {},
            data: (file) => {
                const { base } = this.props
                const now = moment()
                return {
                    token: this.props.initialization.qiniuToken,
                    key: `${now.format('YYYY/MM/DD/HH_mm_ss_SSS')}/${base.initData.user.account_id}_${base.initData.user.company_id}/${file.name}`
                }
            },
            onChange: this.handleChange,
            onRemove: this.handleRemoveFile
        }
        const formItemLayout = {
            labelCol: {
                xs: { span: 4 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 18 },
                sm: { span: 12 },
                className: styles.formLabel
            }
        }
        const formUploadItemLayout = {
            ...formItemLayout,
            wrapperCol: {
                xs: { span: 20 },
                sm: { span: 16 },
                className: styles.formLabel
            }
        }
        const FormItem = Form.Item
        const { getFieldDecorator } = this.props.form

        return (
            <div className={styles.paySetting}>
                <Form className={styles.form} onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label="微信支付商户号:">
                        {getFieldDecorator('key', {
                            rules: [{ required: true, message: '请输入微信支付商户号' }],
                        })(
                            <Input placeholder="请输入" />
                        )}
                    </FormItem>
                    <FormItem  {...formItemLayout} label="微信支付商户密钥：">
                        {getFieldDecorator('secret', {
                            rules: [{ required: true, validator: this.validateSecret }],
                        })(
                            <Input placeholder="请输入" />
                        )}
                    </FormItem>
                    <FormItem {...formUploadItemLayout} label="微信支付证书：" >
                        {getFieldDecorator('certificate_url', {
                            rules: [{ required: true, validator: this.validateCert }],
                        })(
                            <span className={styles.uploadItems}>
                                <Upload name="logo" {...uploadProps} fileList={this.state.fileList}>
                                    <Button style={{ borderColor: '#4391FF', color: '#4391ff' , width: 90}} >
                                        上传
                                    </Button>
                                </Upload>
                            </span>
                        )}
                        <div style={{ fontSize: '12px' }}>
                            请上传全部微信支付证书（含key.pem, cert.pem, cert.p12）
                        </div>
                        <div className={styles.uploadOtherItems}>
                            {
                                this.state.expectFiles.map(item => {
                                    return <dl key={item.name}>
                                        <dt>{item.isUploaded? item.uploadedName : item.name}</dt>
                                        <dd>{item.isUploaded?"已":"未"}上传 <Checkbox checked={item.isUploaded} /></dd>
                                        <dd className={styles.uploadOtherItemRemove}>
                                            <span hidden={!item.isUploaded} title="删除" onClick={(e) => { this.handleRemoveExpectFile(item, e)}}>
                                                <Icon type="close"  />
                                            </span>
                                        </dd>
                                    </dl>
                                })
                            }
                        </div>
                    </FormItem>
                    <FormItem {...formItemLayout} label=" " className={styles.nextButton}>
                        <Button type="primary" htmlType="submit">下一步</Button>
                    </FormItem>
                </Form>
                <div className={styles.help}>
                    <a href="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97.md" target='_blank' rel="nofollow me noopener noreferrer"><Icon type="book"></Icon> 帮助</a>
                </div>
                <div className={styles.explain}>
                    <h4>说明</h4>
                    <h5>微信支付账户</h5>
                    <p>目前暂不提供小程序商城收款账户，所以贵公司必须自己准备一个微信收款账户；商户号，需与公众号、小程序的商户号一致，否则无法使用支付功能。</p>
                    
                </div>
            </div>
        )
    }

    handleRemoveFile = (file) => {
        this.onFileRemove(file.name)
    }

    onFileRemove = (fileName) => {
        const rest = this.state.rest

        const listDate = _.split(fileName, '.')
        const extension = listDate[1]
        const isKey = listDate[0].substr(listDate[0].length - 3)
        const isCert = listDate[0].substr(listDate[0].length - 4)

        // 点击删除文件对应的数组删除一个元素
        if (extension === 'p12') {
            if (rest.indexOf('p12') > -1) {
                _.pull(rest, 'p12')
            }
        }
        else if (extension === 'pem' && isCert === 'cert') {
            if (rest.indexOf('certpem') > -1) {
                _.pull(rest, 'certpem')
            }
        }
        else if (extension === 'pem' && isKey === 'key') {
            if (rest.indexOf('keypem') > -1) {
                _.pull(rest, 'keypem')
            }
        }

        this.setState({ rest: rest })

        this.props.form.validateFields(['certificate_url'], { force: true })

        
    }
}
