export const base64url = str => {
    return btoa(str).replace(/\+/g, '_')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}