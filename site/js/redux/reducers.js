const Immutable = require('immutable')

// import {trace} from '../util/Tracer'
// import IO from '../util/IO'
// const fs = window.require('fs')

// const config = ipcRenderer.sendSync('config')

const initialState = Immutable.fromJS({
    traces: [],
    filters: [{}],
})

function appReducer(state = initialState, action) {
    const {type, payload} = action
    let newState
    // trace('reducer', type, payload)
    // console.log('state', state, state.get('traces'))

    switch (type) {
    case 'trace':
        const trace = Immutable.fromJS(payload)
        let traces = state.get('traces')
        traces = traces.push(trace)
        traces = traces.sortBy(t => t.get('instant'))
        newState = state.set('traces', traces)
        return newState
    case 'setFilter':
        const {i, filter} = payload
        let filters = state.get('filters')
        filters = filters.set(i, filter)
        newState = state.set('filters', filters)
        return newState
    case 'addFilter':
        filters = state.get('filters')
        filters = filters.push(Immutable.fromJS(payload))
        newState = state.set('filters', filters)
        return newState
    default:
        return state
    }
}

export default appReducer