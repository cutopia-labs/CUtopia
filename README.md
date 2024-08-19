# CUtopia

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/cutopia.app)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:cutopia.app@gmail.com)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/+Al8YBqRRLxg1Yzll)

[CUtopia](https://cutopia.app/) is an open-source course review and timetable planning platform used by thousands of CUHK students.

### Planner Demo

<a href="https://youtu.be/kduL-toYHmo" target="_blank">
 <img src="https://img.youtube.com/vi/kduL-toYHmo/maxresdefault.jpg" alt="Planner Demo Video" width="480" border="10" />
</a>

## Packages

Install [node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/).

## Scripts

For Windows users, please run the following scripts in [Git Bash](https://git-scm.com/downloads).

### Bootstrap (install all dependencies)

```bash
yarn bootstrap
```

### Start frontend dev server

```bash
yarn fe dev
```

### Start backend dev server

```bash
# watch and compile files
yarn be watch

# run the server in a separate terminal
yarn be dev
```

## Contributing

We'd love to accept your contributions to this project, you are welcome to submit your issues and pull requests to **dev branch** after reading the [contributing guide](/CONTRIBUTING.md) .

The master branch is connected with [cutopia.app](cutopia.app), any updates on the master branch will rebuild the production website. Like the master branch, the dev branch is linked with [dev.cutopia.app](dev.cutopia.app).

You can follow us on [Instagram](https://www.instagram.com/cutopia.app/) and DM us to discuss suggestions and new features.

If you want to join the development team (with access to AWS, GA, Sentry, and the database), please [email us](mailto:cutopia.app@gmail.com) with your GitHub profile/resume.

## Guidelines

### Semester Data Update

Open `tools/data.ipynb` and run all sections

### Incorrect Data Report

Please submit PR / issue in the [cutopia-data](https://github.com/cutopia-labs/CUtopia-data) repo.
