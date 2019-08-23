/*
 * @Author: sunlzhi 
 * @Date: 2018-11-06 15:48:18 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-20 14:30:50
 */

import React, {Component} from 'react'
import {Button, Modal, Form, message, Tabs, Icon, Pagination } from 'antd'
import styles from '../index.less'
// import { template } from 'handlebars'

const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane
//地区数据

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    // 页面加载调用
    componentDidMount() {
    }

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    // 更改电子发票和增值税发票
    handleTabs = (val) => {
        this.props.handleModelTabs(val)
    }

    areaChange = (value) => {
        this.setState({
            province: value[0],
            city: value[1],
            county: value[2],  
        })
        this.props.form.setFieldsValue({
            textArea: value
        }) 
    }

    // 跳到新增模板
    onAddTemplate = () => {
        this.props.jumpAddTemplate()
    }

    // 点击电子发票模板，打开当前开具电子发票的模板
    onElectronicInvoice = (id) => {
        // this.handleCancel()
        this.props.addTemplateForm(id)
    }

    goTemplatePage = (val) => {
        this.props.goTemplatePage(val)
    }

    render() {
        const {tabsValue, pager} = this.props
        const {taxpayersPagination, taxpayersData} = this.props.invoice

        const electronicInvoiceButton = taxpayersData.map(template => <Button className={styles.buttonList} key={template.id} onClick={()=>this.onElectronicInvoice(template.id)}>{template.name}</Button>)
        
        return <Modal
            title="开具发票"
            width={540}
            className={styles.invoicList}
            footer={null}
            visible={this.props.visible}
            destroyOnClose={true}
            onCancel={this.handleCancel}>
            <div>
                <Tabs defaultActiveKey={tabsValue} onChange={this.handleTabs}>
                    <TabPane tab="电子普通发票" key="1"></TabPane>
                    <TabPane tab="增值税专用发票" key="2"></TabPane>
                </Tabs>
            </div>
            <div>
                {
                    taxpayersPagination.rows_found > 0 ?
                        <ButtonGroup style={{paddingTop: 8}}>
                            {electronicInvoiceButton}
                        </ButtonGroup> : 
                        <div>
                            <p className={styles.noTemplateTips}>当前没有发票模板</p>
                            <div onClick={this.onAddTemplate} className={styles.addTemplate}><Icon type="plus-square" className={styles.icon}/>新增模板</div>
                        </div>
                }
                {taxpayersPagination.rows_found > 0 &&
                    <Pagination
                        size="small"
                        style={{textAlign: 'right'}}
                        current={pager.offset}
                        pageSize={pager.limit} 
                        total={taxpayersPagination.rows_found}
                        showTotal={(total) => `共 ${total} 条`} 
                        showQuickJumper={true} 
                        onChange={this.goTemplatePage} />
                }
            </div>
        </Modal>
    }

}