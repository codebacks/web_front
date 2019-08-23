/**
 **@time: 2018/8/9
 **@Description:
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { Button, Modal, Form, Input, Upload, message, Checkbox, Icon } from 'antd'
import { objToAntdForm } from 'setting/utils'
import _ from 'lodash'
import styles from './pay.less'
import { connect } from 'dva'
import moment from 'moment'
import UploadSvg from '../../../../../../assets/font_icons/upload.svg'

const DEFAULT_EXPECTFILES = [{
    name: 'xxx_key.pem',
    matchName: '_key.pem',
    uploadedName: undefined,
    isUploaded: false
}, {
    name: 'xxx_cert.pem',
    matchName: '_cert.pem',
    uploadedName: undefined,
    isUploaded: false
}, {
    name: 'xxx_cert.p12',
    matchName: '_cert.p12',
    uploadedName: undefined,
    isUploaded: false
}]

@connect(({ base }) => ({ base }))
@Form.create({
    mapPropsToFields(props) {
        return objToAntdForm(_.get(props, 'setting_pay.editModel', {}),
            ['key', 'secret', 'cert_p12_url', 'cert_pem_url', 'key_pem_url'])
    }
})
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
        // 获取当条修改数据id
        var id = this.props.projectId
        if (id) {
            this.setState({
                id,
                isEdit: true
            })
            this.getEditData(id)
        } else {
            this.validateExpectFiles([])
        }
    }

    getEditData = (id) => {
        // 获取当条修改数据
        this.props.dispatch({
            type: 'setting_pay/getEditModel',
            payload: {
                id: id
            },
            callback: () => {
                const { cert_p12_url, cert_pem_url, key_pem_url } = this.props.setting_pay.editModel
                const certNames = [
                    cert_p12_url,
                    cert_pem_url,
                    key_pem_url
                ].map(filename => this.formatCertFileInfo(filename))

                const rest = certNames.map(cert => cert.type)

                this.setState({
                    rest: rest
                })

                const fileList = certNames.map((cert, index) => ({
                    uid: index,
                    name: cert.name,
                    response: {
                        key: cert.fullname
                    },
                    status: 'done',

                }))

                this.setState({
                    fileList: fileList
                })
                this.validateExpectFiles(fileList)
            }
        })
    }

    //弹出窗
    handleCreate = () => {
        const form = this.props.form
        form.validateFields((err, values) => {
            if (!err) {
                let paies = {
                    cert_p12_url: '',
                    cert_pem_url: '',
                    key_pem_url: '',
                }

                let fileDocument = this.state.fileList
                const certNames = fileDocument.map(item => this.formatCertFileInfo(item.response.key))

                certNames.map((item) => {
                    if (item.type === 'p12') {
                        paies.cert_p12_url = item.fullname
                    } else if (item.type === 'certpem') {
                        paies.cert_pem_url = item.fullname
                    } else if (item.type === 'keypem') {
                        paies.key_pem_url = item.fullname
                    }
                    return paies
                })

                paies = {
                    ...values,
                    ...paies,
                }

                if (this.state.isEdit) {
                    this.getUpdateData(paies)
                } else {
                    this.getCreateData(paies)
                }
            }
        })
    }

    //添加数据
    getCreateData(paies) {
        this.props.dispatch({
            type: "setting_pay/create",
            payload: {
                paies: paies,
            },
            callback: () => {
                message.success(`添加支付配置成功`)
                this.handlePageClose('ok')
            }
        })
    }

    // 编辑数据
    getUpdateData(paies) {
        this.props.dispatch({
            type: 'setting_pay/update',
            payload: {
                paies: { ...paies, id: this.state.id }
            },
            callback: () => {
                message.success(`修改支付配置成功`)
                this.handlePageClose('ok')
            }
        })
    }

    // 取消Button
    handleCancel = () => {
        this.setState({
            fileList: [],
            rest: []
        })
        this.handlePageClose()
    }

    handlePageClose = (data) => {
        this.setState({
            fileList: [],
            rest: [],
            expectFiles: [...DEFAULT_EXPECTFILES]
        })

        this.props.onAddCompleted(data)
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
            const isUploaded = isRemoveFile ? false : item.isUploaded
            return {
                ...item,
                isUploaded: isUploaded,
                uploadedName: isUploaded ? item.uploadedName : undefined
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
            const isUploaded = uploadFile !== undefined
            return {
                ...item,
                isUploaded: isUploaded,
                uploadedName: isUploaded ? uploadFile.name : undefined

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
        var rest = this.state.rest
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

                    //上传格式不正确
                    if (!(_.endsWith(fileName, '_cert.p12')) && !(_.endsWith(fileName, '_cert.pem')) && !(_.endsWith(fileName, '_key.pem'))) {
                        message.error('请上传正确的文件格式')
                        reject(file)
                        return
                    }

                    const listDate = _.split(fileName, '.')
                    const extension = listDate[1]
                    const isCert = listDate[0].substr(listDate[0].length - 4)
                    const isKey = listDate[0].substr(listDate[0].length - 3)
                    const rest = that.state.rest

                    //上传格式已存在
                    if (rest.indexOf(extension) !== -1) {
                        message.error('上传格式.p12已存在')
                        reject(file)
                    } else if (rest.indexOf(isCert + extension) !== -1) {
                        message.error('上传格式_cert.pem已存在')
                        reject(file)
                    } else if (rest.indexOf(isKey + extension) !== -1) {
                        message.error('上传格式_key.pem已存在')
                        reject(file)
                    } else {
                        // 无同上传格式,数组添加一个元素
                        if (extension === 'p12') {
                            rest.push('p12')
                        } else if (_.endsWith(fileName, '_cert.pem')) {
                            rest.push('certpem')
                        } else if (_.endsWith(fileName, '_key.pem')) {
                            rest.push('keypem')
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
                    token: this.props.documentToken,
                    key: `${now.format('YYYY/MM/DD/HH_mm_ss_SSS')}/${base.initData.user.account_id}_${base.initData.user.company_id}/${file.name}`
                }
            },
            onChange: this.handleChange,
            onRemove: this.handleRemoveFile,
            // showUploadList: {
            //     showRemoveIcon: false //删除按钮
            // }
        }
        const formItemLayout = {
            labelCol: {
                xs: { span: 4 },
                sm: { span: 7 },
                style: { width: '136px' }
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
        const { visible } = this.props
        const { getFieldDecorator } = this.props.form

        return (
            <Modal
                visible={visible}
                title="添加配置"
                okText="确定"
                width={480}
                onCancel={this.handleCancel}
                onOk={this.handleCreate}
            >
                <Form>
                    <FormItem>
                        <div style={{ fontSize: 12, color: '#999', lineHeight: 1 }}>
                            <span>商户号，需与公众号、小程序的商户号一致，否则无法使用支付功能</span>
                            <a href="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83/%E6%94%AF%E4%BB%98%E8%AE%BE%E7%BD%AE%E6%95%99%E7%A8%8B.md" target='_blank' rel="nofollow me noopener noreferrer" className='hz-margin-small-left'>使用教程</a>
                        </div>
                    </FormItem>

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
                        {getFieldDecorator('cert_p12_url', {
                            rules: [{ required: true, validator: this.validateCert, validateTrigger: 'onText' }],
                        })(
                            <span className={styles.uploadItems}>
                                <Upload name="logo" {...uploadProps} fileList={this.state.fileList}>
                                    <Button>
                                        <Icon component={UploadSvg} style={{ fontSize: '16px' }} />
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
                                        <dt>{item.isUploaded ? item.uploadedName : item.name}</dt>
                                        <dd>{item.isUploaded ? "已" : "未"}上传 <Checkbox checked={item.isUploaded} /></dd>
                                        <dd className={styles.uploadOtherItemRemove}>
                                            <span hidden={!item.isUploaded} title="删除" onClick={(e) => { this.handleRemoveExpectFile(item, e) }}>
                                                <Icon type="close" />
                                            </span>
                                        </dd>
                                    </dl>
                                })
                            }
                        </div>
                    </FormItem>

                </Form>
            </Modal >
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

        this.props.form.validateFields(['cert_p12_url', 'cert_pem_url', 'key_pem_url'], { force: true })


    }
}