import React from 'react'
import { Popover, Icon} from 'antd'
import styles from './index.less'
import PropTypes from 'prop-types'

export default class Index extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        extra: PropTypes.node
    }
    
    render() {
        const { 
            title,
            explain,
            description,
            extra,
            children,
            className
        } = this.props

        return (
            <div className={className}>
                <div className={styles.head}>
                    <div className={styles.title}>
                        <span className={styles.titleDriver}></span><span>{title}</span>
                        {
                            explain &&
                            <Popover placement="bottomLeft" content={explain}>
                                <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                            </Popover>
                        }
                        { 
                            description &&
                            <span className={styles.description}>{description}</span>
                        }
                    </div>
                    {
                        extra &&
                        <div className={styles.extra}>{extra}</div>
                    }
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        )
    }
}