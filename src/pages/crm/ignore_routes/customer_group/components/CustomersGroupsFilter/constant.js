import moment from "moment"
import FilterContent from './components/FilterContent'
import InputType from './components/FilterContent/inputTypes/InputType'
import CheckboxType from './components/FilterContent/inputTypes/CheckboxType'
import InputNumberType from './components/FilterContent/inputTypes/InputNumberType'
import DatePickerType from './components/FilterContent/inputTypes/DatePickerType'
import AreaType from './components/FilterContent/inputTypes/AreaType'
import SelectType from './components/FilterContent/inputTypes/SelectType'
import {message} from "antd"

export const categoryContents = [
    {
        name: '微信信息',
        categoryTags: [
            {
                id: 'tags',
            },
            {
                id: 'wechat_remark',
            },
        ],
    },
    {
        name: '客户信息',
        categoryTags: [
            {
                id: 'name',
            },
            {
                id: 'gender',
            },
            {
                id: 'age',
            },
            {
                id: 'mobile',
            },
            {
                id: 'area',
            },
            {
                id: 'remark',
            },
            {
                id: 'create_time',
            },
            {
                id: 'birthday',
            },
        ],
    },
    {
        name: '订单信息',
        categoryTags: [
            {
                id: 'shop',
            },
            {
                id: 'product_name',
            },
            {
                id: 'order_no',
            },
            {
                id: 'buy_time',
            },
            {
                id: 'platform',
            },
            {
                id: 'platform_user_id',
            },
        ],
    },
]

