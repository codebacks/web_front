
export default {
    namespace: 'home_index',
    state: {
        wechatCustomStatics: {
            customCount: {
                today: 0,
                yesterday: 0,
                dayBeforeYesterday: 0
            }
        }
    },
    effects: {
        
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}