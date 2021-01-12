import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const YJS = () => {
    let ydoc = new Y.Doc();

    let websocketProvider = new WebsocketProvider(`wss://thetechcompany.workhub.services/yjs`, 'workhub', ydoc)

    websocketProvider.on('status', (e : any) => {
        console.log(e)
    })
}
