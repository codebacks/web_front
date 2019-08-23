'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [吴明]
 * 创建日期: 16/12/27
 */
import React, { Fragment } from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import { Steps,Popover, Icon} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import MessageAccount from '@/pages/crm/components/MessageManage/MessageAccount'
import FilterUser from '@/pages/crm/components/MessageManage/filterUser'
import SendSms  from '@/pages/crm/components/MessageManage/sendSms'
const Step = Steps.Step
@connect(({ base, crm_customerPool }) => ({
    base, crm_customerPool
}))

@documentTitleDecorator({
    title:'手动发送'
})

export default class extends React.Component{
    constructor(props) {
        super()
        this.state = {
            steps:1
        }
    }

    render() {

        const {steps} = this.props.location.query 
        return (
            <Page>
                <Page.ContentHeader
                    title="手动发送"
                    titleHelp = {<Popover placement="bottomLeft" content='发送对象来源：用户池'>
                        <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o"/>
                    </Popover>}
                />
                <MessageAccount />
                <Steps current={steps?Number(steps):0} style={{margin:'16px auto'}}>
                    <Step title="筛选发送对象" />
                    <Step title="编辑发送内容" />
                </Steps>
                <div>
                    {
                        !steps||steps==='0'?<FilterUser  {...this.props}  query = {this.props.location.query}/>:<SendSms  {...this.props}/>
                    }
                </div>
            </Page>
        )
    }
}
