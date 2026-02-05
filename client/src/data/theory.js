
export const algorithmTheory = {
    naive: {
        title: "Naive String Matching",
        complexity: {
            time: "O((n-m+1) * m)",
            space: "O(1)"
        },
        description: "The Naive String Matching algorithm is the simplest method for finding a pattern within a text. It slides the pattern over the text one by one and checks for a match. If a mismatch is found, it shifts the pattern by one position to the right.",
        steps: [
            "Align the pattern with the beginning of the text.",
            "Compare characters from left to right.",
            "If a mismatch occurs, shift the pattern one position to the right.",
            "Repeat until the entire text is searched or a match is found.",
            "If a full match is found, record the index and continue shifting to find other occurrences."
        ],
        pros: ["Simple to implement", "No preprocessing required", "Good for small texts"],
        cons: ["Inefficient for large texts", "High time complexity in worst case (e.g., text: AAAAA...B, pattern: AAAAAB)"]
    },
    kmp: {
        title: "Knuth-Morris-Pratt (KMP)",
        complexity: {
            time: "O(n + m)",
            space: "O(m)"
        },
        description: "The KMP algorithm improves upon the naive approach by avoiding unnecessary comparisons. It uses a preprocessed 'Partial Match Table' (LPS array) to determine how much to shift the pattern when a mismatch occurs, ensuring we never backtrack in the text.",
        steps: [
            "Preprocess the pattern to create the Longest Prefix Suffix (LPS) array.",
            "Align the pattern with the text.",
            "Compare characters. If a match occurs, move both text and pattern pointers.",
            "If a mismatch occurs, use the LPS array to shift the pattern pointer without moving the text pointer back.",
            "Continue until the end of the text."
        ],
        pros: ["Linear time complexity", "No backtracking in text pointer", "Efficient for large inputs"],
        cons: ["Complex to implement", "Requires extra space for LPS array"]
    },
    rk: {
        title: "Rabin-Karp Algorithm",
        complexity: {
            time: "Average O(n + m), Worst O(nm)",
            space: "O(1)"
        },
        description: "The Rabin-Karp algorithm uses hashing to find any one of a set of pattern strings in a text. It calculates a hash value for the pattern and for each substring of the text of the same length. If the hash values match, it performs a character-by-character check to confirm (handling hash collisions).",
        steps: [
            "Calculate the hash of the pattern.",
            "Calculate the hash of the first window of text.",
            "Slide the window one character at a time.",
            "Update the window hash using a 'rolling hash' formula (remove leading char, add new trailing char).",
            "If hash matches, compare characters to verify.",
            "If characters match, a pattern is found."
        ],
        pros: ["Good for multiple pattern search", "Rolling hash makes updates O(1)"],
        cons: ["Worst case is slow (many collisions)", "Hash calculation overhead"]
    }
};
