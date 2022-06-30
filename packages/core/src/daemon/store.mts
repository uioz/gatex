import {readManifest, writeManifest, type Manifest} from '../common/manifest.mjs';
import {readApiPrefixFromRemoteBranches} from '../common/remote-branch.mjs';

export class Store {
  /**
   * 服务配置
   */
  public manifest: Manifest = {};
  /**
   * 服务仓库所有可用分支后缀
   */
  // public remotePrefix: Array<string> = [];

  public flushManifest(manifest: Manifest) {
    return writeManifest((this.manifest = manifest));
  }

  public async init() {
    const [manifest] = await Promise.all([
      readManifest(),
      // readApiPrefixFromRemoteBranches(),
    ]);

    // console.log(
    //   `store init -> prefixs from local file are ${Object.keys(manifest)}`
    // );

    // for (const host of Object.keys(manifest)) {
    //   if (remotePrefix.indexOf(host) === -1) {
    //     delete manifest[host];
    //   }
    // }
    // console.log(
    //   `store init -> deduplicated prefixs are ${Object.keys(manifest)}`
    // );

    this.manifest = manifest;
    // this.remotePrefix = remotePrefix;
  }
}
