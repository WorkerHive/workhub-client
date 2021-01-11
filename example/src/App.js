import React from 'react';
import logo from './logo.svg';
import {WorkhubClient} from '@workerhive/client'
import './App.css';

const client = new WorkhubClient();

function App() {

  const [ actions, setActions ] = React.useState([])

  React.useEffect(() => {
    setTimeout(() =>{
      let a = [];
      for(var k in client.actions){
        a.push(k) 
      }
  client.actions.getProjects().then((r) => console.log(r))
      client.actions.getProject("df797084-9fca-4de1-853b-d912d8eca6d1").then((r) => console.log(r))
      setActions(a);
    // client.actions.addProject({name: "A project to test with"}).then((r) => {
     //  console.log(r)
//    
 //    })
    }, 1000)
  }, [])

  return (
    <div>
        {actions.map((x) => (
          <div style={{paddingBottom: 8, marginBottom: 12, marginTop: 12, paddingLeft: 12, borderBottom: '1px solid black'}}>{x}</div>
        ))}
    </div>
  );
}

export default App;
