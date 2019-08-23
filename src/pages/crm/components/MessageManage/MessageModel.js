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
            type: 'sms_managamnet/getMsmTemplateList',
            payload:{
                type:this.props.type,
                offset: (current - 1)*limit,
                limit: limit,
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
    chooseMessageModel=(record)=>{
        this.props.onCancel(record)
    }

    render() {
        const {loading,current,limit} = this.state
        const { list, total } = this.props.sms_managamnet
        const columns = [
            {
                title: '模板名称',
                dataIndex: 'name',
                key:'name',
                width:200
            },
            {
                title: '发送短信数',
                dataIndex: 'send_count',
                key:'send_count',
                width:150
            },
            {
                title: '发送人数',
                dataIndex: 'unique_mobile_count',
                key:'unique_mobile_count',
                width:150
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key:'creator',
                width:150
            },
            {
                title: '操作',
                render:(text,record)=><a  onClick={()=>{this.chooseMessageModel(record)}}>选择</a>
                
            }
        ]
        return (
            <Modal visible={this.props.visible}
                title={this.props.type ==1?'营销模版':'加粉模板'}
                onCancel={this.handleCancel}
                footer={null}
                className={styles.message_model}
                width={800}>
                <Table columns={columns} dataSource={list}  rowKey={(record, index) => index} pagination={false}  scroll={{ y: 450}}   loading={loading}/>
                {
                    list.length > 0 ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={total}
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
