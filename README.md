# Local Database Query Project

This project allows you to query a local PostgreSQL database using custom `npm` commands. It simplifies querying the database and retrieving information directly from the command line.

## Prerequisites

Before you begin, ensure that you have the following installed:

- **Node.js**: Install NVM (it's my preferred way to manage Node.js versions). After installing nvm, add a .nvmrc file to the root of your project directory that contains a snippet of text:
  21.2.0

This allows you to simply type nvm use in your CLI while in the root of your project to activate the correct version of node! You may get an installation command to run if you don't yet have that version of node, but it's just another one-liner.

Check to make sure you've activated the correct version of node by typing:

node --version

- **npm** (Node Package Manager)
- **PostgreSQL** [psql](https://www.postgresql.org/docs/current/app-psql.html) or [pgAdmin](https://www.pgadmin.org/)

## Installation

1. Create a node project
   From the root of your repository, run npm init -y to create a new Node.js project.
2. Add TypeScript along with types for node, and tsx (TypeScript Execute) which will allow you to run TypeScript files directly in Node.js

npm install -D typescript @types/node tsx
Note: The -D flag installs the packages as development dependencies, which means they won't be included in your production build.

## Config

We'll use a single JSON file to keep track of two things:

- Who is currently logged in
- The connection credentials for the PostgreSQL database

Note: There's no user-based authentication for this app. If someone has the database credentials, they can act as any user.

So, create a config file in your home directory, ~/.gatorconfig.json.

The JSON file should have this structure (when prettified):

{
"db_url": "connection_string_goes_here",
"current_user_name": "username_goes_here"
}

## Clone and Install Dependencies

Clone the repository and install the necessary dependencies:

git clone <repository-url>
cd <project-directory>
npm install

## Create a DB

Mac:

1. brew install postgresql@16
2. Ensure the installation worked.

The psql command-line utility is the default client for Postgres. Use it to make sure you're on version 16+ of Postgres:

> psql --version

3. Start the Postgres server in the background

> brew services start postgresql

4. Connect to the server.

I recommend simply using the psql client. It's the "default" client for Postgres, and it's a great way to interact with the database. While it's not as user-friendly as a GUI like PGAdmin, it's a great tool to be able to do at least basic operations with.

Enter the psql shell:

> psql postgres

You should see a new prompt that looks like this:

> postgres=#

5. Create a new database.

I called mine gator:

> CREATE DATABASE gator;

Connect to the new database:

> \c gator

You should see a new prompt that looks like this:

> gator=#

Now you can also use:

> psql "postgres://<username>:@localhost:5432/gator"

## Migrations

Using Drizzle ORM, you can run migrations with:

- npx drizzle-kit generate
- npx drizzle-kit migrate

## Commands

This is the list of available commands:

### Users

- npm start login <username> - sets the current user in the config
- npm start register <username> - adds a new user to the database
- npm start reset - deletes all the users in the database
- npm start users - lists all the users in the database

### Feeds

- npm start agg <time_between_requests> - scrapes feeds starting from last fetched feed to most recent, creating posts based on single feed
- npm start addfeed <feed_name> <url> - creates feed
- npm start follow <url> - creates a follow to a feed based upon feed url and current user
- npm start unfollow <url> - deletes a follow to a feed based upon feed url and current user
- npm start following - lists followed feeds for current user
- npm start browse [limit](optional) - lists posts for current user with optional limit
