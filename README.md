# Chalmers Course Statistics
This is a simple web app for viewing grade statistics of courses at [Chalmers University of Technology](https://chalmers.se).

The data is provided by Chalmers via a public [Excel document](http://document.chalmers.se/doc/00000000-0000-0000-0000-00001C968DC6) which lists **all** the results of **all** courses...

This app also provides [a public REST API](API.md).

# Installation
## Requirements
- [Node.js](https://nodejs.org)
- [MongoDB](https://mongodb.com)

## Setup
*Note that these instructions are specific for ftek.se.*

To install run these commands:
```bash
cd /srv/websites/statistics
git clone https://github.com/Fysikteknologsektionen/chalmers-course-stats/ .
npm install
npm run build
chmod +x statistics/update.sh
```

To have the app always running you will now create two systemd services:
- `mongod.service` - database
- `node-course-statistics.service` - node.js

This can be done by using [this configuration for mongod](https://gist.github.com/jwilm/5842956) and following [this guide for node](https://www.axllent.org/docs/view/nodejs-service-with-systemd/). Some tweaks might be neccesary to get it working for this specific app. For example the node service should start `node server.js` in our case.

To get continuous database updates you need to setup a cron job.
Here is an example that will run `update.sh` every second day.:

`0 0 1-31/2 * * /srv/websites/statistics/statistics/update.sh /srv/websites/statistics/statistics >/dev/null 2>&1`


# Software updates
Updates are handled automatically on ftek.se by a PHP script that runs upon a push event via GitHub Webhooks.

However if you want to manually update run these commands:
```bash
cd /srv/websites/statistics
git stash
git pull
npm install
npm run build
systemctl restart node-course-statistics
```
A [webhook script](https://gist.github.com/gka/4627519) has been setup so deployment should happen upon a GitHub push event.

# Database updates
If the cron job is set up correctly then you don't need to do this.

However these are the commands for a manual update:
```bash
cd /srv/websites/statistics/statistics/
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
- `mongod`
- `npm start`
- `node server.js`

and then point your browser to [localhost:3000/stats/](http://localhost:3000/stats/). Any updates to any file will automatically refresh the browser.

# Credits
This app was created by [Jan Liu](https://github.com/fsharpasharp/) who was inspired by Johan Bowald's [exam statistics page](http://tenta.bowald.se). With the help of [Johan Winther](https://github.com/JohanWinther) the app was ported over to Fysikteknologsektionen's website ([ftek.se/stats](https://ftek.se/stats)).

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
You can find a guide on how to setup and use React [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
