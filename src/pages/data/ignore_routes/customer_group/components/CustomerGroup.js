/*
 * @Author: sunlizhi 
 * @Date: 2018-11-20 17:04:16 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-11-27 10:40:25
 */

import React, {Component} from 'react'
// import { Icon, Modal, Table, Pagination } from 'antd'
import { GROUP_DATA } from '../new_group/data'
import styles from '../index.less'
import {number} from 'utils/display.js'

// 修改数据结构
let group_data = []
GROUP_DATA.forEach((value,index,)=>{
    group_data = group_data.concat(value.children)
})

export default class CustomerDetails extends Component {
    state = {
        group_data,
    }

    // 页面加载调用
    componentDidMount() {}

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    clusteringInfo = (rules) => {
        const {group_data} = this.state
        const arr = []
        
        const option = {
            between: '（含）至',
            gt: '大于',
            lt: '小于',
        }
        rules.forEach((value, idnex)=>{
            group_data.forEach((value2, idnex2)=>{
                let name_text = ''
                let label_text = ''
                if (value.name === value2.name) {
                    name_text = value2.label

                    if (value.name === 'gender') { // 如果是性别，单独适配
                        for (let w of value.data) {
                            label_text += value2.option[w].label + '，'
                        }
                        label_text = label_text.substr(0, label_text.length-1)
                    } else if (value.name === 'customer_tag') { // 如果是客户标签
                        label_text = value.data.join('，')
                    } else if (value.name === 'city') { // 如果是地区
                        label_text = value.data.join(' ')
                    } else { // 其他均为区间或大于小于的值，可以统一处理
                        let option_type = option[value.type]
                        let unit = value2.unit
                        let content0 = unit==='元'?number(value.data[0]):value.data[0]
                        let content1 = unit==='元'?number(value.data[1]):value.data[1]

                        if (value.type === 'between') { // 如果是区间则单独处理
                            label_text = content0 + unit + option_type + content1 + unit + option_type.substr(0, option_type.length-1)
                        } else {
                            label_text = option_type + content0 + unit
                        }
                    }
                    
                    arr.push({name: name_text, value: label_text})
                }
            })
        })

        return arr
    }

    render () {
        const {data} = this.props
        // console.log(data)
        
        return (data ? <div className={styles.customerGroupBox} onClick={()=>this.props.onCustomerDetails(data.id, data.name)}>
            
            <h3>{data.name}</h3>
            <div className={styles.peopleNum}>{number(data.member_count)}</div>
            <div className={styles.customerGroupDetails} onClick={(e)=>this.props.onStopPropagation(e)}>
                <ul className={styles.customerGroupConditionList}>
                    {this.clusteringInfo(data.rules).map((rules,index)=><li key={index}>
                        <span>{rules.name}：</span>
                        <span>{rules.value}</span>
                    </li>)}
                </ul>
                {!data.is_system_default &&
                    <div onClick={()=>this.props.onDeleteGroup(data.id, data.name)} className={styles.deleteCustomerGroup}>删除</div>
                }
            </div>
        </div>:null)
    }
}
