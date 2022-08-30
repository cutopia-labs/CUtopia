# CUtopia
This is the source code for [cutopia.app](cutopia.app).

CUtopia is a course review and timetable planning website for CUHK students. It provides a platform for students to share their opinions and pick the course that best fits them.

## Packages

Install [node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/).

For backend development, install: [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [Docker](https://www.docker.com/).

## Scripts

### Bootstrap (install all dependencies):

```bash
yarn bootstrap
```

After bootstrapping, replace `ATLAS_PROD_URI` and `ATLAS_DEV_URI` in the backend/.env file with your MongoDB connection URI.

### Start frontend dev server:

```bash
yarn fe dev
```

### Start backend dev server:

```bash
# watch and compile files
yarn be watch

# run the server in a separate terminal
yarn be dev
```

## Contributing

We'd love to accept your contributions to this project, you are welcomed to submit your issues and pull requests to **dev branch**.

The master branch is connected with [cutopia.app](cutopia.app), any updates on master branch will rebuild the production website. Similar to master branch, the dev branch is linked with [dev.cutopia.app](dev.cutopia.app).

You can come and join our [telegram group](https://t.me/+Al8YBqRRLxg1Yzll) to discuss suggestions and new features.

If you want to join the development team (with access to AWS, GA, Sentry, and the database), you can [email us](mailto::cutopia.app@gmail.com) with your resume / github profile.

## Guidelines

### Semester Data Update

Open `tools/data.ipynb` and run all sections

### Incorrect Data Correction

Please submit PR / issue in [cutopia-data](https://github.com/cutility/CUtopia-data) repo.

