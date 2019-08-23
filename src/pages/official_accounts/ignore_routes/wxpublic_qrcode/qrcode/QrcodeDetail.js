'use strict'

import React from 'react'
import { connect } from 'dva'
import { Form, Modal} from 'antd'
import DocumentTitle from 'react-document-title'
import Page from '../../../../../components/business/Page'

const formItemLayout = {
    labelCol: {
        span: 6,
        style: {
            width: '108px',
            textAlign: 'right',
        },
    },
    wrapperCol: {
        span: 18,
    }
}

@connect(({ wxpublic_qrcode }) => ({
    wxpublic_qrcode
}))
export default class extends React.Component {
    state = {
        previewVisible : false
    }
    componentDidMount() {
        const query = this.props.location.query
        if(query.id || query.showid){
            this.props.dispatch({
                type: 'wxpublic_qrcode/qrcodeDetail',
                payload: {
                    id: query.id || query.showid
                }
            })
        }
    }
    componentWillUnmount(){
        this.props.dispatch({
            type: 'wxpublic_qrcode/clearProperty'
        }) 
    }
    onImgClick = (e,url)=>{
        e.preventDefault()
        this.setState({
            previewVisible : true
        })
    }
    handleCancel = () =>{
        this.setState({
            previewVisible : false
        }) 
    }
    render() {
        const {detail} = this.props.wxpublic_qrcode
        const type ={
            1:'文字',
            2:'图片',
            3:'活动'
        }
        return <DocumentTitle title='创建二维码'>
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '公众号推广',
                        path: '/official_accounts/wxpublic_qrcode'
                    }, {
                        name: '查看二维码'
                    }]}
                />
                <Form style={{ width: 614 }}>
                    <Form.Item label="公众号名称：" {...formItemLayout} style={{ marginBottom: 8, marginTop: 16 }}>
                        <span>{detail.mp_name || ''}</span>
                    </Form.Item>
                    <Form.Item label="二维码名称：" {...formItemLayout} >
                        <span>{detail.name || ''}</span>
                    </Form.Item>
                    <Form.Item label="二维码有效期：" {...formItemLayout} >
                        <span>{detail.expired + '' !==  '-1' ? `${detail.expired || ''}天` : '永久'}</span>
                    </Form.Item>
                    <Form.Item label="扫描次数：" {...formItemLayout} >
                        <span>{detail.scan_count || ''}</span>
                    </Form.Item>
                    <Form.Item label="新增粉丝：" {...formItemLayout} >
                        <span>{detail.fans_count || ''}</span>
                    </Form.Item>
                    <Form.Item label="回复类型：" {...formItemLayout} >
                        <span>{detail.type + '' !=='3' ?type[detail.type] : `晒图${type[detail.type]}` }</span>
                    </Form.Item>
                    <Form.Item label={`回复${type[detail.type] || ''}：`} {...formItemLayout}>
                        {
                            detail.type + '' === '1' ? <span>{detail.text || ''}</span> :
                                detail.type + '' === '2' ? 
                                    <img src={detail.img_url} onClick={e=>this.onImgClick(e,detail.img_url)} alt='' title="查看" style={{maxWidth: 140,marginTop:12,cursor: 'pointer'}}/> :
                                    detail.type + '' === '3' ? <span>{detail.activity_name || ''}</span> : null

                        }
                        <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                            <img alt="" style={{ width: '100%'}} src={detail.img_url} />
                        </Modal>
                    </Form.Item>

                </Form>
            </Page>
        </DocumentTitle>
    }
}