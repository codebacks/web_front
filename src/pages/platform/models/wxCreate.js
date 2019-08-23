/**
 **@Description:
 **@author: AmberYe
 */

import {
    wxdetail,
    getWxlistData,
    deleteWx,
    updateCreateObj,
    uploadBg,
    createWxcode,    
    cancleCreate,
    addWxNum,
    getWxlistDataNoId,
} from 'platform/services/wxCreate'
export default {
    namespace:'platform_create',
    state:{
        createForm:{},
        params:{
            limit: 10,
            offset: 0,
            id:''
        },
        choseWxList:[],
        total: 0,
        current: 1,
        token:'',
        loading: false,
        subloading:false,
        definedWxFormInfo:{}
    },
    effects:{
        * wxdetail({payload,callback},{select,call,put}){
            const data = yield call(wxdetail,payload)
            if(data){
                yield put({
                    type:'setProperty',
                    payload:{
                        createForm:data.data                        
                    },
                }) 
            }
            callback && callback()            
        },
        * getWxlistData({payload, callback}, {select, call, put}) {            
            let params = yield select(({platform_create}) => platform_create.params)            
            params = {...params,...payload.params}            
            if(payload.offset) {
                params.offset = params.limit * (payload.offset - 1)                
            }
            if(payload.id){              
                params.id = Number(payload.id) 
            }else{
                params.id = 0
            }
            const data = yield call(getWxlistData, params)
            if(data && data.meta.code === 200){
                yield put({
                    type: 'setProperty',
                    payload: {
                        choseWxList: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.offset === undefined ? 1 : payload.offset,
                    },
                })
            }
            callback && callback()
        },
        * getWxlistDataNoId({payload,callback},{select,call,put}) {
            let params = yield select(({platform_create}) => platform_create.params)            
            params = {...params,...payload.params}            
            if(payload.offset) {
                params.offset = params.limit * (payload.offset - 1)                
            }            
            const data = yield call(getWxlistDataNoId, params)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        choseWxList: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.offset === undefined ? 1 : payload.offset,
                    },
                })
            }
            callback && callback()
        },
        * deleteWx({payload,callback},{select,call,put}) {           
            const {meta} = yield call(deleteWx,payload)
            if(meta && meta.code === 200){
                yield put({
                    type:'setProperty',
                    payload:{},
                }) 
                
            }
            callback && callback(meta) 
        },
        * uploadBg({payload,callback},{select,call,put}) {
            yield put({type: 'showLoading'})          
            const {data,meta} = yield call(uploadBg,payload)
            if(data && meta){
                yield put({
                    type:'setProperty',
                    payload:{
                        token:data.token
                    },
                }) 
                callback && callback(data,meta)                
            }             
            yield put({type: 'hideLoading'})
        },
        * updateCreateObj({payload,callback},{select,call,put}){
            yield put({type: 'showSubLoading'})   
            const {meta} = yield call(updateCreateObj,payload.createForm)
            if(meta){
                yield put({
                    type:'setProperty',
                    payload:{}
                }) 
                callback && callback(meta) 
            }    
            yield put({type: 'hideSubLoading'})             
        },
        * createWxcode({payload,callback},{select,call,put}){
            yield put({type: 'showSubLoading'}) 
            const {meta} = yield call(createWxcode,payload.createForm)
            if(meta){
                yield put({
                    type:'setProperty',
                    payload:{},
                })
                callback && callback(meta)
            }            
            yield put({type: 'hideSubLoading'})
        },
        * cancleCreate({payload,callback},{select,call,put}){
            const data = yield call(cancleCreate,payload)          
            if(data && data.meta){
                callback && callback(data.meta)
            }
        },
        * addWxNum({payload,callback},{select,call,put}) {
            const {meta} = yield call(addWxNum,payload)
            yield put({
                type:'setProperty',
                payload:{
                    // choseWxList:data.data,
                },
            })
            callback && callback(meta)
        }
        
    },
    reducers:{
        setProperty(state,action){
            return {...state, ...action.payload}
        },
        setCreateForm(state, action) {
            const createForm = state.createForm
            const form = action.payload            
            Object.keys(form).forEach((key) => {
                createForm[key] = form[key]
            })
            return {
                ...state,
                ...{
                    createForm: createForm,
                },
            }
        },
        resetCreateForm(state,action) {
            return {
                ...state,
                createForm:{
                    name:'',
                    type:1,
                    subject:'',
                    description:'',
                    wxAccountCopy:1,
                    status:1,
                    token:'',
                    addChildQrcodeType:1,
                    bgImagePath:''
                },      
                choseWxList:[],
                total: 0,
                current: 1,
                token:'',  
                definedAddwx:[]
            }  
        },
        updateWxlist(state,action){
            const choseWxList = state.choseWxList
            return {
                ...state,
                ...{
                    choseWxList:choseWxList
                }
            }
        },
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        showSubLoading(state) {
            return {...state, subloading: true}
        },
        hideSubLoading(state){
            return {...state, subloading: false}
        },
    }
}
