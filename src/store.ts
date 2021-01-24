type State = {
    store: any
}

type Action = {
    type: string,
    data: any
    id?: string
}

export function clientReducer(state : State, action : Action): State {
    let actionParts = action.type.match(/[^_]*/g)
    if(!actionParts) return state;
    actionParts = actionParts.filter((a) => a.length > 0)
    
    let store = Object.assign({}, state.store || {})
 
    if(!store[actionParts[1]]) store[actionParts[1]] = [];
    let ix = action.id != null ? store[actionParts[1]].map((x: any) => x.id).indexOf(action.id) : null;

    switch(actionParts[0]){
        case 'ADD':
            console.log(actionParts, store)
            store[actionParts[1]] = store[actionParts[1]].concat([action.data])
            return {store: store}
        case 'GET':
            if(ix > -1){
                store[actionParts[1]][ix] = action.data
            }else{
                store[actionParts[1]] = store[actionParts[1]].concat([action.data])
            }
            return {store: store};
        case 'GETS':
            store[actionParts[1]] = action.data;       
            return {store: store}
        case 'UPDATE':
            if(ix > -1){
                let _part = store[actionParts[1]].slice()
                _part[ix] = {
                    ..._part[ix],
                    ...action.data
                } 
                console.log("Update", ix, action.data)
                store[actionParts[1]] = _part;
            }
            return {store};
        case 'DELETE':
            if(ix > -1){
                let part = store[actionParts[1]].slice()
                part.splice(ix, 1)
                store[actionParts[1]] = part;
            }
            return {store};
    }
    return state;
}
