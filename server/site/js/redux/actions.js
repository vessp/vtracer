import Immutable from 'immutable'
import {dispatch, tightenDispatch, getState, asyncAction} from './store'
import config from '../config'

const get = (...getIn) => getState('app', ...getIn)
const send = tightenDispatch('cheekySet')

let webSocket = null
let numConnectFails = 0

const FLUSH_THROTTLE = 500 //update delay in ms
const MAX_NUM_TRACES = 300 //list item limit

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
    send('userCount', -1)

    // if(numConnectFails <= 6){
    //   setTimeout(() => {
    //     dispatch(doSocketConnect())
    //   }, 30000)
    // } else {
    //   console.log('retry connection count exceeded, refresh the page to try again')
    // }

    if(get('shouldReconnect')) //manual reconnect control
      setTimeout(() => dispatch(doSocketConnect()), 1000)
  }
  webSocket.onmessage = (event) => {
    const jparcel = event.data
    if(jparcel) {
      const parcel = JSON.parse(jparcel)
      if(parcel.type == 'trace') {
        recordTrace(parcel.payload)
      } else if(parcel.type == 'userCount') {
        send('userCount', parcel.payload)
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

const _recordedTraces = []
let _lastFlush = 0
let _flushTimer = null
function recordTrace(trace) {
  _recordedTraces.push(trace)
  if(_flushTimer) {
    // console.log('  case3')
    return
  }

  // if(Date.now() - _lastFlush > FLUSH_THROTTLE) {
  //   console.log('  case1')
  //   flushTraces()
  // } 
  // else {
    // console.log('  case2')
    _flushTimer = setTimeout(() => {
      flushTraces()
      _flushTimer = null
    }, FLUSH_THROTTLE)
  // }
}

export const flushTraces = () => {
  _lastFlush = Date.now()
  // console.log('  flushTraces')

  //empty _recordedTraces array
  let pendingTraces = _recordedTraces.splice(0, _recordedTraces.length)

  pendingTraces = pendingTraces.map(trace => {
    //set default values in case the trace was malformed
    
    let text
    try {
      text = JSON.parse(trace.text)//we do JSON.parse here to unescape the slashes in the current trace.text
    } catch(e) {
      text = trace.text
    }

    trace.text = (text || JSON.stringify(trace)) + '' //ensuring string
    trace.bundle = trace.bundle || 'unspecified'
    trace.instant = trace.instant || Date.now()
    trace.level = trace.level || 'd'
    return Immutable.fromJS(trace)
  })

  let traces = get('traces')
  traces = traces.push(...pendingTraces)
  traces = traces.sortBy(t => t.get('instant'))
  
  //limit list size
  traces = traces.slice(traces.size-MAX_NUM_TRACES, traces.size)

  send({traces})
  runFiltering()
}

export const clearTraces = asyncAction(() => {
  send('traces', Immutable.fromJS([]))
  runFiltering()
})

export const setSearchText = asyncAction(val => {
  send('searchText', val)
  runFiltering()
})

export const setFilter = asyncAction((i, filter) => {
  let filters = get('filters')
  filters = filters.set(i, filter)
  send({filters})
  runFiltering()
})

export const createFilter = asyncAction(filter => {
  filter = filter || {}
  filter.query = filter.query || ''
  filter.queryMode = filter.queryMode || 'contains'
  filter.isActive = filter.isActive == undefined ? true : filter.isActive
  filter.style = filter.style || {}

  let filters = get('filters')
  filters = filters.push(Immutable.fromJS(filter))
  send({
    showingFilters: true,
    filters
  })
  runFiltering()
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
  runFiltering()
})

export const removeFilter = asyncAction(i => {
  let filters = get('filters')
  filters = filters.remove(i)
  send({filters})
  runFiltering()
})

export const toggleShouldReconnect = asyncAction(i => {
  const shouldReconnect = get('shouldReconnect')
  if(!shouldReconnect && !get('isSocketConnected'))
    send(doSocketConnect())

  send({shouldReconnect:!shouldReconnect})
})


//-----------------------------------------------------------------------
function runFiltering() {
  const traces = get('traces')
  const filters = get('filters')
  const searchText = get('searchText')

  const activeFilters = filters.filter(f => f.get('isActive'))

  let filteredTraces = traces
  if(searchText) {
    filteredTraces = filteredTraces.filter(t => {
      const text = t.get('bundle') + t.get('text') //search in bundle and text
      return text.toLowerCase().indexOf(searchText.toLowerCase()) != -1
    })
  }
  filteredTraces = filteredTraces.filter(t => {
      let showing = true
      activeFilters.forEach(f => {
        if(selects(f, t)) {
          const show = f.get('show')
          if(show != null)
            showing = show
        }
      })
      return showing
    })
    .map(t => {
      const tText = t.get('text')
      activeFilters.forEach(f => {
        if(selects(f, t)) {
          t = t.mergeIn(['style'], f.get('style'))
        }
      })
      return t
    })
  send({filteredTraces})
}

function selects(f, t) {
  const tText = t.get('text')
  const tLevel = t.get('level')
  const fQuery = f.get('query')
  const fQueryLevel = f.get('queryLevel')
  const fQueryMode = f.get('queryMode')

  let levelPass = true
  if(fQueryLevel && fQueryLevel.toLowerCase() != tLevel.toLowerCase())
    levelPass = false

  let queryPass = false
  if(fQueryMode == 'contains') {
    if(tText.toLowerCase().indexOf(fQuery.toLowerCase()) != -1)
      queryPass = true
  }
  else if(fQueryMode == 'regex') {
    try {
      const fQueryReg = new RegExp(fQuery, 'g')
      if(tText.match(fQueryReg) != null)
        queryPass = true
    } catch(e) {
      //handle invalid regex
      console.log(e)
    }
  }
  else if(fQueryMode == 'bundle') {
    const tBundle = t.get('bundle')
    if(tBundle.toLowerCase().indexOf(fQuery.toLowerCase()) != -1)
      queryPass = true
  }

  return levelPass && queryPass
}
