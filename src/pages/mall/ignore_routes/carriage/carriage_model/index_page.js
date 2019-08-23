/**
 **@Description:
 **@author: 吴明
 */

import React, { Component } from 'react'
import { Table, Input, Form, Radio, Button, message,Popover } from 'antd'
import { connect } from 'dva'
// import documentTitleDecorator from 'hoc/documentTitle'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import CitySelect from 'components/business/CitySelect/index'
import { getAreaName, getAllkey, getformCitys } from 'components/business/CitySelect/data'
import { validatorByIsInteger, validatorByIsPositiveMoney,validatorByIsNumber } from 'utils/validator'
import { toNumber } from 'utils/display'
import router from 'umi/router'

// import { Link } from 'dva/router'
import styles from './index.less'
import _ from 'lodash'

// const FormItem = Form.Item

const EditableContext = React.createContext()


@connect(({ base, mall_carriage }) => ({
    base,
    mall_carriage
}))
// @documentTitleDecorator({
//     title: '邮费管理'
// })
@Form.create()
export default class LL extends React.PureComponent {

    state = {
        visiable: false,
        cityselectRaw: null,
        cityselectedKeys: [],
        cityselectIndex: 1,
        index: 1,
        data: [],
        rows: [],
        excludeCitys: [],
        set: 1,
        canSave: true,
        saveLoading: false,
        title: ''
    }

    componentDidMount() {
        const { id } = this.props.location.query
        this.setState({
            title: id ?'修改模板' : '新增模板'
        })
        if (id) {
            this.props.dispatch({
                type: 'mall_carriage/carriageTemplateDetail',
                payload: id
            })
        }
    }
    componentWillUnmount() {
        this.props.dispatch({
            type: "mall_carriage/carriageTemplateClear",
            payload: {
                carriage: {}
            }
        })
    }

    selectCityHandler = () => {
        this.setState({
            visiable: true,
            cityselectedKeys: []
        })
    }

    onCancelHandler = () => {
        this.setState({
            cityselectRaw: null,
            cityselectedKeys: [],
            visiable: false
        })
    }

    onOkHandler = ({ citys, friendlyCitys }, raw) => {
        if (citys && citys.length > 0) {
            if (raw && raw.isEdit) {
                const { editIndex } = raw
                let data = this.state.data

                data.find(item => item.index === editIndex).area = {
                    citys,
                    friendlyCitys
                }
                this.setState({
                    data: data,
                    cityselectRaw: null,
                    cityselectedKeys: [],
                    visiable: false
                })

            } else {
                this.setState({
                    cityselectRaw: null,
                    cityselectedKeys: [],
                    visiable: false,
                    index: this.state.index + 1,
                    data: [...this.state.data, {
                        area: {
                            citys,
                            friendlyCitys
                        },
                        index: this.state.index + 1,
                        unit: '',
                        amount: '',
                        liang: '',
                        total: ''
                    }]
                })
            }
        } else {
            this.setState({
                visiable: false,
                cityselectRaw: null
            })
        }
    }

    addHandler = () => {
        this.setState({
            cityselectIndex: this.state.cityselectIndex + 1,
            visiable: true,
            excludeCitys: this.state.data.reduce((prev, current) => {
                return [...prev, ...current.area.citys]
            }, [])
        })
    }

    removeItem = (data) => {
        const newData = _.filter(this.state.data, function (o) {
            return o.index !== data.index
        })
        this.setState({
            data: newData
        })
    }

