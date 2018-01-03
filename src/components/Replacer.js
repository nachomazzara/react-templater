import React from 'react'
import PropTypes from 'prop-types'

Replacer.propTypes = {
  updateReplacer: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  markup: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

export default function Replacer ({index, markup, value, updateReplacer}) {
  const normalizeMarkup = (markup) => markup.replace('{{','').replace('}}','')

  return <div key={index}>
    <label>{ normalizeMarkup(markup) }</label>
    <input type='text' value={value}
           onChange={(e) => updateReplacer(e, index, markup)}/>
  </div>
}