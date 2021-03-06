#!/usr/bin/env node

const package = require("../package.json")
const program = require('commander')
const lib = require("../lib")
const { validateArgs, validateConfig, upload, readConf } = lib

program
  .version(package.version)

program
  .usage('cdn-upload <config path> [env]')

program
  .on('--help', () => {
    console.log('')
    console.log('  Examples:')
    console.log('')
    console.log('    $ cdn-upload config/cdn_upload.json beta')
  })

program
  .description("Upload files to cdn. set config, defaults to config/cdn_upload.json")
  .option('-s, --sync', 'Make sure the local uploaded files is the same as the cdn files')
  .arguments('<configPath> [env]')
  .action((configPath, env) => {
    const { configPath: _configPath, env: _env } = validateArgs(configPath, env)
    const config = readConf(_configPath)
    const legalConfig = validateConfig(config, _env, _configPath)
    if(program.sync) {
      upload(legalConfig, true)
      return 
    }
    upload(legalConfig)
  })


if(process.argv.slice(2).length == 0){
  console.log('No enviroment given')
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)
