## Develop
#### Compiling scripts
```sh
sh local-compile.sh
```
#### Starting server
Run below in a separate terminal after scripts are compiled 
```sh
sh local-server.sh
```

#### GraphQL playground
After server started, GraphQL playground is available at:
http://localhost:4000/graphql


## Deploy

```sh
sh deploy.sh stack-name
```
> Example: `sh deploy.sh mike-dev`

### Config API Gateway manually for static resources
1. Create Resource
> /static
> 
> Enable API Gateway CORS: True

2. Create Child Resources for all files under static
> Configure as proxy resource: True
> 
> Resource Path `static_file_name_with_extension`
>
> Enable API Gateway CORS: True
3. Add Methods (e.g. GET, OPTION) for all files under child resources
> 
> Integration type: Lambda fn
> 
> Use Lambda Proxy Integration: true
4. Deploy API
> Choose stage of deployment (Prod)

## Environment Variable Settings

#### lambda/graphql/.env
```
NODE_ENV=development
ATLAS_URI=Your mongodb connection key
```
#### mongodb/.env
```
ATLAS_URI=Your mongodb connection key
ATLAS_DEV_URI=Mongodb connection key for dev
```
