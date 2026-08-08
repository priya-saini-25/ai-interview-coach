/**
 * DSA Question Bank for AI Placement Coach
 * Contains curated problems across key topics, difficulties, companies, and roles.
 */

const dsaQuestionBank = [
  // --- ARRAYS & HASHING ---
  {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    topic: 'Hashing',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'TCS', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer', 'MERN Stack Developer', 'Frontend Developer', 'Data Analyst'],
    tags: ['array', 'hash-table'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    hints: ['Can you solve it in a single pass using a Hash Map?', 'For each element nums[i], check if target - nums[i] exists in the map.']
  },
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    topic: 'Hashing',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Accenture', 'TCS', 'Infosys'],
    roles: ['Frontend Developer', 'Software Engineer', 'MERN Stack Developer', 'Backend Developer'],
    tags: ['array', 'hash-table', 'set'],
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    hints: ['A HashSet stores only unique elements.', 'Inserting elements into a set takes O(1) average time.']
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An Anagram is a word formed by rearranging the letters of a different word using all original letters exactly once.',
    topic: 'Strings',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Cognizant', 'TCS', 'Wipro'],
    roles: ['Frontend Developer', 'Software Engineer', 'MERN Stack Developer'],
    tags: ['string', 'hash-table', 'sorting'],
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    hints: ['Count character frequencies using a frequency array of size 26 or a hash map.']
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
    topic: 'Hashing',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Flipkart'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer', 'MERN Stack Developer'],
    tags: ['array', 'hash-table', 'string', 'sorting'],
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
    hints: ['Use sorted strings as hash map keys or letter frequency counts formatted as key strings.']
  },
  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.',
    topic: 'Heap/Priority Queue',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer', 'Data Analyst'],
    tags: ['hash-table', 'heap', 'bucket-sort'],
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' }
    ],
    constraints: ['1 <= nums.length <= 10^5', 'k is in the range [1, number of unique elements]'],
    hints: ['Count frequencies with a map, then use Bucket Sort or a Min-Heap of size K.']
  },
  {
    id: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. Must run in O(n) without using division.',
    topic: 'Arrays',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Meta', 'Adobe', 'Flipkart'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['array', 'prefix-sum'],
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30'],
    hints: ['Compute prefix products in one pass, then suffix products in a reverse pass.']
  },

  // --- TWO POINTERS ---
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    topic: 'Two Pointers',
    category: 'Two Pointers',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Meta', 'Accenture', 'TCS'],
    roles: ['Frontend Developer', 'Software Engineer', 'MERN Stack Developer'],
    tags: ['two-pointers', 'string'],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    hints: ['Use two pointers (left starting at index 0, right at length - 1) and skip non-alphanumeric chars.']
  },
  {
    id: 'two-sum-ii-input-array-is-sorted',
    title: 'Two Sum II - Input Array Is Sorted',
    slug: 'two-sum-ii-input-array-is-sorted',
    description: 'Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number.',
    topic: 'Two Pointers',
    category: 'Two Pointers',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Adobe', 'Infosys'],
    roles: ['Software Engineer', 'Backend Developer', 'MERN Stack Developer'],
    tags: ['array', 'two-pointers', 'binary-search'],
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]' }
    ],
    constraints: ['2 <= numbers.length <= 3 * 10^4'],
    hints: ['Since array is sorted, if sum < target increment left pointer; if sum > target decrement right pointer.']
  },
  {
    id: '3sum',
    title: '3Sum',
    slug: '3sum',
    description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.',
    topic: 'Two Pointers',
    category: 'Two Pointers',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Flipkart'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['array', 'two-pointers', 'sorting'],
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }
    ],
    constraints: ['3 <= nums.length <= 3000'],
    hints: ['Sort the array first. Loop through each number as fixed first element and use Two Pointers for remaining two.']
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    description: 'Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    topic: 'Two Pointers',
    category: 'Two Pointers',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Adobe', 'Meta', 'Flipkart'],
    roles: ['Software Engineer', 'Frontend Developer', 'Backend Developer'],
    tags: ['array', 'two-pointers', 'greedy'],
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5'],
    hints: ['Start pointers at extreme ends. Move the pointer pointing to shorter line inward.']
  },

  // --- SLIDING WINDOW ---
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    description: 'You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return maximum profit.',
    topic: 'Sliding Window',
    category: 'Sliding Window',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Google', 'TCS', 'Infosys', 'Accenture'],
    roles: ['Frontend Developer', 'Software Engineer', 'MERN Stack Developer', 'Data Analyst'],
    tags: ['array', 'dynamic-programming', 'sliding-window'],
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }
    ],
    constraints: ['1 <= prices.length <= 10^5'],
    hints: ['Track minimum price seen so far and maximum profit obtainable at current price.']
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    topic: 'Sliding Window',
    category: 'Sliding Window',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe', 'TCS'],
    roles: ['Frontend Developer', 'Software Engineer', 'MERN Stack Developer', 'Backend Developer'],
    tags: ['hash-table', 'string', 'sliding-window'],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4'],
    hints: ['Use a set or hash map to maintain unique characters within a sliding window [L, R].']
  },

  // --- STACK & QUEUE ---
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    topic: 'Stack',
    category: 'Stack',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'TCS', 'Wipro', 'Cognizant'],
    roles: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'MERN Stack Developer'],
    tags: ['string', 'stack'],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 10^4'],
    hints: ['Push opening brackets onto a stack. When encountering a closing bracket, check if it matches stack top.']
  },
  {
    id: 'min-stack',
    title: 'Min Stack',
    slug: 'min-stack',
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).',
    topic: 'Stack',
    category: 'Stack',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Google', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['stack', 'design'],
    examples: [
      { input: 'MinStack minStack = new MinStack(); minStack.push(-2); minStack.push(0); minStack.push(-3); minStack.getMin(); // -3', output: '-3' }
    ],
    constraints: ['Methods pop, top and getMin operations will always be called on non-empty stacks.'],
    hints: ['Consider keeping a second auxiliary stack that records the minimum value at each stack depth.']
  },
  {
    id: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    slug: 'implement-queue-using-stacks',
    description: 'Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all normal queue operations (push, peek, pop, empty).',
    topic: 'Queue',
    category: 'Queue',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Accenture', 'TCS'],
    roles: ['Software Engineer', 'Backend Developer', 'MERN Stack Developer'],
    tags: ['stack', 'queue', 'design'],
    examples: [
      { input: 'MyQueue myQueue = new MyQueue(); myQueue.push(1); myQueue.push(2); myQueue.peek(); // 1; myQueue.pop(); // 1', output: '1' }
    ],
    constraints: ['All calls to pop and peek are valid.'],
    hints: ['Maintain an input stack and an output stack. Transfer elements when output stack is empty.']
  },

  // --- LINKED LIST ---
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    topic: 'Linked List',
    category: 'Linked List',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe', 'TCS', 'Infosys'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer', 'MERN Stack Developer'],
    tags: ['linked-list', 'recursion'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }
    ],
    constraints: ['The number of nodes in the list is in the range [0, 5000].'],
    hints: ['Maintain three pointers: prev, curr, next. Point curr.next to prev at each step.']
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list and return its head.',
    topic: 'Linked List',
    category: 'Linked List',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Google', 'Accenture', 'Cognizant'],
    roles: ['Software Engineer', 'Backend Developer', 'MERN Stack Developer'],
    tags: ['linked-list', 'recursion'],
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
    ],
    constraints: ['The number of nodes in both lists is in the range [0, 50].'],
    hints: ['Use a dummy node to simplify boundary head pointer connections.']
  },
  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
    topic: 'Linked List',
    category: 'Linked List',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['linked-list', 'two-pointers'],
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true' }
    ],
    constraints: ['Number of nodes in range [0, 10^4].'],
    hints: ['Use Floyd\'s Tortoise and Hare algorithm (slow moving 1 step, fast moving 2 steps).']
  },

  // --- BINARY SEARCH ---
  {
    id: 'binary-search',
    title: 'Binary Search',
    slug: 'binary-search',
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index; otherwise, return `-1`.',
    topic: 'Binary Search',
    category: 'Binary Search',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys', 'Wipro'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst'],
    tags: ['array', 'binary-search'],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }
    ],
    constraints: ['1 <= nums.length <= 10^4'],
    hints: ['Calculate mid = L + (R - L) / 2 to avoid overflow.']
  },
  {
    id: 'search-a-2d-matrix',
    title: 'Search a 2D Matrix',
    slug: 'search-a-2d-matrix',
    description: 'You are given an `m x n` integer matrix with properties where each row is sorted and the first integer of each row is greater than the last integer of the previous row. Search for target.',
    topic: 'Binary Search',
    category: 'Binary Search',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Google', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer', 'Data Analyst'],
    tags: ['array', 'binary-search', 'matrix'],
    examples: [
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' }
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 100'],
    hints: ['Treat the 2D matrix as a flattened 1D array of size m * n.']
  },

  // --- TREES & BST ---
  {
    id: 'maximum-depth-of-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    description: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    topic: 'Trees',
    category: 'Trees',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'TCS'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer', 'MERN Stack Developer'],
    tags: ['tree', 'depth-first-search', 'breadth-first-search'],
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].'],
    hints: ['Recursive DFS: 1 + Math.max(maxDepth(left), maxDepth(right)).']
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    description: 'Given the root of a binary tree, invert the tree, and return its root (mirror image).',
    topic: 'Trees',
    category: 'Trees',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Accenture'],
    roles: ['Software Engineer', 'Backend Developer', 'Frontend Developer'],
    tags: ['tree', 'depth-first-search'],
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }
    ],
    constraints: ['Number of nodes in tree is in range [0, 100].'],
    hints: ['Swap the left and right child pointers recursively.']
  },
  {
    id: 'validate-binary-search-tree',
    title: 'Validate Binary Search Tree',
    slug: 'validate-binary-search-tree',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    topic: 'BST',
    category: 'Trees',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['tree', 'depth-first-search', 'binary-search-tree'],
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' }
    ],
    constraints: ['Number of nodes in range [1, 10^4].'],
    hints: ['Pass min and max bounds recursively for each subtree.']
  },
  {
    id: 'lowest-common-ancestor-of-a-binary-search-tree',
    title: 'Lowest Common Ancestor of a BST',
    slug: 'lowest-common-ancestor-of-a-binary-search-tree',
    description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.',
    topic: 'BST',
    category: 'Trees',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta'],
    roles: ['Software Engineer', 'Backend Developer'],
    tags: ['tree', 'binary-search-tree'],
    examples: [
      { input: 'root = [6,2,8,0,4,7,9], p = 2, q = 8', output: '6' }
    ],
    constraints: ['Number of nodes in range [2, 10^5].'],
    hints: ['If both p and q are smaller than root, LCA lies in left subtree; if both greater, in right subtree.']
  },

  // --- HEAP / PRIORITY QUEUE ---
  {
    id: 'kth-largest-element-in-an-array',
    title: 'Kth Largest Element in an Array',
    slug: 'kth-largest-element-in-an-array',
    description: 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element.',
    topic: 'Heap/Priority Queue',
    category: 'Heap / Priority Queue',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Flipkart'],
    roles: ['Software Engineer', 'Backend Developer', 'Data Analyst'],
    tags: ['array', 'heap', 'quickselect'],
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }
    ],
    constraints: ['1 <= k <= nums.length <= 10^5'],
    hints: ['Use a Min-Heap of size K or QuickSelect algorithm for O(N) average time.']
  },

  // --- RECURSION & BACKTRACKING ---
  {
    id: 'subsets',
    title: 'Subsets',
    slug: 'subsets',
    description: 'Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
    topic: 'Backtracking',
    category: 'Recursion & Backtracking',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['array', 'backtracking', 'bit-manipulation'],
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }
    ],
    constraints: ['1 <= nums.length <= 10'],
    hints: ['Backtracking choice: at index i, decide whether to include nums[i] or exclude it.']
  },
  {
    id: 'permutations',
    title: 'Permutations',
    slug: 'permutations',
    description: 'Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.',
    topic: 'Recursion',
    category: 'Recursion & Backtracking',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer'],
    tags: ['array', 'backtracking'],
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }
    ],
    constraints: ['1 <= nums.length <= 6'],
    hints: ['Use recursion with a visited boolean array or element swapping.']
  },

  // --- GREEDY ---
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    slug: 'maximum-subarray',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    topic: 'Greedy',
    category: 'Greedy & Dynamic Programming',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'TCS', 'Infosys'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer', 'MERN Stack Developer', 'Data Analyst'],
    tags: ['array', 'divide-and-conquer', 'dynamic-programming'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    hints: ['Kadane\'s Algorithm: currentSum = max(num, currentSum + num).']
  },
  {
    id: 'jump-game',
    title: 'Jump Game',
    slug: 'jump-game',
    description: 'You are given an integer array `nums`. You are initially positioned at the array\'s first index. Return `true` if you can reach the last index, or `false` otherwise.',
    topic: 'Greedy',
    category: 'Greedy & Dynamic Programming',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    roles: ['Software Engineer', 'Backend Developer'],
    tags: ['array', 'greedy', 'dynamic-programming'],
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true' },
      { input: 'nums = [3,2,1,0,4]', output: 'false' }
    ],
    constraints: ['1 <= nums.length <= 10^4'],
    hints: ['Track maximum reachable index from left to right.']
  },

  // --- DYNAMIC PROGRAMMING ---
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    topic: 'Dynamic Programming',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS', 'Accenture', 'Cognizant'],
    roles: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'MERN Stack Developer'],
    tags: ['math', 'dynamic-programming', 'memoization'],
    examples: [
      { input: 'n = 2', output: '2' },
      { input: 'n = 3', output: '3' }
    ],
    constraints: ['1 <= n <= 45'],
    hints: ['dp[i] = dp[i-1] + dp[i-2]. It is identical to Fibonacci sequence.']
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    slug: 'coin-change',
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount`. Return fewest number of coins needed to make up that amount.',
    topic: 'Dynamic Programming',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Flipkart'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['array', 'dynamic-programming', 'breadth-first-search'],
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' }
    ],
    constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10^4'],
    hints: ['Bottom-up DP: dp[i] = min(dp[i], 1 + dp[i - coin]) for each coin.']
  },
  {
    id: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    slug: 'longest-increasing-subsequence',
    description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
    topic: 'Dynamic Programming',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer'],
    tags: ['array', 'binary-search', 'dynamic-programming'],
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], length 4.' }
    ],
    constraints: ['1 <= nums.length <= 2500'],
    hints: ['O(N^2) DP or O(N log N) using Patience Sorting with binary search.']
  },

  // --- GRAPHS ---
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the number of islands.',
    topic: 'Graphs',
    category: 'Graphs',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Flipkart'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['array', 'depth-first-search', 'breadth-first-search', 'matrix'],
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' }
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
    hints: ['Iterate through each cell. When finding a "1", increment island count and run BFS/DFS to sink connected land.']
  },
  {
    id: 'clone-graph',
    title: 'Clone Graph',
    slug: 'clone-graph',
    description: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.',
    topic: 'Graphs',
    category: 'Graphs',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    roles: ['Software Engineer', 'Backend Developer'],
    tags: ['hash-table', 'depth-first-search', 'breadth-first-search', 'graph'],
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' }
    ],
    constraints: ['The number of nodes in the graph is in the range [0, 100].'],
    hints: ['Use a hash map to map original nodes to their cloned node copies during DFS/BFS traversal.']
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule',
    slug: 'course-schedule',
    description: 'There are a total of `numCourses` courses you have to take, labeled from 0 to `numCourses - 1`. You are given an array `prerequisites`. Return `true` if you can finish all courses, otherwise return `false`.',
    topic: 'Graphs',
    category: 'Graphs',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe'],
    roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
    tags: ['depth-first-search', 'breadth-first-search', 'graph', 'topological-sort'],
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }
    ],
    constraints: ['1 <= numCourses <= 2000'],
    hints: ['This is cycle detection in a directed graph. Use Kahn\'s algorithm (Topological Sort using in-degrees).']
  }
];

module.exports = dsaQuestionBank;
