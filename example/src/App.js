import React from 'react';
import logo from './logo.svg';
import {WorkhubClient, WorkhubProvider, useHub, YJS} from '@workerhive/client'
import Test from './components/test'
import './App.css';

function App() {
YJS();
  const [ actions, setActions ] = React.useState([])
  const context = useHub()
  React.useEffect(() => {
    console.log(context)
    setTimeout(() =>{
        console.log(context)
/*      let a = [];
      for(var k in client.actions){
        a.push(k) 
      }
  client.actions.getProjects().then((r) => console.log(r))
      client.actions.getProject("df797084-9fca-4de1-853b-d912d8eca6d1").then((r) => console.log(r))
      setActions(a);

      */

    // client.actions.addProject({name: "A project to test with"}).then((r) => {
     //  console.log(r)
//    
 //    })
    }, 1000)
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
