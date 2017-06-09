import React from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import moment from 'moment'
// import ColorPicker from 'rc-color-picker'
import JSONTree from 'react-json-tree'

const treeTheme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: 'none', //'#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
}

function parseObjects(text) {
  const objs = []

  if(!text)
    return objs

  if(typeof text == 'object') {
    objs.push(text)
    return objs
  }

  let openBrace = -1
  for(let i=0; i<text.length; i++) {
    if(text[i] == '{' && openBrace == -1) {
      openBrace = i
    }
    else if(text[i] == '}' && openBrace != -1) {
      const subText = text.substring(openBrace, i+1)
      // console.log(openBrace, i, subText)
      let o
      try {o = JSON.parse(subText)} catch(e){}
      // console.log('o', o)
      if(o) {
        objs.push(o)
        openBrace = -1
      }
    }
  }
  // const matches = text.match(/\{[\s\S]*\}/i) //match all whitespace and non white space chars
  // if(matches) {
  //   const jsonText = matches[0]
  //   try {textJson = JSON.parse(jsonText)} catch(e){}
  // }

  return objs
}

class Home extends React.Component {
  constructor(props) {
    super(props)

    this.checkScroll = this.checkScroll.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onWheel = this.onWheel.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }
  
  componentDidUpdate(prevProps, prevState) {
    this.checkScroll()
  }

  checkScroll() {
    if(this.props.shouldScrollBottom) {
      const ele = ReactDOM.findDOMNode(this.refs.trailingDiv)
      if(ele)
        ele.scrollIntoView({behavior: "smooth"})
    }
  }

  onScroll(e) {

  }

  onClick(e) {
    this.checkScroll()

    //these delays trigger after the tree expands, can probably be improved upon by adding an expand listener to the tree object
    setTimeout(this.checkScroll, 200)
    setTimeout(this.checkScroll, 500)
  }

  onWheel(e) {
    const ele = e.currentTarget
    const height = ele.getBoundingClientRect().height
    const atBottom = ((ele.scrollTop + height) - ele.scrollHeight) > 10
    if(this.props.shouldScrollBottom != atBottom)
      this.props.actions.set({'shouldScrollBottom': atBottom})
  }

  onKeyDown(e) {
    // console.log('key', e.key, e.keyCode)
    if(e.key == ' ' || e.keyCode == 32) {
      this.props.actions.set({'shouldScrollBottom': !this.props.shouldScrollBottom})
    }
  }

