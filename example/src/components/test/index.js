import React from 'react';

import { useHub } from '@workerhive/client'

export default function Test(props){
    const [ hub, err] = useHub()

    console.log(hub.actions.getWorkflows().then((r) => console.log(r)))

    return (

        <div>

            
        </div>
    )
}