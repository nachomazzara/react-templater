import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Card from './Card'
import Replacer from './Replacer'
import Modal from 'react-modal'


class MarkupModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      replacers: [{}],
    }
    this.updateReplacer = this.updateReplacer.bind(this)
    this.addReplacer = this.addReplacer.bind(this)
    this.removeReplacer = this.removeReplacer.bind(this)
  }

  static propTypes = {
    markups: PropTypes.array.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  addReplacer () {
    this.setState({
      replacers: [...this.state.replacers, {}]
    })
  }

  removeReplacer (index) {
    this.setState({
      replacers: this.state.replacers.slice(index)
    })
  }

  updateReplacer (e, index, markup) {
    const { replacers } = this.state
    let newR = [...replacers]
    newR.splice(index, 1, Object.assign({}, replacers[index], {
      [markup]: e.target.value,
    }))
    this.setState({
      replacers: newR
    })
  }

  render () {
    const { markups, isOpen, onRequestClose, save } = this.props
    const { replacers } = this.state
    const canSave = !!replacers.filter(replacer => {
      console.log(Object.keys(replacer).filter(key => !replacer[key]).length > 0)
      return Object.keys(replacer).filter(key => !replacer[key] || replacer[key].length === 0).length
    })

    console.log(canSave)

    return <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      { replacers.map((replacer, index) =>
        <Card key={index} handleDelete={this.removeReplacer}>
          { markups.map((markup) =>
            <Replacer key={index}
                      index={index}
                      markup={markup}
                      value={replacer[markup]}
                      updateReplacer={this.updateReplacer} />
          ) }
        </Card>
      ) }
      <button className='btn' onClick={this.addReplacer} >{'Add Another Card'}</button>
      <button className='btn' disabled={false /* canSave */} onClick={save}>{'Export To PDF'}</button>
    </Modal>
  }
}

export default MarkupModal