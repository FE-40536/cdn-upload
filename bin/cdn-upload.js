#!/usr/bin/env node

const program = require('commander');
const lib = require("../lib");
const { validateArgs, validateConfig, upload } = lib;

program
  .version('0.1.0')

program
  .usage('cdn-upload <config path> [env]')

program
  .on('--help', () => {
    console.log('  Examples:');
    console.log('  ');
    console.log('    $ cdn-upload config/cdn_upload.json beta');
  })

program
  .description("Upload assets to cdn. set config, defaults to config/cdn_upload.json")
  .arguments('<configPath> [env]')
  .action((configPath, env) => {
    let config;
    config = validateArgs(configPath, env);
    config = validateConfig(config, env, config.path);
    upload(config);
  })

if(process.argv.slice(2).length == 0){
  console.log('No enviroment given');
  program.outputHelp();
  process.exit(1);
}

program.parse(process.argv);
