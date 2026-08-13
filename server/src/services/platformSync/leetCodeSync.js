/**
 * LeetCode Public GraphQL Sync Adapter
 */

const validateHandle = (handle) => {
  if (!handle || typeof handle !== 'string') return false;
  return /^[a-zA-Z0-9_-]{3,30}$/.test(handle.trim());
};

const fetchLeetCodeStats = async (handle) => {
  const cleanHandle = (handle || '').trim();

  if (!validateHandle(cleanHandle)) {
    return {
      success: false,
      platform: 'leetcode',
      handle: cleanHandle,
      message: 'Invalid LeetCode handle format.',
    };
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Interview-Coach/1.0',
      },
      body: JSON.stringify({
        query,
        variables: { username: cleanHandle },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        platform: 'leetcode',
        handle: cleanHandle,
        message: `LeetCode API HTTP error: ${response.status}`,
      };
    }

    const data = await response.json();
    const matchedUser = data?.data?.matchedUser;

    if (!matchedUser) {
      return {
        success: false,
        platform: 'leetcode',
        handle: cleanHandle,
        message: `LeetCode handle '${cleanHandle}' not found.`,
      };
    }

    const submissionStats = matchedUser.submitStats?.acSubmissionNum || [];
    let totalSolved = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    submissionStats.forEach((stat) => {
      const diff = (stat.difficulty || '').toLowerCase();
      const count = Number(stat.count) || 0;
      if (diff === 'all') totalSolved = count;
      else if (diff === 'easy') easy = count;
      else if (diff === 'medium') medium = count;
      else if (diff === 'hard') hard = count;
    });

    if (totalSolved === 0) {
      totalSolved = easy + medium + hard;
    }

    return {
      success: true,
      platform: 'leetcode',
      handle: cleanHandle,
      stats: {
        totalSolved,
        easy,
        medium,
        hard,
      },
      syncedAt: new Date(),
    };
  } catch (error) {
    const isAbort = error.name === 'AbortError';
    return {
      success: false,
      platform: 'leetcode',
      handle: cleanHandle,
      message: isAbort ? 'LeetCode API request timed out after 5 seconds.' : `LeetCode sync error: ${error.message}`,
    };
  }
};

module.exports = {
  validateHandle,
  fetchLeetCodeStats,
};
