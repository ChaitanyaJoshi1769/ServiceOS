import { Logger } from '@serviceos/shared';

const logger = new Logger('PluginMarketplace');

export interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  downloads: number;
  rating: number;
  latestVersion: string;
  availableVersions: string[];
  documentation: string;
  repositoryUrl?: string;
  licenseType: string;
  requiredPermissions: string[];
  installationCount: number;
  lastUpdated: Date;
}

export interface PluginReview {
  userId: string;
  pluginId: string;
  rating: number;
  review: string;
  createdAt: Date;
}

export class PluginMarketplace {
  private plugins: Map<string, MarketplacePlugin>;
  private reviews: Map<string, PluginReview[]>;

  constructor() {
    this.plugins = new Map();
    this.reviews = new Map();
  }

  async searchPlugins(query: string, filters?: {
    category?: string;
    minRating?: number;
    licenseType?: string;
  }): Promise<MarketplacePlugin[]> {
    logger.info(`Searching plugins: ${query}`, { filters });

    const results = Array.from(this.plugins.values()).filter(plugin => {
      const matchesQuery = plugin.name.toLowerCase().includes(query.toLowerCase()) ||
                          plugin.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !filters?.category || plugin.category === filters.category;
      const matchesRating = !filters?.minRating || plugin.rating >= filters.minRating;
      const matchesLicense = !filters?.licenseType || plugin.licenseType === filters.licenseType;

      return matchesQuery && matchesCategory && matchesRating && matchesLicense;
    });

    return results.sort((a, b) => b.downloads - a.downloads);
  }

  async getPluginDetails(pluginId: string): Promise<MarketplacePlugin | null> {
    return this.plugins.get(pluginId) || null;
  }

  async getPluginReviews(pluginId: string): Promise<PluginReview[]> {
    return this.reviews.get(pluginId) || [];
  }

  async submitReview(userId: string, pluginId: string, rating: number, review: string): Promise<void> {
    logger.info(`Review submitted for plugin ${pluginId}`, { userId, rating });

    const pluginReview: PluginReview = {
      userId,
      pluginId,
      rating,
      review,
      createdAt: new Date(),
    };

    const reviews = this.reviews.get(pluginId) || [];
    reviews.push(pluginReview);
    this.reviews.set(pluginId, reviews);

    // Recalculate plugin rating
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      plugin.rating = Math.round(avgRating * 10) / 10;
    }
  }

  async listFeaturedPlugins(): Promise<MarketplacePlugin[]> {
    return Array.from(this.plugins.values())
      .filter(p => p.rating >= 4.5 && p.installationCount > 100)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }

  async listPopularPlugins(limit: number = 20): Promise<MarketplacePlugin[]> {
    return Array.from(this.plugins.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  async getPluginsByCategory(category: string): Promise<MarketplacePlugin[]> {
    return Array.from(this.plugins.values())
      .filter(p => p.category === category)
      .sort((a, b) => b.rating - a.rating);
  }
}
