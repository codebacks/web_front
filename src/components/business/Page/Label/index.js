import React from 'react'
import { Row, Col } from 'antd'

export default class Index extends React.PureComponent {
    render(){
        const {
            title,
            text,
            titlelCol,
            textCol
        } = this.props

        let textLayout = {
            ...textCol
        }
        textLayout.style = {
            ...{
                flexGrow: 1,
                paddingRight: '8px'
            },
            ...textLayout.style
        }

        return (
            <Row type="flex">
                <Col {...titlelCol}>{title}：</Col>
                <Col {...textLayout}>{text}</Col>
            </Row>
        )
    }
}