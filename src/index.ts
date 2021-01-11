import { ApolloClient, gql, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { createUploadLink } from 'apollo-upload-client'
import { camelCase } from 'camel-case';
import CRUD from './crud';


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
                    mutableTypes { 
                        name
                        def
                    }
                }
            `
        }).then((r) => r.data.mutableTypes).then((y) => y.map((x : any) => ({name: x.name, def: x.def})))
    }

    setupBasicReads(){
        this.actions = CRUD(this.models, this.client)
    }
}