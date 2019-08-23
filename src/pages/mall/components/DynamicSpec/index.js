import { Component } from 'react'
import TagsComp from 'mall/components/TagsComp'
import { Row, Col, Button, Input, Form, Icon, message  } from 'antd'
import styles from './index.less'
import _ from 'lodash'
const FormItem = Form.Item

@Form.create()
export default class DynamicSpec extends Component {
    state = {
        list : [],
        // 最多可以创建3个字段
        maxLen: 3,
        isEditInit: false
    }
    componentDidMount () {
        // const list = this.props.list
        
        // const getUuid = ()=>{
        //     if(list.length === 0){
        //         return 'spec_a'
        //     }else if(list.length === 1){
        //         return 'spec_b'
        //     }else if(list.length === 2){
        //         return 'spec_c'
        //     }
        // }
        // let list = []
        // if (specs && specs.length > 0) {
        //     list = specs.map((item, index) => {
        //         return {
        //             name: item.spec,
        //             value: item.property,
        //             // uuid: getUuid(),
        //         }
        //     })
        // }
        // this.setState({list})
    } 

    static getDerivedStateFromProps(nextProps, prevState) {
        if(nextProps.list && nextProps.list.length> 0 && prevState.isEditInit === false) {
            return {
                list: nextProps.list,
                isEditInit: true
            }
        }
        return null
    }

    onHandlerAdd = ()=> {
        const { list } = this.state
        const getUuid = () => {
            const str = JSON.stringify(list)
            if(str.indexOf('spec_a') === -1){
                return 'spec_a'
            }else if(str.indexOf('spec_b') === -1){
                return 'spec_b'
            }else if(str.indexOf('spec_c') === -1){
                return 'spec_c'
            }
        }
        const newList = list.concat({
            uuid: getUuid(),
            name: '',
            value: []
        })
        this.setState({
            list: newList
        })
    }
    // 重新排序
    newRank = (data) => { 
        let temp = []
        let arr = []
        data.forEach((item, index) => {
            if (item.name && item.value.length > 0) {
                arr.push(item)
            }
        }) 
        arr.forEach((item, index) => {
            if (index === 0) {
                temp.push({
                    uuid: 'spec_a',
                    name: item.name,
                    value: item.value.slice()
                })
            } else if (index === 1) {
                temp.push({
                    uuid: 'spec_b',
                    name: item.name,
                    value: item.value.slice()
                })  
            } else if (index === 2) { 
                temp.push({
                    uuid: 'spec_c',
                    name: item.name,
                    value: item.value.slice()
                })   
            }
        })
        return temp
    }
    onInputChange = (e, value) => {
        let getValue = e.target.value
        const { list } = this.state
        const obj = _.find(list, function (o) { return o.uuid === value.uuid })
        obj.name = getValue
        this.setState({
            list
        })
    }
    // 删除值
    removeValue = (value) => {
        if (this.props.activityDisabled) {
            return false
        }
        let { list } = this.state
        // 如果长度大于1且uuid为spec_a或spec_b，则重新设置uuid
        list = list.filter(key => key.uuid !== value.uuid)
        this.setState({
            list: list
        })
        let arr = []
        arr = this.newRank(list)
        this.props.onChangeList(arr)
    }
    // 失去焦点的时候判断规格值是否重复
    onBlurInput = (e, value) => {
        let getValue = e.target.value
        const { list } = this.state
        // console.log(list)
        const obj = _.find(list, function(o) { return o.uuid ===value.uuid })
        // 判断添加的是否已经存在
        let validate
        let count = 0
        list.forEach((item) => { 
            if (getValue&&item.name === getValue) {
                count++
            }
            if (count>1) { 
                validate = true
            }
        })
        if (validate) {
            obj.name = ''
            this.setState({
                list
            })
            message.error('规格名已经存在')
        } else { 
            obj.name = getValue
            this.setState({
                list
            })
            let temp = []
            temp = this.newRank(list)
            this.props.onChangeList(temp)
        }
    }
    // 更新tags
    onChangeTag = (tags, value)=> {
        const { list } = this.state
        const obj = _.find(list, function(o) { return o.uuid ===value.uuid })
        obj.value = tags
        this.setState({
            list
        })
        // 去掉里面tags为空的，并更新数据
        let temp = []
        temp = this.newRank(list)
        this.props.onChangeList(temp)
    }
    render(){
        const { list, maxLen } = this.state
        const { getFieldDecorator } = this.props.form
        let activityDisabled = this.props.activityDisabled
        const formItemLayoutName = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3, },
                style: {
                    width: 60
                }
            },
        }
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3, },
                style: {
                    width: 60
                }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 21 },
            },
        }
        return (
            <div className={styles.card}>
                {
                    list.length>0&&list.map((item,index)=>{
                        return (
                            <Row className={styles.content} key={item.uuid}> 
                                <FormItem label='规格名' {...formItemLayoutName}>
                                    {getFieldDecorator(`name${item.uuid}`)(
                                        <div>
                                            <Input disabled={activityDisabled} value={item.name} style={{ width: 200 }} onChange={(e)=>this.onInputChange(e, item)} onBlur={(e)=>this.onBlurInput(e, item)} maxLength={20} placeholder='请输入规格名'></Input>
                                            <Icon type="close-circle" theme="outlined" className={activityDisabled?styles.activityDisabled:styles.closeCircle} onClick={()=>this.removeValue(item)}/>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem label='规格值'{...formItemLayout}>
                                    {getFieldDecorator(`value${item.uuid}`)(
                                        <TagsComp activityDisabled={activityDisabled} error={'规格值'} tags={item.value} onChangeTag={(e)=>this.onChangeTag(e, item)}></TagsComp>
                                    )}
                                </FormItem>
                            </Row>
                        )
                    })
                }
                {
                    list.length < maxLen&&(
                        <Row className={styles.contentAdd}>
                            <Col>
                                <Button type='primary' disabled={activityDisabled} onClick={this.onHandlerAdd}>添加规格项</Button>
                            </Col>
                        </Row>
                    )
                }
            </div>
        )
    }
}
