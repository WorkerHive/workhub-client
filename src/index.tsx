import React, { useContext, useEffect } from 'react';
import { ApolloClient, gql, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { createUploadLink } from 'apollo-upload-client'
import { camelCase } from 'camel-case';
import { createContext, FC } from "react";
import CRUD from './crud';
import {YJS} from './yjs';

export { 
    YJS
}


export const useHubHook = (url : string) : [WorkhubClient | null, Error | null] => {
    const [ client, setClient ]  =  React.useState<any>(null);
    const [ error, setError ] = React.useState<Error | null>(null);
    
    useEffect(() => {
        async function startClient(url : string){
            console.log("Start client")
            try{
                if(window.hubClient){
                    console.log("Existing hub client", window.hubClient)
                    setClient(window.hubClient as WorkhubClient)
                }else{
                    let cli = new WorkhubClient(url);
                    window.hubClient = cli;
                    setClient(cli as WorkhubClient)

                    console.log(cli)
                }
                setError(null);
            }catch(e){
                console.error("Error setting up client", e)
                setClient(null);
                setError(e)
            }
        }
        async function stopClient(){
            console.log("Stop client")
            setClient(null);
            setError(null);
        }

        stopClient().then(() => startClient(url))
        return () => {
           //stopClient();
        }
    }, [url, setClient, setError])

    return [client, error];
}

export interface ProviderProps {
    children: any;
    args: any;
    url: string;
}

import { HubContext } from './context';

export const useHub = () => {
    const context = useContext(HubContext)
    return context
}

export const WorkhubProvider : FC<ProviderProps> = ({children, args, url}) => {
    const [ hub, err] = useHubHook(url);
    return (<HubContext.Provider value={[hub, err]}>{children instanceof Function ? children(hub, err) : children}</HubContext.Provider>)
}

export class WorkhubClient {
    private hubUrl: string;
    private client?: ApolloClient<NormalizedCacheObject>;
    private models?: Array<any> = [];

    public actions : any=  {};

    constructor(url?: string) {
        this.hubUrl = url || 'http://localhost:4002';      
        this.initClient()
        this.getModels().then((models) => {
            this.models = models;
            this.setupBasicReads();
        })
    }

    initClient(){
        console.debug('=> Setup client', this.hubUrl)
        this.client = new ApolloClient({
            link: createUploadLink({
                uri: `${this.hubUrl}/graphql`
            }),
            cache: new InMemoryCache({
                addTypename: false
            })
        })
    }

    getModels(){
        return this.client!.query({
            query: gql`
                query GetTypes { 
                    crudTypes { 
                        name
                        def
                    }
                }
            `
        }).then((r) => r.data.crudTypes).then((y) => y.map((x : any) => ({name: x.name, def: x.def})))
    }

    setupBasicReads(){
        this.actions = CRUD(this.models, this.client)
    }
}