    modifyItem = (data) => {
        let citys = this.state.data.find(item => item.index === data.index).area.citys
        let selectKeys = []
        getAllkey(selectKeys, citys)
        this.setState({
            cityselectIndex: this.state.cityselectIndex + 1,
            visiable: true,
            excludeCitys: this.state.data.filter(item => item.index !== data.index).reduce((prev, current) => {
                return [...prev, ...current.area.citys]
            }, []),
            cityselectedKeys: selectKeys,
            // cityselectedKeys: this.state.data.find(item => item.index === data.index).area.citys.map(item => item.code),
            cityselectRaw: { isEdit: true, editIndex: data.index }
        })
    }
    saveHandler = (values) => {

        Promise.all(this.state.rows.map(c => c.getData()))
            .then(result => {
                if (!result.length || !result[0].area) {
                    message.error('请指定可配送区域和运费')
                    return
                }
                let area = []
                // const { carriage } = this.props.mall_carriage

                if (Array.isArray((result)) && result.length > 0) {
                    result.forEach(item => {
                        if (item.area) {
                            let _area = getAreaName(item.area)
                            area.push({
                                country: 'CN',
                                first: values.set ===1 ? item.unit : toNumber(item.unit,'*',1000),
                                first_price: toNumber(item.amount),
                                second:  values.set ===1 ? item.liang : toNumber(item.liang,'*',1000),
                                second_price: toNumber(item.total),
                                ext_json: JSON.stringify(_area.soucre),
                                province: _area.province.join(','),
                                city: _area.city.join(','),
                                district: _area.district.join(',')
                            })
                        }
                    })
                }

                let params = {
                    name: values.name, //模板名称
                    rule: values.set, //计算规则 1 件 2 重量
                    basic_price: parseFloat(values.basic_price) * 100, //	下单地址不在运费模板地址区间里，使用该字段
                    template_areas: []
                }
                area.forEach(item => {
                    params.template_areas.push(item)
                })

                const { id } = this.props.location.query
                this.setState({
                    saveLoading: true
                })
                if (id) {
                    this.props.dispatch({
                        type: 'mall_carriage/updateCarriageTemplate',
                        payload: {
                            id,
                            params
                        },
                        callback: (type) => {
                            this.setState({
                                visiable: false
                            })
                            if (type) {
                                message.success('编辑模板成功')
                                router.push('/mall/carriage')
                            }
                        }
                    })

                } else {
                    this.props.dispatch({
                        type: 'mall_carriage/increaseCarriageTemplate',
                        payload: params,
                        callback: (type) => {
                            this.setState({
                                visiable: false
                            })
                            if (type) {
                                message.success('新增模板成功')
                                router.push('/mall/carriage')
                            }

                        }
                    })
                }

            }).catch(errors => {
                console.error(errors)
                this.setState({
                    saveLoading: false
                })
            })
    }
    submitHandler = (e) => {
        e.preventDefault()
        this.props.form.validateFields((errors, values) => {
            if (!errors) {
                this.saveHandler(values)
            }
        })

    }

    onRowHandler = (record, index) => {
        return {
            ...record,
            parent: this
        }
    }

    onBindRow = (row, index) => {

        let rows = this.state.rows
        let t = rows.push(row)
        this.setState({
            rows: [...rows]
        })
    }

    setControlChangeHandler = (e) => {
        this.setState({
            set: e.target.value
        })
    }
    /**
     * dva 数据格式化
     * state    this.state.data
     * carriage  props.mall_carriage.carriage
     */
    getDvaToData = (state, carriage) => {
        if (carriage.length === 0) return
        if (!this.isDva) return state
        if (this.dvaData) return this.dvaData


        let _areaMap = carriage.template_areas

        if (Array.isArray(_areaMap)) {

            this.dvaData = _areaMap.map((item, index) => {

                let ext_json = item.ext_json
                if (typeof ext_json === 'string') {
                    try {
                        ext_json = JSON.parse(ext_json)
                    } catch (e) {
                        console.error(e)
                    }
                }

                let formatCitys = (Array.isArray(ext_json) && ext_json.map(item => ({
                    checked: true,
                    name: item.name,
                    level: 1
                }))) || []

                return {
                    amount: parseFloat(item.first_price) ? parseFloat(item.first_price) / 100 : item.first_price,
                    area: {
                        citys: ext_json,
                        friendlyCitys: {
                            formatCitys
                        },
                    },
                    index: index + 1,
                    liang: carriage.rule===1 ? item.second : toNumber(item.second ,'/',1000),
                    total: parseFloat(item.second_price) ? parseFloat(item.second_price) / 100 : item.second_price,
                    unit: carriage.rule===1 ? item.first : toNumber(item.first ,'/',1000)
                }
            })

            return this.dvaData

        } else {
            return false
        }


    }
    dvaData = null;
    isDva = true;
    isFromChange = false
    componentDidUpdate(prevProps, prevState) {
        // 只让 dvaData 影响 state 一次
        if (this.dvaData && this.isDva) {
            if (Array.isArray(prevState.data) && !prevState.data.length) {
                let  o = {
                    data: this.dvaData,
                    cityselectIndex: this.dvaData.length,
                    index: this.dvaData.length,
                }
                if(this.props.mall_carriage && this.props.mall_carriage.carriage.rule){
                    o.set = this.props.mall_carriage.carriage.rule
                }
                this.setState(o)
                this.isDva = false
                if(!this.isFromChange){
                    const { carriage } = this.props.mall_carriage
                    this.props.form.setFieldsValue({
                        name: carriage.name,
                        set:carriage.rule,
                        basic_price:toNumber(carriage.basic_price,'/',100)
                    })
                }
            }
        }else{
            if(this.props.mall_carriage && this.props.mall_carriage.carriage && this.props.mall_carriage.carriage.name){
                this.isFromChange = true
            }
            
        }

        

    }
    onReturn = (e) => {
        e.preventDefault()
        router.goBack()
    }

