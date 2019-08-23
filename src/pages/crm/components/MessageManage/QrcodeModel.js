'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户:[吴明]
 */
import React from 'react'
import {Modal, Table,Pagination } from 'antd'
import {connect} from 'dva'
import {Link} from 'dva/router'
import styles from './index.less'

@connect(({ base, sms_managamnet}) => ({
    base, sms_managamnet
}))
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            loading:false,
            current:1,
            limit:10
        }
    }
    componentDidMount(){
        this.getData(this.state.current,this.state.limit)
    }
    getData=(current,limit)=>{
        this.setState({
            loading:true
        })
        this.props.dispatch({
            type: 'sms_managamnet/getQrcodeList',
            payload:{
                offset: (current - 1),
                limit: limit,
                addChildQrcodeType:1
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    current:current,
                    limit:limit
                })
            }
        })
    }
    handleChangePageSize=(value,limit)=>{
        this.getData(1,limit)
    }
    handleChangePage=(current)=>{
        this.getData(current,this.state.limit)
    }

    handleCancel = () => {
        this.props.onCancel()
    }
    chooseMessageModel=(id)=>{
        this.props.onCancel(id)
    }

    render() {
        const {loading,current,limit} = this.state
        const { data, rows_found } = this.props.sms_managamnet
        let datas = data.filter(item=>item.addChildQrcodeType===1)
        const columns = [
            {
                title: '新码名称',
                dataIndex: 'name',
                key:'name',
                width:200
            },
            {
                title: '微信数',
                dataIndex: 'wechatNum',
                key:'wechatNum',
                width:200
            },
            {
                title: '创建人',
                dataIndex: 'operatorUserName',
                key:'operatorUserName',
                width:200
            },
            {
                title: '操作',
                width:100,
                render:(text,record)=><a  onClick={()=>{this.chooseMessageModel(record.id)}}>选择</a>
                
            }
        ]
        return (
            <Modal visible={this.props.visible}
                title='新码微信号'
                onCancel={this.handleCancel}
                footer={null}
                width={600}
                className={styles.message_model}>
                <p> <img style={{width:24}} src={require('../../assets/images/attention.svg')} /> 每条短信将从新码内随机选取微信号，不是新码短链接！</p>
                <Table columns={columns} dataSource={datas}  rowKey={(record, index) => index} pagination={false}  scroll={{ y: 450}}   loading={loading}/>
                {
                    datas.length > 0 ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={rows_found}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={limit} 
                            size="small"
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleChangePageSize}
                            onChange={this.handleChangePage} />
                        : ''
                }
  
            </Modal>
        )
    }
}
