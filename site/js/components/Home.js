import React from 'react'
import axios from 'axios'

class Home extends React.Component {
  constructor(props) {
    super(props)

    this.onChangeQuery = this.onChangeQuery.bind(this)
  }

  onChangeQuery(i, e) {
    let filter = this.props.filters.get(i)
    filter = filter.set('query', e.target.value)
    this.props.actions.setFilter(i, filter)
  }

  render () {
    const {filters, traces} = this.props

    let filteredTraces = traces.filter(t => {
      const tText = t.get('text')
      let passed = true

      filters.forEach(f => {
        const fQuery = f.get('query')
        if(fQuery && tText.toLowerCase().indexOf(fQuery.toLowerCase()) == -1)
          passed = false
      })

      return passed
    })

    return (
      <div className='home'>
        
        <div className='filters'>
          <div>
            {filters.map((filter, i) => {
              return (
                <div key={i}>
                  <input type='text' value={filter.get('query') || ''} 
                    onChange={e => this.onChangeQuery(i, e)}/>
                </div>
              )
            })}
          </div>
          <button onClick={() => this.props.actions.addFilter({})}>
            +
          </button>
        </div>
        <ul className='lines'>
          {filteredTraces.map((trace, i) => {
            return <li key={i}>{trace.get('text')}</li>
          })}
        </ul>
        <button onClick={() => axios.post('http://localhost:3000/traces', 
          {trace:{instant: Date.now(), text:'myPostedTrace'}})}>
          Send
        </button>
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