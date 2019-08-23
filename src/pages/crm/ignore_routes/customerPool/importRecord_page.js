'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [吴明]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {connect} from 'dva'
import {Table, Pagination,Form, Row, DatePicker,  Col,  Button, Icon} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import moment from 'moment'
import ErrorModal from './ErrorModel'
// import Page from 'crm/components/Page'
import Page from 'components/business/Page'
import styles from './importRecord.less'


@connect(({ base, crm_customerPool}) => ({
    base, crm_customerPool
}))
@Form.create()
@documentTitleDecorator({
    title:'导入记录'
})
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visible:false,
            id:'',
            params:{
                begin_time:'',
                end_time:'',
                offset:1,
                limit:10
            }
        }
    }

    componentDidMount() {
        this.handleSearch()
        this.getData(1,10)
       
    }
    handleSearch = () =>{
        var { params } = this.state 
        params.offset=1
        this.setState({
            ...params
        })
        this.getData(1,10)
    }
    onCancel = ()=>{
        this.setState({
            visible:false
        })
    }
    getData = (offset,limit)=>{
        this.props.dispatch({
            type:"crm_customerPool/importList",
            payload:{
                ...this.state.params,
                offset:(offset-1)*limit,
                limit:limit
            }
        })
    }
    handleChangeDate = (value)=>{
        var { params } = this.state 
        if(value.length==2){ 
            params.begin_time = moment(value[0]).format('YYYY-MM-DD')+' 00:00:00'
            params.end_time = moment(value[1]).format('YYYY-MM-DD')+ " 23:59:59"
        }else{
            params.begin_time =''
            params.end_time =''
        }
        this.setState({params})
    }
    showModel=(record)=>{
        this.setState({
            visible:true,
            id:record.id
        })
    }
    handlePageChange = (offset) =>{
        var { params } = this.state 
        params.offset = offset
        this.setState({params},()=>{
            this.getData(offset,params.limit)
        })
       
    }

    handleChangeSize = (offset,limit) =>{
        var { params } = this.state 
        params.limit = limit
        params.offset = 1
        this.setState({params})
        this.getData(1,limit)
    }
    render() {
        const { RangePicker } = DatePicker
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const {list, total, loading} = this.props.crm_customerPool
        const {params} = this.state
        const columns = [
            {
                title: '导入时间',
                dataIndex: 'created_at',
            },
            {
                title: '用户数量',
                dataIndex: 'count',
            },
            {
                title: '导入结果',
                dataIndex: 'status',
                key: 'status',
                render:(text,record,index)=>{
                   return  text===1?'成功':'失败'
                }

            },
            // {
            //     title: '完成时间',
            //     dataIndex: 'success_time_at',
            // },
            {
                title: '导入成功',
                dataIndex: 'success_count',
            },
            {
                title: '导入失败',
                dataIndex: 'failed_count',
                render:(text,record,index)=>{
                    return (
                        <div>
                            <a onClick={()=>{this.showModel(record)}}>{text}</a>
                        </div>
                    )
                }
            }
        ]
        return (

            <Page>
                <Page.ContentHeader
                    breadcrumbData={[{
                        name: '用户池',
                        path: '/crm/customerpool'
                    },{
                        name: '导入记录'
                    }]}
                />
                 <Page.ContentAdvSearch  hasGutter={false}>
                    <Form layout="horizontal" className="hz-from-search"  className={styles.customerPool}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="创建日期" {...formItemLayout}>
                                    <RangePicker onChange={(value)=>{this.handleChangeDate(value)}} />
                                </Form.Item>
                            </Col>
    
                            <Col span={8}>
                                <Button className="hz-btn-width-default" type="primary"  style={{'marginTop':'3px'}}   onClick={this.handleSearch}>
                                    <Icon type="search"/>
                                    搜索
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                 </Page.ContentAdvSearch>
                <div className={styles.tablelist}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={loading}
                        rowKey={record => record.id}
                        pagination={false}
                    />
                    { list.length ?  <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={params.offset}
                        showQuickJumper={true}
                        showTotal={total => `共${total}条`}
                        pageSize={params.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.handlePageChange}
                    /> : ''
                    }
                </div>
                <ErrorModal key={this.state.id}  visible={this.state.visible} onCancel={this.onCancel} id={this.state.id}/>
            </Page>
        )
    }
}
