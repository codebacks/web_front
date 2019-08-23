import React from 'react'
// import PropTypes from 'prop-types'
import styles from './index.less'

export class Tab extends React.PureComponent {
    
    static defaultProps = {
        isActive: false
    }

    

    clickHandler = (value) => {
        const {onChange} = this.props
        onChange && onChange(value)
    }


    render(){
        const {
            activeValue,
            children,
            value
        } = this.props

        const isActive = activeValue === value
        
        return (
            <div className={isActive?styles.tabActived:''} onClick={() => this.clickHandler(value)}>{children}</div>
        )
    }
}


export default class Index extends React.PureComponent {

    state = {
        activeValue: ''
    }
    // static contextTypes = {
    //     radioGroup: PropTypes.any
    // }

    onChange = (value) => {
        const { onChange } = this.props
        
        this.setState({
            activeValue: value
        },() => {
            onChange && onChange(value)
        })
    }

    componentDidMount(){
        this.setState({
            activeValue: this.props.defaultActive
        })
    }

    componentWillReceiveProps(nextProps){
        if('activeValue' in nextProps){
            this.setState({
                activeValue: nextProps.activeValue
            })
        }
    }

    // getChildContext() {
    //     return {
    //         radioGroup: {
    //             onChange: this.onChange,
    //         },
    //     }
    // }

    render(){
        const {
            options
        } = this.props

        let tabProps = {
            onChange: this.onChange
        }

        let children = this.props.children
        if(options){
            children = options.map((option, index) => {
                if (typeof option === 'string') { 
                    return (<Tab key={index} activeValue={this.state.activeValue} value={option} {...tabProps}>
                        {option}
                    </Tab>)
                }else{
                    return (<Tab key={index} activeValue={this.state.activeValue} value={option.value} {...tabProps}>
                        {option.label}
                    </Tab>)
                }
            })
        }

        return (
            <div className={styles.tab}>
                {children}
            </div>
        )
    }
}

Index.Tab = Tab