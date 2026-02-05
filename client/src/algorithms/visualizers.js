
export const naiveGenerator = function* (text, pattern) {
    const n = text.length;
    const m = pattern.length;

    for (let i = 0; i <= n - m; i++) {
        // Highlight the window we are checking
        yield {
            textIndex: i,
            patternIndex: 0,
            state: 'window',
            message: `Checking window ensuring at index ${i}`
        };

        let j;
        for (j = 0; j < m; j++) {
            const isMatch = text[i + j] === pattern[j];
            yield {
                textIndex: i + j,
                patternIndex: j,
                state: isMatch ? 'match' : 'mismatch',
                message: isMatch ? `Compute: ${text[i + j]} == ${pattern[j]}` : `Mismatch: ${text[i + j]} != ${pattern[j]}`
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

    // Compute LPS - Yielding steps for LPS computation could be separate, 
    // but here we just compute it for the search phase.
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

    let textIdx = 0; // i
    let patIdx = 0;  // j

    while (textIdx < n) {
        // Highlight comparison
        const isMatch = text[textIdx] === pattern[patIdx];
        yield {
            textIndex: textIdx,
            patternIndex: patIdx,
            state: isMatch ? 'match' : 'mismatch',
            message: isMatch ? `Match at ${textIdx}` : `Mismatch at ${textIdx}`
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
                message: `Pattern found at index ${textIdx - patIdx}`
            };
            patIdx = lps[patIdx - 1];
        } else if (textIdx < n && pattern[patIdx] !== text[textIdx]) {
            if (patIdx !== 0) {
                yield {
                    textIndex: textIdx,
                    patternIndex: patIdx,
                    state: 'shift',
                    message: `Mismatch after partial match. Shifting pattern using LPS.`
                };
                patIdx = lps[patIdx - 1];
            } else {
                textIdx++;
            }
        }
    }
    yield { state: 'finished', message: 'Search Completed' };
};

export const rabinKarpGenerator = function* (text, pattern) {
    const d = 256;
    const q = 101;
    const n = text.length;
    const m = pattern.length;
    let p = 0;
    let t = 0;
    let h = 1;

    // H value
    for (let i = 0; i < m - 1; i++) {
        h = (h * d) % q;
    }

    // Calculate hash
    for (let i = 0; i < m; i++) {
        p = (d * p + pattern.charCodeAt(i)) % q;
        t = (d * t + text.charCodeAt(i)) % q;
    }

    for (let i = 0; i <= n - m; i++) {
        yield {
            textIndex: i,
            patternIndex: 0,
            state: 'window',
            message: `Checking hash: P(${p}) vs T(${t})`
        };

        if (p === t) {
            yield {
                textIndex: i,
                patternIndex: 0,
                state: 'hash-match',
                message: `Hash Match! Checking characters...`
            };

            let j;
            for (j = 0; j < m; j++) {
                const isMatch = text[i + j] === pattern[j];
                yield {
                    textIndex: i + j,
                    patternIndex: j,
                    state: isMatch ? 'match' : 'mismatch',
                    message: isMatch ? `Char Match: ${text[i + j]}` : `Char Mismatch`
                };
                if (!isMatch) break;
            }
            if (j === m) {
                yield {
                    textIndex: i,
                    patternIndex: 0,
                    state: 'found',
                    message: `Pattern found at ${i}`
                };
            }
        } else {
            yield {
                textIndex: i,
                patternIndex: 0,
                state: 'hash-mismatch',
                message: `Hash Mismatch`
            };
        }

        if (i < n - m) {
            t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
            if (t < 0) t = (t + q);
        }
    }
    yield { state: 'finished', message: 'Search Completed' };
};
