import { request } from "undici";
import { isValidPrefixName } from "../common/helper.mjs";

async function fetchBranch(target: string) {
  const [HOST, PROJECT_ID, ACCESS_TOKEN] = target.split("@");

  const { statusCode, body } = await request(
    `${HOST}/api/v4/projects/${PROJECT_ID}/repository/branches?private_token=${ACCESS_TOKEN}`
  );

  if (statusCode === 200) {
    const responseData = (await body.json()) as Array<{
      name: string;
    }>;

    const branchNames = responseData.map((item) => item.name);

    return branchNames;
  } else {
    throw new Error("request to gitlab is failed!");
  }
}

function filterBranchesName(names: Array<string>) {
  const reservedBranch = new Set(["pre-release", "dev"]);

  const branchPrefix = ["feat/", "fix/", "refacor/", "test/", "chore/", "build/"];

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

export async function readApiPrefixFromRemoteBranch(
  target: string
): Promise<Array<string>> {
  return filterBranchesName(await fetchBranch(target));
}
