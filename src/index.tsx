import React, { useContext, useEffect, useReducer } from 'react';
import { ApolloClient, gql, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { createUploadLink } from 'apollo-upload-client'
import { camelCase } from 'camel-case';
import { createContext, FC } from "react";
import { clientReducer } from './store';
import CRUD from './crud';
import {YJS} from './yjs';

export { 
    YJS
}



export const useHubHook = (url : string) : [WorkhubClient | null, any, Boolean, Error | null] => {
    const [ client, setClient ]  =  React.useState<any>(null);
    const [ isReady, setReady ] = React.useState<boolean>(false);
    const [ error, setError ] = React.useState<Error | null>(null);

    const [{store}, dispatch] = React.useReducer(clientReducer, {store: {}})


    useEffect(() => {
        async function startClient(url : string){
            console.log("Start client")
            try{
                if(window.hubClient){
                    console.log("Existing hub client", window.hubClient)
                    if(!window.hubClient.lastUpdate || window.hubClient.lastUpdate?.getTime() < new Date().getTime() - 15 * 60 * 1000){
                        window.hubClient.setup(dispatch).then(() => {
                            //Maybe check time since last update?
                            setClient(window.hubClient as WorkhubClient)
                            setReady(true)
                        })
                    }
                }else{
                    let cli = new WorkhubClient(url);
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

        stopClient().then(() => startClient(url))
        return () => {
           //stopClient();
        }
    }, [url, setClient, setError, setReady])

    return [client, store, isReady, error];
}

export interface ProviderProps {
    children: any;
    args?: any;
    url: string;
}

import { HubContext } from './context';

export const useHub = () => {
    const context = useContext(HubContext)
    return context
}

export const WorkhubProvider : FC<ProviderProps> = ({children, args, url}) => {
    const [ hub, store, isReady, err] = useHubHook(url);
    return (<HubContext.Provider value={[hub, store, isReady, err]}>{children instanceof Function ? children(hub, store, isReady, err) : children}</HubContext.Provider>)
}

export class WorkhubClient {
    public lastUpdate: Date | null = null;

    private hubUrl: string;
    private client?: ApolloClient<NormalizedCacheObject>;
    public models?: Array<any> = [];

    public actions : any = {};
    constructor(url?: string, setup_fn?: Function, dispatch?: any) {
        this.hubUrl = url || 'http://localhost:4002';      
        this.initClient()

        if(setup_fn){
            this.getModels().then((models) => {
                this.models = models;
                this.setupBasicReads(dispatch);
                setup_fn();
            })
        }
    }

    async setup(dispatch: any){
        let models = await this.getModels();
        this.models = models;
        this.setupBasicReads(dispatch);
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

    async getModels(){
        this.lastUpdate = new Date();
        let result = await this.client!.query({
            query: gql`
                query GetTypes { 
                    crudTypes { 
                        name
                        def
                    }
                }
            `
        })
        
        return result.data.crudTypes.map((x: any) => ({name: x.name, def: x.def}))
    }

    setupBasicReads(dispatch: any){
        this.actions = CRUD(this.models, this.client, dispatch)
    }
}