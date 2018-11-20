# A Makerspace Management System,based :Polis RFID Access System Extended 2

Web API for [RFID access system](https://github.com/ParalelniPolis/rfid-locks)


## Dependencies

* [Node.js](https://nodejs.org/) >= 6.0.0
* [Mongo DB](https://www.mongodb.com/)
* [Git](https://git-scm.com/)


## Setup

Make sure you have the necessary [dependencies](#dependencies) before continuing.

Get the code:
```
git clone https://github.com/swjtu-maker/stooop
```

Change into the project directory:
```
cd stooop
```

Install application dependencies via npm or yarn:
```
npm install
```
or
```
yarn
```
This will install all node modules that the project requires.

## Running the Server

To run the node.js server app:
```
npm start
```

## Configuration

Configuration variables should be set via environment variables (database credentials, session secret, etc) in ``.env`` file - see ``.env.example``.

## Tests

If you are working on the server part of the app, then you should run the tests to verify that you haven't broken anything:
```
npm test
```

## Documentation
You can generate JSDoc documentation automatically by running
```
npm run jsdoc
```
