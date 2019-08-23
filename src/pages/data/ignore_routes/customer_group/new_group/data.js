/**
 * 多选框  CheckGroup
 * 区间    SectSelect
 * 条件    RadioComp
 * 标签    TagSelect
 * 地区    CitySelect
 */


export const GROUP_DATA = [
    {
        id: 1,
        group: '客户资料',
        subText: '',
        children: [
            {
                id: 1,
                name: 'gender',
                type: 'in',
                data: [],
                label: '性别',
                text: '依据客户资料—性别筛选',
                unit: '',
                mode: 'CheckGroup',
                max: '',
                option: [
                    {value: 0, label: '未知'},
                    {value: 1, label: '男'},
                    {value: 2, label: '女'}
                ]
            },
            {
                id: 2,
                name: 'age',
                type: 'between',
                data: [],
                label: '年龄',
                text: '依据客户资料—生日计算',
                unit: '岁',
                mode: 'SectSelect',
                max: 200,
                option: [],
            },
            {
                id: 3,
                name: 'city',
                type: 'eq',
                data: [],
                label: '地区',
                text: '依据客户资料—地区筛选',
                unit: '',
                mode: 'CitySelect',
                max: '',
                option: [],
            }
        ]
    },
    {
        id: 2,
        group: '标签',
        subText: '',
        children: [
            {
                id: 4,
                name: 'customer_tag',
                type: 'in',
                data: [],
                label: '客户标签',
                text: '筛选包含以下标签的客户',
                unit: '',
                mode: 'TagSelect',
                max: '',
                option: [],
            }
        ]
    },
    {
        id: 3,
        group: '订单交易',
        subText: '（近360天以内）',
        children: [
            {
                id: 5,
                name: 'trade_lately_pay_time',
                type: 'between',
                data: [],
                label: '最近付款时间',
                text: '客户在最近一次下单且付款的时间',
                unit: '天',
                mode: 'RadioComp',
                max: 360,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 6,
                name: 'trade_lately_success_time',
                type: 'between',
                data: [],
                label: '最近成功交易时间',
                text: '客户在最近一次订单完成的时间（含售后订单）',
                unit: '天',
                mode: 'RadioComp',
                max: 360,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 7,
                name: 'trade_pay_count',
                type: 'between',
                data: [],
                label: '付款次数',
                text: '客户下单且付款的订单笔数',
                unit: '次',
                mode: 'RadioComp',
                max: 999,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 8,
                name: 'trade_success_count',
                type: 'between',
                data: [],
                label: '成功交易次数',
                text: '客户订单完成的订单笔数（含售后订单）',
                unit: '次',
                mode: 'RadioComp',
                max: 999,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 9,
                name: 'trade_pay_amount',
                type: 'between',
                data: [],
                label: '付款金额',
                text: '客户下单且付款的订单总金额',
                unit: '元',
                mode: 'RadioComp',
                max: 9999999,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 10,
                name: 'trade_success_amount',
                type: 'between',
                data: [],
                label: '成功交易金额',
                text: '客户订单完成的订单总金额（含售后订单）',
                unit: '元',
                mode: 'RadioComp',
                max: 9999999,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 11,
                name: 'trade_pay_price',
                type: 'between',
                data: [],
                label: '付款客单价',
                text: '付款总金额 / 付款总次数',
                unit: '元',
                mode: 'RadioComp',
                max: 9999999,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            },
            {
                id: 12,
                name: 'trade_success_price',
                type: 'between',
                data: [],
                label: '成功交易客单价',
                text: '成功交易总金额 / 成功交易次数',
                unit: '元',
                mode: 'RadioComp',
                max: 9999999,
                option: [
                    {value: 'between', label: '区间'},
                    {value: 'gt', label: '大于'},
                    {value: 'lt', label: '小于'}
                ]
            }
        ]
    }
]