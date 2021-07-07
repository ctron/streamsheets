import {LoggerFactory} from "@cedalo/logger";

const process = require('process');
const fs = require('fs');
const path = require('path');
const { RepositoryManager } = require('@cedalo/repository');
const logger = LoggerFactory.createLogger('gateway - context', process.env.STREAMSHEETS_LOG_LEVEL || 'info');

const getInitJSON = (initDirectory) => {
    const initJSON = {
        machines: [],
        streams: []
    };
    try {
        const files = fs.readdirSync(initDirectory);
        files.forEach(file => {
            logger.warn("Processing file:", file);
            if (!file.endsWith(".json")) {
                logger.info("Skipping non-JSON file (or directory)", file)
            } else {
                const json = JSON.parse(fs.readFileSync(path.join(initDirectory, file)).toString());
                if (json.machines) {
                    initJSON.machines = [...initJSON.machines, ...json.machines];
                }
                if (json.streams) {
                    initJSON.streams = [...initJSON.streams, ...json.streams];
                }
            }
        });
    } catch (error) {
        logger.error("Failed to load init data", error);
    }
    return initJSON;
}

const init = async () => {
    const examples = process.env.DEPLOY_EXAMPLES_FROM;
    if (examples) {
        logger.warn("Deploying examples from:", examples);

        let setup = await RepositoryManager.configurationRepository.getSetup();
        if (setup) {
            logger.warn("Examples already deployed");
        } else {
            logger.warn("Setup not found, initializing ...");
            const data = getInitJSON(examples);
            logger.info("Init data", data);
            await RepositoryManager.populateDatabases(data);
            await RepositoryManager.streamRepository.reloadStreams([]);
            await RepositoryManager.configurationRepository.saveSetup({});
            logger.warn("Setup not found, initializing ... done!");
        }
    }
}

module.exports = { init };
