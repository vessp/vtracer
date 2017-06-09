import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import {createAppStore} from './redux/store'
import * as actions from './redux/actions'
import Home from './components/Home'

const store = createAppStore()
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