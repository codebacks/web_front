// 商品规格组件

import React, { Component, Fragment } from 'react'
// import PropTypes from 'prop-types'
import { Form  } from 'antd'
import DynamicSpec from '../DynamicSpec'
import DynamicTable from '../DynamicTable'
const GlobalContext = React.createContext()
@Form.create()
export default class StandardComp extends Component {
    state = {
        list: [],
        sku: [],
        activityDisabled: false,
        dataSourceTemp:[],
        DynamicTableKey: 0
    }

    dynamicTableRef = null
    registerTableRef= (table) => {
        this.dynamicTableRef = table
    }

    componentDidMount(){
        this.props.parent.registerComp(this)
        const {specs, sku, spec_a, activity_join} = this.props.data

        if (spec_a !== null) {
            let getUuid = ['spec_a', 'spec_b', 'spec_c']
            let list = []
            if (specs && specs.length > 0) {
                list = specs.map((item, index) => {
                    return {
                        name: item.spec,
                        value: item.property,
                        uuid: getUuid[index],
                    }
                })
            }
            
            this.setState({
                list,
                sku
            })
        }
        if (activity_join && activity_join.length > 0) {
            this.setState({activityDisabled: true})
        }
    }

    onDataSourceTemp = (dataSourceTemp) => {
        if (dataSourceTemp) {
            this.setState({dataSourceTemp})
        }
    }

    onChangeList = (list)=> {
        let DynamicTableKey = this.state.DynamicTableKey
        DynamicTableKey++
        if (list.length <= 0) {
            this.setState({
                sku: [],
                DynamicTableKey,
            },() => {
                this.setState({
                    list,
                })
            })
        } else {
            this.setState({
                DynamicTableKey,
                list
            })
        }
        this.props.onChangeSpec(list)
    }

    onoChangeSku = (values) => {
        // console.log(values)
        const result = this.state.dataSourceTemp.map((item, index) => {
            return {
                id: values['id'+ index],
                price: (values['price' + index] - 0)*100 ,
                stock_count: values['stock_count'+ index] - 0 ,
                display_price: values['display_price'+ index]?(values['display_price'+ index] - 0) * 100: '',
                sku_no: values['sku_no'+ index],
                cover_url: values['cover_url'+ index],
                property_a: item.spec_a,
                property_b: item.spec_b,
                property_c: item.spec_c,
            }
        })

        this.setState({
            sku: result,
        })

        const {onChangeSku} = this.props
        onChangeSku && onChangeSku(result)
    }

    getDatas = () => {
        return new Promise((resolve, reject) => {
            this.dynamicTableRef.getDatas().then(result=> {
                this.props.form.validateFields((err, values) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve({
                            specificassdt: result,
                            specificat: this.state.list
                        })
                    }
                })
            })
            
        })
    }

    render(){
        const { list, DynamicTableKey, sku, activityDisabled } = this.state
        const { photoToken, data } = this.props
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 24,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 24,
                style: {
                    paddingLeft: '24px'
                },
            },
        }
        return (
            <Fragment>
                <GlobalContext.Provider value={list}>
                    <Form.Item label="商品规格" {...formItemLayout} style={{marginTop: 16}}>
                        {getFieldDecorator("specificat",{})(
                            <DynamicSpec onChangeList = {this.onChangeList} activityDisabled={activityDisabled} list={list} key={'DynamicSpec'+data.id}/>
                        )}
                    </Form.Item>
                    {
                        list.length>0&&(
                            <Form.Item label="规格明细" {...formItemLayout} style={{marginTop: 16}}>
                                {getFieldDecorator("specificassdt",{})(
                                    <GlobalContext.Consumer>
                                        {list => <DynamicTable parent={this} activityDisabled={activityDisabled} onDataSourceTemp={this.onDataSourceTemp} onoChangeSku={this.onoChangeSku} list={list} sku={sku} photoToken={photoToken} key={'DynamicTable'+data.id+DynamicTableKey}/>}
                                    </GlobalContext.Consumer>
                                )}
                            </Form.Item> 
                        )
                    }

                </GlobalContext.Provider>
            </Fragment>
        )
    }
}
