//添加或选择部门
import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, Tree, Icon, message } from 'antd'
import styles from '../index.less'

const TreeNode = Tree.TreeNode

const treeForEach = (treeData, fn) => {
    treeData.forEach((data) => {
        fn(data)
        if(data.children) {
            treeForEach(data.children, fn)
        }
    })
}

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))
export default class SelectPart extends Component {
    constructor(){
        super()
        this.state = {
            selectTree : [],
            selectedDepart : [],
            confirmLoading: false,
        }
    }
    //使操作和列表页面显示分离
    convertData(data) {
        return data
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.setting_shopManagement.selectTree !== this.props.setting_shopManagement.selectTree || nextProps.setting_shopManagement.currentShop !== this.props.setting_shopManagement.currentShop){
            this.timer = setTimeout(()=>{  
                this.setState({
                    selectTree: this.convertData(this.props.setting_shopManagement.selectTree) || [],
                    selectedDepart: this.convertData(this.props.setting_shopManagement.currentShop.departments) || []
                },()=>{
                    treeForEach(this.state.selectTree,(data)=>{
                        this.state.selectedDepart&&this.state.selectedDepart.forEach((v,k)=>{
                            if(v.id === data.id){
                                data.select = true
                            }
                        })
                    })
                    this.forceUpdate()
                })
            },0)
        }
    }
    componentWillUnmount(){
        if(this.timer){
            clearTimeout(this.timer)
        }
    }
    saveUpdateShop = () => {
        this.setState({
            confirmLoading: true
        }) 
        const { id } = this.props.setting_shopManagement.currentShop
        const { selectedDepart } = this.state
        let partIds= []
        selectedDepart&&selectedDepart.forEach((v,k)=>{
            partIds.push(v.id)
        })
        this.props.dispatch({
            type: 'setting_shopManagement/editeShopDepart',
            payload:{
                id: id,
                department_ids: partIds,
            },
            callback: (data) => {
                this.props.dispatch({
                    type: 'setting_shopManagement/setProperty',
                    payload:{ updatePartVisible: false }
                })
                this.setState({
                    selectedDepart : [],
                    confirmLoading: false
                }) 
                if(!data.error){
                    message.success('添加/修改部门成功')
                    this.props.dispatch({
                        type: 'setting_shopManagement/getShopList',
                        payload:{}
                    }) 
                }
            }
        })
    }
    cancelUpdateShop = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ updatePartVisible: false }
        })
    } 
    onTreeClick = (item) => {
        item.select = !item.select
        let {selectTree, selectedDepart} = this.state
        //选中
        if(item.select) {
            selectedDepart&&selectedDepart.push(item)
        //删除
        }else {
            selectedDepart = selectedDepart&&selectedDepart.filter(selectedDepart => {
                return selectedDepart.id !== item.id
            })
        }
        this.setState({
            selectTree,
            selectedDepart
        })
    }
    renderTreeTitle = (item) => {
        const nodeClick = (
            <div style={{float: 'right'}}>
                <Icon
                    style={{fontWeight: 'bold'}}
                    type="check"
                />
            </div>
        )
        return (
            <div onClick={()=>{this.onTreeClick(item)}}>
                <span title={item.name}>{item.name.length>10? `${item.name.substr(0,10)}...` : item.name}</span>
                {
                    item.select ? nodeClick : null
                }
            </div>
        )
    } 
    renderTreeNodes = (data) => {
        return data.map((item) => {
            if(item.children) {
                return (
                    <TreeNode
                        title={this.renderTreeTitle(item)}
                        key={item.id}
                        selectable={false}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return (
                <TreeNode
                    title={this.renderTreeTitle(item)}
                    key={item.id}
                    selectable={false}
                    dataRef={item}
                />
            )
        })
    }
    render(){
        const { updatePartVisible } = this.props.setting_shopManagement
        const { selectTree, confirmLoading } = this.state
        return (
            <div>
                <Modal
                    title="选择部门"
                    visible={updatePartVisible}
                    cancelText="关闭"
                    okText="保存"
                    onOk={this.saveUpdateShop}
                    onCancel={this.cancelUpdateShop}
                    okButtonProps={{ disabled: false }}
                    width={400}
                    confirmLoading= { confirmLoading }
                >
                    <Tree
                        className={styles.tree}
                    >
                        {this.renderTreeNodes(selectTree)}
                    </Tree> 
                </Modal>                
            </div>
        )
    }
}