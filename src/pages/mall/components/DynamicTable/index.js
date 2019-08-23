import { Component, Fragment } from 'react'
import { Table, Form, Input, Upload, Icon, message } from 'antd'
// import _ from 'lodash'
import { jine } from 'utils/display'
import styles from './index.less'
const FormItem = Form.Item
@Form.create({
    onValuesChange: (props, changedValues, values) => {
        props.onoChangeSku(values)
    }
})
export default class DynamicTable extends Component {
    state = {
        dataSourceTemp: [],
        columnsTemp: []
    }

    getDatas = () => {
        return new Promise((resolve, reject) => {
            this.props.form.validateFields((err, values) => {
                const result = this.state.dataSourceTemp.map((item, index) => {
                    // console.log(item)
                    const specs = this.props.list.map((specItem,index) => {
                        return {
                            spec: specItem.name,
                            property: item[specItem.uuid]
                        }
                    })

                    return {
                        id: values['id'+ index] || '',
                        price: values['price' + index]*100 ,
                        stock_count: values['stock_count'+ index],
                        display_price: values['display_price'+ index]?values['display_price'+ index]*100: '',
                        sku_no: values['sku_no'+ index],
                        cover_url: values['cover_url'+ index] && values['cover_url'+ index].file && values['cover_url'+ index].file.response && values['cover_url'+ index].file.response.key || values['cover_url'+ index] || '',
                        specs: specs,
                        spec_a: item.spec_a,
                        spec_b: item.spec_b,
                        spec_c: item.spec_c,
                    }
                })
                // console.log(result)

                if(err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
        })
    }

    componentDidMount(){
        this.props.parent.registerTableRef(this)

        const tableData = this.props.list
        const { getFieldDecorator } = this.props.form
        // 图片上传处理
        const { photoToken, sku, activityDisabled } = this.props
        const  uploadProps = {
            name: 'file',
            accept:'.jpg,.png',
            action: '//upload.qiniup.com/',
            headers: {},
            data: {
                token: photoToken,
            },
            beforeUpload: (file, fileList)=>{
                this.setState({
                    isUpload: true
                })
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
                if (!isJPG) {
                    message.error('文件限制jpg/jpeg/png!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    })
                }
                const isLt1M = file.size / 1024 / 1024 < 1
                if (!isLt1M) {
                    message.error('大小限制1MB!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    }) 
                }
                return isJPG && isLt1M
            },
        }
     
        // 表格默认内容
        const dataSource = [
            {
                id: '',
                price: '',
                stock_count: '',
                sku_no: '',
                display_price: '',
                cover_url: '',
                spec_b: null,
                spec_a: null,
                spec_c: null
            }
        ]
        // 表格行
        const columns = [
            {
                title: (<span><span style={{ marginRight: 5, color: '#f00', verticalAlign: 'sub'}}>*</span>价格</span>),
                dataIndex: 'price',
                render:(text,record,index)=>{
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`price${index}`, {
                                rules: [
                                    { required: true, message: `价格必填!`, },
                                    { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '价格必须为数字，且小数最多只能有2位' },
                                    {validator: this.validatorGreeThenZero, message: '价格必须大于0元'}
                                ],  
                                initialValue: text ? jine(text, '0.00', 'Fen') : '',
                            })(
                                <Input addonBefore="￥" disabled={activityDisabled} maxLength={15}/>
                            )}
                        </FormItem> 
                    )
                }
            },
            {
                title: (<span><span style={{ marginRight: 5, color: '#f00', verticalAlign: 'sub'}}>*</span>库存</span>),
                dataIndex: 'stock_count',
                render: (text, record, index) => {
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`stock_count${index}`, {
                                rules: [
                                    { required: true, message: `库存必填!`, },
                                    { pattern: /^([1-9]\d*)$|^0$/, message: '库存必须是正整数，或为0'}
                                ], 
                                initialValue: text,
                            })(
                                <Input maxLength={8}/>
                            )}
                        </FormItem> 
                    )
                } 
            },
            {
                title: '规格编码',
                dataIndex: 'sku_no',
                render:(text,record,index)=>{
                    return (
                        <span>
                            <FormItem style={{ margin: 0 }}>
                                {getFieldDecorator(`sku_no${index}`, {
                                    initialValue: text,
                                })(
                                    <Input/>
                                )}
                            </FormItem> 
                            {!!record.id && 
                                <FormItem style={{ display: 'none' }}>
                                    {getFieldDecorator(`id${index}`, {
                                        initialValue: record.id,
                                    })(
                                        <Input maxLength={50}/>
                                    )}
                                </FormItem> 
                            }
                        </span>
                    )
                }
            },
            {
                title: '划线价格',
                dataIndex: 'display_price',
                render:(text,record,index)=>{
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`display_price${index}`, {
                                initialValue: text ? jine(text, '0.00', 'Fen') : '',
                                rules: [
                                    { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '划线价格必须为数字，且小数最多只能有2位' },
                                    {validator: this.validatorGreeThenZero, message: '价格必须大于0元'}
                                ],
                            })(
                                <Input addonBefore="￥" maxLength={15}/>
                            )}
                        </FormItem> 
                    )
                }
            },
            {
                title: '图片',
                dataIndex: 'cover_url',
                render:(text,record,index)=>{
                    const addBtn = (
                        <div className={styles.addBtn}>
                            <Icon type="plus" theme="outlined" />
                        </div>
                    )
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`cover_url${index}`, {
                                initialValue: text,
                            })(
                                <Upload
                                    showUploadList={false}
                                    {...uploadProps}
                                    onChange={(file)=>{this.changeCover(file,index)}}
                                >
                                    {text?(<img className={styles.showImg} src={`//image.yiqixuan.com/${text.file?text.file.response.key:text}`} alt=''/>):addBtn}
                                </Upload>
                            )}
                        </FormItem> 
                    )
                }
            },
        ]
        let dataSourceDeal = this.copyArrObj(dataSource)
        let columnsDeal = this.copyArrObj(columns)
        // 处理获取的数据
        // 处理表格字段
        // 反序循环，使表格字段顺序一致
        let len = tableData.length
        for(let i=len-1;i>=0;i--){
            columnsDeal.unshift({
                title: tableData[i].name,
                dataIndex: tableData[i].uuid,
            }) 
        }
        // 组合数据
        let data = []
        let keepArr = this.getResult(tableData)


        // console.log(keepArr)
        keepArr&&keepArr.forEach((val,key)=>{
            let temp = this.copyArrObj(dataSourceDeal)[0]
            val[0]&&(temp.spec_a = val[0])
            val[1]&&(temp.spec_b = val[1])
            val[2]&&(temp.spec_c = val[2])

            const existsItem = sku && sku.find(s => s.property_a === temp.spec_a && s.property_b === temp.spec_b && s.property_c === temp.spec_c )

            if(existsItem){
                temp.id = existsItem.id
                temp.goods_id = existsItem.goods_id
                temp.stock_count = existsItem.stock_count
                temp.price = existsItem.price
                temp.display_price = existsItem.display_price
                temp.cover_url = existsItem.cover_url
                temp.sku_no = existsItem.sku_no
            }

            if(!temp.id){
                temp.id = key
            }
            data.push(temp)
        })
        // 合并单元格
        columnsDeal.forEach((v,k) => {            
            if(tableData.length > 0){
                const spec_aData = tableData[1]
                const spec_bData = tableData[2]
                const lena = spec_aData&&spec_aData.value&&spec_aData.value.length || 1
                const lenb = spec_bData&&spec_bData.value&&spec_bData.value.length || 1

                if(v.dataIndex === 'spec_a' && spec_aData && spec_aData.value && spec_aData.value.length> 0){
                    let num = lena&&lenb ? (lena*lenb) : lena
                    v.render = (value, row, index) => {
                        const obj = {
                            children: value,
                            props: {},
                        }
                        if(index%(num) === 0){
                            obj.props.rowSpan  = num
                        }else{
                            obj.props.rowSpan  = 0
                        }    
                        return obj
                    }
                }
                if(v.dataIndex === 'spec_b' && spec_bData && spec_bData.value && spec_bData.value.length> 0){
                    let num = lenb
                    v.render = (value, row, index) => {
                        const obj = {
                            children: value,
                            props: {},
                        }
                        if(index%(num) === 0){
                            obj.props.rowSpan  = num
                        }else{
                            obj.props.rowSpan  = 0
                        }    
                        return obj
                    }
                }
            }
        })
        dataSourceDeal = data

        this.setState({
            dataSourceTemp: dataSourceDeal || [],
            columnsTemp: columnsDeal,   
        })
        this.props.onDataSourceTemp(dataSourceDeal)

    }
    // 笛卡儿积
    cartesianProduct = (arr) =>{
        return arr.reduce(function (a, b) {
            return a.map(function (x) {
                return b.map(function (y) {
                    return x.concat(y)
                })
            }).reduce(function (a, b) { return a.concat(b) }, [])
        }, [[]])
    }

    validatorGreeThenZero = (rule, value, callback) => {
        if(value){
            const number = value - 0
            if(number > 0){
                callback()
            }else{
                callback('必须大于0')
            }
        }else{
            callback()
        }
    }

    getResult = (data)=> {
        let temp = []
        data.forEach((v,k)=>{
            if(v.value&&v.value.length > 0){
                temp.push(v.value)
            }
        })
        
        let rst  = this.cartesianProduct(temp)
        return rst
    }
    // 合并单元格
    // columns, num单元格个数 key字段名
    mergeColumn =(columns, num, key)=>{
        columns.forEach((vvv,kkk)=>{
            if(vvv.dataIndex === key){
                vvv.render = (value, row, index) => {
                    const obj = {
                        children: value,
                        props: {},
                    }
                    if(index%(num) === 0){
                        obj.props.rowSpan  = num
                    }else{
                        obj.props.rowSpan  = 0
                    }    
                    return obj
                }
            }
        })
    }
    // 更改图片
    changeCover = (info,index)=> {
        const { dataSourceTemp } = this.state
        if(info.file.status === 'done'){
            dataSourceTemp[index].cover_url = info.file.response.key || ''
            this.setState({
                dataSourceTemp: dataSourceTemp
            })
        }
    }
    //复制对象
    copyArrObj = (data)=>{
        const temp = []
        data.forEach((vvv,kkk)=>{
            var obj = {}
            for(var a in vvv){
                obj[a] = vvv[a]
            }
            temp.push(obj) 
        }) 
        return temp 
    }
    render(){
        const { dataSourceTemp, columnsTemp } = this.state
        return (
            <Fragment>
                <Table
                    bordered
                    dataSource={dataSourceTemp}
                    columns={columnsTemp} 
                    rowKey={
                        ((record)=>{
                            return record.id
                        })
                    }
                    pagination={false}
                    rowClassName="editable-row"
                ></Table> 
            </Fragment>
        )
    }
}
