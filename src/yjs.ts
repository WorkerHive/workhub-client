import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export class RealtimeSync {
    private doc = new Y.Doc();

    private websocketProvider = new WebsocketProvider(`wss://thetechcompany.workhub.services/yjs`, 'workhub', this.doc)

    public status: string = '';

    constructor(){
        this.websocketProvider.on('status', (e : any) => {
            console.log(e)
            this.status = e;
        })
    }
}
