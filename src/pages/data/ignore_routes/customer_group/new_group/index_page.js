import React from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from '../../../../../components/business/Page'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Input, Button, Form, message } from 'antd'
import styles from './index.less'
import { GROUP_DATA } from './data'
import CardList from '../../../components/CardList'
const FormItem = Form.Item
  
@connect(({ base, customer_group }) => ({
    base, customer_group
}))
@documentTitleDecorator()
@Form.create()
export default class Index extends React.Component {
    state = {
        list: JSON.parse(JSON.stringify(GROUP_DATA)),
        topics: [],
    }
    // rules数据列表
    rulesData = []
    onClickTag = (item) => {
        let { list, topics } = this.state
        item.select = item.select ? !item.select : true
        if (item.select === true) {
            topics.push(item)
            // 添加值
            this.rulesData.push({
                name: item.name,
                type: item.type,
                data: item.data,
            }) 
        } else {
            topics = topics.filter(val => val.id !== item.id)
            this.rulesData = this.rulesData.filter(val => val.name !== item.name)
            this.onDealData(topics, this.rulesData)
        }
        list = JSON.parse(JSON.stringify(list))
        this.setState({
            list,
            topics
        })
    }
    onDealData = (data, arr) => {  
        data.forEach((val,key) => { 
            arr.forEach((v,k) => { 
                if (val.name === v.name) {
                    val.data = v.data
                    val.type = v.type
                }
            })
        })
    }
    onDeleteTag = (item) => {
        const { list, topics } = this.state
        list.forEach((value, key) => {
            if (value.children) {
                value.children.forEach((v, k) => {
                    if (v.name === item.name) {
                        v.select = false
                    }
                })
            }
        })
        this.setState({
            list: list,
            topics: topics.filter(it => it.name !== item.name)
        })
        this.rulesData = this.rulesData.filter(val => val.name !== item.name)
        this.onDealData(topics, this.rulesData)
    }
    onChangeRule = (item, val) => {
        if (JSON.stringify(val) === '{}') { 
            return
        }
        // 更新数据
        let arr = this.rulesData.filter(data => {
            if (data.name === item.name) {
                data.type = val.type && val.type.value || data.type
                data.data = val.data && val.data.value || data.data
                return true
            }
            return false
        })
        if (arr.length === 0) {
            this.rulesData.push({
                name: item.name,
                type: val.type && val.type.value || item.type,
                data: val.data && val.data.value || item.data,
            })
        }
    }
    onSubmit = () => {
        let flag = false
        const len = this.rulesData.length
        if (len === 0) {
            message.warning('未选择分群规则')
            return
        } else { 
            flag = this.cardRefs.onValidate()
        }
        // console.log(this.rulesData)
        this.props.form.validateFields({ force: true }, (errors, values) => {
            if (!errors && flag) {
                this.props.dispatch({
                    type: 'customer_group/addGroup',
                    payload: {
                        name: values.name,
                        rules: this.rulesData,
                    },
                    callback: (data) => {
                        this.onCancel()
                    }
                })
            }
        })
    }
    onCancel = () => {
        router.push('/data/customer_group')
    }
    render() {
        const { list, topics } = this.state
        const { getFieldDecorator } = this.props.form
        return (
            <DocumentTitle title='客户模型_新建模型'>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '客户模型',
                            path: '/data/customer_group'
                        }, {
                            name: '新建模型'
                        }]}
                    />
                    <div className={styles.content}>
                        <div className={styles.contLeft}>
                            {/* 左侧标签及内容 */}
                            {
                                list.map(item => {
                                    return (
                                        <div className={styles.category} key={item.id}>
                                            <div className={styles.categoryName}>{item.group}{item.subText && (<span className={styles.subText}>{item.subText}</span>)}</div>
                                            <div className={styles.categoryTag}>
                                                {
                                                    item.children.map(val => {
                                                        return (
                                                            <a key={val.id} onClick={() => this.onClickTag(val)} className={val.select === true ? styles.categoryTagActive : ''}>
                                                                <span>{val.label}</span>
                                                                {
                                                                    val.select === true && (<div className={styles.categorySelect}></div>)
                                                                }
                                                            </a>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className={styles.contright}>
                            <div className={styles.contTag}>
                                {
                                    topics.length > 0 && (
                                        <CardList topics={topics} onDeleteTag={this.onDeleteTag} onChange={this.onChangeRule} triggerRef={node => this.cardRefs = node} />
                                    )
                                }
                                {
                                    topics.length === 0 && (
                                        <div className={styles.emptyTopic}>请选择条件</div>
                                    )
                                }
                            </div>
                            
                            <div className={styles.contSave}>
                                <FormItem>
                                    {getFieldDecorator('name', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '请输入人群名称',
                                            },
                                            {
                                                max: 15,
                                                message: '不能超过15个字',
                                            }
                                        ],
                                    })(
                                        <div>
                                            <span className={styles.tagName}>人群名称：</span>
                                            <Input placeholder='请输入人群名称，15个字以内' style={{ width: 350, marginRight: 16 }} />
                                            <Button type='primary' style={{ marginRight: 16 }} onClick={this.onSubmit}>保存</Button>
                                            <Button onClick={this.onCancel}>取消</Button>
                                        </div>
                                    )}
                                </FormItem>
                            </div>
                        </div>
                    </div>
                </Page>
            </DocumentTitle>
        )
    }
}