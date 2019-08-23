'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [wuming]
 */
import React from 'react'
import {Modal, Table,Pagination} from 'antd'
import {connect} from 'dva'
import styles  from './ErrorModel.less';
@connect(({ base, crm_customerPool}) => ({
    base, crm_customerPool
}))
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            detailList:[],
            customerLoading:false,
            limit:10,
            offset:1
        }
    }

    handleCancel = () => {
        this.props.onCancel()
    }
    handleOk = () =>{
        this.props.dispatch({
            type:'crm_customerPool/exportErrorList',
            payload:{
                id:this.props.id
            },
            callback:(data)=>{
                window.location.href=data
                this.props.onCancel()
            }
        })
        
    }
    componentDidMount() {
        const {offset,limit } = this.state
        if(this.props.id){
            this.getData(offset,limit)
        }  
    }
    handlePageChange =(page) =>{
        const {limit } = this.state
        this.setState({
            offset:page
        },()=>{
            this.getData(page,limit)
        })
    }
    getData=(page,pageSize)=>{
        this.props.dispatch({
            type:'crm_customerPool/errorList',
            payload:{
                import_history_id:this.props.id,
                offset:(page-1)*pageSize,
                limit:pageSize,
                status:2
            }
        })
    }
    render() {
        const {data,errorTotal,loading}= this.props.crm_customerPool
        const {offset,limit}= this.state
        const columns = [
            {
                title: '手机号',
                dataIndex: 'phone',
                key:'phone'
            },
            {
                title: '姓名',
                dataIndex: 'name',
                key:'name'
            },
            {
                title: '备注',
                dataIndex: 'remark',
                key:'remark'
            },
            {
                title: '原因',
                dataIndex: 'reason',
                key:'reason'
            }
        ]
        return ( <Modal visible={this.props.visible}
            title='错误数据'
            className={styles.errorModel}
            onCancel={this.handleCancel}
            onOk={this.handleOk}
            okText="导出"
            cancelText="返回"
            width={960}>
            <Table
                columns={columns}
                dataSource={data}
                size="middle"
                loading={loading}
                rowKey={record => record.id}
                pagination={false}
            />
            { data.length ?  <Pagination
                className="ant-table-pagination"
                total={errorTotal}
                size="small"
                current={offset}
                showQuickJumper={true}
                showTotal={total => `共${total}条`}
                pageSize={limit}
                onChange={this.handlePageChange}
            /> : ''
            }

        </Modal>)
    }
}
