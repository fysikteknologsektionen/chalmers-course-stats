# Chalmers Course Statistics

This is a simple web app for viewing grade statistics of courses at [Chalmers University of Technology](https://chalmers.se).

The data is provided by Chalmers via a Excel document obtained by email which lists **all** the results of **all** courses.

This app also provides [a public REST API](API.md).

# Installation

## Requirements

- [Node.js](https://nodejs.org)
- [MongoDB](https://mongodb.com)

## Setup

*Note that these instructions are specific for ftek.se.*

To install run these commands:

```bash
cd /srv/stats
git clone https://github.com/Fysikteknologsektionen/chalmers-course-stats/ .
npm install
npm run build
```

To have the app always running you will now create two systemd services:

- `mongod.service` - database
- `node-course-statistics.service` - node.js

This can be done by using [this configuration for mongod](https://gist.github.com/jwilm/5842956) and following [this guide for node](https://www.axllent.org/docs/view/nodejs-service-with-systemd/). Some tweaks might be neccesary to get it working for this specific app. For example the node service should start `node server.js` in our case.

**NOTE** The data is currently obtained by manual email as Chalmers does not publish it as a online document anymore.

# Software updates

Updates are handled automatically on ftek.se by a PHP script that runs upon a push event via GitHub Webhooks.

However if you want to manually update run these commands:

```bash
cd /srv/stats
git fetch
git reset --hard FETCH_HEAD
chown www-data:www-data -R *
npm install
npm run build
sudo /bin/systemctl restart node-course-statistics
```

A [webhook script](https://gist.github.com/gka/4627519) has been setup so deployment should happen upon a GitHub push event.

# Database updates

The database is updated manually by running the following commands after placing the relevant excel document of results in the `statistics` folder:
```bash
cd /srv/stats/statistics
node importResults.js
```

Below are the old way of importing things. **You should not need to use them.**
```bash
cd /srv/stats/statistics/
mongo --eval "db.dropDatabase();"
node addFields.js
```

# Development

## Contributions, bug reports and suggestions

If you would like to contribute or send feedback, please [create an issue](https://github.com/Fysikteknologsektionen/chalmers-course-stats/issues/new) first.

## Set up development environment

Run these commands:

```bash
cd /path/to/development/directory
git clone https://github.com/Fysikteknologsektionen/chalmers-course-stats/
npm install
```

To start the server run (in separate terminals)
- `mongod` (use `mongod --dbpath` to run the database from the same folder instead of on root level)
- `npm start`
- `node server.js`

If you find yourself with some error after running `node server.js` running `npm run build` before might fix it.

and then point your browser to [localhost:3000/stats/](http://localhost:3000/stats/). Any updates to any file will automatically refresh the browser.

# Credits

This app was created by [Jan Liu](https://github.com/fsharpasharp/) who was inspired by Johan Bowald's [exam statistics page](http://tenta.bowald.se). With the help of [Johan Winther](https://github.com/JohanWinther) the app was ported over to Fysikteknologsektionen's website ([ftek.se/stats](https://ftek.se/stats)).

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
You can find a guide on how to setup and use React [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
