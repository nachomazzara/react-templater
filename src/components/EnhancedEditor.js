import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MarkupModal from './MarkupModal'
import { Editor } from 'react-draft-wysiwyg';

import { EditorState, convertToRaw, Modifier } from 'draft-js'
import StateToPdfMake from 'draft-js-export-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from "pdfmake/build/vfs_fonts"

import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'


class CustomOption extends Component {
  constructor (props) {
    super(props)
    this.addDiamond = this.addDiamond.bind(this)
  }
  static propTypes = {
    onChange: PropTypes.func,
    editorState: PropTypes.object,
  }

  addDiamond () {
    const { editorState, onChange } = this.props;
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      '{{markup}}',
      editorState.getCurrentInlineStyle(),
    );
    onChange(EditorState.push(editorState, contentState, 'insert-characters'));
  }

  render() {
    return (
      <div className='rdw-dropdown-wrapper'>
        <a className='rdw-dropdown-selectedtext' onClick={this.addDiamond}>
          <span>{'{{ }}'}</span>
        </a>
      </div>
    )
  }
}


class EnhancedEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editorState: EditorState.createEmpty(),
      isOpen: false,
      markups: [],
    }

    this.onEditorStateChange = this.onEditorStateChange.bind(this)
    this.save = this.save.bind(this)
    this.replace = this.replace.bind(this)
    this.generate = this.generate.bind(this)
    this.onRequestClose = this.onRequestClose.bind(this)
  }

  onEditorStateChange (editorState) {
    this.setState({
      editorState,
    })
  }

  replace (toReplace, index) {
    return JSON.parse(Object.keys(this.state.replacers[index]).reduce((text, key) =>
        text.replace(new RegExp(`${key}`, 'g'), this.state.replacers[index][key])
      , JSON.stringify(toReplace)))
  }

  save () {
    const content = convertToRaw(this.state.editorState.getCurrentContent())
    this.state.replacers.forEach((replacer, index) => {
      const raw = this.replace(content, index)
      const pdfMaker = new StateToPdfMake(raw)
      const pdfmakeContents = pdfMaker.generate()
      pdfMake.vfs = pdfFonts.pdfMake.vfs
      pdfMake.createPdf(pdfmakeContents).download(`example${index}.pdf`)
    })
  }

  generate () {
    const content = this.state.editorState.getCurrentContent()
    const rex = new RegExp("{{.*?}}", "g")
    const matchesArray = JSON.stringify(convertToRaw(content)).match(rex)
    this.setState({
      markups: matchesArray ? matchesArray.filter((item, pos, arr) => arr.indexOf(item) === pos) : [],
      isOpen: true
    })
  }

  onRequestClose () {
    this.setState({
      isOpen: false
    })
  }

  render () {
    const { isOpen, editorState, markups } = this.state
    return <div>
      <Editor
      editorState={editorState}
      wrapperClassName="wrapper"
      editorClassName="editor"
      onEditorStateChange={this.onEditorStateChange}
      toolbar={{
        options: ['inline', 'blockType'],
      }}
      toolbarCustomButtons={[<CustomOption />]} />
      <button className='btn' onClick={this.generate}>{ 'Generate!' }</button>
      { isOpen && <MarkupModal markups={markups}
                               isOpen={isOpen}
                               onRequestClose={this.onRequestClose}
                               save={this.save}/> }
    </div>
  }
}

export default EnhancedEditor