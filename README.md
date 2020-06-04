# Tug of war DV App

A small webapp that helps with democratic decision making

## Installation

You should be good to go by simply running:

```bash
   go build ./application.go
   ./application.go
```

## Deployment

The app is deployed on AWS' Elastic Beanstalk, so if this is your first time setting up you will first have to run `eb init`. However, once done, changes can be deployed by simply running `eb deploy`.