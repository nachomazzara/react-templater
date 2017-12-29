import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Editor } from 'react-draft-wysiwyg';
import Modal from 'react-modal'

import { EditorState, convertToRaw, Modifier } from 'draft-js'
import StateToPdfMake from 'draft-js-export-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from "pdfmake/build/vfs_fonts"

import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'


class CustomOption extends Component {
  constructor () {
    super()
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
      '{{DYNAMIC_TEXT_HERE}}',
      editorState.getCurrentInlineStyle(),
    );
    onChange(EditorState.push(editorState, contentState, 'insert-characters'));
  }

  render() {
    return (
      <button onClick={this.addDiamond}>{'{{ }}'}</button>
    )
  }
}


class EnhancedEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editorState: EditorState.createEmpty(),
      isOpen: false,
      inputs: [],
      replacers: [{}],
    }

    this.onEditorStateChange = this.onEditorStateChange.bind(this)
    this.save = this.save.bind(this)
    this.replace = this.replace.bind(this)
    this.generate = this.generate.bind(this)
    this.closeModal = this.closeModal.bind(this)
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
    const raw = convertToRaw(content)
    var str = JSON.stringify(raw).replace(`<%name%>`, 'nacho')
    var rex = new RegExp("{{.*?}}", "g")
    var matchesArray = str.match(rex)
    this.setState({
      isOpen: true,
      inputs: matchesArray ? matchesArray.filter((item, pos, arr) => arr.indexOf(item) === pos) : []
    })
  }

  closeModal () {
    this.setState({
      isOpen: false
    })
  }

  render () {
    return <div>
      <Editor
      editorState={this.state.editorState}
      wrapperClassName="wrapper"
      editorClassName="editor"
      onEditorStateChange={this.onEditorStateChange}
      toolbarCustomButtons={[<CustomOption />]} />
      <button onClick={this.generate}>{ 'Generate!' }</button>
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>

      <button onClick={this.save}>{ 'Save this shit!' }</button>

      { this.state.replacers.map((r, index) =>
        <div key={index}>
          { this.state.inputs.map((input) =>
            <div key={index}>
              <label>{input.replace('{{','').replace('}}','')}</label>
              <input type='text' value={this.state.replacers[index][input]}
                     onChange={(e) => {
                       let newR = [...this.state.replacers]
                       newR.splice(index, 1, Object.assign({}, this.state.replacers[index], {
                         [input]: e.target.value,
                       }))
                       this.setState({
                         replacers: newR
                       })
                     }}/>
            </div>
          ) }
          <button onClick={() => this.setState({
            replacers: [...this.state.replacers, {}]
          })} >{`+`}</button>
        </div>
      )
      }
    </Modal>
    </div>
  }
}

export default EnhancedEditor