  render () {
    const {filters, filteredTraces, actions, shouldScrollBottom, showingFilters, shouldReconnect, userCount, whiteSpace, jsonExpandLevel} = this.props

    return (
      <div className='home'>
        <div className='filters'>

          <div className='filters-controls'>
            <button className='btn btn-default' onClick={() => actions.set({showingFilters:!showingFilters})}>
              <i className={'fa' + (showingFilters?' fa-chevron-up':' fa-chevron-down')}/>
            </button>
            <button className='btn btn-default' onClick={() => actions.clearTraces()}>
              <i className='fa fa-ban'/>
            </button>
            {shouldScrollBottom
              ? <button className='btn btn-info' onClick={() => actions.set({'shouldScrollBottom': false})}><i className='fa fa-hand-o-down'/></button>
              : <button className='btn btn-danger' onClick={() => actions.set({'shouldScrollBottom': true})}><i className='fa fa-hand-paper-o'/></button>
            }

            {whiteSpace=='pre' && <button className='btn btn-default' onClick={() => actions.set({'whiteSpace': 'pre-wrap'})}><i className='fa fa-indent'/></button>}
            {whiteSpace=='pre-wrap' && <button className='btn btn-info' onClick={() => actions.set({'whiteSpace': 'nowrap'})}><i className='fa fa-align-left'/></button>}
            {whiteSpace=='nowrap' && <button className='btn btn-info' onClick={() => actions.set({'whiteSpace': 'pre'})}><i className='fa fa-list'/></button>}
            
            <button className='btn btn-default' onClick={() => actions.set({'jsonExpandLevel': jsonExpandLevel>=3?-1:jsonExpandLevel+1})}><i className='fa fa-level-down'/>{jsonExpandLevel}</button>
            <input type='text' className='form-control'
              value={this.props.searchText}
              onChange={e => actions.setSearchText(e.target.value)}/>
            {this.props.isSocketConnected
              ? <button className='btn btn-default' onClick={() => actions.toggleShouldReconnect()}><i className='fa fa-link'/>{shouldReconnect&&<i className='fa fa-bolt'/>}</button>
              : <button className='btn btn-danger' onClick={() => actions.toggleShouldReconnect()}><i className='fa fa-unlink'/>{shouldReconnect&&<i className='fa fa-bolt'/>}</button>
            }
            <button className='btn btn-default'><i className='fa fa-user'/>{' ' + (userCount==-1 ? '-' : userCount)}</button>
            <button className='btn btn-default' onClick={() => actions.createFilter()}>
              <i className='fa fa-plus'/>
            </button>
          </div>
          
          {showingFilters && filters.map((filter, i) => {
            const mod = (filter) => actions.setFilter(i, filter)
            return (
              <div key={i} className='filter'>
                {/*Filter On/Off*/}
                {filter.get('isActive')
                  ? <button className='btn btn-default' onClick={() => mod(filter.set('isActive', false))}><i className='fa fa-circle'/></button>
                  : <button className='btn btn-danger' onClick={() => mod(filter.set('isActive', true))}><i className='fa fa-circle-o'/></button>
                }

                {/*Query Level*/}
                {[null,'v','d','i','w','e'].map((level, i, a) => {
                    if(filter.get('queryLevel') != level)
                      return
                    const nextLevel = i==a.length-1 ? a[0] : a[i+1]
                    return <button className={'btn' + (level?' btn-info':' btn-default')} key={level}
                      onClick={() => mod(filter.set('queryLevel', nextLevel))}>
                      {level ? level.toUpperCase() : '--'}
                    </button>
                })}

                {/*Query Mode*/}
                {filter.get('queryMode') == 'contains' &&
                  <button className="btn btn-default" title='Plain'
                    onClick={() => mod(filter.set('queryMode', 'regex'))}>
                    P
                  </button>
                }
                {filter.get('queryMode') == 'regex' &&
                  <button className="btn btn-info" title='Regex'
                    onClick={() => mod(filter.set('queryMode', 'bundle'))}>
                    R
                  </button>
                }
                {filter.get('queryMode') == 'bundle' &&
                  <button className="btn btn-info" title='Bundle'
                    onClick={() => mod(filter.set('queryMode', 'contains'))}>
                    B
                  </button>
                }

                {/*Query*/}
                <input className='form-control' type='text' value={filter.get('query') || ''}
                  onChange={e => mod(filter.set('query', e.target.value))}
                  />

                {/*Visibility*/}
                {filter.get('show') == true &&
                  <button className="btn btn-info" onClick={() => mod(filter.set('show', false))}>S</button>
                }
                {filter.get('show') == false &&
                  <button className="btn btn-info" onClick={() => mod(filter.set('show', null))}>H</button>
                }
                {filter.get('show') == null &&
                  <button className="btn btn-default" onClick={() => mod(filter.set('show', true))}>--</button>
                }

                {/*Styles*/}
                <input className='form-control style-control' type='text' value={filter.getIn(['style', 'color']) || ''}
                  onChange={e => mod(filter.setIn(['style', 'color'], e.target.value))}
                  />
                <input className='form-control style-control' type='text' value={filter.getIn(['style', 'background']) || ''}
                  onChange={e => mod(filter.setIn(['style', 'background'], e.target.value))}
                  />

                {/*Order*/}
                <button className='btn btn-default' onClick={() => actions.swapFilters(i, i-1)}>
                  <i className='fa fa-arrow-up'/>
                </button>
                <button className='btn btn-default' onClick={() => actions.swapFilters(i, i+1)}>
                  <i className='fa fa-arrow-down'/>
                </button>

                {/*Remove*/}
                <button className='btn btn-default' onClick={() => actions.removeFilter(i)}>
                  <i className='fa fa-remove'/>
                </button>
              </div>
            )
          })}
        </div>
        <div className='traces' onScroll={this.onScroll} onClick={this.onClick} onWheel={this.onWheel} onKeyDown={this.onKeyDown}>
          {filteredTraces.map((trace, i, list) => {
            const style = trace.get('style') ? trace.get('style').toJS() : {}

            const timestamp = moment(trace.get('instant')).format('HH:mm:ss')//.format('YYYY-MM-DD HH:mm:ss')
            const bundle = trace.get('bundle')
            const level = trace.get('level')
            const text = trace.get('text')
            // console.log(trace)
            const parsedObjects = parseObjects(text)

            return (
              <div className={'trace ' + level} key={i}
                style={{background:style.background}}>
                <span className='trace-timestamp'>{timestamp}</span>
                <span className='trace-bundle'>{bundle}</span>
                <span className='trace-level'>{level.toUpperCase()}</span>
                {parsedObjects.map((o,i) => (
                    <span className='trace-json' key={i}>
                      <JSONTree 
                        data={o}
                        theme={treeTheme}
                        invertTheme={false}
                        shouldExpandNode={(keyName, data, level) => level<=jsonExpandLevel} 
                        />
                    </span>
                ))}
                <span className={'trace-text'} style={{color:style.color, whiteSpace:whiteSpace}}>{text}</span>
              </div>
            )
          })}
          <div id='trailingDiv' ref='trailingDiv'/>
        </div>
      </div>
    )
  }
}

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../redux/actions'
export default connect(
  (state) => {
    //map store to props
    return {
      searchText: state.app.get('searchText'),
      shouldScrollBottom: state.app.get('shouldScrollBottom'),
      whiteSpace: state.app.get('whiteSpace'),
      jsonExpandLevel: state.app.get('jsonExpandLevel'),
      filteredTraces: state.app.get('filteredTraces'),
      filters: state.app.get('filters'),
      showingFilters: state.app.get('showingFilters'),
      isSocketConnected: state.app.get('isSocketConnected'),
      shouldReconnect: state.app.get('shouldReconnect'),
      userCount: state.app.get('userCount'),
    }
  },
  (dispatch) => {
    //map dispatch to props
    return {
      actions: bindActionCreators(actions, dispatch)
    }
  }
)(Home)