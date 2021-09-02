## Develop
#### Starting server
```sh
sh local.sh
```
#### Watching logs
```sh
sh watch-log.sh
```

#### GraphQL playground
After server started, GraphQL playground is available at:
http://127.0.0.1:3000/graphql


## Deploy

```sh
sh deploy.sh stack-name
```
> Example: `sh deploy.sh mike-dev`


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
