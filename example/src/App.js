import React from 'react';
import logo from './logo.svg';
import {WorkhubClient, WorkhubProvider, useHub, YJS} from '@workerhive/client'
import Test from './components/test'
import './App.css';

function App() {
YJS();
  const [ actions, setActions ] = React.useState([])

  React.useEffect(() => {

  }, [])

  return (
    <WorkhubProvider url="http://localhost:4002">
      
      <Test />
    <div>
        {actions.map((x) => (
          <div style={{paddingBottom: 8, marginBottom: 12, marginTop: 12, paddingLeft: 12, borderBottom: '1px solid black'}}>{x}</div>
        ))}
    </div>
    </WorkhubProvider>

  );
}

export default App;
