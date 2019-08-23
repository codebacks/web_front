import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import router from 'umi/router'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Form, Popover, DatePicker, Radio, Row, Col, Button, InputNumber, Icon, Checkbox, message,Modal } from 'antd'
import moment from 'moment'
// import styles from './index.less'
// import { ACTIVIT_STATUS } from '../../services/first_binding'
import HzInput from '@/components/HzInput'
import TextAreaCount from '@/components/TextAreaCount'

const CheckboxGroup = Checkbox.Group
const { RangePicker } = DatePicker
const { confirm } = Modal
@Form.create({})
@connect(({lottery_activity,platform_redpacket }) => ({  lottery_activity,platform_redpacket }))
export default class Create extends React.PureComponent {
    state = {
        type: '创建活动',
        activity_rules: '1.同一微信用户活动期间免费抽1次\n2.抽奖获得实物奖品的客户请截图联系商家',
        checkboxValue: [],
        lottery_count_1: 1,
        lottery_count_2: 1,
    }

    componentDidMount() {
        let { id } = this.props.location.query
        let {from} = this.props
        if(from && from.name){
            let state = {
                [`lottery_count_${from.lottery_type}`]:from.lottery_count,
                typeDisabled: from.lottery_type === 2,
                lottery_point:from.lottery_point/100,
            }
            if(id){
                state.from = {
                    ...this.state.form,
                    ...{prizes:from.prizes}
                }
            }

            this.setState(state,()=>{
                this.props.form.setFieldsValue({
                    name:from.name,
                    time:from.time,
                    lottery_point:from.lottery_point/100,
                    lottery_type:from.lottery_type,
                    description:from.description,
                    prize_type:from.prize_type,
                })
            })
            this.point = from.lottery_point/100
            this.lottery_count = from.lottery_count

        }else if (id) {
            this.setState({
                type: '编辑活动'
            }, () => {
                this.getEditData(id)
            })
        }
        this.checkPacket()
    }
    getEditData = (id) =>{
        this.props.dispatch({
            type:'lottery_activity/getLotteryActivities',
            payload:{id},
            callback:(data)=>{
                data.prizes = data.prizes.map(i => {
                    if(i.prize_value && i.prize_value > 0){
                        i.prize_value = i.prize_value/100
                    }
                    return i
                })
                this.setState({
                    from: { prizes: data.prizes },
                    [`lottery_count_${data.lottery_type}`]: data.lottery_count,
                    typeDisabled: data.lottery_type === 2,
                    lottery_point: data.lottery_point/100
                },()=>{
                    this.point = data.lottery_point && data.lottery_point/100
                    this.lottery_count = data.lottery_count
                    this.checkbox = data.prize_type && data.prize_type.split(',').map(i=> Number(i))
                    let from = {
                        name:data.name,
                        time:[ moment(data.begin_at) ,moment(data.end_at)],
                        description:data.description,
                        lottery_point:data.lottery_point,
                        lottery_type:data.lottery_type,
                        prize_type: this.checkbox
                    }
                    this.props.form.setFieldsValue(from)
                    
                })
            }
        })
    }
    // 验证开始小红包
    checkPacket () {
        const { dispatch } = this.props
        dispatch({
            type: 'platform_redpacket/checkPacket',
            payload: {
                has_wx_pay:2
            },
            callback:() =>{}
        })
    }
    // 保存
    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.lottery_point = this.point ? this.point*100 : 0
                values.lottery_count = this.lottery_count || 1
                this.point = ''
                this.lottery_count = ''
                values = {...this.state.from,...values}
                this.props.setStep && this.props.setStep(2,values) 
            }
        })
    }
    // 活动说明
    handleTextChange = () => {
        const value = '1.同一微信用户活动期间免费抽1次\n2.抽奖获得实物奖品的客户请截图联系商家'
        this.props.form.setFieldsValue({
            description: value
        })
    }

    disabledDate = (current) => {
        return current && +current._d <  (new Date() - 1000*60*60*24)
    }
    point = ''
    pointChange = (value) => {
        this.point = value
        this.setState({
            lottery_point:value
        })
    }
    lottery_count = ''
    handleTypeChange = (e) =>{
        let value = e.target.value
        let l = value === 1 ? 2:1
        this.setState({
            [`lottery_count_${l}`]:1,
            typeDisabled: value === 2
        })
        this.lottery_count = 1
    }
    countChange = (value,type) => {
        this.setState({
            [`lottery_count_${type}`]:value
        })
        this.lottery_count = value
    }
    checkbox = []
    checkboxChange = (value) => {
        const { ispacket } = this.props.platform_redpacket
        if (value.indexOf(3) > -1 &&
            this.checkbox.indexOf(3) === -1 &&
            (!ispacket || ispacket.length === 0)) {
            confirm({
                title: '提示',
                content: '设置现金红包奖品需要配置商户号，且开通企业付款到零钱功能',
                okText: '去设置',
                iconType: 'info-circle',
                cancelText: '再想想',
                onOk: () => {
                    this.checkbox = value
                    router.push('/setting/authorization/subscription')
                },
                onCancel: () => {
                    this.props.form.setFieldsValue({
                        prize_type: this.checkbox
                    })
                },
            })
        } else {
            this.checkbox = value
        }
    }

    render() {
        const { type } = this.state
        const FormItem = Form.Item
        const RadioGroup = Radio.Group
        const { getFieldDecorator } = this.props.form
        let { id } = this.props.location.query
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '80px' }
            },
            wrapperCol: {
                span: 12
            }
        }
        return (
            <DocumentTitle title={id ?'编辑活动':'创建活动'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '活动列表',
                            path: '/platform/lottery_activity'
                        }, {
                            name: type
                        }]}
                    />
                    <Row>
                        <Col span={15} style={{ width: 780 }}>
                            <Form className='hz-margin-base-top'>
                                <FormItem {...formItemLayout} label="活动名称">
                                    {getFieldDecorator('name', {
                                        rules: [
                                            { required: true, message:"请输入活动名称"}
                                        ]
                                    })(
                                        <HzInput placeholder="12字以内" maxLength={12} />
                                    )}
                                </FormItem>

                                <FormItem {...formItemLayout}
                                    label="活动时间"
                                    wrapperCol={{ span: 12 }}
                                    required={true}
                                >
                                    {getFieldDecorator('time', {
                                        rules: [
                                            { required: true, message:"请选择活动时间"}
                                        ]
                                    })(
                                        <RangePicker
                                            disabledDate={this.disabledDate}
                                            showTime={{
                                                hideDisabledOptions: true,
                                                defaultValue: [moment('00:00:00', 'HH:mm'), moment('23:59:59', 'HH:mm')],
                                            }}
                                            format="YYYY-MM-DD HH:mm"
                                            style={{width:'100%'}}
                                        />    
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label="积分抽奖">
                                    {getFieldDecorator('lottery_point', {})(
                                        <>
                                            每次消耗 <InputNumber
                                            onChange={this.pointChange}
                                            value={this.state.lottery_point}
                                            min={1}
                                            max={99999999}
                                            step={1}
                                            precision={0}
                                        /> 积分
                                        </>
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label="抽奖次数">
                                    {getFieldDecorator('lottery_type', {
                                        initialValue: 1
                                    })(
                                        <RadioGroup onChange={this.handleTypeChange}>
                                            <Radio value={1}>同一客户活动期间总共可抽 <InputNumber
                                                defaultValue={1}
                                                disabled={this.state.typeDisabled}
                                                value={this.state.lottery_count_1}
                                                onChange={value => this.countChange(value,1)}
                                                min={1}
                                                max={999}
                                                step={1}
                                                precision={0}
                                            /> 次</Radio>
                                            <Radio value={2}>同一客户活动期间每天可抽 <InputNumber
                                                defaultValue={1}
                                                disabled={!this.state.typeDisabled}
                                                value={this.state.lottery_count_2}
                                                onChange={value => this.countChange(value,2)}
                                                min={1}
                                                max={999}
                                                step={1}
                                                precision={0}
                                            /> 次</Radio>
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                
                                <FormItem {...formItemLayout} label="活动规则" style={{ marginBottom: 0 }}>
                                    {getFieldDecorator('description', {
                                        rules: [{ required: true, message: '请输入活动规则' }]
                                    })(
                                        <TextAreaCount
                                            placeholder="请输入或粘贴客户需要了解的活动规则，文字可换行"
                                            style={{ height: 130, width: 390 }}
                                            limitSize={300}
                                            rows={5}
                                        />
                                    )}
                                </FormItem>

                                <FormItem>
                                    <a href="javascript:;" style={{ float: "left", marginLeft: 80 }} onClick={this.handleTextChange}>载入示例</a>
                                </FormItem>

                                <FormItem {...formItemLayout} label="奖品类型" >
                                    {getFieldDecorator('prize_type', {
                                        rules: [{type:'array', required: true, message: '请选择奖品类型' }]
                                    })(
                                        <CheckboxGroup onChange={this.checkboxChange} disabled={!!id}>
                                            <Checkbox value={1}>积分</Checkbox>
                                            <Checkbox value={2}>实物</Checkbox>
                                            <Checkbox value={3}>现金红包 <Popover 
                                                placement="bottomLeft" 
                                                arrowPointAtCenter
                                                title={null}
                                                content={<div >
                                                    <span>选择现金红包奖项需配置商户号并</span> <br/> 
                                                    <span>开通企业打款到零钱功能</span>
                                                </div>}>
                                                <Icon type="question-circle" style={{color:'#4391FF'}} />
                                            </Popover></Checkbox>
                                        </CheckboxGroup>
                                    )}
                                    
                                </FormItem>

                                <div className='hz-margin-base-top-bottom'>
                                    <Button type="primary" htmlType="submit" onClick={() => this.handleSubmit()} disabled={this.state.isClickButton}>下一步</Button>
                                    <Link to='/platform/lottery_activity'><Button style={{ marginLeft: 16 }}>取消</Button></Link>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Page>
            </DocumentTitle >
        )
    }
}

