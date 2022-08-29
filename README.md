# CUtopia
This is the source code for [cutopia.app](cutopia.app).

CUtopia is a course review and timetable planning website for CUHK students. It provides a platform for students to share their opinions and pick the course that best fits them.

## Installation

Install `node.js` and `yarn`, then run `yarn` to install dependencies.

## Scripts

Bootstrap (install all dependencies):

`yarn bootstrap`

Start frontend dev server:

`yarn fe dev`

## Contributing

We'd love to accept your contributions to this project, you are welcomed to submit your issues and pull requests (rebase) to this project.

The master branch is connected with [cutopia.app](cutopia.app), any updates on master branch will rebuild the production website. Similar to master branch, the dev branch is linked with [dev.cutopia.app](dev.cutopia.app).

You can come and join our [telegram group](https://t.me/+Al8YBqRRLxg1Yzll) to discuss suggestions and new features.

If you want to join the development team (with access to AWS, GA, Sentry, and the database), you can [email us](mailto::cutopia.app@gmail.com) with your resume / github profile.

## Guidelines

### Semester Data Update
1. Run the course scraper (and modify current term config) to generate static data & derived data

2. In the course scraper dir, run the `sh tools/move_data.sh {timestamp}` to copy data into CUtopia-data. Then gc and push the data.

3. Backend: `git submodule update --remote`

4. Frontend: run `yarn update-data` to update data, THEN modify the current term & expire before in config.ts after BE deployed
