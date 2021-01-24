import React, { useContext, useEffect, useReducer } from 'react';
import { ApolloClient, gql, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client'
import { camelCase } from 'camel-case';
import { createContext, FC } from "react";
import { clientReducer } from './store';
import CRUD from './crud';
import {YJS} from './yjs';

export { 
    YJS
}



export const useHubHook = (url : string, token: string) : [WorkhubClient | null, any, Boolean, Error | null] => {
    const [ client, setClient ]  =  React.useState<any>(null);
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

import { HubContext } from './context';

export const useHub = () => {
    const context = useContext(HubContext)
    return context
}

export const WorkhubProvider : FC<ProviderProps> = ({children, token, url}) => {
    const [ hub, store, isReady, err] = useHubHook(url, token || '');
    return (<HubContext.Provider value={[hub, store, isReady, err]}>{children instanceof Function ? children(hub, store, isReady, err) : children}</HubContext.Provider>)
}

export class WorkhubClient {
    public lastUpdate: Date | null = null;

    private hubUrl: string;
    private client?: ApolloClient<NormalizedCacheObject>;
    public models?: Array<any> = [];

    private accessToken?: string;

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

    setAccessToken(token: string){
        this.accessToken = token
    }

    async setup(dispatch: any){
        let models = await this.getModels();
        this.models = models;
        this.setupBasicReads(dispatch);
    }

    private authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
        const token = localStorage.getItem('token');
    // return the headers to the context so httpLink can read them
        return {
        headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
        }
       }
    });

    initClient(){
        console.debug('=> Setup client', this.hubUrl)
        this.client = new ApolloClient({
            link: this.authLink.concat(createUploadLink({
                uri: `${this.hubUrl}/graphql`
            })),
            cache: new InMemoryCache({
                addTypename: false
            })
        })
    }

    authenticate(username: string, password: string){
        return fetch(`${this.hubUrl}/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                strategy: 'jwt',
                username: username,
                password: password
            })
        }).then((r) => r.json())
    }

    async query(query : string, variables : object = {}){
        let result = await this.client!.query({
            query: gql`${query}`,
            variables: variables
        })
        return result;
    }
    
    async mutation(query: string, variables: object = {}){
        let result = await this.client!.mutate({
            mutation: gql`${query}`,
            variables: variables
        })
        return result;
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


        this.actions['getStoreTypes'] = async () => {
            let result = await this.query(`
                query GetStoreTypes{
                    storeTypes {
                        id
                        name
                        description
                    }
                }
            `)
            dispatch({type: `GETS_StoreType`, data: result.data.storeTypes})
            return result.data.storeTypes;
        }
        this.actions['getStores'] = async () => {
            let result = await this.query(`
                query GetStores {
                    integrationStores{
                        id
                        name
                        host
                        user
                        pass
                        dbName
                        type
                    }
                }
            `)
            dispatch({type: `GETS_IntegrationStore`, data: result.data.integrationStores})
            return result.data.integrationStores;
        }
        this.actions['addStore'] = async (store: any) => {
            let result = await this.mutation(`
                mutation AddStore($store: IntegrationStoreInput){
                    addIntegrationStore(integrationStore: $store){
                        id
                        name
                        host
                        user
                        pass
                        dbName
                        type
                    }
                }
            `, {
                store: store
            })
            dispatch({type: `ADD_IntegrationStore`, data: result.data.addIntegrationStore})
            return result.data.addIntegrationStore;
        }
        this.actions['updateStore'] = async (id: string, store: any) => {
            let result = await this.mutation(`
                mutation UpdateStore($id: String, $store: IntegrationStoreInput) {
                    updateIntegrationStore(id: $id, integrationStore: $store){
                        id
                        name
                        host
                        user
                        pass
                        dbName
                        type
                    }
                }
            `, {
                store: store,
                id: id
            })
            dispatch({type: `UPDATE_IntegrationStore`, data: result.data.updateIntegrationStore, id: id})
            return result.data.updateIntegrationStore
        }
        this.actions['deleteStore'] = async (id: string) => {
            let result = await this.mutation(`
                mutation DeleteStore($id: String){
                    deleteIntegrationStore(id: $id)
                }
            `, {
                id: id
            })
            dispatch({type: `DELETE_IntegrationStore`, id: id})
            return result.data.deleteIntegrationStore;
        }
    }
}