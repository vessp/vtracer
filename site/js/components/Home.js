import React from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import moment from 'moment'
// import ColorPicker from 'rc-color-picker'
import Tracer, {register, logv} from '../Tracer'

class Home extends React.Component {
  constructor(props) {
    super(props)

    this.selects = this.selects.bind(this)
  }

  selects(f, t) {
    const tText = t.get('text')
    const fQuery = f.get('query')
    const fQueryMode = f.get('queryMode')

    if(fQuery) {
      if(fQueryMode == 'contains') {
        if(tText.toLowerCase().indexOf(fQuery.toLowerCase()) != -1)
          return true
      }
      else if(fQueryMode == 'regex') {
        try {
          const fQueryReg = new RegExp(fQuery, 'g')
          if(tText.match(fQueryReg) != null)
            return true
        } catch(e) {
          //handle invalid regex
          console.log(e)
        }
      }
      else if(fQueryMode == 'level') {
        const tLevel = t.get('level')
        if(tLevel.toLowerCase().indexOf(fQuery.toLowerCase()) != -1)
          return true
      }
    }

    return false
  }

  componentDidMount() {
    Tracer.register('ws://localhost:3000', 'com.vessp.app1')
    setInterval(() => {
      Tracer.logv('[MyComponent] myTraceMessage-' + Math.random())
    }, 1000)
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.shouldScrollBottom) {
      const ele = ReactDOM.findDOMNode(this.tracesDiv)
      // ele.scrollIntoView({behavior: "smooth"})
      ele.scrollTop = 99999
    }

    if(!this.addedScrollListener) {
      this.addedScrollListener = true
      const ele = ReactDOM.findDOMNode(this.tracesDiv)
      ele.addEventListener('mousewheel', e => {
        const height = ele.getBoundingClientRect().height
        const atBottom = Math.abs((ele.scrollTop + height) - ele.scrollHeight) < 10
        const shouldScrollBottom = this.props.shouldScrollBottom
        if(shouldScrollBottom != atBottom)
          this.props.actions.set({'shouldScrollBottom': atBottom})
      })
    }
  }

  render () {
    const {filters, traces, actions, shouldScrollBottom} = this.props

    const activeFilters = filters.filter(f => f.get('isActive'))

    let filteredTraces = traces
      .filter(t => {
        return t.get('bundle').indexOf(this.props.bundleQuery) != -1
      })
      .filter(t => {
        let showing = true
        activeFilters.forEach(f => {
          if(this.selects(f, t)) {
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
          if(this.selects(f, t)) {
            t = t.set('style', f.get('style'))
          }
        })
        return t
      })

    // console.log('filteredTraces', filteredTraces.toJS())

    return (
      <div className='home'>
        <div className='filters'>

          <div className='filters-controls'>
            <button className='btn btn-default' onClick={() => actions.clearTraces()}>
              <i className='fa fa-ban'/>
            </button>
            <input type='text' className='form-control'
              value={this.props.bundleQuery}
              onChange={e => actions.setBundleQuery(e.target.value)}/>
            {shouldScrollBottom
              ? <button className='btn btn-info' onClick={() => actions.set({'shouldScrollBottom': false})}><i className='fa fa-hand-o-down'/></button>
              : <button className='btn btn-danger' onClick={() => actions.set({'shouldScrollBottom': true})}><i className='fa fa-hand-paper-o'/></button>
            }
            <button className='btn btn-default' onClick={() => actions.createFilter()}>
              <i className='fa fa-plus'/>
            </button>
          </div>
          
          {filters.map((filter, i) => {
            const mod = (filter) => actions.setFilter(i, filter)
            return (
              <div key={i} className='filter'>
                {filter.get('isActive')
                  ? <button className='btn btn-info' onClick={() => mod(filter.set('isActive', false))}><i className='fa fa-circle'/></button>
                  : <button className='btn btn-default' onClick={() => mod(filter.set('isActive', true))}><i className='fa fa-circle-o'/></button>
                }
                <input className='form-control' type='text' value={filter.get('query') || ''}
                  onChange={e => mod(filter.set('query', e.target.value))}
                  />
                {filter.get('queryMode') == 'contains' &&
                  <button className="btn btn-default" onClick={() => mod(filter.set('queryMode', 'level'))}>P</button>
                }
                {filter.get('queryMode') == 'level' &&
                  <button className="btn btn-success" onClick={() => mod(filter.set('queryMode', 'regex'))}>L</button>
                }
                {filter.get('queryMode') == 'regex' &&
                  <button className="btn btn-danger" onClick={() => mod(filter.set('queryMode', 'contains'))}>R</button>
                }
                {filter.get('show') == true &&
                  <button className="btn btn-success" onClick={() => mod(filter.set('show', false))}>S</button>
                }
                {filter.get('show') == false &&
                  <button className="btn btn-danger" onClick={() => mod(filter.set('show', null))}>H</button>
                }
                {filter.get('show') == null &&
                  <button className="btn btn-default" onClick={() => mod(filter.set('show', true))}>--</button>
                }
                <input className='form-control style-control' type='text' value={filter.getIn(['style', 'color']) || ''}
                  onChange={e => mod(filter.setIn(['style', 'color'], e.target.value))}
                  />
                <input className='form-control style-control' type='text' value={filter.getIn(['style', 'background']) || ''}
                  onChange={e => mod(filter.setIn(['style', 'background'], e.target.value))}
                  />
                <button className='btn btn-default' onClick={() => actions.swapFilters(i, i-1)}>
                  <i className='fa fa-arrow-up'/>
                </button>
                <button className='btn btn-default' onClick={() => actions.swapFilters(i, i+1)}>
                  <i className='fa fa-arrow-down'/>
                </button>
                <button className='btn btn-default' onClick={() => actions.removeFilter(i)}>
                  <i className='fa fa-remove'/>
                </button>
              </div>
            )
          })}
        </div>
        <div className='traces' ref={ref => this.tracesDiv = ref}>
          {filteredTraces.map((trace, i) => {
            const style = trace.get('style') ? trace.get('style').toJS() : {}

            const timestamp = moment(trace.get('instant')).format('YYYY-MM-DD HH:mm:ss')
            const level = trace.get('level')
            const text = trace.get('text')

            return (
              <button className={'trace ' + level} key={i} type="button"
                style={{background:style.background}} title={trace.get('bundle')}>
                <span className='trace-timestamp'>{timestamp}</span>
                <span className='trace-level'>{level.toUpperCase()}</span>
                <span className='trace-text' style={{color:style.color}}>{text}</span>
              </button>
            )
          })}
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
      bundleQuery: state.app.get('bundleQuery'),
      shouldScrollBottom: state.app.get('shouldScrollBottom'),
      traces: state.app.get('traces'),
      filters: state.app.get('filters'),
    }
  },
  (dispatch) => {
    //map dispatch to props
    return {
      actions: bindActionCreators(actions, dispatch)
    }
  }
)(Home)