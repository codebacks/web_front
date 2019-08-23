import React from "react"
import { Modal ,Form, Input,message, Select,Upload,Icon,InputNumber } from "antd"
import { connect } from 'dva'
import HzInput from '@/components/HzInput'
import { ACTIVIT_TYPE } from '../../../services/lottery_activity'
const FormItem = Form.Item
const Option = Select.Option

const imgMap = {
    1:'https://image.51zan.com/2019/05/09/FkTuoJ2HaE4pkwNzDeB6ZcHrZkRE.png',
    3:'https://image.51zan.com/2019/05/09/Fgky804m1N5W0R4oARqIRrtmQJ3O.png',
    4:'https://image.51zan.com/2019/05/09/FjYQF6N2SVJFgHmquuu77kGuukBa.png'
}

@Form.create()
export default class extends React.Component {
    state = {
        fileList :[],
        type:4
    }
    
    getFile = (fileList) => {
        this.setState({
            fileList
        })
    }
    onCancel =()=>{
        this.onProbabilityChange(this.props.row.probability)
        this.props.form.resetFields()
        this.props.onCancel && this.props.onCancel()
    }
    onClick = ()=>{
        this.props.form.validateFields((err,values)=>{
            if(!err){
                values.img_path = this.state.fileList[0] && this.state.fileList[0].url
                let row = this.props.row
                row = {...this.props.row,...values}
                row.probability = Number(row.probability)
                this.props.onOk && this.props.onOk(row)
                this.props.form.resetFields()
                this.props.onCancel && this.props.onCancel()
            }
        })
        
    }
    componentDidUpdate(prevProps){
        if(this.props.visible && !prevProps.visible){
            let row = { ...this.props.row }
            if(!row.type){
                row.type = 4
                row.name = '谢谢参与'
            } 
            this.setState({
                type:row.type
            },()=>{
                this.props.form.setFieldsValue(row)
            })
            
            let {img_path} =  this.props.row
            if(!img_path) img_path = imgMap[row.type]
            if(img_path){
                this.setState({
                    fileList:[{
                        uid: '-1',
                        name: img_path,
                        status: 'done',
                        url: img_path
                    }]
                })
            }else{
                this.setState({
                    fileList:[]
                })
            }
        }
    }
    validatorByProbability= (rule,value,callback) =>{
        if(this.props.probability < 0){
            callback(`中奖概率之和不能大于100`)
        }else{
            callback()
        }
    }
    onProbabilityChange = (value) =>{
        let {row,probabilityChange} = this.props
        let o = {...row}
        o.probability = value
        probabilityChange && probabilityChange(o)
    }
    typeChange=(type)=>{
        this.props.form.resetFields()
        this.onProbabilityChange(this.props.row.probability)
        this.setState({
            type
        },()=>{
            let name = ''
            if(type === 4) name= '谢谢参与'
            this.props.form.setFieldsValue({name})
            let img_path = imgMap[type]
            let fileList = []
            if(img_path){
                fileList = [{
                    uid: '-1',
                    name: img_path,
                    status: 'done',
                    url: img_path
                }]
            }
            this.setState({fileList})
        })
    }
    prizeChange = (value) => {
        const {type} = this.state
        const {setFieldsValue} = this.props.form
        let name = ''
        switch(type){
            case 1:
                name = `${value}积分`
                break
            case 3:
                name = `${value}元红包`
                break
            default:
                return
        }
        setFieldsValue({name})
    }


    render() {
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 18},
        }
        const { visible , probability, from} = this.props
        const { getFieldDecorator } = this.props.form
        const {type} = this.state

        let TYPES = ACTIVIT_TYPE.filter(i=>{
            if(i.value === 4) return true
            return from.prize_type.indexOf(i.value) > -1
        })
        return <Modal
            visible={visible}
            title="编辑"
            okText="确定"
            cancelText="取消"
            destroyOnClose
            onCancel={this.onCancel}
            onOk={this.onClick}
            width={480}
        >
            <Form>
                <FormItem label="奖品类型" {...formItemLayout}>
                    {getFieldDecorator('type', {
                        rules:[
                            {required:true,message:'请选择奖品类型'}
                        ],
                        initialValue:4
                    })(
                        <Select
                            placeholder='请选择奖品类型'
                            onChange={this.typeChange}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                        >
                            {
                                TYPES.map((item) => {
                                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                                })
                            }
                        </Select>
                    )}
                </FormItem>
                {type === 1||type === 3 ? <FormItem label="奖品面额" {...formItemLayout}>
                    {getFieldDecorator('prize_value', {
                        rules:[
                            {required:true,message:'请输入奖品面额'}
                        ]
                    })(
                        <InputNumber
                            min={1}
                            max={type===1?99999:200}
                            onChange={this.prizeChange}
                            step={1}
                            precision={type===1?0:2}
                            style={{width:'100%'}} 
                            placeholder={`${type===1?'单位：积分':'1.00~200元'}`} />
                    )}
                </FormItem>: null}
                
                
                <FormItem label="奖品名称" {...formItemLayout}>
                    {getFieldDecorator('name', {
                        rules:[
                            {required:true,message:'请输入奖品名称'}
                        ]
                    })(
                        <HzInput maxLength={type===1?7:6} placeholder='请输入奖品名称' />
                    )}
                </FormItem>
                {type !== 4 ? <FormItem label="奖品数量" {...formItemLayout}>
                    {getFieldDecorator('number', {
                        rules:[
                            {required:true,message:'请输入奖品数量'}
                        ]
                    })(
                        <InputNumber
                            min={1}
                            max={99999}
                            step={1}
                            precision={0}
                            style={{width:'100%'}} 
                            placeholder='大于0正整数' />
                    )}
                </FormItem>:null}

                <FormItem label="中奖概率" {...formItemLayout}>
                    {getFieldDecorator('probability', {
                        validateTrigger:'onBlur',
                        rules:[
                            {required:true,message:'请输入中奖概率'},
                            {validator:this.validatorByProbability}
                        ]
                    })(
                        <InputNumber
                            min={0}
                            step={1}
                            precision={0}
                            onChange={this.onProbabilityChange}
                            style={{width:'100%'}} 
                            placeholder='请输入中奖概率' />
                    )}
                    <span style={{fontSize:12,color:'#9EA8B1',display:'block',marginTop: '-6px'}}>还剩{probability}%的中奖概率 </span>
                </FormItem>
                <UploadContainer {...this.props} getFile={this.getFile} fileList={this.state.fileList} />
            </Form>
        </Modal>
    }
}


