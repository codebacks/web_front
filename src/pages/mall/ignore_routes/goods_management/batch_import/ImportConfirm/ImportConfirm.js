/*
 * @Author: zhousong 
 * @Date: 2019-2-25
 * @Discription: 商品批量导入步骤二组件
 */

import { PureComponent, Fragment } from 'react'
import { Dropdown, Icon, Button, Menu, Popover } from 'antd'
import styles from './index.less'
import classNames from 'classnames'
import _ from 'lodash'
import { connect } from 'dva'
import AddModal from './modal/AddModal'

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

@connect(({base, goods_management}) => ({
    base, goods_management
}))
export default class extends PureComponent {

    state = {
        categoryList: [],
        childList: [],
        currentItem: null,
        currentTwo: null,
        total: 0,
        visible: false,
        cateType: null
    }

    componentDidMount () {
        const { categoryData } = this.props
        let tempArr = categoryData.list
        tempArr.map(item => {
            item.icon_url = '11@1x.png'
            if (item.children && item.children.length > 0) {
                item.children.map(ite => {
                    ite.icon_url = '11@1x.png'
                    return ite
                })
            }
            return item
        })
        this.setState({
            categoryList: tempArr,
            total: categoryData.total,
            currentItem: tempArr[0],
            childList: childListFunc(tempArr) || [],
            currentTwo: currentTwoFunc(tempArr) || [],
        })
    }

    renderMenu = (item, type)=> {
        return (
            <Menu className={styles.dropDownMenu}>
                <Menu.Item onClick={()=>this.onClickEdite(item, type)}>编辑</Menu.Item>
            </Menu>
        )
    }

    closeOneModal = (value)=> {
        if (value) {
            const { cateType, categoryList } = this.state
            let tempArr = categoryList
            if (cateType === 1) {
                tempArr.map(item => {
                    if (item.id === value.id) {
                        item.icon_url = value.icon_url
                        item.name = value.name
                    }
                    return item
                })
                this.setState({
                    visible: false,
                    selectItem: null,
                    categoryList: tempArr,
                })
            } else {
                tempArr.map(item => {
                    if (item.platform_category_id === value.parent_cid) {
                        item.children.map(ite => {
                            if (ite.id === value.id) {
                                ite.icon_url = value.icon_url
                                ite.name = value.name
                            }
                            return ite
                        })
                    }
                    return item
                })
                this.setState({
                    visible: false,
                    selectItem: null,
                    categoryList: tempArr,
                    currentTwo: value || [],
                })
            }
        } else {
            this.setState({
                visible: false,
                selectItem: null,
            })
        }
    }

    // 页面事件
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

    onClickEdite = (item, type)=> {
        this.setState({
            visible: true,
            selectItem: item,
            cateType: type
        })
    }

    onLastStep = () => {
        this.props.lastStep()
    }

    handleConfirm = () => {
        let aimArr = this.state.categoryList
        this.state.categoryList.forEach((item) => {
            if (item.children && item.children.length > 0) {
                aimArr = aimArr.concat(item.children)
            }
        })
        this.props.confirmImport(aimArr)
    }

    render () {
        const { categoryList, total, childList, currentItem, currentTwo } = this.state
        const { photoPrefix } = this.props.goods_management

        return (
            <Fragment>
                <div className={styles.tips}>共计：<span>{total}</span> 件商品<i>部分商品，可能因为数据格式问题造成匹配失败而无法导入！</i></div>
                <div className={styles.categoryBox}>
                    {/* 一级类目 */}
                    <div className={styles.category}>
                        <div className={styles.addCategory}>
                            <span>一级类目</span>
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
                                                        <Dropdown overlay={this.renderMenu(item, 1)} trigger={['click']} placement='bottomRight'>
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
                        <div className={classNames(styles.addCategory, styles.padding)}>
                            <span>二级类目</span>
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
                                                    <Dropdown overlay={this.renderMenu(item, 2)} trigger={['click']} placement='bottomRight'>
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
                        <div style={{position: 'relative'}}>
                            <div className={styles.showGifCon}>
                                <div className={styles.showGifDec}>您所设置的商品类目在如下区域展示：</div>
                                <div className={styles.showGifImg}>
                                    <img src={require(`mall/assets/images/category.gif`)} alt=''/>
                                </div>
                                <div className={styles.showGifTips}>动态效果图</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{marginBottom: '88px'}}>
                    <Button type='primary' style={{marginRight: '16px'}} onClick={this.handleConfirm}>确认导入</Button>
                    <Button type='default' onClick={this.onLastStep}>返回上一步</Button>
                </div>
                <AddModal  onClose={this.closeOneModal} state={this.state} key={new Date().getTime()}></AddModal>
            </Fragment>
        )
    }
}