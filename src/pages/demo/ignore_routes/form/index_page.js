/**
 * 文件说明: 列表页
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 18/08/01
 */

import React, { Component } from 'react'
import { Table, Divider } from 'antd'
import { connect } from 'dva'

@connect(({ demo_menu }) => ({
    demo_menu,
}))
export default class Index extends Component {

    render() {
        const columns = [{
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            render: text => <a href="#">{text}</a>,
        }, {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <a href="#">修改</a>
                    <Divider type="vertical" />
                    <a href="#">删除</a>
                </div>
            ),
        }]
        const data = [{
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
        }, {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
        }, {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park',
        }]
        return (
            <div>
                <Table
                    columns={columns} dataSource={data}
                    title={() => '客户管理'}
                />
            </div>
        )
    }
}
