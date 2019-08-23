import React from 'react'
import WeBox from '../WeBox'
import { Card, Row, Col } from 'antd'
import { getWeekStatistics } from '../../services/moment'
import MomentItem from './MomentItem'
import css from "./index.less"

export default class Index extends React.PureComponent {

    state = {
        loading: true,
        data: []
    }

    componentDidMount(){
        getWeekStatistics().then((data) => {
            this.setState({
                data
            })
        }, ({error}) => {

        }).finally(() =>{
            this.setState({
                loading: false
            })
        })
    }

    render() {
        return <WeBox {...this.props} title="朋友圈统计" description="近7天数据">
            <Card >
                <div>
                    <Row className={css.chartRow}>
                        <Col span={8}>
                            <MomentItem name="发圈数" loading={this.state.loading} data={this.state.data.map(item => ({name: item.date.format('MM/DD'), value: item.data.moments}))} />
                        </Col>
                        <Col span={8}>
                            <MomentItem name="点赞数" loading={this.state.loading} data={this.state.data.map(item => ({name: item.date.format('MM/DD'), value: item.data.likes}))} />
                        </Col>
                        <Col span={8}>
                            <MomentItem name="评论数" loading={this.state.loading} data={this.state.data.map(item => ({name: item.date.format('MM/DD'), value: item.data.comments}))} />
                        </Col>
                    </Row>
                </div>
            </Card>
        </WeBox>
    }
}