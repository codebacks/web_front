
import React, { Component } from 'react'
import { Icon, Popover, Switch, Modal, message } from 'antd'
import DocumentTitle from 'react-document-title'
import { connect } from 'dva'
import Page from 'components/business/Page'
import router from 'umi/router'
import AlertMessage from './AlertMessage'
import styles from './index.less'

const IMG_TYPE = {
    1: require('../../assets/successful_payment.svg'),
    2: require('../../assets/deliver_goods.svg'),
    3: require('../../assets/order_deliver.svg'),
    4: require('../../assets/sign_for.svg'),
    5: require('../../assets/evaluate.svg')
}
const edit_img = require('../../assets/edit.svg')

@connect(({ template_settings }) => ({
    template_settings
}))

export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            content: {}
        }
    }

    componentDidMount() {
        this.getTemplateMessages()
    }

    getTemplateMessages = () => {
        this.props.dispatch({
            type: 'template_settings/template_messages'
        })
    }

    open_messages = (id,name) => {
        this.props.dispatch({
            type: 'template_settings/open_messages',
            payload: {
                id,
            },
            callback: (response) => {
                if (response.meta) {
                    let meta = response.meta
                    if (meta.code + '' !== '200') {
                        this.handleOk({ code: meta.code + '', message: meta.message })
                    } else {
                        this.getTemplateMessages()
                        message.success(`${name}开启成功`)
                    }
                }
            }
        })
    }

    close_messages = (id, name) => {
        this.props.dispatch({
            type: 'template_settings/close_messages',
            payload: {
                id,
            },
            callback: (response) => {
                if (response.meta && response.meta.code + '' === '200') {
                    this.getTemplateMessages()
                    message.success(`${name}关闭成功`)
                }
            }
        })
    }

    onSwitchChange = (item) => {
        let status = item.status + ''
        if (status === '2') {
            this.close_messages(item.id,item.name)
        }else {
            this.open_messages(item.id,item.name)
        }
    }

    onEditClick = (subtype,id) => {
        router.push({
            pathname: '/official_accounts/template_settings/setting_details',
            query: { subtype, id },
        })
    }
    handleOk = (content) => {
        this.setState({
            visible: true,
            content
        })
    }
    onCancel = () => {
        this.setState({
            visible: false,
            content: {}
        })
    }
    render() {
        const { template_messages } = this.props.template_settings

        const content = <div>
            <p>1、模板消息用于向关注用户主动推送各类通知消息。</p>
            <p>2、点击编辑可对具体模板可编辑内容以及跳转网页进行编辑，确认修改后即刻生效。</p>
            <p>3、每个服务号可申请的模板上限为25个，超限可在微信公众后台删除。</p>
            <p>4、使用模板消息，需先在微信公众平台进行模板消息的申请，<span style={{ color: '#252A00', fontWeight: 'bold' }}>申请流程及注意事项</span>见右上角帮助。</p>
        </div>

        const titleHelp = <Popover content={content} placement="bottomLeft" title="" trigger="hover">
            <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type='question-circle' />
        </Popover>
        const FragmentItem = (props) => {
            const item = props.item
            return(<li>
                <div className={styles.noticeTitle}>
                    <img className={styles.successful_payment} src={IMG_TYPE[item.subtype]} alt="" />{item.name}
                </div>
                <div className={styles.noticeExample} title={item.title}> <span className={styles.parcel_left}>「</span><span className={styles.parcel}>{item.title}</span><span className={styles.parcel_right}>」</span></div>
                <div className={styles.noticeOperation}>
                    <div><Switch loading={false} checked={item.status + '' === '2'} onChange={() => this.onSwitchChange(item)} checkedChildren="开" unCheckedChildren="关" /></div>
                    <div><img onClick={() => this.onEditClick(item.subtype, item.id)} src={edit_img} alt="" /></div>
                </div>
            </li >)
        }

        return <DocumentTitle title="模板设置">
            <Page>
                <Page.ContentHeader
                    title="模板设置"
                    titleHelp={titleHelp}
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E6%A8%A1%E6%9D%BF%E6%B6%88%E6%81%AF.md'
                />
                <div className={styles.pageTitle}>订单通知</div>
                <div>
                    <ul className={styles.noticeList}>

                        {
                            template_messages && template_messages.map(item => <FragmentItem item={item} key={`item_${item.id}`}/>)
                        }

                    </ul>
                </div>
                <AlertMessage visible={this.state.visible} content={this.state.content} onCancel={this.onCancel} Ok={this.handleOk} />
            </Page>
        </DocumentTitle>
    }
}
