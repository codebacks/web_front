import React from 'react'
import {connect} from 'dva'
import { Modal} from 'antd'
import router from 'umi/router'
import defualt_theme from '../../asserts/defualt_theme.png'
import blue_theme from '../../asserts/theme_blue.png'
import styles from './index.less'
const img_type = {
    default:defualt_theme,
    blue:blue_theme
}

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class  extends React.Component {
    state={
        index: 0,
        selectLi: 0,
        okButtonDisable: true,
        themes:[{
            type:'default',
            title:'默认风格',
            version:'v1.0.0',
        }]
    }
    componentDidMount(){
        this.props.dispatch({
            type:'shop_fitment/getTemplateList'
        }).then(res => {
            this.props.dispatch({
                type:'shop_fitment/getCurrentTemplate',
                callback:(data)=>{
                    if(data){
                        const { themes } = this.state
                        themes.forEach((item,i)=>{
                            if(item.type === data.type){
                                this.handleSelect(i)
                            }
                        })
                    }
                }
            })
        })
    }
    
    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.shop_fitment.templateList){
            return{
                themes: nextProps.shop_fitment.templateList
            }
        }
        return null
    }

    onOk = () => {
        const {selectLi,themes} = this.state
        this.props.onOk && this.props.onOk(themes[selectLi])
        this.props.onCancel && this.props.onCancel()
    }

    onCancel = () => {
        router.push({
            pathname: '/setting/shop_management/mp_setting',
            params: {
                key: 4
            }
        })
    }
    handleSelect = (index) => {
        this.setState({
            selectLi: index,
            okButtonDisable: index > -1
        })
    }

    render() {
        const { selectLi, okButtonDisable } = this.state
        return <Modal
            title="选择风格"
            maskClosable={false}
            keyboard={false}
            visible={this.props.visible}
            onOk={this.onOk}
            onCancel={this.onCancel}
            okButtonProps={{disabled: !okButtonDisable}}
            okText="确认"
            cancelText="取消"
            width='900px'
            bodyStyle={{padding: '48px 0 24px 51px'}}
        >
            <div className={styles.theme_modal}>
                <ul>
                    {
                        this.state.themes.map((item,i) => <li key={i+'_'} className={selectLi === i ? styles.active : ''} onClick={()=>this.handleSelect(i)}>
                            <img src={img_type[item.type]} alt='' />
                            <div>{item.title}</div>
                        </li>)
                    }
                    
                </ul>
            </div>
        </Modal>
    }
}
