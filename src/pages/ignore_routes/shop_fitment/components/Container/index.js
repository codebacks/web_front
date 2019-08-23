import React from 'react'
import {connect} from 'dva'
import {Modal} from 'antd'
import styles from './index.less'
const {confirm} = Modal

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class Container extends React.Component  {
    _delete = () =>{
        const {onDelete,model,index} = this.props
        let _this = this
        confirm({
            title: '删除此模块数据无法恢复，是否确认删除?',
            onOk() {
                onDelete && onDelete(index,model)
                model.data && model.data.forEach(i => {
                    _this.props.dispatch({
                        type:'shop_fitment/clearProducts',
                        payload:{
                            type:i.type
                        }
                    })
                })
            },
            onCancel() {}
        })
    }
    // componentDidMount(){
    //     this.srcollTop()
    // }
    // componentDidUpdate(prevProps){
    //     const {isActive,currentIndex} = this.props
    //     if(isActive && (prevProps.isActive !== isActive || currentIndex !== prevProps.currentIndex)){
    //         this.srcollTop()
    //     }
    // }
    el = null
    srcollTop = () => {
        setTimeout(_=>{
            if(this.el){
                let el = this.el
                let offsetHeight = el.offsetHeight > 560 ? 560 : el.offsetHeight
                let diffH = el.offsetTop + offsetHeight
                if(diffH > 566){
                    let m = document.querySelector('#m_model')
                    m.scrollTop = diffH - 560
                }
            }
        })
    }
    render(){
        const {isActive,model,onMove,index,currentIndex} = this.props
        return <div className={styles.container} ref={(el)=>this.el = el} >
            {
                //  ${isBottom? styles.handle_label_top:''}
                isActive ? <div className={`${styles.handle_label}`} >
                    <span title='删除' onClick={(e)=> this._delete()}>删除</span>
                    <span title='上移' onClick={(e)=> onMove && onMove(model,'up',index)}>上移</span>
                    <span title='下移' onClick={(e)=> onMove && onMove(model,'down',index)}>下移</span>
                </div> : <div className={styles.shade} onClick={()=> currentIndex && currentIndex(index)} />
            }
            {this.props.children}
        </div>
    }
    
}
