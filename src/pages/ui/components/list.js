import React from 'react'
import { Table, Icon, Divider, Tooltip, Popover, Modal } from 'antd'
import router from 'umi/router'

export default class List extends React.PureComponent{

    deleteHandler = () => {
        Modal.confirm({
            title: '系统提示',
            content: '解除后，与公众号相关的功能将无法使用是否确定解除？', 
            onOk() {
                console.log('OK')
            },
            onCancel() {

                console.log('Cancel')
            },
        })
    }

    detailHandler = (item) => {
        router.push('/ui/detail/' + item.key)
    }

    render() {
        const columns = [{
            title: '发送时间',
            dataIndex: 'sendTime',
            key: 'sendTime',
            width: 190
        }, 
        {
            title: '红包金额',
            dataIndex: 'amount',
            key: 'amount',
        }, 
        {
            title: '红包备注',
            dataIndex: 'remark',
            key: 'remark',
        }, 
        {
            title: '红包状态',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: '发送人',
            dataIndex: 'sendName',
            key: 'sendName',
        },
        {
            title: (<span>发送人微信号 <Popover content="提示文字提示文字提示文字"><Icon className="hz-text-primary" type="question-circle"></Icon></Popover></span>),
            dataIndex: 'sendWeChatName',
            key: 'sendWeChatName',
        },
        {
            title: '相关订单号',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 230,
            render: (text, record) => (
                <span>
                    <Tooltip title="编辑此信息">
                        <a href="javascript:void(0);">编辑</a>
                    </Tooltip>
                    <Divider type="vertical" />
                    <a href="javascript:void(0);" onClick={this.deleteHandler}>删除</a>
                    <Divider type="vertical" />
                    <a href="javascript:void(0);" onClick={() => this.detailHandler(record)}>详情</a>
                    <Divider type="vertical" />
                    <a href="javascript:void(0);" className="ant-dropdown-link">
                    更多 <Icon type="down" />
                    </a>
                </span>
            ),
        }]
        const dataItem = {
            key: 1,
            sendTime: '2018-07-21 13:29',
            amount: 1.00,
            remark: '返现',
            status: 2,
            sendName: '李毛毛',
            sendWeChatName: '来自星星的你',
            orderNumber: '112309826',
            address: 'New York No. 1 Lake Park',
        }

        var data = []

        for(var i = 0; i< 45; i++) {
            data.push({...dataItem, key: i})
        }



        return (
            <div>
                <Table columns={columns} dataSource={data} pagination={{total: data.length, pageSize: 10,hideOnSinglePage: true, pageSizeOptions: ['10','20','50'], showSizeChanger: true}}  />
            </div>
        )
    }
}