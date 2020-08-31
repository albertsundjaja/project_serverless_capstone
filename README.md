# Serverless Daily Journal App

This app is the capstone project for Udacity Cloud Developer ND. 

The main function of the app is to create daily journal which other users can view publicly (similar to an FB post).

## Functionality of the application

This application will allow creating/removing/updating/fetching journal items. Each user can view everyone's journals that are created today (GMT time) but can only create/update/delete their own journal. Each user can optionally add image to their journal.

## Authentication

Authentication is done using Auth0 service. The application uses asymmetrically encrypted JWTs to authenticate and authorize users.

## Request Validation

Request validation is done on the API gateway level. `serverless-reqvalidator-plugin` is used to help implement the feature.

## Architecture

To avoid vendor lockout, data layer and business logic are separated. This way, when we need to change from one vendor to another, we can minimize the change needed to only the data layer.

## Logging

Logging is done with [Winston](https://github.com/winstonjs/winston) logger to create a JSON formatted log and passed to AWS CloudWatch. 

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

This will deploy the app to AWS. (This is not needed for the purpose of the capstone project, as it has already been deployed)

## Frontend

To run the frontend do the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the deployed application on AWS.

In case of a newly deployed app, first edit the `client/src/config.ts` file to set correct parameters.

