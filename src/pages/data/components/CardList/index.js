import React, { Fragment } from 'react'
import styles from './index.less'
import CheckGroup from './Component/CheckGroup'
import RadioComp from './Component/RadioComp'
import CitySelect from './Component/CitySelect'
import TagSelect from './Component/TagSelect'
import SectSelect from './Component/SectSelect'
const Comp = {
    CheckGroup,
    RadioComp,
    CitySelect,
    TagSelect,
    SectSelect,
}

export default class Index extends React.Component { 
    state = {
        list: [],
    }
    static getDerivedStateFromProps (props, state) { 
        if (JSON.stringify(props.topics)!==JSON.stringify(state.list)) { 
            return {
                list: props.topics
            }
        }
        return null
    }
    componentDidMount(){
        this.props.triggerRef(this)
    }
    renderData = (item) => {
        const Com = Comp[item.mode]
        return <Com key={item.id} item={item} onChange={(val) => this.onChange(item, val)} refName={node => this[`${item.name}`] = node} />
    }
    onChange = (item, val) => {
        this.props.onChange(item, val)
    }
    // 验证，返回true或false
    onValidate = () => {
        // 判断是否验证通过
        let { list } = this.state
        let flag = false
        list.forEach(item => {
            this[`${item.name}`].props.form.validateFields((err,values) => { 
                if (err) { 
                    flag = true 
                }
            })
        })
        if (flag) { 
            return false
        }
        return true
    }
    render () {
        let { list } = this.state
        return (
            <Fragment>
                {
                    list.map((item,index) => {
                        return (
                            <div key={item.name}  className={styles.tags}>
                                <div className={styles.tagsHead}>
                                    <div className={styles.name}>{item.label}</div>
                                    <div className={styles.operate} onClick={()=>this.props.onDeleteTag(item)}>删除</div>
                                </div>
                                <div className={styles.tagsCon}>{item.text}</div>
                                <div>
                                    {this.renderData(item)}
                                </div>
                            </div>
                        )
                    })
                }
            </Fragment>
        )
    }
}