// import checkPagesPermission from 'dvaConfig/actions/checkPagesPermission'
import {globalActionsType} from 'utils/dva'

export function config() {
    return {
        onError(err) {
            err.preventDefault()
            console.error(err)
            // message.error(err.message)
        },
        initialState: {},
        onAction: [
            // checkPagesPermission
        ],
        onReducer(combineReducers) {
            return (state, action) => {
                if (action.type === globalActionsType.logout) {
                    const {routing} = state
                    state = {routing}
                } else if (action.type === globalActionsType.resetState) {
                    const {namespace} = action.payload
                    delete state[namespace]
                }

                return combineReducers(state, action)
            }
        },
    }
}