export const filterContents = {
    'tags': {
        name: '微信标签',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>微信标签筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>微信标签输入：输入框输入关键词后可自动匹配到包含关键词的微信标签，选择后添</p>
                    <p>加至输入框，可多选，回车后添加筛选条件</p>
                    <p>支持标签内容为空，则添加后自动变为：包含/不包含标签 的条件选项</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'wechat_remark': {
        name: '微信备注',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>微信备注筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>微信备注输入：输入框输入关键词后可自动匹配到包含关键词的微信备注，选择后添</p>
                    <p>加至输入框，可多选，回车后添加筛选条件</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'name': {
        name: '客户姓名',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>客户姓名筛选条件使用帮助：</p>
                    <p>包含/不包含按钮：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>客户姓名输入框：输入客户姓名后按回车自动添加筛选条件至下方标签栏，点击X删除</p>
                    <p>按钮可删除已经添加条件</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'gender': {
        name: '性别',
        Content: FilterContent,
        contentOption: {
            InputContent: CheckboxType,
            description: (
                <>
                    <p>客户性别筛选条件使用帮助： 性别复选框，勾选后表示生效，条件为包含</p>
                </>
            ),
            renderTagTitle: (title) => {
                const ageMap = {
                    '0': '未知',
                    '1': '男',
                    '2': '女',
                }
                return ageMap[title]
            },
            inputContentOption: {
                options: [
                    {
                        label: '未知',
                        value: '0',
                    },
                    {
                        label: '男',
                        value: '1',
                    },
                    {
                        label: '女',
                        value: '2',
                    },
                ],
            },
        },
    },
    'age': {
        name: '年龄',
        Content: FilterContent,
        contentOption: {
            InputContent: InputNumberType,
            description: (
                <>
                    <p>客户年龄筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>年龄筛选输入：输入年龄范围添加，数值输入框相同或只输入一个数值时为单值匹配</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(!title) {
                    return ''
                }

                const value = title.split(',')

                if(value[0] === value[1]) {
                    return `${title[0]}岁`
                }
                return `${value[0]}~${value[1]}岁`
            },
            inputContentOption: {
                afterRender: () => {
                    return '岁'
                },
            },
        },
    },
    'mobile': {
        name: '手机号',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>手机号筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>手机号输入：输入符合条件位数的手机号，暂只支持中国大陆地区11位手机号</p>
                    <p>特殊输入：手机号可添加输入为空的条件，即添加为：包含/不包含手机号</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(title === '') {
                    return '未知'
                }
                return title
            },
            inputContentOption: {
                validator: ({item, rule, value, callback}) => {
                    if(value && !/^[0-9]{11}$/.test(value)) {
                        callback('必须为手机格式')
                        return
                    }

                    if(item.values.indexOf(value) > -1) {
                        callback('不能重复')
                        return
                    }

                    callback()
                },
            },
        },
    },
    'area': {
        name: '地区',
        Content: FilterContent,
        contentOption: {
            InputContent: AreaType,
            description: (
                <>
                    <p>地区筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>地区选择输入：省份/城市/区县，按顺序输入选择，低级别可城市和区县不选输入，</p>
                    <p>例如：可只选择福建省福州市，或只选择福建省添加</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'remark': {
        name: '客户备注',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>客户备注筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>客户备注输入：输入框输入关键词后可自动匹配到包含关键词的客户备注，选择后添</p>
                    <p>加至输入框，可多选，回车后添加筛选条件</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'create_time': {
        name: '创建时间',
        Content: FilterContent,
        contentOption: {
            InputContent: DatePickerType,
            description: (
                <>
                    <p>客户创建时间筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>选择时间段：选择时间起止范围，如前后时间相同则定位为单一时间点</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(title) {
                    return title.split(',').join(' ~ ')
                }
                return title
            },
            inputContentOption: {
                momentToString: (values) => {
                    return `${moment(values[0]).format('YYYY-MM-DD HH:mm:ss')},${moment(values[1]).format('YYYY-MM-DD HH:mm:ss')}`
                },
                beforeSetState: (values) => {
                    if(values.value) {
                        const momentToString = filterContents['create_time'].contentOption.inputContentOption.momentToString

                        values.value = momentToString(values.value)
                    }else {
                        values.value = ''
                    }

                    return values
                },
                rangePickerOption: {
                    showTime: true,
                    format: 'YYYY-MM-DD HH:mm:ss',
                },
            },
        },
    },
    'birthday': {
        name: '选择生日',
        Content: FilterContent,
        contentOption: {
            InputContent: DatePickerType,
            description: (
                <>
                    <p>生日筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>选择时间段：选择日期起止范围或输入单一日期，如前后日期相同则定位为单一时间</p>
                    <p>点</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(title) {
                    return title.split(',').join(' ~ ')
                }
                return title
            },
            inputContentOption: {
                momentToString: (values) => {
                    return `${moment(values[0]).format('YYYY-MM-DD')},${moment(values[1]).format('YYYY-MM-DD')}`
                },
                beforeSetState: (values) => {
                    if(values.value) {
                        const momentToString = filterContents['birthday'].contentOption.inputContentOption.momentToString

                        values.value = momentToString(values.value)
                    }else {
                        values.value = ''
                    }

                    return values
                },
                rangePickerOption: {
                    showTime: false,
                    format: 'YYYY-MM-DD',
                },
            },
        },
    },
    'shop': {
        name: '店铺名称',
        Content: FilterContent,
        contentOption: {
            InputContent: SelectType,
            description: (
                <>
                    <p>店铺名称筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>店铺名称输入和选择框：输入店铺名称关键词或下拉菜单选择店铺，点击添加至输入</p>
                    <p>框后回车添加</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(title) {
                    return title.name
                }
                return title
            },
            inputContentOption: {
                beforeSetState: (values) => {
                    if(values && values.value) {
                        values.value = {
                            id: values.value.key,
                            name: values.value.label,
                        }
                    }
                    return values
                },
                validator: ({item, rule, value, callback}) => {
                    if(!value) {
                        callback('必填')
                        return
                    }

                    if(item.values.findIndex(item => item.id === value.key) > -1) {
                        callback('不能重复')
                        return
                    }

                    callback()
                },
                selectOption: {
                    showSearch: true,
                    labelInValue: true,
                    placeholder: '搜索店铺名称',
                    defaultActiveFirstOption: false,
                    showArrow: true,
                    filterOption: false,
                    notFoundContent: null,
                    allowClear: true,
                },
                onSearch: async (value = '') => {
                    try {
                        const api = require('crm/common/api/customerGroups').default
                        const {request} = require('utils')
                        const qs = require('qs')

                        const params = {
                            name: value,
                            offset: 0,
                            limit: 100,
                        }

                        const {data} = await request(`${api.shops.url}?${qs.stringify(params)}`)

                        if(data) {
                            return data
                        }else {
                            throw new Error('请求错误')
                        }
                    }catch(e) {
                        message.error('请求错误')
                    }
                },
            },
        },
    },
    'product_name': {
        name: '商品名称',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>商品名称筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>商品名称输入选择框：输入关键词查询商品名称，点击添加至输入窗，或点击下拉窗</p>
                    <p>选择商品名称，回车添加至筛选条件</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'order_no': {
        name: '订单号',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>订单号筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>订单号输入框：输入订单号查询并点击添加至筛选条件</p>
                </>
            ),
            inputContentOption: {},
        },
    },
    'buy_time': {
        name: '选择购买时间段',
        Content: FilterContent,
        contentOption: {
            InputContent: DatePickerType,
            description: (
                <>
                    <p>购买时间筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>购买时间段输入：选择时间段范围输入，如仅选择单一时间输入或前后输入时间相</p>
                    <p>同，则视为时间点输入</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(title) {
                    return title.split(',').join(' ~ ')
                }
                return title
            },
            inputContentOption: {
                momentToString: (values) => {
                    return `${moment(values[0]).format('YYYY-MM-DD HH:mm:ss')},${moment(values[1]).format('YYYY-MM-DD HH:mm:ss')}`
                },
                beforeSetState: (values) => {
                    if(values.value) {
                        const momentToString = filterContents['create_time'].contentOption.inputContentOption.momentToString

                        values.value = momentToString(values.value)
                    }else {
                        values.value = ''
                    }

                    return values
                },
                rangePickerOption: {
                    showTime: true,
                    format: 'YYYY-MM-DD HH:mm:ss',
                },
            },
        },
    },
    'platform': {
        name: '平台类型',
        Content: FilterContent,
        contentOption: {
            InputContent: CheckboxType,
            description: (
                <>
                    <p>平台类型筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>平台类型选择框：点击下拉选择平台类型，可添加多个平台类型</p>
                </>
            ),
            renderTagTitle: (title) => {
                const ageMap = {
                    '1': '淘宝/天猫',
                    '2': '京东',
                }
                return ageMap[title]
            },
            inputContentOption: {
                options: [
                    {
                        label: '淘宝/天猫',
                        value: '1',
                    },
                    {
                        label: '京东',
                        value: '2',
                    },
                ],
            },
        },
    },
    'platform_user_id': {
        name: '购物账号',
        Content: FilterContent,
        contentOption: {
            InputContent: InputType,
            description: (
                <>
                    <p>购物账号筛选条件使用帮助：</p>
                    <p>包含/不包含：按钮可切换条件模式，同时仅支持一种添加，切换将清空已选择条件</p>
                    <p>购物账号输入：输入框输入对应平台的购物账号可自动匹配到包含内容的购物账号，</p>
                    <p>选择后添加至输入框，可多选，回车后添加筛选条件，如输入为空，则创建为空条件</p>
                </>
            ),
            renderTagTitle: (title) => {
                if(title === '') {
                    return '未知'
                }
                return title
            },
            inputContentOption: {
                validator: ({item, rule, value, callback}) => {
                    if(item.values.indexOf(value) > -1) {
                        callback('不能重复')
                        return
                    }

                    callback()
                },
            },
        },
    },
}
