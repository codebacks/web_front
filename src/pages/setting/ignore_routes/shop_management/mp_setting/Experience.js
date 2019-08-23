import { Component, Fragment } from 'react'
import {connect} from 'dva'
import { Row, Form, Button, Table, Pagination, Modal, Input } from 'antd'
import styles from './index.less'
import safeSetState from 'hoc/safeSetState'
const confirm = Modal.confirm

@connect(({base, mp_setting}) => ({
    base,
    mp_setting,
}))
@Form.create()
@safeSetState()
export default class Experience extends Component {
    state = {
        visible: false,
        loading: false,
    }
    addExperie = ()=>{
        this.setState({
            visible: true, 
        })
    }
    getInitData = () => { 
        const { perPage } = this.props.mp_setting
        this.props.dispatch({
            type: 'mp_setting/getExperieList',
            payload: {
                page: 1,
                per_page: perPage,
            }
        })   
    }
    onCancel = ()=> {
        this.setState({
            visible: false, 
        })
    }
    onOk = ()=> {
        this.props.form.validateFields((err, values)=>{
            // console.log(values)
            if(!err){
                this.props.dispatch({
                    type: 'mp_setting/addExperie',
                    payload: {
                        wechat_id: values.wechat_id || ''
                    },
                    callback: () => {
                        this.setState({
                            visible: false, 
                        })
                        this.getInitData()
                    }
                })
            }
        })
    }
    deleteItem = (item) => {
        const _this = this
        confirm({
            title: '确认删除此账号的体验权限？',
            onOk() {
                _this.props.dispatch({
                    type: 'mp_setting/deleteExperie',
                    payload: {
                        id: item.id,
                        wechat_id: item.wechat_id,
                    },
                    callback: ()=> {
                        _this.getInitData()
                    }
                }) 
            },
            onCancel() {},
        }) 
    }
    handleChangeSize = (current, pageSize)=> {
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'mp_setting/getExperieList',
            payload: {
                page: 1,
                per_page: pageSize,
            },
            callback: ()=>{
                this.setState({
                    loading: false,
                })
            }
        })  
    }
    goToPage = (current, size)=> {
        this.setState({
            loading: true,
        })
        const { perPage } =this.props.mp_setting
        this.props.dispatch({
            type: 'mp_setting/getExperieList',
            payload: {
                page: current,
                per_page: perPage,
            },
            callback: ()=>{
                this.setState({
                    loading: false,
                })
            }
        }) 
    }
    render(){
        const { currentPage, perPage, totalSize, experieList } = this.props.mp_setting
        const { visible, loading } = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [
            {
                title: '用户微信号',
                dataIndex: 'wechat_id',
                width: '40%',
            },
            {
                title: '添加时间',
                dataIndex: 'created_at',
                width: '40%',
            },
            {
                title: '操作',
                width: '20%',
                render: (value, item, index) => {
                    return <a onClick={()=>{this.deleteItem(item)}}>删除</a> 
                }
            }
        ]
        return(
            <Fragment>
                <Row className={styles.expeAdd}>
                    <Button type='primary' onClick={this.addExperie}>添加</Button>
                </Row>
                <Row>
                    <Table 
                        columns={columns} 
                        dataSource={experieList} 
                        pagination={false} 
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        experieList.length > 0 && (
                            <Pagination
                                className="ant-table-pagination"
                                current={currentPage}
                                total={totalSize}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}
                                pageSize={perPage} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goToPage}
                            />    
                        )
                    }
                </Row>
                {/* 弹窗 */}
                <Modal
                    title="添加体验账号"
                    visible={visible}
                    onCancel={this.onCancel}
                    onOk={this.onOk}
                    width={400}
                >
                    <Form>
                        <Form.Item label="微信号" {...formItemLayout}>
                            {getFieldDecorator("wechat_id",{
                                rules: [{ required: true, message: '请输入微信号' }],
                            })(
                                <Input/>
                            )}
                        </Form.Item>  
                    </Form>
                </Modal>
            </Fragment>
        )
    }
}