    render() {
        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '80px'
                }
            },
            wrapperCol: {
                span: 20
            }
        }

        const { data, title } = this.state

        const columns = [{
            title: '可配送区域',
            dataIndex: 'area',
            width: 400,

        }, {
            title: this.state.set === 1 ? '首个(个)' : '首重(KG)',
            dataIndex: 'unit',
            set: this.state.set
        }, {
            title: '运费(元)',
            dataIndex: 'amount'
        }, {
            title: this.state.set === 1 ? '续个(个)' : '续重(KG)',
            dataIndex: 'liang',
            set: this.state.set
        }, {
            title: '运费(元)',
            dataIndex: 'total'
        }]

        const cells = columns.map(col => ({
            ...col,
            onCell: (record) => {
                return {
                    record,
                    dataIndex: col.dataIndex,
                    column: col,
                    parent: this
                }
            }
        }))
        const { getFieldDecorator } = this.props.form
        // 模板详情
        const { carriage } = this.props.mall_carriage
        let _map = this.getDvaToData(data, carriage) || data
        const content = <div style={{ fontSize: 14}}>
            <p>假设配送区域设为北京市，基础运费设为15元，首件（1件）运费10元，续件（2件）运费为5元。</p>
            <p>假设顾客购买N件按该模板计费的商品：</p>
            <p>●若配送地为北京市以外的区域，无论购买多少件，运费Z=15元（基础运费为15元）；</p>
            <p>●若配送地址为北京市，则N=1时，运费Z=10元（首件运费为10元）；</p>
            <p>●若配送地址为北京市，则N=2或3时，运费Z=15元（首件运费10元+续件运费2件内均为5元）；</p>
            <p>●若配送地址为北京市，则N=4或5时，运费Z=20元（首件运费10元+续件运费2件内5元+续件运费2件内5元）；</p>
        </div>
        return (
            <DocumentTitle title={title}>

                <Page>
                    <Page.ContentHeader  breadcrumbData={[{ name: "邮费管理", path: '/mall/carriage' }, { name: title }]} />
                    <Form onSubmit={this.submitHandler}>
                        <Form.Item className={styles.form_label} label="模板名称" {...formItemLayout}>
                            {getFieldDecorator("name", {
                                rules: [{
                                    required: true, message: '请填写名称'
                                }, {
                                    max: 30, message: '超过30个字'
                                }]
                            })(
                                <Input placeholder='请填写名称，30字以内' />
                            )}
                        </Form.Item>

                        <Form.Item className={styles.form_label} label="计费类型" {...formItemLayout}>
                            {getFieldDecorator("set", {
                                initialValue: this.state.set
                            })(
                                <Radio.Group onChange={this.setControlChangeHandler}>
                                    <Radio value={1}>按件计</Radio>
                                    <Radio value={2}>按重量</Radio>
                                </Radio.Group>
                            )}
                            <Popover placement="bottomLeft" content={content} trigger="hover">
                                <a> 运费计费规则 </a>
                            </Popover>
                        </Form.Item>
                        {/* form_label  */}
                        <Form.Item className={styles.form_label} label="基础运费" {...formItemLayout}>
                            {getFieldDecorator("basic_price", {
                                rules: [{
                                    required: true, message: '请填写基础运费'
                                }, {
                                    validator: validatorByIsPositiveMoney
                                }]
                            })(
                                <Input placeholder='请填写基础运费，最大支持小数点前7位数' />
                            )}
                        </Form.Item>
                        <Form.Item label="配送区域" className={styles.form_label_bottom} >
                            <Table
                                className={styles.border_none}
                                rowKey="index"
                                pagination={false}
                                dataSource={_map}
                                onRow={this.onRowHandler}
                                bordered
                                components={{
                                    body: {
                                        row: EditableRow,
                                        cell: EditableCell
                                    }
                                }}
                                columns={cells}
                                footer={() => <div> <a onClick={this.addHandler}>指定可配送区域和运费</a></div>}
                            >
                            </Table>
                        </Form.Item>
                        <Form.Item>
                            <Button type='primary' htmlType="submit" className={styles.bottom_btn} loading={this.state.saveLoading}>保存</Button>
                            <Button className={styles.bottom_btn} onClick={this.onReturn}>返回</Button>
                        </Form.Item>
                    </Form>

                    {/* <Button onClick={this.selectCityHandler}>
                    选择城市
                </Button> */}
                    <CitySelect key={'cityselect-' + this.state.cityselectIndex} excludeCitys={this.state.excludeCitys} selectedKeys={this.state.cityselectedKeys} raw={this.state.cityselectRaw} visiable={this.state.visiable} onCancel={this.onCancelHandler} onOk={this.onOkHandler}></CitySelect>
                </Page>
            </DocumentTitle>
        )
    }
}



