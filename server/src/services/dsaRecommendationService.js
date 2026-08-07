const dsaQuestionBank = require('../data/dsaQuestionBank');

/**
 * Role-to-Topic Priority Weights
 */
const ROLE_TOPIC_WEIGHTS = {
  'frontend developer': {
    Strings: 4,
    Arrays: 4,
    Hashing: 4,
    'Two Pointers': 4,
    'Sliding Window': 4,
    Recursion: 3,
    Stack: 2,
    'Linked List': 2,
    Trees: 1,
    Graphs: 1,
  },
  'backend developer': {
    Arrays: 4,
    Hashing: 4,
    Trees: 4,
    BST: 4,
    Graphs: 4,
    'Binary Search': 4,
    'Heap/Priority Queue': 4,
    'Linked List': 3,
    Stack: 3,
    Queue: 3,
    'Dynamic Programming': 3,
  },
  'software engineer': {
    Arrays: 3,
    Strings: 3,
    Hashing: 3,
    'Two Pointers': 3,
    'Sliding Window': 3,
    Stack: 3,
    Queue: 3,
    'Linked List': 3,
    'Binary Search': 3,
    Trees: 3,
    BST: 3,
    'Heap/Priority Queue': 3,
    Backtracking: 3,
    Greedy: 3,
    'Dynamic Programming': 3,
    Graphs: 3,
  },
  'mern stack developer': {
    Arrays: 4,
    Strings: 4,
    Hashing: 4,
    'Two Pointers': 4,
    'Sliding Window': 4,
    Stack: 3,
    Queue: 3,
    'Linked List': 3,
    Trees: 3,
    'Dynamic Programming': 2,
  },
  'full stack developer': {
    Arrays: 4,
    Strings: 4,
    Hashing: 4,
    'Two Pointers': 3,
    'Sliding Window': 3,
    Stack: 3,
    Queue: 3,
    'Linked List': 3,
    Trees: 3,
    Graphs: 3,
    'Dynamic Programming': 2,
  },
  'data analyst': {
    Arrays: 4,
    Strings: 4,
    Hashing: 4,
    Greedy: 3,
    'Binary Search': 3,
    Stack: 2,
    Queue: 2,
  },
};

/**
 * Normalizes input role/company string for loose matching
 */
const normalizeStr = (str) => (str ? str.toLowerCase().trim() : '');

/**
 * Calculates a recommendation score for a problem based on target role, company, and difficulty.
 */
function calculateScore(problem, roleNorm, companyNorm, difficultyFilter) {
  let score = 1; // base score

  // 1. Role match in problem metadata
  if (roleNorm && problem.roles) {
    const hasRoleMatch = problem.roles.some((r) => normalizeStr(r).includes(roleNorm) || roleNorm.includes(normalizeStr(r)));
    if (hasRoleMatch) score += 3;
  }

  // 2. Role-specific topic priority
  const roleWeights = ROLE_TOPIC_WEIGHTS[roleNorm] || ROLE_TOPIC_WEIGHTS['software engineer'];
  if (roleWeights && roleWeights[problem.topic]) {
    score += roleWeights[problem.topic];
  }

  // 3. Company match (fallback gracefully if not found)
  if (companyNorm && problem.companies) {
    const hasCompanyMatch = problem.companies.some((c) => normalizeStr(c).includes(companyNorm) || companyNorm.includes(normalizeStr(c)));
    if (hasCompanyMatch) score += 3;
  }

  // 4. Difficulty match filter
  if (difficultyFilter && problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase()) {
    score += 2;
  }

  return score;
}

/**
 * Recommendation Service Entry Point
 */
exports.getRecommendedProblems = (targetRole, targetCompany, userProgress = [], queryFilters = {}) => {
  const roleNorm = normalizeStr(targetRole || 'Software Engineer');
  const companyNorm = normalizeStr(targetCompany || '');
  const { topic: filterTopic, difficulty: filterDifficulty, status: filterStatus } = queryFilters;

  // Build lookup map for user progress records by problemId or topic name
  const progressMapByProblemId = new Map();
  const progressMapByTopic = new Map();

  userProgress.forEach((item) => {
    if (item.problemId) {
      progressMapByProblemId.set(item.problemId, item);
    }
    if (item.topic) {
      progressMapByTopic.set(item.topic.toLowerCase(), item);
    }
  });

  // Calculate scores and merge user solve state
  let enrichedProblems = dsaQuestionBank.map((problem) => {
    const userProg = progressMapByProblemId.get(problem.id) || progressMapByTopic.get(problem.title.toLowerCase());
    
    let status = 'Not Started';
    let solvedAt = null;
    let progressId = null;
    let savedForRevision = false;

    if (userProg) {
      progressId = userProg._id ? userProg._id.toString() : null;
      savedForRevision = !!userProg.savedForRevision;
      if (userProg.completed || userProg.status === 'Solved') {
        status = 'Solved';
        solvedAt = userProg.completedAt || userProg.updatedAt;
      } else if (userProg.status === 'In Progress') {
        status = 'In Progress';
      }
    }

    const score = calculateScore(problem, roleNorm, companyNorm, filterDifficulty);

    return {
      ...problem,
      status,
      savedForRevision,
      solvedAt,
      progressId,
      score,
    };
  });

  // Apply optional query filters
  if (filterTopic) {
    enrichedProblems = enrichedProblems.filter((p) => p.topic.toLowerCase() === filterTopic.toLowerCase() || p.category.toLowerCase().includes(filterTopic.toLowerCase()));
  }

  if (filterDifficulty) {
    enrichedProblems = enrichedProblems.filter((p) => p.difficulty.toLowerCase() === filterDifficulty.toLowerCase());
  }

  if (filterStatus) {
    const normStatus = filterStatus.toLowerCase();
    if (normStatus === 'solved') {
      enrichedProblems = enrichedProblems.filter((p) => p.status === 'Solved');
    } else if (normStatus === 'pending' || normStatus === 'unsolved') {
      enrichedProblems = enrichedProblems.filter((p) => p.status !== 'Solved');
    } else if (normStatus === 'in progress') {
      enrichedProblems = enrichedProblems.filter((p) => p.status === 'In Progress');
    } else if (normStatus === 'saved' || normStatus === 'saved for revision') {
      enrichedProblems = enrichedProblems.filter((p) => p.savedForRevision === true);
    }
  }

  // Sort by status (Unsolved first, Solved last) and then score descending
  enrichedProblems.sort((a, b) => {
    const aSolved = a.status === 'Solved' ? 1 : 0;
    const bSolved = b.status === 'Solved' ? 1 : 0;

    if (aSolved !== bSolved) {
      return aSolved - bSolved;
    }
    return b.score - a.score;
  });

  const solvedCount = enrichedProblems.filter((p) => p.status === 'Solved').length;
  const inProgressCount = enrichedProblems.filter((p) => p.status === 'In Progress').length;

  return {
    targetRole: targetRole || 'Software Engineer',
    targetCompany: targetCompany || '',
    total: enrichedProblems.length,
    solved: solvedCount,
    inProgress: inProgressCount,
    problems: enrichedProblems,
  };
};

/**
 * Gets a single problem by ID or slug
 */
exports.getProblemById = (idOrSlug) => {
  const normId = normalizeStr(idOrSlug);
  return dsaQuestionBank.find((p) => normalizeStr(p.id) === normId || normalizeStr(p.slug) === normId);
};
