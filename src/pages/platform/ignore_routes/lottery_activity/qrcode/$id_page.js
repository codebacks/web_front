import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import { Link } from 'dva/router'
import router from 'umi/router'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Button,Table,Row,Col,message,Modal,Icon,Input } from 'antd'
import {getQrCodeUrl} from '../../../services/lottery_activity'
import styles from '../index.less'

import QRCode from '@/components/QrCode'


@connect(({ lottery_activity }) => ({ lottery_activity }))
export default class extends React.Component {
    state={
        url:''
    }
    componentDidMount(){
        console.log(this.props.computedMatch && this.props.computedMatch.params)
        let params = this.props.computedMatch && this.props.computedMatch.params
        let _id = params && params.id
    }
    render(){

        let { id } = this.props.location.query
        let params = this.props.computedMatch && this.props.computedMatch.params
        let url = getQrCodeUrl(params && params.id)
        return <DocumentTitle title={id ?'编辑成功':'创建成功'}>
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '活动列表',
                        path: '/platform/lottery_activity'
                    }, {
                        name: id ?'编辑成功':'创建成功'
                    }]}
                />
                <div className={styles.content}>
                    <h2>
                        <Icon type="check-circle" style={{fontSize:40,color:'#09BB07',display: 'block',float: 'left'}} theme="filled" /> <span>活动保存成功！</span> 
                    </h2>
                    <p>微信扫一扫,查看/参与活动</p>
                    <QRCode useDevicePixelRatio={false} value={url} />
                    <div className={styles.btn}>
                        <span>复制短连接：</span> <Input readOnly style={{width:320}} value={url} />
                        <CopyToClipboard
                            text={url}
                            onCopy={() => { message.success('复制链接成功！') }}
                        >
                            <Button type="primary" style={{ verticalAlign: 'middle', width: '80px',marginLeft:8 }}>复制</Button>
                        </CopyToClipboard>
                    </div>
                </div>
            </Page>
        </DocumentTitle>
    }
}




