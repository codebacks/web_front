import React, { Fragment } from 'react'
import { Form, Select } from 'antd'
import {province as provinceData} from 'crm/components/ChinaRegions/province'
import { city as cityData } from 'crm/components/ChinaRegions/city'
const FormItem = Form.Item
const Option = Select.Option

@Form.create({
    onFieldsChange (props, changedFields) {
        props.onChange&&props.onChange(changedFields)
    },
})
export default class Index extends React.Component { 
    state = {
        cities: [],
        provinceValue: '',
        cityValue: '',
    }
    componentDidMount () { 
        const { item } = this.props
        this.props.refName(this)
        this.props.form.setFieldsValue({
            data: item&&item.data || []
        }) 
    }
    handleProvinceChange = (value) => {
        let Province = value !== '' ? (
            provinceData.find(item=> item.name === value)
        ) : ''
        let City = Province.id?cityData[Province.id] : []
        this.setState({
            cities: City,
            provinceValue: value,
            cityValue: '',
        })
        const data = this.props.form.getFieldValue('data')
        data[0] = value
        data[1] = ''
        this.props.form.setFieldsValue({
            data: data
        })
    }
    onCityValueChange = (value) => {
        this.setState({
            cityValue: value,
        })
        const data = this.props.form.getFieldValue('data')
        data[1] = value
        this.props.form.setFieldsValue({
            data: data
        }) 
    } 
    render () {
        const { getFieldDecorator } = this.props.form
        const { cities } = this.state
        return (
            <Fragment>
                <FormItem style={{marginTop: 24}}>
                    {getFieldDecorator('data', {
                        initialValue: ['','']
                    })(
                        <div>
                            <Select
                                defaultValue=''
                                style={{ width: 120, marginRight: 16 }}
                                value={this.state.provinceValue}
                                onChange={this.handleProvinceChange}
                            >
                                <Option value="">全部[省份]</Option>
                                {provinceData.map(province => <Option key={province.id} value={province.name}>{province.name}</Option>)}
                            </Select>
                            <Select
                                style={{ width: 120 }}
                                value={this.state.cityValue}
                                onChange={this.onCityValueChange}
                            >
                                <Option value="">全部[城市]</Option>
                                {cities.map(city => <Option key={city.id} value={city.name}>{city.name}</Option>)}
                            </Select>
                        </div> 
                    )}
                </FormItem>
            </Fragment>
        )
    }
}