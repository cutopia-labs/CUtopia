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
