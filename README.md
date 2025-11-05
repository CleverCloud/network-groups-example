# Link applications in a Clever Cloud Network Group

To follow this tutorial, you need a [Clever Cloud account](https://console.clever-cloud.com) and [Clever Tools](https://github.com/CleverCloud/clever-tools):

```bash
npm i -g clever-tools
clever login
```

## Create and configure the applications

Clone this repository:

```bash
git clone https://github.com/CleverCloud/network-groups-example
cd network-groups-example
```

Create and configure the private service:

```bash
# Note the application ID, we'll need it later
clever create -t python privateApp

# Configure the application
clever env set APP_FOLDER "privateApp" --alias privateApp
clever env set CC_RUN_COMMAND "uv run main.py" --alias privateApp

# Deploy the application without following the logs
clever deploy --exit-on deploy-start --alias privateApp
```

Create and configure the public website:

```bash
# Note the application ID, we'll need it later
clever create -t node publicApp

# Configure the application
clever env set APP_FOLDER "publicApp" --alias publicApp
```

## Create and configure the network group

Create the network group and link the two applications to it:

```bash
clever features enable ng
clever ng create myNGDemo --link [privateApp_id],[publicApp_id]
```

> [!TIP]
> Replace `[privateApp_id]` and `[publicApp_id]` with the application IDs you noted earlier.

Get the private application domain within the network group, use it for public application configuration:

```bash
clever env set PRIVATE_SERVICE_URL "http://$(clever ng get [privateApp_id] --format json | jq -r '.domainName'):4242" --alias publicApp
```

Deploy the public website without following the logs

```bash
clever deploy --alias publicApp
clever open --alias publicApp
```

You should see the public website, inverting the provided text through the private service available only within the Clever Cloud Network Group. Learn more about [Network Groups](http://www.clever-cloud.com/doc/develop/network-groups/).
