import { createStore, combineReducers, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import thunkMiddleware from 'redux-thunk'
import Immutable from 'immutable'

import appReducer from './reducer'

let store = null
const dynamicReducers = {}

function getAllReducers() {
  return combineReducers({
    app:appReducer,
    // ...dynamicReducers //why can't i do this?
  })
}

//CREATE STORE------------------------------------------------------------

export function createAppStore() {
  store = createStore(getAllReducers(), {}, 
    applyMiddleware(
      thunkMiddleware,
      promiseMiddleware()
    )
  )
  return store
}

//DYNAMIC REDUCERS--------------------------------------------------------

export function addDynamicReducer(name, reducer) {
  if(dynamicReducers[name])
    console.warn('addDynamicReducer(): warning dynamic reducer with name ' + name + ' already exists')

  dynamicReducers[name] = reducer
  store.replaceReducer(getAllReducers())
}

export function removeDynamicReducer(name) {
  if(!dynamicReducers[name])
    console.warn('removeDynamicReducer(): warning dynamic reducer with name ' + name + ' does not exists')

  // delete dynamicReducers[name]
  // when i deleted the reducer, redux printed an error in the console
  // so instead of completely deleting the reducer, i will just clear it
  dynamicReducers[name] = (state) => Immutable.Map({})
  store.replaceReducer(getAllReducers())
}

//HELPERS----------------------------------------------------------------

export function dispatch(...args) {
  const numArgs = args.length
  const a0 = args[0]
  const a1 = args[1]

  // console.log(args.map(a => typeof a), args)

  if(typeof a0 == 'function') {
    console.assert(numArgs==1, 'unexpected dispatch args')
    return store.dispatch(a0) //a0 is an action
  }
  else if(typeof a0 == 'string') {
    const type = a0
    if(numArgs == 1) {
      return store.dispatch({type:type})
    }
    else {
      let payload = args[numArgs-1]
      //loop through the args building up the payload object
      for(let i=numArgs-2; i>=1; i--) {
        // console.assert(typeof args[i] == 'string', 'unexpected dispatch args')
        payload = {[args[i]]:payload}
      }
      return store.dispatch({type:type, payload:payload})
    }
  }
  else {
    throw new Error('unexpected dispatch args')
  }
}

export function tightenDispatch(...tighteningArgs) {
  return (...dispatchArgs) => {
    if(dispatchArgs.length == 1 && (typeof dispatchArgs[0] == 'function' || typeof dispatchArgs[0] == 'string'))
      return dispatch(...dispatchArgs)
    else
      return dispatch(...tighteningArgs, ...dispatchArgs)
  }
}

export function getState(reducerName, ...getInArgs) {
  const state = store.getState()

  if(reducerName && !state[reducerName])
    console.warn('reducer with name "' + reducerName + '" does not exist')

  if(reducerName && getInArgs && getInArgs.length > 0)
    return state[reducerName].getIn(getInArgs)
  else if(reducerName)
    return state[reducerName]
  else
    return state
}
window.gs = getState //TODO disable 

export function asyncAction(func) {
  return (...args) => {
    return (_dispatch, _getState) => {
      func(...args)
    }
  }
}