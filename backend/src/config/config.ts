import { readFileSync } from "fs";
import { join } from "node:path";

export const ORIGINS_TO_ALLOW = ['http://localhost:8080', 'http://localhost:5173', 'https://yash-digitaltwin-client.azurewebsites.net'];

export const SENSOR_COLLECTIONS_AUTHROLES = ['ADMIN', 'USER']
export const USER_MANAGEMENT_AUTHUSERS = ['ADMIN', 'USER']

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

const githubPrivateKeyPath = join(__dirname, '../../yash-migration-framework.2025-11-19.private-key.pem');

export const githuseceretKey = readFileSync(githubPrivateKeyPath, 'utf-8');