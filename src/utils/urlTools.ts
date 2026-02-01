
export const normalizeBaseUrl = (base: string): string => {
    return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const replaceBaseUrl = (originalUrl: string, newBaseUrl: string): string | null => {
    try {
        const u = new URL(originalUrl);
        // Ensure newBaseUrl doesn't have trailing slash
        const cleanBase = normalizeBaseUrl(newBaseUrl);
        // Construct new URL: Base + Path + Search
        return cleanBase + u.pathname + u.search;
    } catch {
        return null;
    }
};

export const buildM3U = (vps: string, username: string, password: string, output: 'ts' | 'm3u8'): string => {
    const cleanBase = normalizeBaseUrl(vps);
    const type = 'm3u_plus';
    return `${cleanBase}/get.php?username=${username}&password=${password}&type=${type}&output=${output}`;
};
