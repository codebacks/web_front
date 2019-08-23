import React from 'react'
import {Table, Pagination, Row, Col, Form, Input, Select, Button, Icon, Popover} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import Header from 'crm/components/Header'
import config from 'crm/common/config'
import createFaceHtml from 'components/Face/createFaceHtml'
import commonStyles from '../common.scss'
import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DateTimeFormat} = config

@connect(({base, crm_mass_msg_record, loading}) => ({
    base,
    crm_mass_msg_record,
    detailsLoading: loading.effects['crm_mass_msg_record/details'],
}))
@documentTitleDecorator({
    title: '群发明细'
})
export default class FriendsMassMsgDetailPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        const locationState = this.props.location.state
        const location = locationState && locationState.location
        if (!location) {
            router.push('/crm/mass_msg?type=2')
            return
        }
        this.loadResult()
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_record/resetDetailsParams'
        })
    }

    loadResult = () => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'crm_mass_msg_record/taskResult',
            payload: {
                id: id
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_mass_msg_record.detailsParams}
        params.limit = size
        this.props.dispatch({
            type: 'crm_mass_msg_record/setProperty',
            payload: {detailsParams: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'crm_mass_msg_record/details',
            payload: {
                id: id,
                page: page
            },
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(e.target){
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.crm_mass_msg_record.detailsParams}
        params[key] = val
        this.props.dispatch({
            type: 'crm_mass_msg_record/setProperty',
            payload: {
                detailsParams: params
            }
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    reExecution = (taskId, id) => {
        this.props.dispatch({
            type: 'crm_mass_msg_record/reExecution',
            payload: {
                task_id: taskId,
                ids: [id]
            },
            callback: () => {
                const {detailCurrent : current} = this.props.crm_mass_msg_record
                this.goPage(current)
            }
        })
    }

    render () {
        const columns = [
            {
                title: '客户姓名',
                dataIndex: 'customer.name',
                key: 'customer.name',
            },
            {
                title: '微信昵称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: `${styles.firstColumn} ${styles.nicknameColumn}`,
            },
            {
                title: '微信号',
                dataIndex: 'target.alias',
                key: 'target.alias',
            },
            {
                title: '微信备注',
                dataIndex: 'target.remark_name',
                key: 'target.remark_name',
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: commonStyles.deptColumn,
                render: (text, record ,index) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length){
                        content = departments.map((item)=>{
                            return item.name
                        }).join('，')
                        return  <Popover placement="topLeft" content={<p className={commonStyles.wholeDept}>{content}</p>} title={null} trigger="hover">
                            <div className={commonStyles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                }
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
            },
            {
                title: '所属微信',
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    if (!text) {
                        return record.from.nickname
                    }
                    return text
                }
            },
            {
                title: '消息内容',
                dataIndex: 'message',
                className: styles.descColumn,
                render: (text, record, index) => {
                    if(record.message_type === 1){
                        return <Popover placement="topLeft" content={createFaceHtml({tagName: 'div', tagProps: {className: styles.wholeDesc}, values: text})}>
                            {createFaceHtml({tagName: 'div', tagProps: {className: styles.descCut}, values: text})}
                        </Popover>
                    }else {
                        return <img className={styles.image} src={text} alt="image"/>
                    }

                }
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                key: 'execute_time',
                render: (text, record, index) => {
                    if(text){
                        return moment(text*1000).format(DateTimeFormat)
                    }
                    return '--'
                }
            },
            {
                title: '发送',
                dataIndex: 'status',
                key: 'status',
                render: (text, record, index) =>{
                    switch (text) {
                    case 0:
                        return <span className={`${styles.status} ${styles.notPull}`}>未执行</span>
                    case 2:
                        return <span className={`${styles.status} ${styles.doing}`}>执行中</span>
                    case 1:
                        return <span className={`${styles.status} ${styles.success}`}>执行成功</span>
                    case -1:
                        return <span className={`${styles.status} ${styles.error}`}> 执行失败</span>
                    case -2:
                        return <span className={`${styles.status} ${styles.notPull}`}>取消执行</span>
                    default:
                        return ''
                    }
                }
            },
            {
                title: '反馈时间',
                dataIndex: 'feedback_time',
                key: 'feedback_time',
                render: (text ,record ,index) => {
                    if(text){
                        return moment(text*1000).format(DateTimeFormat)
                    }
                    return '--'
                }
            },
            {
                title: '失败原因',
                dataIndex: 'error_message',
                key: 'error_message',
                className: styles.errorColumn,
                render: (text ,record ,index) => {
                    if(record.status === 1){
                        return '--'
                    }
                    if(record.status === -1){
                        return <div className={styles.reExecution} >
                            <span onClick={()=>{this.reExecution(this.props.match.params.id, record.id)}}>
                            重新执行
                            </span>
                            <p>{record.error_message}</p>
                        </div>
                    }
                    return <p>{record.error_message}</p>
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }


        const {detailsLoading} = this.props
        const locationState = this.props.location.state
        const taskId = locationState &&  locationState.taskId
        const title =  locationState && locationState.title || ''
        const location = locationState && locationState.location
        const {detailsParams: params, details, detailsTotal, detailsCurrent, result} = this.props.crm_mass_msg_record

        return ( location ? <div className={styles.details}>
                <Header
                    breadcrumbData={
                        [
                            {
                                name: '客户群发',
                                path: {
                                    pathname: location.pathname,
                                    query: location.query,
                                    state: location && location.state
                                }
                            },
                            {
                                name: '群发明细',
                            },
                        ]
                    }
                />
                <p className={styles.name}>群发主题: {title}</p>
                <div className={styles.customSearchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Input placeholder="微信昵称/微信号/微信备注"
                                    value={params.query}
                                    onChange={(e)=>{this.handleChange('query', e)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="发送状态："
                                colon={false}
                            >
                                <Select value={params.status}
                                    onChange={(e)=>{this.handleChange('status', e)}}
                                    style={{width: '100%'}}
                                >
                                    <Option value=''>全部状态</Option>
                                    <Option value='0'>未执行</Option>
                                    <Option value='1'>执行成功</Option>
                                    <Option value='-1'>执行失败</Option>
                                    <Option value='2'>执行中</Option>
                                    <Option value='-2'>取消执行</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem {...formItemLayout}
                                label=""
                                colon={false}
                            >
                                <Button type="primary"
                                    icon="search" onClick={this.handleSearch}>搜索</Button>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>

                    </Row>
                </div>
                { result ? <div className={styles.tableHead}>
                    <div className={styles.taskNo}>编号：{taskId}
                        <Popover content={<div className={styles.questionDesc}>由系统生成的客户群发标识；当执行异常时，可复制完整编号，发给客服，便于客服查错，更快找到问题</div>}>
                            <Icon type="question-circle-o" className={styles.questionCircle}/>
                        </Popover>
                    </div>
                    <div className={styles.result}>
                        <div className={styles.item}>
                            <h3>{result['-1'] || 0}</h3>
                            <p>失败</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['1'] || 0}</h3>
                            <p>成功</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['0'] || 0}</h3>
                            <p>未执行</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['2'] || 0}</h3>
                            <p>执行中</p>
                        </div>
                        <div className={styles.item}>
                            <h3>{result['-2'] || 0}</h3>
                            <p>取消执行</p>
                        </div>
                    </div>
                </div>: ''
                }
                <div style={{ clear: 'right' }}>
                    <Table
                        columns={columns}
                        dataSource={details}
                        loading={detailsLoading}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                    />
                    {details.length ? (
                        <Pagination
                            className="ant-table-pagination"
                            total={detailsTotal}
                            current={detailsCurrent}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={params.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        />
                    ) : ''
                    }
                </div>
            </div> : ''
        )

    }
}