# CUtopia

The source code for [cutopia.app](cutopia.app).

CUtopia is a course review and timetable planning website for CUHK students. It provides a platform for students to share their opinions and pick the course that best fits them.

Planner Demo Video:

<a href="https://youtu.be/kduL-toYHmo" target="_blank">
 <img src="https://img.youtube.com/vi/kduL-toYHmo/maxresdefault.jpg" alt="Planner Demo Video" width="480" border="10" />
</a>

## Packages

Install [node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/).

## Scripts

For Windows users, please run the following scripts in [Git Bash](https://git-scm.com/downloads).

### Bootstrap (install all dependencies):

```bash
yarn bootstrap
```

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

We'd love to accept your contributions to this project, you are welcomed to submit your issues and pull requests to **dev branch** after read the [contributing guide](/CONTRIBUTING.md) .

The master branch is connected with [cutopia.app](cutopia.app), any updates on master branch will rebuild the production website. Similar to master branch, the dev branch is linked with [dev.cutopia.app](dev.cutopia.app).

You can come and join our [telegram group](https://t.me/+Al8YBqRRLxg1Yzll) to discuss suggestions and new features.

If you want to join the development team (with access to AWS, GA, Sentry, and the database), please [email us](mailto::cutopia.app@gmail.com) with your resume / github profile.

## Guidelines

### Semester Data Update

Open `tools/data.ipynb` and run all sections

### Incorrect Data Correction

Please submit PR / issue in [cutopia-data](https://github.com/cutopia-labs/CUtopia-data) repo.
