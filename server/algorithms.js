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

// Rabin-Karp Algorithm
function rabinKarp(text, pattern) {
    const d = 256; // Number of characters in the input alphabet
    const q = 101; // A prime number
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let steps = 0;
    
    // If pattern is empty or longer than text
    if(m === 0 || m > n) return { matches: [], time: 0, steps: 0 };

    const start = performance.now();
    let p = 0; // Hash value for pattern
    let t = 0; // Hash value for text
    let h = 1;

    // The value of h would be "pow(d, m-1)%q"
    for (let i = 0; i < m - 1; i++) {
        h = (h * d) % q;
        steps++;
    }

    // Calculate the hash value of pattern and first window of text
    for (let i = 0; i < m; i++) {
        p = (d * p + pattern.charCodeAt(i)) % q;
        t = (d * t + text.charCodeAt(i)) % q;
        steps++;
    }

    // Slide the pattern over text one by one
    for (let i = 0; i <= n - m; i++) {
        // Check the hash values of current window of text and pattern.
        // If the hash values match then only check for characters one by one
        steps++; // outer comparison
        if (p === t) {
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

        // Calculate hash value for next window of text: Remove leading digit,
        // add trailing digit
        if (i < n - m) {
            t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;

            // We might get negative value of t, converting it to positive
            if (t < 0) {
                t = (t + q);
            }
        }
    }
    const end = performance.now();
    return { matches, time: end - start, steps };
}

module.exports = { naive, kmp, rabinKarp };
