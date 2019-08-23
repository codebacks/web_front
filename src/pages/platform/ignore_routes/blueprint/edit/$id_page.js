import React from 'react'
import { Form } from 'antd'
import FormView from '../components/formView'
import Page from 'components/business/Page'
import { connect } from 'dva'
import _ from 'lodash'
import { objToAntdForm } from '../../../utils/form'
import { getImageAbsoulteUrl } from '../../../../../utils/resource'
import { GUIDE_TYPE } from '../../../services/blueprint'
import moment from 'moment'

@connect(({ platform_blueprint }) => ({
    platform_blueprint
}))
@Form.create({
    mapPropsToFields(props) {
        return objToAntdForm(
            _.get(props, 'platform_blueprint.activitiesDetailData', {}),
            ['name', 'begin_at', 'end_at', 'shop_ids', 'image_count', 'order_begin_at', 'order_end_at', 'red_packet_type', 'fixed_amount', 'rule_amount', 'limit_type', 'limit_value', 'is_parallel', 'guide_words', 'guide_qrcode_url', 'explain', 'format_rule',
                {
                    name: 'activity_time', convert: function (value, model) {
                        return [moment(model.begin_at), moment(model.end_at)]
                    }
                },
                {
                    name: 'startValue', convert: function (value, model) {
                        if (model.order_begin_at === '0000-00-00 00:00:00' || !model.order_begin_at) {
                            return
                        } else {
                            return (moment(model.order_begin_at))
                        }
                    }
                },
                {
                    name: 'endValue', convert: function (value, model) {
                        if (model.order_end_at === '0000-00-00 00:00:00' || !model.order_end_at) {
                            return
                        } else {
                            return (moment(model.order_end_at))
                        }
                    }
                },
                {

                    name: 'shop_ids', convert: function (value, model) {
                        if (value) {
                            return value.split(',').map(item => {
                                return item === 'all' ? item : (item - 0)
                            })
                        } else {
                            return []
                        }
                    }
                },
                {
                    name: 'limit_day_value', convert: function (value, model) {
                        if (model.limit_type === 1) {
                            return model.limit_value
                        }
                    }
                },
                {
                    name: 'limit_second_value', convert: function (value, model) {
                        if (model.limit_type === 2) {
                            return model.limit_value
                        }
                    }
                },
                {
                    name: 'fix_amount', convert: function (value, model) {
                        if (model.activity_amount_rule && model.red_packet_type === 1) {
                            return model.activity_amount_rule.amount / 100
                        }
                    }
                },
                {
                    name: 'rule_min_random', convert: function (value, model) {
                        if (model.activity_amount_rule && model.red_packet_type === 2) {
                            return model.activity_amount_rule.format_rule.map(item => item.min_amount / 100)
                        }
                    }
                },
                {
                    name: 'rule_max_random', convert: function (value, model) {
                        if (model.activity_amount_rule && model.red_packet_type === 2) {
                            return model.activity_amount_rule.format_rule.map(item => item.max_amount / 100)
                        }
                    }
                },
                {
                    name: 'rule_min_amount', convert: function (value, model) {
                        if (model.activity_amount_rule && model.red_packet_type === 3) {
                            return model.activity_amount_rule.format_rule.map(item => item.min_amount / 100)
                        }
                    }
                },
                {
                    name: 'rule_max_amount', convert: function (value, model) {
                        if (model.activity_amount_rule && model.red_packet_type === 3) {
                            return model.activity_amount_rule.format_rule.map(item => item.max_amount / 100)
                        }
                    }
                },
                {
                    name: 'count_amount', convert: function (value, model) {
                        if (model.activity_amount_rule && model.red_packet_type === 3) {
                            return model.activity_amount_rule.format_rule.map(item => item.amount / 100)
                        }
                    }
                },
                {
                    name: 'is_parallel', convert: function (value, model) {
                        return model.is_parallel === 1 ? false : true
                    }
                },
                {
                    name: 'guide_type', convert: function (value, model) {
                        return value === 3 ? false : true
                    }
                },
                {
                    name: 'guide_qrcode_url', convert: function (value, model) {
                        if (model.guide_type === 1) {
                            return value.split(',').map(item => item - 0)
                        }
                    }
                },
                {
                    name: 'guide_radio_type', convert: function (value, model) {
                        return model.guide_type === 1 ? 1 : 2
                    }
                },
                {
                    name: 'guide_qrcode_img', convert: function (value, model) {
                        const imgUrl = model.guide_type === GUIDE_TYPE.custom ? getImageAbsoulteUrl(model.guide_qrcode_url) : ''
                        return imgUrl
                    }
                },
                {
                    name: 'shop_type', convert: function (value, model) {
                        return value
                    }
                },
            ])
    }
})
export default class Edit extends React.PureComponent {
    state = {
        isGetDataFinish: false
    }

    componentDidMount() {
        var id = this.props.match.params.id
        this.props.dispatch({
            type: 'platform_blueprint/activitiesDetail',
            payload: {
                id: id
            },
            callback: () => {
                this.setState({
                    isGetDataFinish: true
                })
            }
        })
    }

    render() {


        return (
            <Page>
                <Page.ContentHeader title="编辑活动" />
                <FormView {...this.props} isGetDataFinish={this.state.isGetDataFinish} />
            </Page>
        )
    }
}