# Eco Rewards Hub
[![Travis](https://img.shields.io/travis/ecorewards/eco-rewards-hub.svg?style=flat-square)](https://travis-ci.org/ecorewards/eco-rewards-hub) [![codecov](https://codecov.io/gh/ecorewards/eco-rewards-hub/branch/master/graph/badge.svg)](https://codecov.io/gh/ecorewards/eco-rewards-hub) ![David](https://img.shields.io/david/ecorewards/eco-rewards-hub.svg?style=flat-square)

API to ingest and process passenger travel transactions and calculate eco rewards.

## Usage

Node +12 and a MySQL compatible database are required.

```
npm install --save eco-rewards-hub
npm run migrate
npm start
``` 

## CLI commands

```
npm run cli -- create-scheme [name]
npm run cli -- create-organisation [name] [schemeId] [apiKey]
``` 

## Functional requirements

The scope of the API is defined by a number of user stories in cucumber format. 

See [features](/feature).

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
| 2019-11-19 | No OAuth for API access | oauth server library in midst of re-write, KISS for now and us Basic auth |

## Release notes

N/A

## License

This software is licensed under [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).
