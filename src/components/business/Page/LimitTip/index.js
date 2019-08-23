import React from 'react'
import styles from './index.less'

const NumberContext = React.createContext()

class Index extends React.PureComponent {
    render() {
        const {
            max,
            current,
            className,
            style
        } = this.props
        
        return <span className={className} style={style}>
            <NumberContext.Provider value={{max, current}}>
                {this.props.children}
            </NumberContext.Provider>
        </span>
    }
}

Index.Max = class Max extends React.PureComponent {
    render() {
        return <NumberContext.Consumer>
            {({max}) => <span className={styles.max}>{max}</span>}
        </NumberContext.Consumer>
    }
}

Index.Step = class Step extends React.PureComponent {
    render() {
        return <NumberContext.Consumer>
            {({max, current}) => <span>{current}/<span className={styles.stepMax}>{max}</span></span>}
        </NumberContext.Consumer>
    }
}


export default Index