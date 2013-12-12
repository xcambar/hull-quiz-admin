# Quizzes administration

The archive that contains this document provides an administration for using quizzes with [hull.io](http://hull.io).

This document will guide you through the installation process and
the basic usage of [the dashboard of hull](http://hullapp.io).


# Requirements

* An administrator account on [hull.io](http://hull.io).
* An app on the Hull platform.

    *An app is automatically created when you create your account.*

    *You can create as many apps as you want.*

* The credentials for the app, namely `appId` and `orgUrl`, that
  can be found in the dashboard of Hull.
* A [keen.io](http://keen.io) account, configured with your Hull app.

# Setup

* Unzip the archive.
* Edit the file `app/cripts/ull-init.js` and change the values in `Hull.init` by those for your app.
* Serve the `app` folder with the Web Server of your choice, and open your browser to the address to view the quiz admin.
    * For instance, if you're using PHP, you can simply use `php -S localhost:8888` from the `app` folder and open `http://localhost:8888` in your browser

# Using [the Hull dashboard](https://hullapp.io)

## Allowing others to access the organization settings

* Go to the [Admin](https://hullapp.io).
* Click on `Settings` on the left navigation bar.
* Click on `Collaborators` in the main pane

In this page, you can grant or revoke administration rights on your app.

## Creating an app

* Go to the [Admin](https://hullapp.io).
* The list of the current applications for your organization is displayed on the screen.
* Click on the button `Create an application` on the far right side of the screen.
* Fill in the form
* Click "Create app" to validate

## Whitelisting a domain

Whitelisting a domain is very important when your application goes live.
The default mode has no safety net regarding the domain it is run from.
The production allows your app to be run exclusively from the domains
you whitelisted in the app configuration.

To configure the whitelisted domain(s):

* Go to the [Admin](https://hullapp.io).
* Click on the app you want to configure
* In the popup that appeared, fill in the `domains` field
* Click `Update App`.

When you are ready to go into production, don't forget to
move the `Production mode` slider in its `production` state
(it is under "informations" in the app page).

## Configure services for your app

This section is covered in details in [our official documentation](http://hull.io/docs/services/).



