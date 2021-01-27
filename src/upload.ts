import { camelCase } from 'camel-case';
import gql from 'graphql-tag';
import { isNativeType, rawType } from "./utils";

export default (models: any, client?: any, dispatch?: any) => {
    let actions: any = {};

    const getFields = (type : any, parent?: any) => {
        return type.def.map((x: any) => {
            let raw = rawType(x.type);

            if(isNativeType(raw)){
                return x.name                
            }else{
                let model = models.filter((a: any) => a.name == raw)[0];

                //Recursion blocker, hopefully stops some of the circular references
                if(!parent || parent.name != raw){
                    return `
                        ${x.name} {
                            ${getFields(model, type)}
                        }
                    `
                }
            }
        }).join(`\n`)

    }
    
    models.forEach((model: any) => {
        console.log(model)
        if(model){
        const fields = getFields(model)

        actions[`get${model.name}s`] = async () => {
            let result = await client.query({
                query: gql`
                    query Get${model.name}s {
                        ${camelCase(model.name)}s{
                            ${fields}
                        }
                    }
                `,
            })
            return result.data[`${camelCase(model.name)}s`]
        }

        actions[`add${model.name}`] = async (file: any) => {
            let result = await client.mutate({
                mutation: gql`
                    mutation Add${model.name}($file: Upload){
                        add${model.name}(file: $file){
                            ${fields}
                        }
                    }
                `,
                variables: {
                    file: file
                }
            })
            return result.data[`add${model.name}`]
        }

        actions[`delete${model.name}`] = async (id: any) => {
            let result = await client.mutate({
                mutation: gql`
                    mutation Delete${model.name}($id: ID){
                        delete${model.name}(id: $id){
                            ${fields}
                        }
                    }
                `,
                variables: {
                    id: id
                }
            })
            return result.data[`delete${model.name}`]
        }
    }
    })
    return actions;
}