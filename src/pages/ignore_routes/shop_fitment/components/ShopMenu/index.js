import React,{ Fragment } from 'react'
import {Layout ,Icon} from 'antd'
import styles from './index.less'
import menuData ,{activeMuneData}from './menuData'
import DefaultModel from './components/DefaultModel'
import Line from './components/Line'
import Search from './components/Search'
import CommodityCategories from './components/CommodityCategories'
import DoubleColumn from './components/DoubleColumn'
import SingleLine from './components/SingleLine'
import ImageText from './components/ImageText'
import Section from './components/Section'


const {  Sider } = Layout
export default class extends React.Component {
    constructor(props){
        super()
        this.state ={
            menuStatus:[],
            model:{},
            collapsed:true,
            menuList:menuData
        }
    }
    componentWillMount(){
        // this.menuItemClick(this.state.menuList[0])
    }
    selectModel = (model) =>{
        this.props.onCheck && this.props.onCheck(model)
    }
    checkedModel = (model)=>{
        const props = {
            model: model,
            onSelect:this.selectModel
        }
        const M =  {
            Default:DefaultModel,
            SingleText:Section,
            Section,
            Line,
            Search,
            CommodityCategories,
            DoubleColumn,
            SingleLine,
            ImageText,
        }
        const MenuModel = M[model.type]
        if(MenuModel){
            return <MenuModel {...props} />
        }
        return null
    }
    menuItemClick = (item) => {
        let arr = new Array(10)
        arr[item.index] = styles.shop_menu_item_checked
        this.setState({
            collapsed:false,
            model:item,
            menuStatus: arr
        })
    }
    render(){
        const { model, collapsed, menuList,menuStatus } = this.state
        return <Fragment>
            <Sider className={styles.sider} width='182'>
                <div className={styles.menu}>
                    <div className={styles.title}>通用模块</div>
                    {
                        menuList.map((item,index) => <div
                            onClick={() => { this.menuItemClick(item) }}
                            key={`p_${index}`}
                            className={`${styles.menu_item} ${menuStatus[item.index]}`}>
                            <img  src={require(`../../asserts/mune/${item.name}.svg`)} alt=''/>
                            {item.text}
                        </div>)
                    }
                    <div className={styles.title}>营销模块</div>
                    {
                        activeMuneData.map((item,index) => <div
                            onClick={() => { this.menuItemClick(item) }}
                            key={`d_${index}`}
                            className={`${styles.menu_item} ${menuStatus[item.index]}`}>
                            {/* <Icon component={()=>require(`../../asserts/mune/${item.active}.svg`).default  || null} /> */}
                            <img  src={require(`../../asserts/mune/${item.active}.svg`)} alt=''/>
                            {item.text}
                        </div>)
                    }
                </div>
            </Sider>
            <Sider className={`${styles.sider} ${collapsed ? styles.sider_left : ''}`} width='320' collapsed={collapsed} collapsedWidth={0} >
                {this.checkedModel(model)}
            </Sider>
        </Fragment>

    }
}