@Form.create()
class EditableRow extends React.PureComponent {
    componentDidMount() {
        this.props.parent.onBindRow(this)
    }
    getData = () => {
        return new Promise((resolve, reject) => {
            this.props.form.validateFields((errors, values) => {
                if (errors) {
                    reject(errors)
                } else {
                    resolve(values)
                }
            })
        })
    }

    render() {
        return <EditableContext.Provider value={this.props.form}>
            <tr {...this.props} />
        </EditableContext.Provider>
    }
}

class EditableCell extends React.PureComponent {

    removeItem = (data) => {
        this.props.parent.removeItem(data)
    }

    modifyItem = (data) => {
        this.props.parent.modifyItem(data)
    }

    validtorBycolumnItem = (type, rules, value, callback) => {
        console.log(type,'validtorBycolumnItem')
        const validtors = {
            unit() {
                if (type === 1) {
                    validatorByIsInteger(rules, value, callback)
                } else if (type === 2) {
                    validatorByIsNumber(rules, value, callback)
                }
            },
            amount() {
                validatorByIsPositiveMoney(rules, value, callback)
            },
            liang() {
                if (type === 1) {
                    validatorByIsInteger(rules, value, callback)
                } else if (type === 2) {
                    validatorByIsPositiveMoney(rules, value, callback)
                }
            },
            total() {
                validatorByIsPositiveMoney(rules, value, callback)
            }
        }
        if (value) { validtors[rules.field]() } else { callback('此项必填') }
    }
    /**
     * 获取所有code
     */
    getAreaCode = () => {
        let area = []
        function _map(Arr) {
            Arr.map(i => {
                area.push(i.code)
                if (Array.isArray(i.child)) {
                    _map(i.child)
                }
            })
        }
        return function (_data) {
            _map(_data)
            let _area = area && area.slice()
            _map = null
            area = null
            return _area
        }

    }

    render() {
        const { column, record } = this.props
        return <EditableContext.Consumer>
            {
                (form) => {
                    const { getFieldDecorator } = form

                    if (column.dataIndex === 'area') {

                        const area = record[column.dataIndex]
                        const { citys, friendlyCitys } = area
                        let value = this.getAreaCode()(citys)
                        value = value.join(',')
                        let formatCitys = getformCitys(citys)
                        let html = formatCitys.map((i, index) => {
                            return <span className={styles.slightColor} key={index + 'i'}><b className={styles.weight} >{i.name}</b>
                                <span key={index + 'i'}>{(i.child ? `（${i.child.map(_i => {

                                    return _i.name + (_i.child ? `：${_i.child.map(__i => (__i.name)).join('、')}` : '')

                                }).join('、')}）` : '')
                                }</span>
                                {index !== formatCitys.length - 1 ? '、' : ''}
                            </span>
                        })
                        return <td>
                            <Form.Item style={{ display: 'none' }} >
                                {getFieldDecorator(column.dataIndex, {
                                    initialValue: value || ""
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                            <div>
                                <div >{
                                    html
                                }</div>
                                <div className={styles.button_margin}>
                                    <Button className={[styles.btn_active, styles.bottom_btn].join(' ')} onClick={() => this.modifyItem(record)}>
                                        编辑
                                    </Button>
                                    <Button className={styles.bottom_btn} onClick={() => this.removeItem(record)}>
                                        删除
                                    </Button>
                                </div>

                            </div>
                        </td>
                    } else {
                        return <td>
                            <Form.Item>
                                {getFieldDecorator(column.dataIndex, {
                                    rules: [
                                        {
                                            validator: this.validtorBycolumnItem.bind(this, this.props.column.set)
                                        }
                                    ],
                                    initialValue: record[column.dataIndex],
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                        </td>
                    }
                }
            }
        </EditableContext.Consumer>
    }
}