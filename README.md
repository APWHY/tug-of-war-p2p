# Tug of war DV App

A small webapp that helps with democratic decision making

## Installation

You should be good to go by simply running:

```bash
   go build ./application.go
   ./application.go
```

This simply sets up a simple gin backend that will host the static html/jss/css files for you to access.

## Deployment

The app is deployed via a static host on AWS Amplify and connected to this repo, so deployment is as simple as pushing to this repository on the develop branch. If you are forking, you can achieve a similar effect by following the tutorial [here](https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/module-1/) (you only need to look at module 1 unless you plan on extending functionality)

## Game balance

For now, the pace of the game can be adjusted by changing the values of `this.decay` and `this.threshold` in `static/js/marker.js`.