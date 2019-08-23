'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/31
 */
import React from 'react'
import {connect} from 'dva'
import {Table, Pagination,} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from 'crm/components/Page'
import styles from './index.scss'
import config from 'crm/common/config'

const {pageSizeOptions} = config

@connect(({ base, crm_tags, crm_setting }) => ({
    base, crm_tags, crm_setting
}))
@documentTitleDecorator()
export  default  class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            value: '',
            focus: '',
            loading: false
        }

    }

    componentDidMount() {
        this.loadTags()
        this.props.dispatch({
            type: 'crm_setting/setModuleName',
            payload: {moduleName: '客户标签'}
        })
    }

    loadTags = () => {
        this.goPage(1)
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_tags/query',
            payload: {page: page},
        })
    }

   handleChangeSize = (current, size) => {
       let params = {...this.props.crm_tags.params}
       params.limit = size
       this.props.dispatch({
           type: 'crm_tags/setProperty',
           payload: {params: params},
       })
       this.goPage(1)
   }

   render() {
       const {list, params, total, current} =  this.props.crm_tags

       const columns = [
           {
               title: '标签名称',
               dataIndex: 'name',
               className: `${styles.firstColumn} ${styles.nameColumn}`
           },
           {
               title: '使用次数',
               dataIndex: 'times',
           },
       ]

       return (
           <Page>
               <Page.ContentHeader
                   title={this.props.documentTitle}
               />
               <div className={styles.tags}>
                   <Table
                       columns={columns}
                       dataSource={list}
                       size="middle"
                       rowKey={(record, index) => index}
                       pagination={false}
                       loading={this.props.loading}
                   />
                   {list.length ? (
                       <Pagination
                           className="ant-table-pagination"
                           total={total}
                           current={current}
                           showQuickJumper={true}
                           pageSizeOptions={pageSizeOptions}
                           showTotal={total => `共 ${total} 条`}
                           pageSize={params.limit}
                           showSizeChanger={true}
                           onShowSizeChange={this.handleChangeSize}
                           onChange={this.goPage}
                       />
                   ) : (
                       ''
                   )}
               </div>
           </Page>
       )
   }
}
