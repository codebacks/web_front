import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Form, Popover, DatePicker, Radio, Row, Col, Button, InputNumber, Icon, Checkbox, message,Modal,Select,Input } from 'antd'
import styles from '../index.less'
import router from 'umi/router'
import JSON from './data'

const {Option} = Select
const FormItem = Form.Item

@Form.create({})
@connect(({lottery_record,platform_redpacket }) => ({  lottery_record,platform_redpacket }))
export default class extends React.PureComponent {
    
    componentDidMount(){
        const {id} = this.props.location.query
        // this.props.dispatch({
        //     type:'lottery_record/getExpress'
        // })
        this.props.dispatch({
            type:'lottery_record/getLotteryRocord',
            payload:{id}
        })
    }
    onSubmit = () => {
        const {id} = this.props.location.query
        this.props.form.validateFields((err,values)=>{
            if(!err){
                this.props.dispatch({
                    type:'lottery_record/sendGrant',
                    payload:{
                        ...{id},
                        ...values
                    },
                    callback:()=>{
                        router.push('/platform/lottery_record')
                    }
                })
            }
        })
        
    }
    searchFilter = (input, option) => {
        const value = input.toUpperCase()
        if (/[a-zA-Z]/.test(value)) {
            if (option.key.indexOf(value) !== -1) {
                return true
            } else {
                return false
            }
        } else if (/[\u4E00-\u9FA5]{1,}/.test(value)) {
            if (option.props.children.indexOf(value) !== -1) {
                return true
            } else {
                return false
            }
        }
    }

    render(){
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '84px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
                style: {
                    width: 240
                }
            },
        }

        const {getFieldDecorator} = this.props.form
        const {express,detail} = this.props.lottery_record
        return <DocumentTitle title='活动记录'>
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '活动记录',
                        path: '/platform/lottery_record'
                    }, {
                        name: '发送奖品'
                    }]}
                />
                <Page.ContentBlock title="抽奖信息" />
                <div className={styles.pageContent} >
                    <Row>
                        <Col span={24} ><span>抽奖人微信：</span>{detail.nick_name}</Col>
                    </Row>
                    <Row>
                        <Col span={24} ><span>中奖时间：</span>{detail.created_at}</Col>
                    </Row>
                    <Row>
                        <Col span={24} ><span>奖品类型：</span>{detail.prize_type ===2 ? '实物':''}</Col>
                    </Row>
                    <Row>
                        <Col span={24} ><span>奖品名称：</span>{detail.prize && detail.prize.name}</Col>
                    </Row>
                    
                </div>
                <Page.ContentBlock title="收货信息" />
                <div className={styles.pageContent} >
                    <Row>
                        <Col span={24} ><span>收货人姓名：</span>{detail.user && detail.user.name}</Col>
                    </Row>
                    <Row>
                        <Col span={24} ><span>收货人手机：</span>{detail.user && detail.user.mobile}</Col>
                    </Row>
                    <Row>
                        <Col span={24} ><span>收货人地址：</span>{detail.user && detail.user.address}</Col>
                    </Row>
                </div>
                <Page.ContentBlock title="配送信息" />
                <div className={styles.pageContent} >
                    <Form layout="horizontal" >
                        <FormItem label="快递公司" {...formItemLayout} >
                            {getFieldDecorator('express_name', {
                                rules:[{required:true,message:'请选择快递公司'}]
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder='搜索快递公司'
                                    filterOption={this.searchFilter}
                                >
                                    {JSON && Object.keys(JSON).map(item => {
                                        return <Option value={JSON[item]} key={item}>{JSON[item]}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="快递单号" {...formItemLayout} >
                            {getFieldDecorator('express_number', {
                                rules: [
                                    {required:true,message:'请输入快递单号'},
                                ]
                            })(
                                <Input placeholder='请输入快递单号' maxLength={40} />
                            )}
                        </FormItem>
                    </Form>
                </div>
                <Row>
                    <Col span={8}>
                        <Col span={16}>
                            <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.onSubmit}>
                                确定
                            </Button>
                            <Link to='/platform/lottery_record'>
                                <Button className="hz-btn-width-default hz-margin-base-left"> 取消 </Button>
                            </Link>
                        </Col>
                    </Col>
                </Row>
                <br />
                <br />
                
            </Page>
        </DocumentTitle>
    }
}












