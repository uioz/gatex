import { request } from 'undici';
import { isValidPrefixName } from '../common/helper.mjs';
async function fetchBranch(host, projectId, accessToken) {
    const { statusCode, body } = await request(`${host}/api/v4/projects/${projectId}/repository/branches?private_token=${accessToken}`);
    if (statusCode === 200) {
        const responseData = (await body.json());
        const branchNames = responseData.map((item) => item.name);
        return branchNames;
    }
    else {
        throw new Error('request to gitlab is failed!');
    }
}
function filterBranchesName(names) {
    const reservedBranch = new Set(['pre-release', 'dev']);
    const branchPrefix = ['feat/', 'fix/', 'refacor/', 'test/', 'chore/', 'build/'];
    const result = [];
    for (const name of names) {
        if (reservedBranch.has(name)) {
            result.push(name);
            continue;
        }
        for (const prefix of branchPrefix) {
            if (name.startsWith(prefix)) {
                // extract xxx from feat/xxx
                const target = name.split(prefix)[1];
                if (isValidPrefixName.test(target)) {
                    result.push(target);
                }
            }
        }
    }
    return result;
}
export async function readApiPrefixFromRemoteBranch(host, projectId, accessToken) {
    return filterBranchesName(await fetchBranch(host, projectId, accessToken));
}
