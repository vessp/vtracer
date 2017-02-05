// const electron = window.require('electron')
// const {ipcRenderer, shell, app} = electron
// const {dialog} = electron.remote
// const fs = window.require('fs')
// const axios = window.require('axios')
// const settings = window.require('electron-settings')
// import {trace, notify} from '../util/Tracer'
// const {exec} = window.require('child_process')
// import IO from '../util/IO'

// const config = ipcRenderer.sendSync('config')

// let webSocket = null
// let _dispatch = null

// function toReducer(type, payload) {
//     _dispatch({type, payload})
// }
// function toMain(type, payload) {
//     ipcRenderer.send(type, payload)
// }

// export function playGlobal(name) {
//     return (dispatch, getState) => {
//         webSocket.send(JSON.stringify({
//             type: 'play',
//             payload: name
//         }))
//     }
// }

export function init() {
    return (dispatch, getState) => {
        dispatch(connectSocket())
    }
}

export function connectSocket() {
    return (dispatch, getState) => {
        const webSocket = new WebSocket('ws://localhost:3000')
        webSocket.onopen = (event) => {
          console.log('WebSocket.onopen')
        }
        webSocket.onclose = (event) => {
          console.log('WebSocket.onclose')
          dispatch(connectSocket())
        }
        webSocket.onmessage = (event) => {
          const jparcel = event.data
          if(jparcel) {
              const parcel = JSON.parse(jparcel)
              // console.log('onParcel:', parcel.type, parcel.payload)
              if(parcel.type == 'trace') {
                  dispatch(onTrace(parcel.payload))
              }
          }
        }
        webSocket.onerror = (event) => {
          console.err('Socket Error: ' + JSON.stringify(event))
        }
    }
}

export function onTrace(a) {
    return (dispatch, getState) => {
        // console.log('onTrace', a)
        dispatch({type: 'trace', payload: a})
    }
}

export function setFilter(i, filter) {
    return (dispatch, getState) => {
        dispatch({type: 'setFilter', payload: {i,filter}})
    }
}

export function addFilter(filter) {
    return (dispatch, getState) => {
        dispatch({type: 'addFilter', payload: filter})
    }
}

export function doSocketConnect() {
    return (dispatch, getState) => {
        // webSocket = new WebSocket(config.URL_WEB_SOCKET)
        // webSocket.onopen = (event) => {
        //     toReducer('isSocketConnected', true)
        //     startPings(dispatch, getState)
        // }
        // webSocket.onclose = (event) => {
        //     toReducer('isSocketConnected', false)
        // }
        // webSocket.onmessage = (event) => {
        //     if(event.data) {
        //         const data = JSON.parse(event.data)
        //         // trace('onMessage:', data.type, data.message)
        //         if(data.type == 'playlist') {
        //             dispatch({type: 'playlist', payload: data.message})
        //         }
        //         else if(data.type == 'play') {
        //             dispatch(playLocal(data.message))
        //         }
        //         else if(data.type == 'userCount') {
        //             dispatch({type: 'userCount', payload: data.message})
        //         }
        //     }
        //     toReducer('lastMessageInstant', Date.now())
        // }
        // webSocket.onerror = (event) => {
        //     alert('Socket Error: ' + JSON.stringify(event))
        // }
    }
}

export function doSocketDisconnect() {
    return (dispatch, getState) => {
        // webSocket.close()
        // webSocket = null
    }
}