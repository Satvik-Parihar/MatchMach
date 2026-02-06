const { performance } = require('perf_hooks');

// Naive String Matching
function naive(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let steps = 0; // Operation count for comparison

    const start = performance.now();
    for (let i = 0; i <= n - m; i++) {
        let j;
        for (j = 0; j < m; j++) {
            steps++;
            if (text[i + j] !== pattern[j]) {
                break;
            }
        }
        if (j === m) {
            matches.push(i);
        }
    }
    const end = performance.now();
    return { matches, time: end - start, steps };
}

// KMP Algorithm
function computeLPSArray(pattern) {
    const m = pattern.length;
    const lps = Array(m).fill(0);
    let len = 0;
    let i = 1;
    let steps = 0;

    while (i < m) {
        steps++;
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return { lps, steps };
}

function kmp(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let steps = 0;

    const start = performance.now();
    const { lps, steps: lpsSteps } = computeLPSArray(pattern);
    steps += lpsSteps;

    let i = 0;
    let j = 0;
    while (i < n) {
        steps++;
        if (pattern[j] === text[i]) {
            j++;
            i++;
        }
        if (j === m) {
            matches.push(i - j);
            j = lps[j - 1];
        } else if (i < n && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    const end = performance.now();
    return { matches, time: end - start, steps };
}

// Rabin-Karp Algorithm with Simple Sum Hash (a=1, b=2...)
// Helper to get weight: a/A=1, b/B=2, ... z/Z=26, others=0
function getCharWeight(char) {
    const code = char.toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) return code - 96;
    return 0;
}

function rabinKarp(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let steps = 0;

    // If pattern is empty or longer than text
    if (m === 0 || m > n) return { matches: [], time: 0, steps: 0 };

    const start = performance.now();
    let p = 0; // Hash value for pattern
    let t = 0; // Hash value for text window

    // Calculate initial hash (Sum of weights)
    for (let i = 0; i < m; i++) {
        p += getCharWeight(pattern[i]);
        t += getCharWeight(text[i]);
        steps++;
    }

    // Slide the pattern over text one by one
    for (let i = 0; i <= n - m; i++) {
        steps++; // outer check

        // 1. Check Hash
        if (p === t) {
            // 2. If Hash matches, check characters
            let j;
            for (j = 0; j < m; j++) {
                steps++;
                if (text[i + j] !== pattern[j]) {
                    break;
                }
            }
            if (j === m) {
                matches.push(i);
            }
        }

        // 3. Rolling Hash: Remove leading, add trailing
        if (i < n - m) {
            const leavingWeight = getCharWeight(text[i]);
            const enteringWeight = getCharWeight(text[i + m]);

            t = t - leavingWeight + enteringWeight;
        }
    }
    const end = performance.now();
    return { matches, time: end - start, steps };
}

module.exports = { naive, kmp, rabinKarp };
