import React, {PropTypes} from 'react'
import {Button, Modal} from 'antd'
import Messages from '../Messages/Index'

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
        }
    }

    componentDidMount() {

    }

    handleCancel = () =>{
        this.props.dispatch({
            type: 'friends/setProperty',
            payload: {profileModal:false,record:''}
        })
    };

    render() {
        const {profileModal,record} = this.props.friends
        return (
            <Modal
                title="聊天历史"
                visible = {profileModal}
                width = {720}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={[
                    <Button key="cancel" onClick={this.handleCancel}>取消</Button>
                ]}>
                <Messages {...this.props} hideBind={true} last_page={true} from_uin={record.from.uin} to_username={record.target.username} />
            </Modal>
        )
    }
}
