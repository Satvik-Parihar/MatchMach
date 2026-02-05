
export const naiveGenerator = function* (text, pattern) {
    const n = text.length;
    const m = pattern.length;

    for (let i = 0; i <= n - m; i++) {
        yield {
            textIndex: i,
            patternIndex: 0,
            state: 'window',
            message: `Checking window starting at index ${i}`
        };

        let j;
        for (j = 0; j < m; j++) {
            const isMatch = text[i + j] === pattern[j];
            yield {
                textIndex: i + j,
                patternIndex: j,
                state: isMatch ? 'match' : 'mismatch',
                message: isMatch ? `Match at index ${i + j}` : `Mismatch at index ${i + j}`,
                matchType: isMatch ? 'hit' : 'miss' // Helpers for history/stats
            };

            if (!isMatch) {
                break;
            }
        }
        if (j === m) {
            yield {
                textIndex: i,
                patternIndex: m - 1,
                state: 'found',
                message: `Pattern found starting at index ${i}`
            };
        }
    }
    yield { state: 'finished', message: 'Search Completed' };
};

export const kmpGenerator = function* (text, pattern) {
    const n = text.length;
    const m = pattern.length;

    // Compute LPS
    const lps = Array(m).fill(0);
    let len = 0;
    let i = 1;
    while (i < m) {
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

    // Yield initial state with LPS table
    yield {
        textIndex: -1,
        patternIndex: -1,
        state: 'init',
        message: 'LPS Table Computed',
        lps: [...lps] // Pass LPS table
    };

    let textIdx = 0;
    let patIdx = 0;

    while (textIdx < n) {
        const isMatch = text[textIdx] === pattern[patIdx];
        yield {
            textIndex: textIdx,
            patternIndex: patIdx,
            state: isMatch ? 'match' : 'mismatch',
            message: isMatch ? `Match at text[${textIdx}]` : `Mismatch at text[${textIdx}] vs pattern[${patIdx}]`,
            lps: [...lps]
        };

        if (pattern[patIdx] === text[textIdx]) {
            patIdx++;
            textIdx++;
        }

        if (patIdx === m) {
            yield {
                textIndex: textIdx - patIdx,
                patternIndex: patIdx - 1,
                state: 'found',
                message: `Pattern found at index ${textIdx - patIdx}`,
                lps: [...lps]
            };
            patIdx = lps[patIdx - 1];
        } else if (textIdx < n && pattern[patIdx] !== text[textIdx]) {
            if (patIdx !== 0) {
                yield {
                    textIndex: textIdx,
                    patternIndex: patIdx,
                    state: 'shift',
                    message: `Mismatch! patIdx was ${patIdx}, shifting to LPS[${patIdx - 1}] = ${lps[patIdx - 1]}`,
                    lps: [...lps]
                };
                patIdx = lps[patIdx - 1];
            } else {
                textIdx++;
            }
        }
    }
    yield { state: 'finished', message: 'Search Completed', lps: [...lps] };
};

export const rabinKarpGenerator = function* (text, pattern) {
    const d = 256;
    const q = 101;
    const n = text.length;
    const m = pattern.length;
    let p = 0;
    let t = 0;
    let h = 1;

    for (let i = 0; i < m - 1; i++) {
        h = (h * d) % q;
    }

    for (let i = 0; i < m; i++) {
        p = (d * p + pattern.charCodeAt(i)) % q;
        t = (d * t + text.charCodeAt(i)) % q;
    }

    for (let i = 0; i <= n - m; i++) {
        yield {
            textIndex: i,
            patternIndex: -1,
            state: 'window',
            message: `Comparing Hash Values`,
            hashP: p,
            hashT: t
        };

        if (p === t) {
            yield {
                textIndex: i,
                patternIndex: 0,
                state: 'hash-match',
                message: `Hash Match! Checking characters...`,
                hashP: p,
                hashT: t
            };

            let j;
            for (j = 0; j < m; j++) {
                const isMatch = text[i + j] === pattern[j];
                yield {
                    textIndex: i + j,
                    patternIndex: j,
                    state: isMatch ? 'match' : 'mismatch',
                    message: isMatch ? `Char Match: ${text[i + j]}` : `Char Mismatch`,
                    hashP: p,
                    hashT: t
                };
                if (!isMatch) break;
            }
            if (j === m) {
                yield {
                    textIndex: i,
                    patternIndex: 0,
                    state: 'found',
                    message: `Pattern found at ${i}`,
                    hashP: p,
                    hashT: t
                };
            }
        } else {
            yield {
                textIndex: i,
                patternIndex: -1, // No specific character pattern index during hash check
                state: 'hash-mismatch',
                message: `Hash Mismatch: ${p} != ${t}`,
                hashP: p,
                hashT: t
            };
        }

        if (i < n - m) {
            t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
            if (t < 0) t = (t + q);
        }
    }
    yield { state: 'finished', message: 'Search Completed' };
};
