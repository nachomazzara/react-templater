import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';
import EnhancedEditor from './components/EnhancedEditor'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to the best markup templater online</h1>
        </header>
        <p className="App-intro">
          {`1 - Write you template with the markups you want
            2 - Once you are done with the markup click on 'Generate'
            3 - Fill the inputs with the desire value adding more blocks to generate multiple files if needed
            4 - Click on 'Export at PDF
            5 - You are done dude!`}
        </p>
        <EnhancedEditor />
      </div>
    )
  }
}

export default App
