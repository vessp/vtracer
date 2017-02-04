const Immutable = require('immutable')

// import {trace} from '../util/Tracer'
// import IO from '../util/IO'
// const fs = window.require('fs')

// const config = ipcRenderer.sendSync('config')

const initialState = Immutable.fromJS({
    traces: [],
})

function appReducer(state = initialState, action) {
    const {type, payload} = action
    let newState
    // trace('reducer', type, payload)
    // console.log('state', state, state.get('traces'))

    switch (type) {
    case 'trace':
        let traces = state.get('traces')
        traces = traces.push(payload)
        newState = state.set('traces', traces)
        return newState
    default:
        return state
    }
}

export default appReducer