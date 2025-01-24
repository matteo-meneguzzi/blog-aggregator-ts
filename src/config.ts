import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string
    currentUserName: string | null
}

export function readConfig (): Config 
{
    const fullPath = getConfigFilePath();

    const data = fs.readFileSync(fullPath, 'utf-8');
    const rawConfig = JSON.parse(data);

    return validateConfig(rawConfig);
}

export function setUser (username: string): void
{
    const config = readConfig(); // Read file as UTF-8
    config.currentUserName = username
    writeConfig(config);
}

function getConfigFilePath (): string
{
    const homeDir = os.homedir()
    const filePath = path.join(homeDir, '/.gatorconfig.json');
    return filePath
}

function writeConfig (config: Config): void
{
    const fullPath = getConfigFilePath();

    const rawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    };

    const data = JSON.stringify(rawConfig, null, 2);
    fs.writeFileSync(fullPath, data, { encoding: 'utf-8' });
}

function validateConfig (rawConfig: any): Config
{
    if (!rawConfig.db_url || typeof rawConfig.db_url !== 'string')
    {
        throw new Error('db_url is required in config file');
    }
    if (!rawConfig.current_user_name || typeof rawConfig.current_user_name !== 'string')
    {
        throw new Error('current_user_name is required in config file');
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };

    return config;
}