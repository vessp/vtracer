import React from 'react'

class Home extends React.Component {
  render () {
    return (
      <div>
        Home
        <ul>
            {this.props.traces.map((trace, i) => {
              return <li key={i}>{trace}</li>
            })}
        </ul>
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
        }
    },
    (dispatch) => {
        //map dispatch to props
        return {
            // actions: bindActionCreators(actions, dispatch)
        }
    }
)(Home)