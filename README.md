# Eco Rewards Hub
[![Travis](https://img.shields.io/travis/ecorewards/eco-rewards-hub.svg?style=flat-square)](https://travis-ci.org/ecorewards/eco-rewards-hub) [![codecov](https://codecov.io/gh/ecorewards/eco-rewards-hub/branch/master/graph/badge.svg)](https://codecov.io/gh/ecorewards/eco-rewards-hub) ![David](https://img.shields.io/david/ecorewards/eco-rewards-hub.svg?style=flat-square)

API to ingest and process passenger travel transactions and calculate eco rewards.

## Installation

Node +12 and a MySQL compatible database are required. The Ubuntu set up is:

```
sudo apt-get install -y nodejs mariadb-server
# warning this will blank your root mysql password
sudo mysql -u root mysql -e "update user set authentication_string=password(''), plugin='mysql_native_password' where user='root'; flush privileges;"
```

Installing and running the service:

```
git clone git@github.com:EcoRewards/eco-rewards-hub.git
npm install --save eco-rewards-hub
npm run migrate
npm start
```

Running with pm2:

```
pm2 start ecosystem.config.js
```

## CLI commands

There are some CLI commands to help get set up:

```
npm run cli -- create-scheme [name]
npm run cli -- create-organisation [name] [schemeId]
npm run cli -- create-group [name] [organisationId]
npm run cli -- create-user [name] [email] [password] [role]
npm run cli -- export-all-members
``` 

## Functional requirements

The scope of the API is defined by a number of user stories in cucumber format. 

See [features](/bdd/feature).

## Non-functional requirements

- Swagger documentation
- Secure API access
- Continuous integration with automated tests

## Decision log

| Date       | Decision | Reasoning | 
| ---------- | -------- | --------- |
| 2019-11-01 | Implement with node.js | Developers familiar with it, fast iteration speed |
| 2019-11-01 | Use a MySQL compatible database | Developers familiar with it, widely used |
| 2019-11-01 | Use AWS | It's convenient and widely used |
| 2019-11-18 | Do not use docker | Unnecessary for a project this size |
| 2019-11-18 | Make the code open-source | No need for private repository, cheaper tooling (Travis et al) |
| 2019-11-18 | Use travis CI | It's free |
| 2019-11-18 | Use cucumber to capture functional requirements | Track the evolution of requirements and use as a basis for functional tests |
| 2019-11-18 | Use use Koa | Widely used and supports promises |
| 2019-11-18 | Use db-migrate | Most widely used database migration tool |
| 2019-11-18 | Do not use an ORM | Seems like overkill when there are so few models |
| 2019-11-18 | Bcrypt passwords | Most secure, widely used method to salt passwords |
| 2019-11-19 | Basic auth for API access | Simple, widely used and easy to implement |
| 2019-11-21 | Swagger documentation | Comes with a slick UI and package to validate requests and responses |
| 2019-11-21 | Link based API responses | Reduces duplication in API responses. See [this post](https://cloud.google.com/blog/products/application-development/api-design-why-you-should-use-links-not-keys-to-represent-relationships-in-apis) |
| 2019-11-27 | Travis deployment | Simple, easy, as seen [here](https://github.com/dwyl/learn-travis/blob/master/encrypted-ssh-keys-deployment.md) |
| 2019-11-27 | PM2 process management | Makes the travis deployment easier |

## License

This software is licensed under [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).
