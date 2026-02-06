
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

// Helper for visualizer
const getCharWeight = (char) => {
    const code = char.toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) return code - 96;
    return 0;
};

export const rabinKarpGenerator = function* (text, pattern) {
    const n = text.length;
    const m = pattern.length;

    // Initial Hash Calculation (Sum)
    let p = 0; // Pattern Hash
    let t = 0; // Text Window Hash

    for (let i = 0; i < m; i++) {
        p += getCharWeight(pattern[i]);
        t += getCharWeight(text[i]);
    }

    yield {
        textIndex: -1,
        patternIndex: -1,
        state: 'init',
        message: `Initial Hash: Pattern=${p}, Window=${t}`,
        hashP: p,
        hashT: t
    };

    for (let i = 0; i <= n - m; i++) {
        yield {
            textIndex: i,
            patternIndex: -1,
            state: 'window',
            message: `Comparing Hashes: ${p} vs ${t}`,
            hashP: p,
            hashT: t
        };

        if (p === t) {
            yield {
                textIndex: i,
                patternIndex: 0,
                state: 'hash-match',
                message: `Hash Match! (${p}) Verifying chars...`,
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
                    message: isMatch ? `Char Match: ${text[i + j]}` : `Mismatch at ${text[i + j]}`,
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
                    message: `Pattern found at index ${i}`,
                    hashP: p,
                    hashT: t
                };
            }
        } else {
            // Just a visual step for mismatch
            // No yield here needed specifically unless we want to pause on every non-match hash
            // The 'window' state above covered the comparison visualization
        }

        // Rolling Hash Update
        if (i < n - m) {
            const leavingChar = text[i];
            const enteringChar = text[i + m];
            const leavingWeight = getCharWeight(leavingChar);
            const enteringWeight = getCharWeight(enteringChar);

            const oldT = t;
            t = t - leavingWeight + enteringWeight;

            yield {
                textIndex: i,
                patternIndex: -1,
                state: 'shift', // Using shift to denote the calculation update
                message: `Roll: ${oldT} - ${leavingChar}(${leavingWeight}) + ${enteringChar}(${enteringWeight}) = ${t}`,
                hashP: p,
                hashT: t
            };
        }
    }
    yield { state: 'finished', message: 'Search Completed' };
};
