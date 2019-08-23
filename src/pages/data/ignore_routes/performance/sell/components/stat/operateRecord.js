'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户:[吴明]
 */
import React from 'react'
import {Modal, Table,Tabs,Pagination,Radio ,message,Icon ,Button,Badge } from 'antd'
import {connect} from 'dva'

const UPDATE_STATUS={
    1:'更新中',
    2:'已完成',
    3:'失败'
}

const STATEMENT_TYPE={
    1:'统计报表',
    2:'订单报表'
}

@connect(({ base, data_performance_sell}) => ({
    base, data_performance_sell
}))


export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            current:1,
            limit:10,
            createCurrent:1,
            createLimit:10
        }
    }
    componentDidMount(){
        this.updateDataList()
        this.createStatementList()
    }
    updateDataList=(current = this.state.current,limit= this.state.limit)=>{
        this.props.dispatch({
            type:'data_performance_sell/updateDataList',
            payload:{
                offset:(current-1)*limit,
                limit:limit
            },
            callback:()=>{
                this.setState({
                    current:current,
                    limit:limit
                })
            }
        })
    }
    createStatementList=(current = this.state.createCurrent,limit= this.state.createLimit)=>{
        this.props.dispatch({
            type:'data_performance_sell/createStatementList',
            payload:{
                offset:(current-1)*limit,
                limit:limit
            },
            callback:()=>{
                this.setState({
                    createCurrent:current,
                    createLimit:limit
                })
            }
        })
    }
    handleChangeSize=(value,limit)=>{
        this.updateDataList(1,limit)
    }
    goToPage=(current)=>{
        this.updateDataList(current,this.state.limit)
    }
    handleChangePageSize=(value,limit)=>{
        this.createStatementList(1,limit)
    }
    handleChangePage=(current)=>{
        this.createStatementList(current,this.state.createLimit)
    }
    changeTabs =(value)=>{

    }
    handleCancel =()=>{
        this.props.cancelRecord()
    }
    createAgain =(id)=>{
        this.props.dispatch({
            type:'data_performance_sell/createAgain',
            payload:{
                id:id
            },
            callback:()=>{
                this.createStatementList()
            }
        })
    }
    download= (url)=>{
        window.location.href=url
    }
    render(){
        const TabPane = Tabs.TabPane
        const {updataData,updataTotal,updataLoading,statementData,statementTotal} = this.props.data_performance_sell
        const {current,limit,createCurrent,createLimit} = this.state
        const updateColumns =[
            {
                title: '更新时间',
                dataIndex:'created_at',
                width:170,
                key:'created_at'
            },
            {
                title: '完成时间',
                dataIndex:'updated_at',
                width:170,
                key:'updated_at'
            },
            {
                title: '状态',
                dataIndex:'status',
                width:120,
                key:'status',
                render:(text,record)=>{
                    switch(text){
                        case 1:
                            return <Badge status="processing" text={UPDATE_STATUS[text]}/>
                        case 2:
                            return <Badge status="default" text={UPDATE_STATUS[text]}/>
                        case 3:
                            return <Badge status="error" text={UPDATE_STATUS[text]}/>
                    }
                }
            },
            {
                title: '更新周期',
                width:200,
                render:(text,record)=><span>{record.start_date}~{record.end_date}</span>
            },

        ]
        const createColumns =[
            {
                title: '报表类型',
                dataIndex:'type',
                key:'type',
                className: 'hz-table-column-width-100',
                render:(text)=>STATEMENT_TYPE[text]
            },
            {
                title: '生成时间',
                dataIndex:'created_at',
                className: 'hz-table-column-width-170',
                key:'created_at'
            },
            {
                title: '完成时间',
                dataIndex:'finished_at',
                className: 'hz-table-column-width-170',
                key:'finished_at'
            },
            {
                title: '状态',
                dataIndex:'status',
                key:'status',
                className: 'hz-table-column-width-100',
                render:(text,record)=>{
                    switch(text){
                        case 1:
                            return <Badge status="processing" text='生成中'/>
                        case 2:
                            return <Badge status="default" text={UPDATE_STATUS[text]}/>
                        case 3:
                            return <Badge status="error" text={UPDATE_STATUS[text]}/>
                    }
                }
            },
            {
                title: '生成周期',
                className: 'hz-table-column-width-200',
                render:(text,record)=><span>{record.start_at.substr(0,10)}~{record.end_at.substr(0,10)}</span>
            },
            {
                title: '操作',
                className: 'hz-table-column-width-120',
                render:(text,record)=>{
                    switch(record.status){
                        case 1 :
                            return <a>--</a>
                        case 2 :
                            return <a onClick={()=>{this.download(record.report_url)}}>下载</a>
                        case 3 :
                            return <a onClick={()=>{this.createAgain(record.id)}}>再次生成</a>
                    }
                }
            }
        ]
        return (
            <Modal 
                visible={this.props.visible}
                title={null}
                onCancel={this.handleCancel}
                footer={null}
                width={940}>
                <Tabs defaultActiveKey="1"  onChange={(value)=>{this.changeTabs(value)}}>
                    <TabPane tab="更新记录" key="1">
                        <Table columns={updateColumns} dataSource={updataData}  rowKey={(record, index) => index} pagination={false}  scroll={{ y: 450}}   loading={updataLoading}/>
                        {
                            updataData.length > 0 ?
                                <Pagination
                                    className="ant-table-pagination"
                                    current={current}
                                    total={updataTotal}
                                    showTotal={(total) => `共 ${total} 条`} 
                                    showQuickJumper={true} 
                                    showSizeChanger={true}  
                                    pageSize={limit} 
                                    size="small"
                                    pageSizeOptions= {['10', '20', '50', '100']}
                                    onShowSizeChange={this.handleChangeSize}
                                    onChange={this.goToPage} />
                                : ''
                        }
                    </TabPane>
                    
                    <TabPane tab="生成记录" key="2">
                        <Table columns={createColumns} dataSource={statementData}  rowKey={(record, index) => index} pagination={false}  scroll={{ y: 450}}   loading={updataLoading}/>
                        {
                            updataData.length > 0 ?
                                <Pagination
                                    className="ant-table-pagination"
                                    current={createCurrent}
                                    total={statementTotal}
                                    showTotal={(total) => `共 ${total} 条`} 
                                    showQuickJumper={true} 
                                    showSizeChanger={true}  
                                    pageSize={createLimit} 
                                    size="small"
                                    pageSizeOptions= {['10', '20', '50', '100']}
                                    onShowSizeChange={this.handleChangePageSize}
                                    onChange={this.handleChangePage} />
                                : ''
                        }
                    </TabPane>
                    
                    
                </Tabs>
            </Modal>
        )
    }
}
