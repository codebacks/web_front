/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/11
 */

import React from 'react'
import styles from './index.less'
import {
    message,
} from "antd"
import FullTypeMessage, {sourceType, getTabName, registerDefaultTabs} from 'business/FullTypeMessage'
import _ from "lodash"
import {consumerHoc} from "business/FullTypeMessage/dataManagement"
import {hot} from "react-hot-loader"

// function CustomComponent(props) {
//     return(
//         <div>1121212</div>
//     )
// }



@consumerHoc({
    mapStoreToProps: (
        {
            typeValue,
            setStoreDeep,
            assignStoreByPath,
            setStoreByPath,
            setStore,
            store: {
                tabsActiveKey,
                index,
            },
        },
        props,
    ) => {
        const tabProps = props.tabProps || {}
        return {
            ...props,
            ...tabProps,
            ...{
                tabsActiveKey,
                ref: props.tabRef,
            },
        }
    },
})
class CustomComponent extends React.PureComponent {
    render() {
        console.log(this.props)
        return (
            <div>1121212</div>
        )
    }
}

// registerDefaultTabs({
//     type: 10,
//     ContentComponent: CustomComponent,
//     name: 'leo'
// })

@hot(module)
export default class Index_page extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            // showTabs: [
            //     {
            //         type: 10,
            //         tabProps: {
            //             maxLen: 200,
            //         },
            //         name: '自定义',
            //         custom: true,
            //         ContentComponent: CustomComponent
            //     },
            // ],
            // showTabs: [
            //     {
            //         type: 1,
            //         tabProps: {
            //             maxLen: 200,
            //             materialLibModalOption: {
            //                 title: 'leo',
            //             },
            //             materialLibOption: {
            //                 load: ()=>{
            //                     console.log('tabProps')
            //                 },
            //                 loadTags: ()=>{
            //                     console.log('tabProps')
            //                 },
            //             },
            //         },
            //         name: '自定义',
            //     },
            //     2
            // ],
            tabsActiveKey: 6,
        }
        this.fullTypeMessageRef = React.createRef()
    }

    componentDidMount() {
        // this.setState({
        //     // showTabs: [
        //     //     {
        //     //         type: 1,
        //     //         tabProps: {
        //     //             maxLen: 200,
        //     //         },
        //     //     },
        //     // ],
        //     tabsActiveKey: 10,
        // })
    }

    onClick = async () => {
        try {
            const current = _.get(this, 'fullTypeMessageRef.current')
            if(current) {
                const value = await current.getData()
                console.log(value)
                message.success('成功')
            }
        }catch(e) {
            message.error(e.msg)
            console.log(e.message)
            console.log(e.data)
        }
    }

    render() {
        return (
            <div className={styles.container}>
                <FullTypeMessage
                    className={styles.fullTypeMessage}
                    ref={this.fullTypeMessageRef}
                    showTabs={this.state.showTabs}
                    tabsActiveKey={this.state.tabsActiveKey}
                    loading={false}
                    // contextProps={{
                    //     // materialLibOption: {
                    //     //     load: ()=>{
                    //     //         console.log('contextProps')
                    //     //     },
                    //     //     loadTags: ()=>{
                    //     //         console.log('contextProps')
                    //     //     },
                    //     // },
                    //     // materialLibModalOption: {
                    //     //     title: 'leo',
                    //     // },
                    // }}
                    // typeValue={{
                    //     type: 1,
                    //     values: {
                    //         content: '[微笑]图案和字都是孩子自己想的，[猪头]他小时候非常喜欢看《黑猫警长》，每年的生日蛋糕我们都会跟孩子沟通，询问他的意见。今年正好是他14周岁，比较有意义，之前我们也跟他说14岁以后，八大类犯罪就要负刑事责任了，以后凡事都要三思而后行，不要冲动。跟他说过以后他就有了',
                    //     },
                    // }}
                />
                <button onClick={this.onClick}>
                    确定
                </button>
            </div>
        )
    }
}
