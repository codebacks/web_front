import React from 'react'
import {connect} from 'dva'
import { Modal, Form, Table, Button, DatePicker, Pagination, Badge, message  } from 'antd'
import styles  from './index.less'
const { RangePicker } = DatePicker
const DEFAULT_PAGE = {
    current: 1,
    pageSize: 10,
}
const dateFormat = 'YYYY-MM-DD'

@Form.create()
@connect(({ base, weixin_analysis }) => ({
    base, weixin_analysis
}))

export default class Index extends React.Component {
    state = {
        loading: false,
        current: DEFAULT_PAGE.current,
        pageSize: DEFAULT_PAGE.pageSize,
        time_start: '',
        time_end: '',
    }
    componentDidMount(){
        if(this.props.visible){
            this.getPageData()
        }
    }
    getPageData = ()=>{
        this.setState({loading: true})
        const { current, pageSize, time_start, time_end } = this.state
        this.props.dispatch({
            type: 'weixin_analysis/getReportList',
            payload: {
                export_time_start: time_start, 
                export_time_end: time_end, 
                offset: (current - 1) * pageSize, 
                limit: pageSize, 
            },
            callback: ()=>{
                this.setState({loading: false})
            }
        })
    }
    onSearch = ()=>{
        this.props.form.validateFields((error, values)=>{
            let val = values.rangePicker
            let time_start = ''
            let time_end =  ''
            if(Array.isArray(val) && val.length > 0){
                time_start = val[0].format(dateFormat)
                time_end = val[1].format(dateFormat)
            }
            this.setState({
                time_start: time_start, 
                time_end: time_end, 
            },()=>{
                this.getPageData()
            })
        })
    }
    onChangePage = (page, pageSize)=>{
        this.setState({
            current: page,
            pageSize: pageSize,
        },()=>{
            this.getPageData()
        })
    }
    onShowSizeChange = (current, size)=>{
        this.setState({
            current: DEFAULT_PAGE.current,
            pageSize: size,  
        },()=>{
            this.getPageData()
        })
    }
    onExport = (item)=>{
        this.props.dispatch({
            type: 'weixin_analysis/tryReportAgain',
            payload: {
                id: item.id
            },
            callbaclk: ()=>{
                message.success('再次导出数据已在队列中，请在导出记录中查看下载')
                this.getPageData()
            }
        })   
    }
    onDownload = (item)=>{
        if(item.download_url){
            window.location.href = item.download_url
        }
    }
    render () {
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
                title: '导出时间',
                dataIndex: 'created_at',
            },
            {
                title: '完成时间',
                dataIndex: 'complete_at',
                render: (value, item)=> value || '--'
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (value, item)=>{
                    let status = ''
                    let text = ''
                    switch(item.status){
                        case 1:
                            status = 'default'
                            text = '导出中'
                            break
                        case 2:
                            status = 'error'
                            text = '导出失败'
                            break
                        case 3:
                            status = 'success'
                            text = '导出完成'
                            break
                        default:
                            status = ''
                            text = ''
                    }
                    return text?<Badge status={status} text={text} />: '--'
                }
            },
            {
                title: '导出周期',
                dataIndex: 'report_at',
                render: (value, item)=> value || '--'
            },
            {
                title: '操作',
                render: (value, item)=>{
                    let text = ''
                    switch(item.status){
                        case 1:
                            text = '--'
                            break
                        case 2:
                            text = (<span className={styles.cursor} onClick={()=>this.onExport(item)}>再次导出</span>)
                            break
                        case 3:
                            text = (<span className={styles.cursor} onClick={()=>this.onDownload(item)}>下载</span>)
                            break
                        default:
                            text = '--'
                    }
                    return text
                }
            },
        ]
        const { current, pageSize } = this.state
        const { exportList, total} = this.props.weixin_analysis
        return (
            <Modal 
                title='导出记录'
                visible={ this.props.visible }
                onCancel={this.props.onCancel}
                className={styles.modalContent}
                footer={null}
                width={900}
            >
                <Form>
                    <Form.Item label="导出时间" {...formItemLayout}>
                        {getFieldDecorator("rangePicker", {})(
                            <RangePicker
                                format={dateFormat} 
                            />
                        )}
                        <Button type='primary' icon="search" style={{marginLeft: 16}} onClick={this.onSearch}>查询</Button>
                    </Form.Item>
                </Form>
                <Table columns={columns} dataSource={exportList} pagination={false} rowKey='id' loading={this.state.loading}  />
                {
                    exportList.length> 0 && (
                        <Pagination 
                            className="ant-table-pagination"
                            current={current}
                            total={total}
                            showTotal={(total) => `共 ${total} 条`}
                            pageSize={pageSize}
                            onChange={this.onChangePage} 
                            onShowSizeChange={this.onShowSizeChange} 
                            showSizeChanger
                            showQuickJumper
                            size='small' 
                        />
                    )
                }

            </Modal>
        )
    }
}
