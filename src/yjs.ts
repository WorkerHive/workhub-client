import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import 'websocket-polyfill'

export class RealtimeSync {
    public doc = new Y.Doc();

    private websocketProvider;

    public status: string = '';

    constructor(url: string){
        this.websocketProvider = new WebsocketProvider(`wss://${url}/yjs`, 'workhub', this.doc)

        this.websocketProvider.on('status', (e : any) => {
            this.status = e.status;
        })
    }

    pushArray(arrKey: string, items: any[]){
        const arr = this.doc.getArray(arrKey)  
        arr.push(items)
    }

    getArray(key: string, model: any){
        return new RealtimeArray(this.doc.getArray(key), model)
    }

    getMap(){

    }
}

export class RealtimeArray {
    private array: Y.Array<any>;
    private model: any;

    constructor(yArray: Y.Array<any>, model: any){
        this.array = yArray;
        this.model = model;
    }

    push(content: any[]){
        content = content.map((x) => {
            console.log("Content", x)
            if(typeof(x) === 'object'){
                console.log("Object", x)
                Object.keys(x).map((key) => {
                    console.log("Object key", x, key)
                    if(x[key] instanceof Date){
                        x[key] = x[key].getTime();
                    }
                })
            }
            return x;
        })
        this.array.push(content)
      //  super.push(content)
    }

    toArray(){
        return this.array.toArray().map((x) => {
            Object.keys(x).map((key) => {
              console.log(this.model)
                if(this.model && this.model.defs && this.model.defs.filter((a : any) => a.name == key)[0].type == "Date"){
                    x[key] = new Date(x[key])
                }
            })
            return x;
        })
    }
}


export class RealtimeMap {
    
}
