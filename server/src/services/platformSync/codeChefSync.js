/**
 * CodeChef Public Stats Sync Adapter
 */

const validateHandle = (handle) => {
  if (!handle || typeof handle !== 'string') return false;
  return /^[a-zA-Z0-9_-]{3,30}$/.test(handle.trim());
};

const fetchCodeChefStats = async (handle) => {
  const cleanHandle = (handle || '').trim();

  if (!validateHandle(cleanHandle)) {
    return {
      success: false,
      platform: 'codechef',
      handle: cleanHandle,
      message: 'Invalid CodeChef handle format.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Primary: Try public REST microservice API for CodeChef user stats
    const response = await fetch(`https://codechef-api.vercel.app/handle/${cleanHandle}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success !== false && (data.currentRating !== undefined || data.rating !== undefined)) {
        const rating = Number(data.currentRating || data.rating) || 0;
        const stars = data.stars || (rating >= 2200 ? '6★' : rating >= 2000 ? '5★' : rating >= 1800 ? '4★' : rating >= 1600 ? '3★' : rating >= 1400 ? '2★' : '1★');
        const totalSolved = Number(data.fullySolved?.count || data.totalSolved) || 0;

        return {
          success: true,
          platform: 'codechef',
          handle: cleanHandle,
          stats: {
            rating,
            stars,
            totalSolved,
          },
          syncedAt: new Date(),
        };
      }
    }

    // Fallback: If public endpoint unavailable or returns 404
    return {
      success: false,
      platform: 'codechef',
      handle: cleanHandle,
      message: `CodeChef public sync unavailable for handle '${cleanHandle}'.`,
    };
  } catch (error) {
    const isAbort = error.name === 'AbortError';
    return {
      success: false,
      platform: 'codechef',
      handle: cleanHandle,
      message: isAbort ? 'CodeChef API request timed out after 5 seconds.' : `CodeChef sync error: ${error.message}`,
    };
  }
};

module.exports = {
  validateHandle,
  fetchCodeChefStats,
};
