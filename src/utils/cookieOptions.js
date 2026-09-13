/**
 * Build cookie options phù hợp với môi trường.
 * @param {number} maxAge - Thời gian sống của cookie (ms).
 * @returns {object} Cookie options.
 */
export const buildCookieOptions = (maxAge) => {
    return {
        httpOnly: true,
        maxAge,
        secure: true, // Chrome coi localhost là secure context
        sameSite: 'none'
    }
}

/**
 * Serialize cookie thành string Set-Cookie header.
 * @param {string} name - Tên cookie
 * @param {string} value - Giá trị cookie
 * @param {object} options - Cookie options từ buildCookieOptions()
 * @returns {string} Set-Cookie header value
 */
export const serializeCookie = (name, value, options = {}) => {
    const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]

    if (options.maxAge !== undefined) {
        parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`)
    }

    if (options.httpOnly) parts.push('HttpOnly')

    if (options.secure) parts.push('Secure')

    if (options.sameSite) {
        const sameSite = options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)
        parts.push(`SameSite=${sameSite}`)
    }

    parts.push('Path=/')

    return parts.join('; ')
}
