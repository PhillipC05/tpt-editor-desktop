/**
 * TPT Asset Editor Desktop - Math Utilities
 * Mathematical functions and utilities for calculations and transformations
 */

class MathUtils {
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    static lerp(start, end, t) {
        return start + (end - start) * this.clamp(t, 0, 1);
    }

    /**
     * Inverse linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} value - Value to find t for
     * @returns {number} Interpolation factor (0-1)
     */
    static inverseLerp(start, end, value) {
        if (start === end) return 0;
        return this.clamp((value - start) / (end - start), 0, 1);
    }

    /**
     * Map a value from one range to another
     * @param {number} value - Value to map
     * @param {number} fromMin - Source range minimum
     * @param {number} fromMax - Source range maximum
     * @param {number} toMin - Target range minimum
     * @param {number} toMax - Target range maximum
     * @returns {number} Mapped value
     */
    static map(value, fromMin, fromMax, toMin, toMax) {
        const t = this.inverseLerp(fromMin, fromMax, value);
        return this.lerp(toMin, toMax, t);
    }

    /**
     * Smooth step function (smooth interpolation)
     * @param {number} edge0 - Lower edge
     * @param {number} edge1 - Upper edge
     * @param {number} x - Input value
     * @returns {number} Smooth stepped value
     */
    static smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    /**
     * Smoother step function (even smoother interpolation)
     * @param {number} edge0 - Lower edge
     * @param {number} edge1 - Upper edge
     * @param {number} x - Input value
     * @returns {number} Smoother stepped value
     */
    static smootherstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Calculate distance between two points
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Distance between points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate distance squared (faster than distance when comparing)
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Distance squared between points
     */
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    /**
     * Calculate angle between two points in radians
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Angle in radians
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    static radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Normalize angle to range [0, 2π)
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    static normalizeAngle(angle) {
        const twoPi = 2 * Math.PI;
        return ((angle % twoPi) + twoPi) % twoPi;
    }

    /**
     * Calculate shortest angle difference
     * @param {number} angle1 - First angle in radians
     * @param {number} angle2 - Second angle in radians
     * @returns {number} Shortest angle difference
     */
    static angleDifference(angle1, angle2) {
        const diff = this.normalizeAngle(angle2 - angle1);
        return diff > Math.PI ? diff - 2 * Math.PI : diff;
    }

    /**
     * Linearly interpolate between two angles
     * @param {number} start - Start angle in radians
     * @param {number} end - End angle in radians
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated angle
     */
    static lerpAngle(start, end, t) {
        const diff = this.angleDifference(start, end);
        return this.normalizeAngle(start + diff * this.clamp(t, 0, 1));
    }

    /**
     * Check if point is inside rectangle
     * @param {number} px - Point x
     * @param {number} py - Point y
     * @param {number} rx - Rectangle x
     * @param {number} ry - Rectangle y
     * @param {number} rw - Rectangle width
     * @param {number} rh - Rectangle height
     * @returns {boolean} True if point is inside rectangle
     */
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    /**
     * Check if point is inside circle
     * @param {number} px - Point x
     * @param {number} py - Point y
     * @param {number} cx - Circle center x
     * @param {number} cy - Circle center y
     * @param {number} radius - Circle radius
     * @returns {boolean} True if point is inside circle
     */
    static pointInCircle(px, py, cx, cy, radius) {
        return this.distanceSquared(px, py, cx, cy) <= radius * radius;
    }

