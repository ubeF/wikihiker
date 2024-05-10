# Wikihiker

## Description

"Wikihiker" is a webcrawler that finds the fastest route between two Wikipedia pages.

## Getting Started

### Dependencies

Node.js
[Cheerio](https://cheerio.js.org/) for HTML parsing\
[Neo4j](https://neo4j.com/) for the GraphDatabase\
[Commander.js](https://github.com/tj/commander.js) for the CLI\
[Cli-progress](https://github.com/npkgz/cli-progress) for the CLI progress bar

### Installation

#### npm

Install the package on npm, setup a database connection and provide the database path, the username and the password in th CLI.

#### source

Download the .zip or clone this repository and run docker compose. The database connection is then established with default values.

### Executing program

Change into the repository and run `node index.js` with the corresponding arguments and flags.\
For a detailed description of all possible arguments and flags run `node index.js --help`

## Help

For any problems regarding the code, please open an issue.

## Authors

Felix Burkard\
Mykhaylo Serdyuk

## License

[GPL-3.0 license](https://github.com/ubeF/wikihiker/tree/main?tab=GPL-3.0-1-ov-file#readme)

## Acknowledgments

The main inspiration for this project is the game [Wikiracing](https://en.wikipedia.org/wiki/Wikiracing):\
The goal of this game is to find the fastest way from one Wikipedia article to another by manually browsing the hyperlinks.
