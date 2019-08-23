/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/16
 */
import {Button, Form, Input, Select} from 'antd'
import styles from './index.less'

const FormItem = Form.Item
const Option = Select.Option

function defaultGetOptions({optionsMap, rowItem, rowIndex, colItem, colIndex, searchBlock}) {
    const options = []
    Object.keys(optionsMap).forEach((key) => {
        const item = optionsMap[key]
        options.push(
            <Option
                key={String(key)}
            >
                {item}
            </Option>,
        )
    })

    return options
}

export function defaultCreateSelect({rowItem, rowIndex, colItem = {}, colIndex, searchBlock}) {
    const {
        contentOption: {
            params,
            key,
            handleChange,
            optionsMap,
            getOptions = defaultGetOptions,
            ...otherProps
        } = {},
    } = colItem

    return (
        <Select
            {...otherProps}
            allowClear={true}
            onChange={(...arg) => {
                handleChange(key, ...arg)
            }}
            value={params[key]}
        >
            {getOptions({optionsMap, rowItem, rowIndex, colItem, colIndex, searchBlock})}
        </Select>
    )
}

export function defaultCreateInput({rowItem, rowIndex, colItem = {}, colIndex, searchBlock}) {
    const {
        contentOption: {
            params,
            key,
            handleChange,
            ...otherProps
        } = {},
    } = colItem

    return (
        <Input
            {...otherProps}
            value={params[key]}
            onChange={(...arg) => {
                handleChange(key, ...arg)
            }}
        />
    )
}

export function defaultCreateInputSearch({rowItem, rowIndex, colItem = {}, colIndex, searchBlock}) {
    const {
        contentOption: {
            params,
            key,
            handleChange,
            ...otherProps
        } = {},
    } = colItem

    return (
        <Input.Search
            {...otherProps}
            value={params[key]}
            onChange={(...arg) => {
                handleChange(key, ...arg)
            }}
        />
    )
}

export const formItemTypesMap = {
    'search': {
        renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock}) {
            return (
                <FormItem
                    label={' '}
                    colon={false}
                    {...colItem.formItemOption}
                >
                    <>
                        {
                            colItem.searchBtnOption && (
                                <Button
                                    type="primary"
                                    icon="search"
                                    className={styles.searchBtn}
                                    {...colItem.searchBtnOption}
                                >
                                    {colItem.searchBtnOption.text || '搜索'}
                                </Button>
                            )
                        }
                        {
                            colItem.resetBtnOption && (
                                <Button
                                    {...colItem.resetBtnOption}
                                >
                                    {colItem.resetBtnOption.text || '重置'}
                                </Button>
                            )
                        }
                    </>
                </FormItem>
            )
        },
    },
    'select': {
        renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock}) {
            const createSelect = colItem.createContent || defaultCreateSelect
            return (
                <FormItem
                    colon={true}
                    {...colItem.formItemOption}
                >
                    {createSelect({rowItem, rowIndex, colItem, colIndex, searchBlock})}
                </FormItem>
            )
        },
    },
    'input': {
        renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock}) {
            const createInput = colItem.createContent || defaultCreateInput
            return (
                <FormItem
                    colon={true}
                    {...colItem.formItemOption}
                >
                    {createInput({rowItem, rowIndex, colItem, colIndex, searchBlock})}
                </FormItem>
            )
        },
    },
    'inputSearch': {
        renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock}) {
            const createInputSearch = colItem.createContent || defaultCreateInputSearch
            return (
                <FormItem
                    colon={true}
                    {...colItem.formItemOption}
                >
                    {createInputSearch({rowItem, rowIndex, colItem, colIndex, searchBlock})}
                </FormItem>
            )
        },
    },
    'default': {
        renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock}) {
            const component = typeof colItem.component === 'function' ? colItem.component(colItem, rowIndex, colIndex) : colItem.component
            return (
                <FormItem
                    colon={true}
                    {...colItem.formItemOption}
                >
                    {component}
                </FormItem>
            )
        },
    },
}