    /**
     * Check if rectangles overlap
     * @param {number} x1 - First rectangle x
     * @param {number} y1 - First rectangle y
     * @param {number} w1 - First rectangle width
     * @param {number} h1 - First rectangle height
     * @param {number} x2 - Second rectangle x
     * @param {number} y2 - Second rectangle y
     * @param {number} w2 - Second rectangle width
     * @param {number} h2 - Second rectangle height
     * @returns {boolean} True if rectangles overlap
     */
    static rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }

    /**
     * Generate random number in range
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} Random number
     */
    static random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate random integer in range
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} Random integer
     */
    static randomInt(min, max) {
        return Math.floor(this.random(min, max));
    }

    /**
     * Generate random boolean with given probability
     * @param {number} probability - Probability of returning true (0-1)
     * @returns {boolean} Random boolean
     */
    static randomBool(probability = 0.5) {
        return Math.random() < probability;
    }

    /**
     * Pick random item from array
     * @param {Array} array - Array to pick from
     * @returns {*} Random item from array
     */
    static randomChoice(array) {
        if (!array || array.length === 0) return null;
        return array[this.randomInt(0, array.length)];
    }

    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.randomInt(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Calculate mean (average) of array of numbers
     * @param {number[]} numbers - Array of numbers
     * @returns {number} Mean value
     */
    static mean(numbers) {
        if (!numbers || numbers.length === 0) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    }

    /**
     * Calculate median of array of numbers
     * @param {number[]} numbers - Array of numbers
     * @returns {number} Median value
     */
    static median(numbers) {
        if (!numbers || numbers.length === 0) return 0;

        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            return sorted[mid];
        }
    }

    /**
     * Calculate standard deviation of array of numbers
     * @param {number[]} numbers - Array of numbers
     * @returns {number} Standard deviation
     */
    static standardDeviation(numbers) {
        if (!numbers || numbers.length === 0) return 0;

        const avg = this.mean(numbers);
        const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
        const avgSquareDiff = this.mean(squareDiffs);

        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculate variance of array of numbers
     * @param {number[]} numbers - Array of numbers
     * @returns {number} Variance
     */
    static variance(numbers) {
        if (!numbers || numbers.length === 0) return 0;

        const avg = this.mean(numbers);
        const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));

        return this.mean(squareDiffs);
    }

    /**
     * Find minimum and maximum values in array
     * @param {number[]} numbers - Array of numbers
     * @returns {Object} Object with min and max properties
     */
    static minMax(numbers) {
        if (!numbers || numbers.length === 0) {
            return { min: 0, max: 0 };
        }

        return {
            min: Math.min(...numbers),
            max: Math.max(...numbers)
        };
    }

    /**
     * Round number to specified decimal places
     * @param {number} value - Value to round
     * @param {number} decimals - Number of decimal places
     * @returns {number} Rounded value
     */
    static round(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    /**
     * Floor number to specified decimal places
     * @param {number} value - Value to floor
     * @param {number} decimals - Number of decimal places
     * @returns {number} Floored value
     */
    static floor(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.floor(value * factor) / factor;
    }

    /**
     * Ceil number to specified decimal places
     * @param {number} value - Value to ceil
     * @param {number} decimals - Number of decimal places
     * @returns {number} Ceiled value
     */
    static ceil(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.ceil(value * factor) / factor;
    }

    /**
     * Check if number is approximately equal to another
     * @param {number} a - First number
     * @param {number} b - Second number
     * @param {number} epsilon - Tolerance for comparison
     * @returns {boolean} True if numbers are approximately equal
     */
    static approximately(a, b, epsilon = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }

    /**
     * Calculate percentage of value relative to total
     * @param {number} value - Value to calculate percentage for
     * @param {number} total - Total value
     * @param {number} decimals - Decimal places for result
     * @returns {number} Percentage value
     */
    static percentage(value, total, decimals = 1) {
        if (total === 0) return 0;
        return this.round((value / total) * 100, decimals);
    }

    /**
     * Convert number to ordinal string (1st, 2nd, 3rd, etc.)
     * @param {number} num - Number to convert
     * @returns {string} Ordinal string
     */
    static toOrdinal(num) {
        const j = num % 10;
        const k = num % 100;

        if (j === 1 && k !== 11) return num + 'st';
        if (j === 2 && k !== 12) return num + 'nd';
        if (j === 3 && k !== 13) return num + 'rd';
        return num + 'th';
    }

    /**
     * Format number with commas as thousands separator
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Calculate factorial of a number
     * @param {number} n - Number to calculate factorial for
     * @returns {number} Factorial result
     */
    static factorial(n) {
        if (n < 0) return 0;
        if (n === 0 || n === 1) return 1;

        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * Calculate binomial coefficient (n choose k)
     * @param {number} n - Total number of items
     * @param {number} k - Number of items to choose
     * @returns {number} Binomial coefficient
     */
    static binomial(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;

        k = Math.min(k, n - k);
        let result = 1;

        for (let i = 1; i <= k; i++) {
            result *= (n - k + i) / i;
        }

        return Math.round(result);
    }

    /**
     * Calculate greatest common divisor (GCD)
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {number} Greatest common divisor
     */
    static gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);

        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }

        return a;
    }

    /**
     * Calculate least common multiple (LCM)
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {number} Least common multiple
     */
    static lcm(a, b) {
        return Math.abs(a * b) / this.gcd(a, b);
    }

    /**
     * Check if number is prime
     * @param {number} num - Number to check
     * @returns {boolean} True if number is prime
     */
    static isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;

        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }

        return true;
    }

    /**
     * Generate array of prime numbers up to limit
     * @param {number} limit - Upper limit
     * @returns {number[]} Array of prime numbers
     */
    static generatePrimes(limit) {
        const primes = [];
        const sieve = new Array(limit + 1).fill(true);

        sieve[0] = sieve[1] = false;

        for (let i = 2; i * i <= limit; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) {
                    sieve[j] = false;
                }
            }
        }

        for (let i = 2; i <= limit; i++) {
            if (sieve[i]) primes.push(i);
        }

        return primes;
    }

    /**
     * Calculate fibonacci number at position n
     * @param {number} n - Position in fibonacci sequence
     * @returns {number} Fibonacci number
     */
    static fibonacci(n) {
        if (n < 0) return 0;
        if (n === 0 || n === 1) return n;

        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
            const temp = a + b;
            a = b;
            b = temp;
        }

        return b;
    }

    /**
     * Calculate power of two greater than or equal to number
     * @param {number} value - Input value
     * @returns {number} Next power of two
     */
    static nextPowerOfTwo(value) {
        if (value <= 0) return 1;
        value--;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        return value + 1;
    }

    /**
     * Check if number is power of two
     * @param {number} value - Number to check
     * @returns {boolean} True if number is power of two
     */
    static isPowerOfTwo(value) {
        return value > 0 && (value & (value - 1)) === 0;
    }

    /**
     * Calculate logarithm with specified base
     * @param {number} value - Value to calculate log for
     * @param {number} base - Logarithm base
     * @returns {number} Logarithm result
     */
    static log(value, base = Math.E) {
        return Math.log(value) / Math.log(base);
    }

    /**
     * Calculate base-2 logarithm
     * @param {number} value - Value to calculate log2 for
     * @returns {number} Base-2 logarithm
     */
    static log2(value) {
        return Math.log2(value);
    }

    /**
     * Calculate base-10 logarithm
     * @param {number} value - Value to calculate log10 for
     * @returns {number} Base-10 logarithm
     */
    static log10(value) {
        return Math.log10(value);
    }

    /**
     * Convert number to different base
     * @param {number} value - Number to convert
     * @param {number} base - Target base (2-36)
     * @returns {string} Number in target base
     */
    static toBase(value, base) {
        if (base < 2 || base > 36) {
            throw new Error('Base must be between 2 and 36');
        }
        return value.toString(base);
    }

    /**
     * Convert from different base to decimal
     * @param {string} value - Number string in source base
     * @param {number} base - Source base (2-36)
     * @returns {number} Decimal number
     */
    static fromBase(value, base) {
        if (base < 2 || base > 36) {
            throw new Error('Base must be between 2 and 36');
        }
        return parseInt(value, base);
    }

    /**
     * Generate UUID v4
     * @returns {string} UUID v4 string
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Calculate hash of string using simple algorithm
     * @param {string} str - String to hash
     * @returns {number} Hash value
     */
    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    /**
     * Calculate CRC32 checksum
     * @param {string} str - String to calculate CRC32 for
     * @returns {number} CRC32 checksum
     */
    static crc32(str) {
        const table = [];
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }

        let crc = 0xFFFFFFFF;
        for (let i = 0; i < str.length; i++) {
            crc = table[(crc ^ str.charCodeAt(i)) & 0xFF] ^ (crc >>> 8);
        }

        return (crc ^ 0xFFFFFFFF) >>> 0;
    }
}

module.exports = MathUtils;
