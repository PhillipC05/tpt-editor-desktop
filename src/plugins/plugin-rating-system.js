/**
 * Plugin Rating System for TPT Asset Editor Desktop
 * Manages plugin ratings, reviews, and reputation
 */

class PluginRatingSystem {
  constructor() {
    this.ratings = new Map();
    this.reviews = new Map();
  }

  /**
   * Add a rating for a plugin
   * @param {string} pluginId - Plugin ID
   * @param {string} userId - User ID
   * @param {number} rating - Rating (1-5)
   * @param {string} review - Optional review text
   * @returns {Object} Rating object
   */
  addRating(pluginId, userId, rating, review = '') {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const ratingId = `${pluginId}-${userId}`;
    const timestamp = new Date().toISOString();

    const ratingObj = {
      id: ratingId,
      pluginId,
      userId,
      rating,
      review,
      timestamp
    };

    // Store the rating
    this.ratings.set(ratingId, ratingObj);

    // Add to plugin reviews
    if (!this.reviews.has(pluginId)) {
      this.reviews.set(pluginId, []);
    }
    this.reviews.get(pluginId).push(ratingObj);

    return ratingObj;
  }

  /**
   * Get average rating for a plugin
   * @param {string} pluginId - Plugin ID
   * @returns {Object} Rating statistics
   */
  getAverageRating(pluginId) {
    const pluginRatings = this.reviews.get(pluginId) || [];
    if (pluginRatings.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const sum = pluginRatings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / pluginRatings.length;

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    pluginRatings.forEach(r => {
      distribution[r.rating]++;
    });

    return {
      average: Math.round(average * 100) / 100,
      count: pluginRatings.length,
      distribution
    };
  }

  /**
   * Get reviews for a plugin
   * @param {string} pluginId - Plugin ID
   * @param {number} limit - Maximum number of reviews to return
   * @returns {Array} Array of reviews
   */
  getReviews(pluginId, limit = 10) {
    const pluginRatings = this.reviews.get(pluginId) || [];
    // Sort by timestamp (newest first)
    return pluginRatings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get user's rating for a plugin
   * @param {string} pluginId - Plugin ID
   * @param {string} userId - User ID
   * @returns {Object|null} User's rating or null if not found
   */
  getUserRating(pluginId, userId) {
    const ratingId = `${pluginId}-${userId}`;
    return this.ratings.get(ratingId) || null;
  }

  /**
   * Update user's rating for a plugin
   * @param {string} pluginId - Plugin ID
   * @param {string} userId - User ID
   * @param {number} rating - New rating (1-5)
   * @param {string} review - Optional review text
   * @returns {Object} Updated rating object
   */
  updateRating(pluginId, userId, rating, review = '') {
    const ratingId = `${pluginId}-${userId}`;
    const existing = this.ratings.get(ratingId);

    if (!existing) {
      throw new Error('Rating not found');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updated = {
      ...existing,
      rating,
      review,
      updatedAt: new Date().toISOString()
    };

    this.ratings.set(ratingId, updated);

    // Update in reviews array
    const pluginReviews = this.reviews.get(pluginId) || [];
    const index = pluginReviews.findIndex(r => r.id === ratingId);
    if (index !== -1) {
      pluginReviews[index] = updated;
    }

    return updated;
  }

  /**
   * Remove user's rating for a plugin
   * @param {string} pluginId - Plugin ID
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  removeRating(pluginId, userId) {
    const ratingId = `${pluginId}-${userId}`;
    const existing = this.ratings.get(ratingId);

    if (!existing) {
      return false;
    }

    // Remove from ratings map
    this.ratings.delete(ratingId);

    // Remove from reviews array
    const pluginReviews = this.reviews.get(pluginId) || [];
    const index = pluginReviews.findIndex(r => r.id === ratingId);
    if (index !== -1) {
      pluginReviews.splice(index, 1);
      this.reviews.set(pluginId, pluginReviews);
    }

    return true;
  }

  /**
   * Get top-rated plugins
   * @param {number} limit - Maximum number of plugins to return
   * @returns {Array} Array of top-rated plugins
   */
  getTopRatedPlugins(limit = 10) {
    const pluginIds = Array.from(this.reviews.keys());
    const pluginRatings = pluginIds.map(pluginId => ({
      pluginId,
      ...this.getAverageRating(pluginId)
    }));

    // Sort by average rating (descending) and count (descending for ties)
    return pluginRatings
      .sort((a, b) => {
        if (b.average !== a.average) {
          return b.average - a.average;
        }
        return b.count - a.count;
      })
      .slice(0, limit);
  }

  /**
   * Get most reviewed plugins
   * @param {number} limit - Maximum number of plugins to return
   * @returns {Array} Array of most reviewed plugins
   */
  getMostReviewedPlugins(limit = 10) {
    const pluginIds = Array.from(this.reviews.keys());
    const pluginCounts = pluginIds.map(pluginId => ({
      pluginId,
      count: (this.reviews.get(pluginId) || []).length
    }));

    // Sort by count (descending)
    return pluginCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Export ratings data
   * @returns {Object} Ratings data
   */
  exportData() {
    const ratings = Array.from(this.ratings.values());
    const reviews = {};

    for (const [pluginId, pluginReviews] of this.reviews.entries()) {
      reviews[pluginId] = pluginReviews;
    }

    return {
      ratings,
      reviews,
      exported: new Date().toISOString()
    };
  }

  /**
   * Import ratings data
   * @param {Object} data - Ratings data to import
   */
  importData(data) {
    if (data.ratings) {
      data.ratings.forEach(rating => {
        this.ratings.set(rating.id, rating);
      });
    }

    if (data.reviews) {
      for (const [pluginId, pluginReviews] of Object.entries(data.reviews)) {
        this.reviews.set(pluginId, pluginReviews);
      }
    }
  }

  /**
   * Clear all ratings
   */
  clear() {
    this.ratings.clear();
    this.reviews.clear();
  }
}

module.exports = PluginRatingSystem;