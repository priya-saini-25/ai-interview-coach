/**
 * Codeforces Public REST API Sync Adapter
 */

const validateHandle = (handle) => {
  if (!handle || typeof handle !== 'string') return false;
  return /^[a-zA-Z0-9_.-]{3,30}$/.test(handle.trim());
};

const fetchCodeforcesStats = async (handle) => {
  const cleanHandle = (handle || '').trim();

  if (!validateHandle(cleanHandle)) {
    return {
      success: false,
      platform: 'codeforces',
      handle: cleanHandle,
      message: 'Invalid Codeforces handle format.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 1. Fetch User Info
    const infoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${cleanHandle}`, {
      signal: controller.signal,
    });

    if (!infoResponse.ok) {
      clearTimeout(timeoutId);
      return {
        success: false,
        platform: 'codeforces',
        handle: cleanHandle,
        message: `Codeforces API error: HTTP ${infoResponse.status}`,
      };
    }

    const infoData = await infoResponse.json();
    clearTimeout(timeoutId);

    if (infoData.status !== 'OK' || !Array.isArray(infoData.result) || infoData.result.length === 0) {
      return {
        success: false,
        platform: 'codeforces',
        handle: cleanHandle,
        message: `Codeforces user '${cleanHandle}' not found.`,
      };
    }

    const userInfo = infoData.result[0];
    const rating = userInfo.rating || 0;
    const rank = userInfo.rank || 'Unrated';

    // 2. Fetch User Status for Solved Problems count
    let totalSolved = 0;
    let acceptedSubmissions = 0;

    try {
      const statusController = new AbortController();
      const statusTimeoutId = setTimeout(() => statusController.abort(), 5000);

      const statusResponse = await fetch(`https://codeforces.com/api/user.status?handle=${cleanHandle}`, {
        signal: statusController.signal,
      });

      clearTimeout(statusTimeoutId);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === 'OK' && Array.isArray(statusData.result)) {
          const solvedSet = new Set();
          statusData.result.forEach((sub) => {
            if (sub.verdict === 'OK' && sub.problem) {
              acceptedSubmissions++;
              const problemKey = `${sub.problem.contestId}-${sub.problem.index}-${sub.problem.name}`;
              solvedSet.add(problemKey);
            }
          });
          totalSolved = solvedSet.size;
        }
      }
    } catch (e) {
      // Ignore user status failure if user info succeeded, keep totalSolved 0
    }

    return {
      success: true,
      platform: 'codeforces',
      handle: cleanHandle,
      stats: {
        rating,
        rank,
        totalSolved,
        acceptedSubmissions,
      },
      syncedAt: new Date(),
    };
  } catch (error) {
    const isAbort = error.name === 'AbortError';
    return {
      success: false,
      platform: 'codeforces',
      handle: cleanHandle,
      message: isAbort ? 'Codeforces API request timed out after 5 seconds.' : `Codeforces sync error: ${error.message}`,
    };
  }
};

module.exports = {
  validateHandle,
  fetchCodeforcesStats,
};
