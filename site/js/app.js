import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import promiseMiddleware from 'redux-promise-middleware'
import thunkMiddleware from 'redux-thunk'

import * as actions from './redux/actions'
import appReducer from './redux/reducers'
import Home from './components/Home'

const reducers = combineReducers({
  app:appReducer
})

const store = createStore(reducers, {}, applyMiddleware(
  thunkMiddleware,
  promiseMiddleware()
))

store.dispatch(actions.init())

class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <Home/>
      </Provider>
    )
  }
}

ReactDOM.render(
  <App/>,
  document.getElementsByClassName('body-content')[0]
)