# YUYUYUI Rank Tracking Discordbot
This bot is meant to be a frontend to respond to queries for ranking information by querying a separate backend service.

## Setup
### Prerequisites
Ensure that you are have npm 7 or newer and node 16.6 or newer installed.
Ensure that you have a discord app created with `https://discord.com/developers/applications/`
 -> Refer to EXTRAS - Discord bot setup for more info

### Steps
Clone the repository
Install the package using
`npm install`
And create an `auth.json` in the repository's root folder as such:
```
{
	"token":"${TOKEN}",
	"client_id":"${CLIENT_ID}"
}
```
Then, replace `${TOKEN}` with your app's bot token from the discord interface https://discord.com/developers/applications/.

Then, replace `${CLIENT_ID}` with your app's client id under the OAuth settings page.

!!!***REMINDER***!!!
DO ***NOT*** commit your auth.json. It contains secrets that should never be shared. Anyone with the data stored inside can effectively control your app and overwrite it with a malicious bot. 

## RUN
Just run the command:
`npm start`

## EXTRAS
### Discord bot setup
- Create app @ https://discord.com/developers/applications/
- Get Token from App's Bot page
- Get Client ID from App's OAuth2 page
- Use Oauth2 URL generator to generate a URL with the correct permissions (This bot needs applications.commands)
- Use the generated URL to add the bot to your server.
