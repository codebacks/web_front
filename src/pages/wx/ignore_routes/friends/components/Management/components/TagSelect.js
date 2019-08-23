import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Select, Spin,} from 'antd'
import {connect} from 'dva'
import safeSetState from 'hoc/safeSetState'

const Option = Select.Option

@connect(({loading}) => ({
    searchLoading: loading.effects['wx_friends/tags'],
}))
@safeSetState()
export default class TagsSelect extends Component {
    static propTypes = {
        placeholder: PropTypes.string,
        values: PropTypes.array,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        placeholder: '',
        values: [],
        onChange: ()=>{},
    }


    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    componentDidMount() {
        this._isMounted = true
        this.loadDefaultTags()
    }

    componentWillUnmount() {
        this._isMounted = false
        clearTimeout(this.state.timer)
        this.resetState()
    }

    getInitialState = () => {
        return  {
            query: '',
            defaultTags: [],
            searchResult: [],
            timer: 0,
        }
    }

    resetState = () =>{
        this.setState(this.getInitialState())
    }

    loadDefaultTags = () => {
        this.loadTags({limit: 100}, (data=[])=>{
            this.setState({
                defaultTags: data
            })
        })
    }

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
            this.loadTags({
                query: value.replace(/\s*$/g, ''),
                limit: 10000,
            }, (data) => {
                this.setState({
                    searchResult: data
                })
            })
        }, 200)
        this.setState({
            timer: timer,
        })
    }

    handleSelect = () => {
        this.clearQuery()
    }

    handleDeselect = () => {
        this.clearQuery()
    }

    handleBlur = () => {
        this.clearQuery()
    }

    clearQuery = () => {
        this.setState({
            query: ''
        })
    }

    loadTags = (params, callback) => {
        this.props.dispatch({
            type: 'wx_friends/tags',
            payload: {
                ...params,
            },
            callback: (data) => {
                if(this._isMounted) {
                    callback && callback(data)
                }
            }
        })
    }

    getOption = (tags) => {
        return tags.map((item) => {
            return <Option value={item.name} key={item.id}>{item.name}</Option>
        })
    }

    render() {
        const {placeholder, values, searchLoading} = this.props
        const {query, defaultTags, searchResult} = this.state
        const defaultTagsOption = this.getOption(defaultTags)

        return (
            <Select
                optionFilterProp="children"
                placeholder={placeholder}
                mode="multiple"
                tokenSeparators={[',']}
                style={{width: '100%'}}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
                onDeselect={this.handleDeselect}
                onSearch={this.handleSearch}
                onBlur={this.handleBlur}
                value={values}
                notFoundContent={searchLoading
                    ? <Spin size="small" />
                    : (query && !searchResult.length)
                        ? <p>未找到相关标签</p>
                        : null}
            >
                {query ? this.getOption(searchResult): defaultTagsOption}
            </Select>
        )
    }
}
