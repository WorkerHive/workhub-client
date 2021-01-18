import React from 'react';

import { useHub } from '@workerhive/client'

export default function Test(props){
    const [ hub, isReady, err] = useHub()

    React.useEffect(() => {
        setTimeout(() => {
            if(isReady){
                hub.actions.getPageLayout('Contact').then((contacts) => {
                    console.log(contacts)
                })
            }
        }, 500)
    }, [])

    return (

        <div>

            
        </div>
    )
}