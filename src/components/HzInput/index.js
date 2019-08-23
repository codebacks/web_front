import React from "react"
import { Input } from "antd"
import styles from "./index.less"

const isChrome = !!window.chrome

export default class Index extends React.PureComponent {
    state = {
        length: 0
    };

    componentDidMount() {
        this.setState({
            length: this.props.value ? this.props.value.length: 0
        })
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(!this.isOnComposition){
            if ('value' in nextProps) { 
                this.setState({
                    length: nextProps.value ? nextProps.value.length: 0
                })
            }
        }
    }

    isOnComposition = false
    
    handleComposition = e => {
        if (e.type === "compositionend") {
            // composition is end
            this.isOnComposition = false 

            // fixed for Chrome v53+ and detect all Chrome
            // https://chromium.googlesource.com/chromium/src/
            // +/afce9d93e76f2ff81baaa088a4ea25f67d1a76b3%5E%21/
            if (!this.isOnComposition && isChrome) {
                const value = e.target.value
                this.setState({
                    length: value.length
                })
                const { onChange } = this.props
                onChange && onChange(e)
            }
        } else {
            // in composition
            this.isOnComposition = true
        }
    };

    handleChange = e => {
        // only when onComposition===false to fire onChange
        if (!this.isOnComposition && !isChrome) {
            const value = e.target.value
            this.setState({
                length: value.length
            })
        }
        const { onChange } = this.props
        onChange && onChange(e)
    }


    render() {
        const { onChange, maxLength, ...otherProps } = this.props

        return (
            <span>
                <Input
                    maxLength={maxLength}
                    onChange={this.handleChange}
                    {...otherProps}
                    onCompositionStart={this.handleComposition}
                    onCompositionEnd={this.handleComposition}
                    // onCompositionUpdate={this.handleComposition}
                />
                {maxLength && (
                    <span className={styles.number}>
                        {this.state.length}/{maxLength}
                    </span>
                )}
            </span>
        )
    }
}
