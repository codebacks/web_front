import React from 'react'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import Header from 'crm/components/Header'
import Search from './Search/index'
import Result from './Result/index'
import styles from './index.scss'

@connect(({base, crm_mass_msg_group}) => ({
    base,
    crm_mass_msg_group,
}))
@documentTitleDecorator(
    {
        title: '新建分组'
    }
)
export default class CreateGroupPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {}

    render() {

        const {step} = this.props.crm_mass_msg_group

        return (
            <div className={styles.createWrap}>
                <Header
                    breadcrumbData={
                        [
                            {
                                name: '客户群发',
                                path: '/crm/mass_msg?type=1'
                            },
                            {
                                name: '新建分组',
                            },
                        ]
                    }
                />
                <Search {...this.props} style={{height: step === 1 ? 'auto' : 0}}/>
                {step === 2 ? <Result {...this.props}/> : ''}
            </div>
        )
    }
}