@connect(({shop_fitment}) => ({ shop_fitment }))
class UploadContainer extends React.Component {
    state = {
        fileList: [],
        showUploadIcon: true,
        previewVisible: false,
        previewImage: ''
    }
    componentDidMount(){
        this.props.dispatch({
            type:'shop_fitment/getToken',
            payload: {
                type: 'image',
            }
        })
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            fileList: nextProps.fileList,
            showUploadIcon: nextProps.fileList.length === 0 || (nextProps.fileList[0] && nextProps.fileList[0].status !== 'done'),
            previewImage:nextProps.fileList[0] && nextProps.fileList[0].url
        }
    }
    handleCancel = () => {
        this.setState({
            previewVisible: false,
            previewImage: ''
        })
    }
    setShowUploadIcon = (status) => {
        setTimeout(_ => {
            this.setState({
                showUploadIcon: status
            })
        }, 400)
    }
    handlePreview = (fileList) => {
        if (fileList && fileList[0]) {
            this.setState({
                previewVisible: true,
                previewImage: fileList[0].url
            })
        }
    }

    beforeUpload = (file, fileList) => {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJPG) {
            message.error('只能上传jpg、jpeg和png格式的图片！')
        }
        const isLt2M = file.size / 1024  <= 100
        if (!isLt2M) {
            message.error('图片大小不能超过100KB！')
        }
        const maxPic = this.state.fileList.length + fileList.length <= 1
        if (!maxPic) {
            message.error('最多只能上传1张图片！')
        }

        return isJPG && isLt2M && maxPic
    }

    handleChange = (info) => {
        const { fileList } = info
        const photoPrefix = this.props.shop_fitment.photoPrefix

        if (info.file.status === 'uploading') {
            this.props.getFile && this.props.getFile(fileList)
        }

        if (info.file.status === 'done') {
            fileList.map((file) => {
                if (file.response) {
                    file.url = `https://${photoPrefix}/${file.response.key}`
                    file.key = file.response.key
                }
                return file
            })
            this.props.getFile && this.props.getFile(fileList)
            // this.setState({ fileList }, () => {
            //     this.setShowUploadIcon(fileList.length === 0)
            // })
        }
    }
    handleRemove = (file) => {
        const { fileList } = this.state
        for (let [i, v] of fileList.entries()) {
            if (v.uid === file.uid) {
                fileList.splice(i, 1)
                this.props.getFile && this.props.getFile([])
                // this.setState({ fileList, showUploadIcon: fileList.length === 0 }, () => {
                this.props.form.validateFields(['images'], { force: true })
                // })
                return
            }
        }
    }
    validatorByImg = (rule, value, callback) =>{
        const {fileList} = this.state
        if(fileList.length && fileList[0].url){
            callback()
        }else{
            callback('请上传图片')
        }
    }
    render() {
        const fileList = this.state.fileList
        const photoToken = this.props.shop_fitment.photoToken
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 18},
        }
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.jpeg,.png",
            headers: {},
            data: {
                token: photoToken,
            },
            listType: "picture-card",
            multiple: true,
            onPreview: () => this.handlePreview(fileList),
            beforeUpload: this.beforeUpload,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
            fileList: fileList,
            className: "avatar-uploader"
        }
        const { getFieldDecorator } = this.props.form
        return <Form.Item label="奖励图片：" {...formItemLayout}
            extra={<div style={{fontSize:12}}>支持.png/.jpeg/.png，建议上传尺寸120x120，大小控制在100KB以内</div>}
        >
            {getFieldDecorator("img_path", {
                rules: [
                    { required: true,validator: this.validatorByImg },
                ]
            })(
                <Upload {...uploadProps}>
                    {
                        this.state.showUploadIcon ? <div>
                            <Icon type='plus' style={{ fontSize: 32, color: '#9EA8B1' }} />
                            <div className="ant-upload-text">上传图片</div>
                        </div> : null
                    }

                </Upload>
            )}
            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="" style={{ width: '100%' }} src={this.state.previewImage} />
            </Modal>
        </Form.Item>
    }
}
