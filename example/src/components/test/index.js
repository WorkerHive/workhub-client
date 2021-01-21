import React from 'react';

import { useHub, store } from '@workerhive/client'

export default function Test(props){
    const [ hub, store, isReady, err] = useHub()
    console.log("STORE", store, store['PageLayout'])
    React.useEffect(() => {
        setTimeout(() => {
            if(isReady){
                console.log("IS READY")
                hub.actions.addContact({name: "Ross Tester"})
                hub.actions.getContacts()
            }
        }, 2000)
    }, [])

    return (

        <div>

            
        </div>
    )
}