import { argv } from "process";
import { request } from "undici";
import { isValidPrefixName } from "./helper.mjs";

async function fetchBranches() {

  const params = argv.slice(2)[0];
  const [HOST, PROJECT_ID, ACCESS_TOKEN] = params.split("@");
  
  const { statusCode, body } = await request(
    `${HOST}/api/v4/projects/${PROJECT_ID}/repository/branches?private_token=${ACCESS_TOKEN}`
  );

  if (statusCode === 200) {
    const responseData = (await body.json()) as Array<{
      name: string;
    }>;

    const branchNames = responseData.map((item) => item.name);

    console.log(branchNames);
    
    return branchNames;
  } else {
    throw new Error("request to gitlab is failed!");
  }
}

function filterBranchesName(names: Array<string>) {
  const reservedBranch = new Set(["pre-release", "dev"]);

  const branchPrefix = ["feat/", "fix/", "refacor/", "perf/", "ci/", "build/"];

  const result: Array<string> = [];

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

export async function readApiPrefixFromRemoteBranches(): Promise<
  Array<string>
> {
  return filterBranchesName(await fetchBranches());
}

export function prefixToPort(prefix: string, prefixBaseline = 0) {
  return (
    prefix
      .split("")
      .map((character) => character.charCodeAt(0))
      .reduce((prev, next) => prev + next) + prefixBaseline
  );
}
