import React, { useContext, Context, createContext, useEffect, useReducer } from 'react';
import { WorkhubClient } from '.';
import { clientReducer } from './store';

declare global {
    interface Window {
        hubClient? :WorkhubClient
    }
}

const HubContext = React.createContext<[WorkhubClient | null, any, Boolean, Error | null]>([null, {}, false, null])


export const WorkhubProvider = ({children, token, url} : ProviderProps) => {
    const [ hub, store, isReady, err ] = useHubHook(url, token || '');
    
    return (
        <HubContext.Provider value={[hub, store, isReady, err]} >
            {typeof(children) === 'function' ? children(hub, store, isReady, err) : children}
        </HubContext.Provider>
    )
}

export const useHubHook = (url : string, token: string) : [WorkhubClient | null, any, Boolean, Error | null] => {
    const [ client, setClient ] = React.useState<any>(null);
    const [ isReady, setReady ] = React.useState<boolean>(false);
    const [ error, setError ] = React.useState<Error | null>(null);

    const [{store}, dispatch] = React.useReducer(clientReducer, {store: {}})


    useEffect(() => {
        async function startClient(url : string, token: string){
            console.log("Start client")
            try{
                if(window.hubClient){
                    console.log("Existing hub client", window.hubClient)
                    window.hubClient.setAccessToken(token)
                    if(!window.hubClient.lastUpdate || window.hubClient.lastUpdate?.getTime() < new Date().getTime() - 15 * 60 * 1000){

                        window.hubClient.setup(dispatch).then(() => {
                            //Maybe check time since last update?
                            setClient(window.hubClient as WorkhubClient)
                            setReady(true)
                        })
                    
                    }
                }else{
                    let cli = new WorkhubClient(url);
                    cli.setAccessToken(token)
                    cli.setup(dispatch).then(() => {
                        window.hubClient = cli;
                        setClient(cli as WorkhubClient)
                        setReady(true)
                    });
                }
                setError(null);
            }catch(e){
                console.error("Error setting up client", e)
                setClient(null);
                setReady(false)
                setError(e)
            }
        }
        async function stopClient(){
            console.log("Stop client")
            setClient(null);
            setReady(false)
            setError(null);
        }

        stopClient().then(() => startClient(url, token))
        return () => {
           //stopClient();
        }
    }, [url, setClient, setError, setReady])

    return [client, store, isReady, error];
}

export interface ProviderProps {
    children: any;
    token?: string;
    url: string;
}

export const useHub = () => {
    const context = useContext(HubContext)
    return context
}
