import React from 'react'
import {Button, Modal} from 'antd'
import Friends from 'crm/components/MassMsg/Friends'
import styles from './index.scss'

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            params: null
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_group/resetFilterParams'
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    };

    render() {
        const {visible} = this.props

        return (
            <Modal
                centered
                destroyOnClose
                title="群发好友"
                visible = {visible}
                width = {940}
                maskClosable={false}
                wrapClassName={styles.friendsModal}
                onCancel={this.handleCancel}
                footer={null}>
                <Friends {...this.props}/>
            </Modal>
        )
    }
}
