/*
 * @Author: sunlzhi 
 * @Date: 2018-11-01 16:40:46 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-20 15:38:36
 */

import React from 'react'
import {connect} from 'dva'
import { Tabs } from 'antd'
import Page from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import InvoiceTemplate from './components/InvoiceTemplate'
import Uninvoiced from './components/Uninvoiced'
import InvoiceRecord from './components/InvoiceRecord'
import InvoiceTemplateForm from './model/invoiceTemplate'

const TabPane = Tabs.TabPane

const DEFAULT_CONDITION = {
    tabsValue: '1',
}

@connect(({goods_management, invoice, base}) => ({
    goods_management,
    invoice,
    base,
}))

export default class Index extends Page.ListPureComponent {
    constructor(props) {
        super(props)
        this.state = {
            tid: '',
            // tabsValue: '1',
            templateVisible: false,
            condition: {...DEFAULT_CONDITION},
        }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        this.getPageData(condition, isSetHistory)
    }
    
    getPageData = (condition, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition)
        }

        this.setState({
            condition: condition,
            loading: true
        })
        
    }

    searchData = (tabs) => {
        const condition = {
            tabsValue: tabs
        }
        this.getPageData(condition)
    }

    // 切换tabs
    handleTabs = (val) => {
        this.searchData(val)
    }

    // 新增/修改发票模板
    jumpAddTemplate = (val) => {
        this.setState({
            tid: val,
            templateVisible: true,
        })
    }

    // 修改完成后修改tid
    changeTid = () => {
        this.setState({
            tid: ''
        })
    }
    
    // 跳转tabs
    jumpTabs = (obj) => {
        this.searchData(obj.tabsValue)
    }

    // 发票模板页操作
    // 关闭弹窗
    handleCancel = () => {
        this.setState({
            templateVisible: false,
        })
    }

    // 获取各组件的this
    onRefUninvoiced = (ref) => {
        this.uninvoiced = ref
    }
    onRefInvoiceRecord = (ref) => {
        this.invoiceRecord = ref
    }
    onRefInvoiceTemplate = (ref) => {
        this.invoiceTemplate = ref
    }

    // 根据当前模块，选择调用的方法
    getTaxpayers = () => {
        const {condition} = this.state
        switch (condition.tabsValue) {
            case '1':
                this.uninvoiced.getTaxpayers()
                break
            case '2':
                this.invoiceRecord.getTaxpayers()
                break
            case '3':
                this.invoiceTemplate.getTaxpayers()
                break
            default:
                break
        }
    }
    
    render() {
        const {templateVisible, condition, tid} = this.state
        const tabsValue = condition.tabsValue
        
        return <DocumentTitle title="发票申请">
            <Page>
                <Page.ContentHeader
                    title="发票申请"
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%9B%B4%E5%A4%9A.md"
                    showDescriptionIcon={false}
                />
                <Tabs activeKey={tabsValue} onChange={this.handleTabs}>
                    <TabPane tab="未开发票" key="1"></TabPane>
                    <TabPane tab="发票记录" key="2"></TabPane>
                    <TabPane tab="发票模板" key="3"></TabPane>
                </Tabs>

                {tabsValue === '1' &&
                    <Uninvoiced
                        onRef={this.onRefUninvoiced}
                        jumpAddTemplate={this.jumpAddTemplate}
                        jumpTabs={this.jumpTabs}
                        {...this.props}
                    />
                }

                {tabsValue === '2' &&
                    <InvoiceRecord
                        onRef={this.onRefInvoiceRecord}
                        jumpAddTemplate={this.jumpAddTemplate}
                        {...this.props}
                    />
                }
                
                {tabsValue === '3' &&
                    <InvoiceTemplate
                        key='InvoiceTemplate'
                        onRef={this.onRefInvoiceTemplate}
                        templateVisible={templateVisible}
                        handleCancel={this.handleCancel}
                        jumpAddTemplate={this.jumpAddTemplate}
                        handleModelTabs={this.handleModelTabs}
                        {...this.props}
                    />
                }
                <InvoiceTemplateForm 
                    key={"InvoiceTemplateForm"+tid}
                    tid={tid}
                    changeTid={this.changeTid}
                    visible={templateVisible} 
                    handleCancel={this.handleCancel} 
                    getTaxpayers={this.getTaxpayers}
                    {...this.props}/>
            </Page>
        </DocumentTitle>
    }
}
