import React, { Fragment } from 'react'
// import DefaultModel from './components/DefaultModel'
import ProductCollapse from './components/ProductCollapse'
import SingleProducts from './components/SingleProducts'
import Banner from './components/Banner'
import SingleImg from './components/SingleImg'
import ImageText from './components/ImageText'
import Section from './components/Section'
import SingleText from './components/SingleText'
import Search from './components/Search'
import Category from './components/Category'

export default class extends React.Component {
    constructor (props) {
        super()
        this.state = {}
    }
    checkContent = (activity) => {
        const {handleData,index} = this.props
        const props = {
            model: activity,
            handleData,
            index
        }
        const M =  {
            // Default:DefaultModel,
            ProductDirection:ProductCollapse,
            ProductCross:ProductCollapse,
            DoubleColumn:SingleProducts,
            SingleLine:SingleProducts,
            ActiveProduct:SingleProducts,
            SingleText,
            Banner,
            SingleImg,
            ImageText,
            Section,
            Search,
            Category
            // Line,
            // Search
        }
        const MenuModel = M[activity.name]
        if(MenuModel){
            return <MenuModel {...props} />
        }
        return null
    }
    initData = (type,index)=>{
        let d = ['ProductCross','ProductDirection']
        let s = ['DoubleColumn','SingleLine','ActiveProduct']
        if(d.indexOf(type) > -1){
            return [0,0,0].map((_,i)=>{
                return{
                    label:'文字',
                    type:`${index}_${i}`,
                    data:[]
                }
            })
        }else if(s.indexOf(type)>-1){
            const { activity } = this.state
            return [0].map((_,i)=>{
                return{
                    label:activity.text,
                    type:`${index}_${i}`,
                    data:[]
                }
            })
        }
    }
    render () {
        const { activity } = this.props
        return <Fragment> {this.checkContent(activity)} </Fragment>
    }
}