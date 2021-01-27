import { type } from "os";

const nativeTypes = [ "Int", "String", "Boolean", "Float", "ID", "JSON", "Date", "Hash", "Upload"];
export const isNativeType = (typeName : string) => {
    return nativeTypes.indexOf(typeName) > -1;
}

export const rawType = (typeName: string) => {
    let type : string = typeName;
    let matchName = typeName.match(/\[(.*?)\]/);
    if(matchName != null){
        type = matchName[1]; 
    }
    return type;
}