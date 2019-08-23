/*
 * @Author: zhangsai
 * @Date: 2019-06-13 10:31:29
 * @Last Modified by: zhangsai
 * @Last Modified time: 2019-06-13 16:50:22
 */



import React, {useState, useEffect} from 'react'
import {connect} from 'dva'
import { Button, Table, Form, Row, Col, Modal, Select, Input, Icon } from 'antd'
import Page from '../../../../components/business/Page'
import styles from './index.less'
const warnIcon = require('../../assets/images/icon_attention@2x.png')
const Option = Select.Option


const Index = (props)=>{
    const [visible, setVisible] =  useState(false)
    const [loading, setLoading] =  useState(false)
    const [type, setType] =  useState('')
    const [sex, setSex] =  useState('')
    const [age, setAge] =  useState('')

    // 类似componentDidMount
    useEffect(()=>{
        console.log('初始化执行')
    },[])

    // 请求接口，初始化数据
    const getInit = ()=>{
        console.log('请求接口')
        props.dispatch({
            type: 'base/getInitData',
            payload: {},
            callback:()=>{
                console.log('请求接口成功')
                console.log(props.base)
            }
        })
    }

    const columns = [
        {
            title: '标识',
            dataIndex: 'id',
            width: '20%',
        },
        {
            title: '类型',
            dataIndex: 'type',
            width: '20%',
        },
        {
            title: '名称',
            dataIndex: 'name',
            width: '20%',
        },
        {
            title: '性别',
            dataIndex: 'sex',
            width: '20%',
        },
        {
            title: '年龄',
            dataIndex: 'age',
            width: '20%',
        },
    ]
    const dataSource = [
        {
            id: 1,
            type: '学生',
            name: '名称',
            sex: '男',
            age: '20',
        },
        {
            id: 2,
            type: '工人',
            name: '名称',
            sex: '女',
            age: '18',
        }
    ]
    const formItemLayout = {
        labelCol: {
            span: 6,
            style: {
                width: '40px',
                textAlign: 'right',
            },
        },
        wrapperCol: {
            span: 16,
        },
    }

    const onCancel = ()=>{
        console.log('取消按钮')
        setVisible(false)
    }
    const onOk = ()=>{
        console.log(props)
        console.log('确定按钮')
        onCancel()
    }

    const onSearch = ()=>{
        getInit()
        // model里面存放的state数据
        console.log(props.base)
        console.log(type, sex, age)
        setLoading(true)
        setTimeout(()=>{
            setLoading(false)
        },500)
    }
    const resetSearch = ()=>{
        setLoading(true)
        setType('')
        setSex('')
        setAge('')
        setTimeout(()=>{
            setLoading(false)
        },500)
    }

    return <Page>
        <div className={styles.title}>
            <h1>HOOK应用</h1>
        </div>
        <div className={styles.head}>
            <img src={warnIcon} style={{marginRight: 8,width: 18,objectFit: 'cover',verticalAlign: 'sub'}} alt='' />
            <span>这是hook应用示例页面！这是hook应用示例页面！这是hook应用示例页面！点击搜素会请求接口~~~</span>
        </div>
        <Button type='primary' onClick={()=>setVisible(true)}>创建hook</Button>
        <div className={styles.search}>
            <Page.ContentAdvSearch>
                <Form layout="horizontal" className="hz-from-search">
                    <Row>
                        <Col span={8}>
                            <Form.Item label="类型" {...formItemLayout}>
                                <Select
                                    getPopupContainer={triggerNode=>triggerNode.parentNode}
                                    placeholder='不限'
                                    value={type}
                                    onChange={(value)=>setType(value)}
                                >
                                    <Option value=''>不限</Option>
                                    <Option value='学生'>学生</Option>
                                    <Option value='工人'>工人</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="性别" {...formItemLayout}>
                                <Select
                                    getPopupContainer={triggerNode=>triggerNode.parentNode}
                                    placeholder='不限'
                                    value={sex}
                                    onChange={(value)=>setSex(value)}
                                >
                                    <Option value="">不限</Option>
                                    <Option value="男">男</Option>
                                    <Option value="女">女</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="年龄"  {...formItemLayout}>
                                <Input placeholder="输入名称" value={age} onChange={(e)=>setAge(e.target.value)} />
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row>
                        <Col span={8}>
                            <Col span={3} style={{width: '40px'}}></Col>
                            <Col span={16}>
                                <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={onSearch} >
                                    <Icon type="search"/>
                                    搜索
                                </Button>
                                <Button className="hz-btn-width-default hz-margin-base-left" onClick={resetSearch}>
                                    重置
                                </Button>
                            </Col>
                        </Col>
                    </Row>
                </Form>
            </Page.ContentAdvSearch>
        </div>
        <div className={styles.table}>
            <Table columns={columns} dataSource={dataSource} pagination={false} rowKey="id" loading={loading}/>
        </div>
        <Modal
            title="弹窗"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
        >
            这是弹窗
        </Modal>
    </Page>
}
const App = connect(({ base }) => ({
    base,
}))(Index)
export default App