import Immutable from 'immutable'
import {dispatch, tightenDispatch, getState, asyncAction} from './store'
import config from '../config'

const get = (...getIn) => getState('app', ...getIn)
const send = tightenDispatch('cheekySet')

let webSocket = null
let numConnectFails = 0

//----------------------------------------------------------------
export const init = asyncAction(() => {
  // console.log('config', config)

  if(config.isDevelopment) {
    document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
    ':35729/livereload.js?snipver=1"></' + 'script>')
  }

  dispatch(doSocketConnect())
})

export const doSocketConnect = asyncAction(() => {
  webSocket = new WebSocket((location.protocol == 'https:'?'wss:':'ws:') + '//' + location.host)

  webSocket.onopen = (event) => {
    numConnectFails = 0
    send('isSocketConnected', true)
  }
  webSocket.onclose = (event) => {
    numConnectFails++
    send('isSocketConnected', false)

    if(numConnectFails <= 6){
      setTimeout(() => {
        dispatch(doSocketConnect())
      }, 30000)
    } else {
      console.log('retry connection count exceeded, refresh the page to try again')
    }
  }
  webSocket.onmessage = (event) => {
    const jparcel = event.data
    if(jparcel) {
      const parcel = JSON.parse(jparcel)
      if(parcel.type == 'trace') {
          dispatch(pushTrace(parcel.payload))
      }
    }
  }
  webSocket.onerror = (event) => {
    console.log('Socket Error: ' + JSON.stringify(event))
  }
})

export const set = asyncAction(obj => {
  send(obj)
})

export const pushTrace = asyncAction(trace => {
  let traces = get('traces')
  traces = traces.push(Immutable.fromJS(trace))
  traces = traces.sortBy(t => t.get('instant'))
  send({traces})
})

export const clearTraces = asyncAction(() => {
  send('traces', Immutable.fromJS([]))
})

export const setBundleQuery = asyncAction(val => {
  send('bundleQuery', val)
})

export const setFilter = asyncAction((i, filter) => {
  let filters = get('filters')
  filters = filters.set(i, filter)
  send({filters})
})

export const createFilter = asyncAction(filter => {
  filter = filter || {}
  filter.query = filter.query || ''
  filter.queryMode = filter.queryMode || 'contains'
  filter.isActive = filter.isActive == undefined ? true : filter.isActive
  filter.style = filter.style || {}

  let filters = get('filters')
  filters = filters.push(Immutable.fromJS(filter))
  send({filters})
})

export const swapFilters = asyncAction((fromIndex, toIndex) => {
  let filters = get('filters')
  if(toIndex < 0 || toIndex > filters.size-1)
    return

  let fromFilter = filters.get(fromIndex)
  let toFilter = filters.get(toIndex)
  filters = filters.set(toIndex, fromFilter)
  filters = filters.set(fromIndex, toFilter)
  send({filters})
})

export const removeFilter = asyncAction(i => {
  let filters = get('filters')
  filters = filters.remove(i)
  send({filters})
})