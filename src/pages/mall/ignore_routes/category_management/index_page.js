// 类目管理

import { Component } from 'react'
import {connect} from 'dva'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Icon, Menu, Dropdown, Modal,  Popover, message } from 'antd'
import _ from 'lodash'
import styles from './index.less'
import AddModal from './modal/AddModal'
import safeSetState from 'hoc/safeSetState'

const confirm = Modal.confirm
const childListFunc = (data)=>{
    if(data&&data[0]){
        return data[0].children
    }
    return []
}
const currentTwoFunc = (data)=>{
    if(data&&data[0]&&data[0].children){
        return data[0].children[0]
    }
    return {}
}

@connect(({base,category_management}) => ({
    base,
    category_management,
}))
@documentTitleDecorator()
@Form.create()
@safeSetState()
export default  class Index extends Component {
    state ={
        visible: false,
        type: '',
        title: '',
        currentItem: null,
        selectItem: null,
        childList: [],
        currentTwo: null,
    }
    componentDidMount(){
        this.props.dispatch({
            type: 'category_management/getToken',
            payload: {
                type: 'image',
            }
        })
        this.props.dispatch({
            type: 'category_management/getCategory',
            payload: {},
            callback: ()=>{
                const { categoryList } = this.props.category_management
                // console.log(categoryList)
                // console.log(childList(categoryList))
                // console.log(currentTwo(categoryList))
                this.setState({
                    currentItem: categoryList[0],
                    childList: childListFunc(categoryList) || [],
                    currentTwo: currentTwoFunc(categoryList) || [],
                })
            }
        })
    }
    componentWillReceiveProps(nextProps){
        // console.log(nextProps.category_management.categoryList)
        const list = nextProps.category_management.categoryList
        const { currentItem } = this.state
        const childList = (data)=>{
            if(data){
                return data.children
            }
            return []
        }
        const currentTwo = (data)=>{
            if(data&&data.children){
                return data.children[0]
            }
            return {}
        }
        // console.log(currentItem)
        this.setState({
            categoryList: list,
        })
        if(currentItem){
            //更新currentItem
            const temp = list.filter((item)=>{
                // console.log(item)
                return item.id === currentItem.id
            })
            this.setState({
                currentItem: temp[0],
                childList: childList(temp[0]) || [],
                currentTwo: currentTwo(temp[0]) || [],
            })
        }else{
            this.setState({
                currentItem: list[0],
                childList: childListFunc(list) || [],
                currentTwo: currentTwoFunc(list) || [],
            })
        }
    }
    addCategory = (type, title)=> {
        const {  currentItem } = this.state
        //创建一级类目或者已经选择一级类目才可以创建
        if(currentItem || type==='one'){
            this.setState({
                visible: true,
                type: type,
                title: title,
            })
        }else{
            message.error('请先创建一级类目')
        }

    }
    closeOneModal = ()=> {
        this.setState({
            visible: false,
            selectItem: null,
        })
    }
    renderMenu = (item)=> {
        return (
            <Menu className={styles.dropDownMenu}>
                <Menu.Item onClick={()=>this.onClickEdite(item)}>编辑</Menu.Item>
                <Menu.Item onClick={()=>this.onClickDelete(item)}>删除</Menu.Item>
            </Menu>
        )
    }
    onClickEdite = (item)=> {
        this.setState({
            visible: true,
            selectItem: item,
            title: '编辑类目',
        })
    }
    //删除指定类目
    onClickDelete = (item)=> {
        // console.log(item)
        const _this=this
        confirm({
            title: '确定删除该类目?',
            // content: '删除后改状态不再显示',
            onOk() {
                _this.props.dispatch({
                    type: 'category_management/deleteCategory',
                    payload: {
                        id: item.id
                    },
                    callback: ()=>{
                        message.success('删除成功')
                        //删除后，重新请求数据刷新
                        _this.props.dispatch({
                            type: 'category_management/getCategory',
                            payload: {},
                            callback: ()=>{
                                const { categoryList } = _this.props.category_management
                                _this.setState({
                                    currentItem: categoryList[0],
                                    childList: childListFunc(categoryList) || [],
                                    currentTwo: currentTwoFunc(categoryList) || [],
                                }) 
                            }
                        })
                    }
                })  
            },
            onCancel() {},
        }) 
    }
    onClickOne = (item)=> {
        const childList = (data)=>{
            if(data){
                return data.children
            }
            return []
        }
        const currentTwo = (data)=>{
            if(data&&data.children){
                return data.children[0]
            }
            return {}
        }  
        this.setState({
            currentItem: item,
            childList: childList(item) || [],
            currentTwo: currentTwo(item) || [],
        })
    }
    onClickTwo = (item)=> {
        this.setState({
            currentTwo: item
        })
    }
    render(){
        let { categoryList, photoPrefix } = this.props.category_management 
        categoryList = categoryList || []
        const { childList, currentItem, currentTwo } = this.state
        // console.log(currentItem)
        // console.log(_.get(currentItem, 'id', ''))
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E7%B1%BB%E7%9B%AE%E7%AE%A1%E7%90%86.md"
                />  
                <div>
                    {/* 一级类目 */}
                    <div className={styles.category}>
                        <div className={styles.addCategory} onClick={()=>this.addCategory('one','新增一级类目')}>
                            <Icon type="plus" theme="outlined" className={styles.addIcon}/>
                            <span>新增一级类目</span>
                        </div>
                        <div>
                            {
                                categoryList.length>0
                                    ?(
                                        categoryList.map(item=>{
                                            return (
                                                <div className={_.get(currentItem, 'id', '') === item.id ? styles.categoryActiveItem : styles.categoryItem} key={item.id} onClick={()=>this.onClickOne(item)}>
                                                    <div className={styles.categoryImg}>
                                                        <Popover placement="bottomLeft" content={(<img className={styles.popoverImg} src={`//${photoPrefix}/${item.icon_url}`} alt=''/>)}>
                                                            {photoPrefix&&(<img src={`//${photoPrefix}/${item.icon_url}`} alt=''/>)}
                                                        </Popover>
                                                    </div>
                                                    <div className={styles.categoryTitle}>
                                                        <span>{item.name}</span>
                                                    </div>
                                                    <div className={styles.categoryIcon}>
                                                        <Dropdown overlay={this.renderMenu(item)} trigger={['click']} placement='bottomRight'>
                                                            <Icon type="ellipsis" className={styles.icon}></Icon>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )
                                    :''
                            }
                        </div>
                    </div>
                    {/* 二级类目 */}
                    <div className={styles.category}>
                        <div className={styles.addCategory} onClick={()=>this.addCategory('two','新增二级类目')}>
                            <Icon type="plus" theme="outlined"  className={styles.addIcon}/>
                            <span>新增二级类目</span>
                        </div>
                        <div>
                            {
                                childList.length>0&&(
                                    childList.map(item=>{
                                        return (
                                            <div className={_.get(currentTwo, 'id', '') === item.id ? styles.categoryActiveItem : styles.categoryItem} key={item.id} onClick={()=>this.onClickTwo(item)}>
                                                <div className={styles.categoryImg}>
                                                    <Popover placement="bottomLeft" content={(<img className={styles.popoverImg} src={`//${photoPrefix}/${item.icon_url}`} alt=''/>)}>
                                                        {photoPrefix&&(<img src={`//${photoPrefix}/${item.icon_url}`} alt=''/>)}
                                                    </Popover>
                                                </div>
                                                <div className={styles.categoryTitle}>
                                                    <span>{item.name}</span>
                                                </div>
                                                <div className={styles.categoryIcon}>
                                                    <Dropdown overlay={this.renderMenu(item)} trigger={['click']} placement='bottomRight'>
                                                        <Icon type="ellipsis" className={styles.icon}></Icon>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        )
                                    }) 
                                )
                            }
                        </div>
                    </div>
                    {/* 展示内容显示 */}
                    <div className={styles.showGif}>
                        <div className={styles.showGifCon}>
                            <div className={styles.showGifTit}>实况预览</div>
                            <div className={styles.showGifDec}>（你所设置的商品类目在如下区域展示）</div>
                            <div className={styles.showGifImg}>
                                <img src={require(`mall/assets/images/category.gif`)} alt=''/>
                            </div>
                        </div>
                    </div>
                </div>
                <AddModal  onClose={this.closeOneModal} state={this.state} key={new Date().getTime()}></AddModal>
            </Page>
        )
    }
}