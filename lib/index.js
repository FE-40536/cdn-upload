const fs = require('fs')
const path = require('path')
const plugins = require("./initialize")
const glob = require("glob")
const _  = require('lodash')
const os = require('os')
const maxConcurrency = 16
const cpuCount = os.cpus().length 
const concurrency = cpuCount >= maxConcurrency ? maxConcurrency : cpuCount
const { print, validateArgs, validateConfig, readConf } = require('./utils')

const getLocalDirectoryFiles = (config) => {
  let ignore = config.ignore && config.ignore.map((pattern) => {
    return `${config.localDirectory}/${pattern}`
  })
  ignore = ignore || []
  const files = glob.sync(`${config.localDirectory}/**/**/*`, { ignore: ignore })
  .filter((file) => {
    if(!fs.lstatSync(file).isDirectory()){ return file }
  })
  return removePrefixForFiles(files, new RegExp(`^${config.localDirectory}`))
}

const removePrefixForFiles = (files, prefix) => {
  return files.map((file) => {
    return file.replace(prefix, "")
  })
}

const addPrefixForFiles = (files, prefix) => {
  return files.map((file) => {
    return prefix + file
  })
}

const upload = async (config, sync = false) => {
  const { cdn, cache } = plugins.initialize(config)

  const localFiles = getLocalDirectoryFiles(config)
  const remoteFiles = addPrefixForFiles(localFiles, config.remoteDirectory)
  const diffFiles = cache.getDiff(remoteFiles)
  const readyUploadFiles = removePrefixForFiles(diffFiles, config.remoteDirectory)
  cache.update(remoteFiles)

  const cdnAssets = await cdn.getCdnAssets()
  print(`********** Ready to upload files **********`)
  const opts = {
    concurrency: config.concurrency || concurrency
  } 
  const { failedFiles, uploadedFiles } = await cdn.upload(readyUploadFiles, opts)
  cache.filterFailedFiles(failedFiles)
  readyRemoveFiles = cache.getDiff(cdnAssets)
  let uploadedResult
  if (sync) {
    await cdn.remove(readyRemoveFiles)
    uploadedResult = { uploadedFiles: remoteFiles, removeFiles: readyRemoveFiles }
  } else {
    uploadedResult = { uploadedFiles: remoteFiles, removeFiles: [] }
  }
  print(`******************* End *******************`)
  return uploadedResult

  //if(readyUploadFiles.length > 0) {
  //  let needChangeKeys = readyUploadFiles.map((asset) => {
  //    return path.join(config.remoteDirectory, asset)
  //  })
  //  await cdn.changeMime(needChangeKeys)
  //}
}

module.exports = {
  readConf,
  validateArgs,
  validateConfig,
  upload
}
