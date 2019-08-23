'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/08/13
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Select, Spin,} from 'antd'
import {connect} from 'dva'
import safeSetState from 'hoc/safeSetState'
// import styles from './index.less'

const Option = Select.Option

@connect(({base, wechats, loading}) => ({
    base,
    wechats,
    searchLoading: loading.effects['wechats/querySummary'],
}))
@safeSetState()
export default class WeChatSelectSingle extends React.Component {
    static propTypes = {
        cls: PropTypes.string,
        placeholder: PropTypes.string,
        departmentId: PropTypes.string,
        userId: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.number]
        ),
        field: PropTypes.string,
        uin: PropTypes.string,
        username: PropTypes.string,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        cls: '',
        placeholder: '全部【微信号】',
        departmentId: undefined,
        userId: undefined,
        field: 'uin',
        uin: undefined,
        username: undefined,
        onChange: ()=>{},
    }


    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    componentDidMount() {
        this.loadWechats()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.departmentId !== prevProps.departmentId
            || this.props.userId !== prevProps.userId) {
            this.resetState()
            this.loadWechats()
            // this.props.onChange()
        }
    }

    componentWillUnmount() {
        clearTimeout(this.state.timer)
        this.resetState()
    }

    getInitialState = () => {
        return  {
            query: '',
            userWeChats: [],
            searchResult: [],
            timer: 0,
        }
    }

    resetState = () =>{
        this.setState(this.getInitialState())
    }

    loadWechats = () => {
        this.props.dispatch({
            type: 'wechats/querySummary',
            payload: {
                department_id: this.props.departmentId || undefined ,
                user_id: this.props.userId,
                limit: 100,
            },
            callback: (data) =>{
                this.setState({
                    userWeChats: data
                })
            }
        })
    };

    handleChange = (value, option) => {
        const name = option && option.props ? option.props.children : undefined
        if(value === '' || value){
            this.props.onChange(value, name)
            return
        }
        this.setState({
            query: '',
        })
        this.props.onChange(value, name)
    }

    handleSearch = (value) => {
        let {timer} = this.state
        if (timer) {
            clearTimeout(timer)
        }
        timer = window.setTimeout(() => {
            value = value.replace(/(^\s*)/, '')
            this.setState({
                query: value,
            })
            this.props.dispatch({
                type: 'wechats/querySummary',
                payload: {
                    department_id: this.props.departmentId || undefined,
                    user_id: this.props.userId,
                    query: value.replace(/\s*$/g, ''),
                    limit: 10000,
                },
                callback: (data) => {
                    this.setState({
                        searchResult: data
                    })
                }
            })
        }, 200)
        this.setState({
            timer: timer,
        })
    }

    handleBlur = () => {
        this.setState({
            query: ''
        })
    }

    getOptionContent = (item) => {
        if (item.remark) {
            return `${item.nickname}【${item.remark}】`
        } else {
            return `${item.nickname}【${item.alias || item.username}】`
        }
    }

    render() {
        const {searchLoading, cls, placeholder, field} = this.props

        const value = this.props[field]

        const {query, userWeChats, searchResult} = this.state

        let userWeChatsOption = []
        userWeChatsOption.push(<Option key="0" value="">全部【微信号】</Option>)
        userWeChatsOption.push.apply(userWeChatsOption, userWeChats.map((item) => {
            return <Option key={item[field]}
                title={item.nickname}
                value={item[field]}>
                {this.getOptionContent(item)}
            </Option>
        }))

        return (
            <div className={cls}>
                <Select
                    allowClear
                    showSearch
                    filterOption={false}
                    placeholder={ placeholder}
                    style={{width: '100%'}}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    onSearch={this.handleSearch}
                    onBlur={this.handleBlur}
                    value={value}
                    notFoundContent={searchLoading
                        ? <Spin size="small"/>
                        : (query && !searchResult.length)
                            ? <p>未找到相关微信号</p>
                            : null}
                >
                    {
                        query ? searchResult.map((item) => {
                            return <Option
                                key={item[field]}
                                value={item[field]}>
                                {this.getOptionContent(item)}
                            </Option>
                        }) : userWeChatsOption
                    }
                </Select>
            </div>
        )
    }
}
