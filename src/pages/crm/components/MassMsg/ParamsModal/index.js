import React from 'react'
import {Button, Modal} from 'antd'
import FilterCondition from 'crm/components/MassMsg/FilterCondition'
import styles from './index.scss'

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    componentDidMount() {
        this.loadParams()
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                searchParams: {}
            }
        })
    }

    loadParams = () => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/groupDetail',
            payload: {
                id: this.props.params.id
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    };

    render() {
        const {visible} = this.props
        const {searchParams} = this.props.crm_mass_msg_group

        return (
            <Modal
                centered
                title="筛选条件"
                visible={visible}
                width={540}
                maskClosable={false}
                wrapClassName={styles.paramsModal}
                onCancel={this.handleCancel}
                footer={null}>
                <FilterCondition params={searchParams}/>
            </Modal>
        )
    }
}
