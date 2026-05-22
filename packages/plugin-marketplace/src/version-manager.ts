import { Logger } from '@serviceos/shared';

const logger = new Logger('VersionManager');

export interface VersionInfo {
  version: string;
  releaseDate: Date;
  changelog: string;
  minPlatformVersion: string;
  maxPlatformVersion?: string;
  downloadUrl: string;
  checksumSha256: string;
  breakingChanges: boolean;
  deprecated: boolean;
}

export class VersionManager {
  private versions: Map<string, VersionInfo[]>;

  constructor() {
    this.versions = new Map();
  }

  async getVersions(pluginId: string): Promise<VersionInfo[]> {
    return this.versions.get(pluginId) || [];
  }

  async publishVersion(
    pluginId: string,
    version: string,
    changelog: string,
    minPlatformVersion: string,
    downloadUrl: string,
    checksumSha256: string,
    breakingChanges: boolean = false
  ): Promise<void> {
    logger.info(`Publishing version ${version} for plugin ${pluginId}`);

    const versionInfo: VersionInfo = {
      version,
      releaseDate: new Date(),
      changelog,
      minPlatformVersion,
      downloadUrl,
      checksumSha256,
      breakingChanges,
      deprecated: false,
    };

    const versions = this.versions.get(pluginId) || [];
    versions.push(versionInfo);
    versions.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    this.versions.set(pluginId, versions);
  }

  async deprecateVersion(pluginId: string, version: string): Promise<void> {
    const versions = this.versions.get(pluginId) || [];
    const versionInfo = versions.find(v => v.version === version);
    if (versionInfo) {
      versionInfo.deprecated = true;
      logger.info(`Version ${version} of plugin ${pluginId} deprecated`);
    }
  }

  async getLatestVersion(pluginId: string): Promise<VersionInfo | null> {
    const versions = this.versions.get(pluginId) || [];
    return versions.find(v => !v.deprecated) || null;
  }

  async getCompatibleVersions(pluginId: string, platformVersion: string): Promise<VersionInfo[]> {
    const versions = this.versions.get(pluginId) || [];
    return versions.filter(v => {
      const minMet = this.versionGreaterOrEqual(platformVersion, v.minPlatformVersion);
      const maxMet = !v.maxPlatformVersion || this.versionLessOrEqual(platformVersion, v.maxPlatformVersion);
      return minMet && maxMet && !v.deprecated;
    });
  }

  private versionGreaterOrEqual(v1: string, v2: string): boolean {
    const [major1, minor1, patch1] = v1.split('.').map(Number);
    const [major2, minor2, patch2] = v2.split('.').map(Number);

    if (major1 !== major2) return major1 > major2;
    if (minor1 !== minor2) return minor1 > minor2;
    return patch1 >= patch2;
  }

  private versionLessOrEqual(v1: string, v2: string): boolean {
    return v1 === v2 || !this.versionGreaterOrEqual(v1, v2);
  }
}
