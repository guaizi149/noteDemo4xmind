import React from 'react';
// import logo from './logo.svg';
import './App.css';
// import Chart from './note/chart'
import Chart from './account/account'
import 'moment/locale/zh-cn';


function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Chart></Chart>
      </header>
    </div>
  );
}

export default App;
