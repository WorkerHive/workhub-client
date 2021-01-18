import { gql } from '@apollo/client';
import { camelCase } from 'camel-case';
import { isNativeType, rawType } from './utils';

export default (models: any, client?: any) => {
    let actions: any = {};

    //Takes a type model and iterates over available keys, if key isn't native getFields will be called again to fill out the query fields
    const getFields = (type : any) => {
        return type.def.map((x: any) => {
            let raw = rawType(x.type);

            if(isNativeType(raw)){
                return x.name                
            }else{
                console.log("Mapping another type fields", raw, models, x.type);
                return `
                    ${x.name} {
                        ${getFields(models[raw])}
                    }
                `
            }
        }).join(`\n`)
    }

    models.forEach((model: any) => {
        actions[`add${model.name}`] = (item: any) => {
            return client!.mutate({
                mutation: gql`
            mutation Add${model.name}($input: ${model.name}Input){
                add${model.name}(${camelCase(model.name)}: $input){
                    ${getFields(model)}
                }
            }
        `,
                variables: {
                    input: item
                }
            }).then((r: any) => r.data[`add${model.name}`])
        }

        actions[`delete${model.name}`] = (id: string) => {
            return client!.mutate({
                mutation: gql`
            mutation Delete${model.name}($id: ID){
                delete${model.name}(id: $id)
            }
        `,
                variables: {
                    id: id
                }
            }).then((r: any): any => r.data[`delete${model.name}`])
        }

        actions[`update${model.name}`] = (id: string, update: any) => {
            return client!.mutate({
                mutation: gql`
            mutation Update${model.name}($id: ID, $update: ${model.name}Input){
                update${model.name}(${camelCase(model.name)}: $update, id: $id){
                    ${getFields(model)}
                }
            }
            `,
                variables: {
                    id,
                    update
                }
            }).then((r: any) => r.data[`update${model.name}`])
        }

        actions[`get${model.name}`] = (id: any) => {
            return client!.query({
                query: gql`
            query Get${model.name}($id: ID){
                ${camelCase(model.name)}(id: $id) {
                    ${getFields(model)}
                }
            }
        `,
                variables: {
                    id: id
                }
            }).then((r: any) => r.data[`${camelCase(model.name)}`])
        }

        actions[`get${model.name}s`] = () => {
            return client!.query({
                query: gql`
            query Get${model.name}s {
                ${camelCase(model.name)}s {
                    ${getFields(model)}
                }
            }
        `
            }).then((r: any) => r.data[`${camelCase(model.name)}s`])
        }
    })
    return actions;

}