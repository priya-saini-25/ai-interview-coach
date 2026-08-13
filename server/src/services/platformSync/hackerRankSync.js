/**
 * HackerRank Public Profile Sync Adapter
 */

const validateHandle = (handle) => {
  if (!handle || typeof handle !== 'string') return false;
  return /^[a-zA-Z0-9._-]{3,30}$/.test(handle.trim());
};

const fetchHackerRankStats = async (handle) => {
  const cleanHandle = (handle || '').trim();

  if (!validateHandle(cleanHandle)) {
    return {
      success: false,
      platform: 'hackerrank',
      handle: cleanHandle,
      message: 'Invalid HackerRank handle format.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://www.hackerrank.com/rest/hackers/${cleanHandle}/badges`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        platform: 'hackerrank',
        handle: cleanHandle,
        message: `HackerRank API error: HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    const badges = data?.models || [];

    if (!Array.isArray(badges)) {
      return {
        success: false,
        platform: 'hackerrank',
        handle: cleanHandle,
        message: `HackerRank handle '${cleanHandle}' not found.`,
      };
    }

    let badgeStars = 0;
    let totalSolved = 0;

    badges.forEach((badge) => {
      const badgeName = (badge.badge_type || badge.badge_name || '').toLowerCase();
      const stars = Number(badge.stars) || 0;
      const solved = Number(badge.solved) || 0;

      totalSolved += solved;

      if (badgeName.includes('problem') || badgeName.includes('cpp') || badgeName.includes('java') || badgeName.includes('python')) {
        if (stars > badgeStars) {
          badgeStars = stars;
        }
      }
    });

    return {
      success: true,
      platform: 'hackerrank',
      handle: cleanHandle,
      stats: {
        badgeStars,
        totalSolved,
      },
      syncedAt: new Date(),
    };
  } catch (error) {
    const isAbort = error.name === 'AbortError';
    return {
      success: false,
      platform: 'hackerrank',
      handle: cleanHandle,
      message: isAbort ? 'HackerRank API request timed out after 5 seconds.' : `HackerRank sync error: ${error.message}`,
    };
  }
};

module.exports = {
  validateHandle,
  fetchHackerRankStats,
};
