export const ACTION_HTTP_METHODS = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' }
];

export const CONFIG_TABS = [
    { key: 'query_params', label: 'Query' },
    { key: 'header_params', label: 'Headers' },
    { key: 'body_params', label: 'Body' },
    { key: 'path_params', label: 'Path' }
];

export const UrlUtils = {
    parse: (url: string) => {
        try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
            return {
                protocol: parsed.protocol,
                host: parsed.host,
                path: parsed.pathname,
                query: parsed.search.slice(1)
            };
        } catch {
            return { protocol: '', host: '', path: '', query: '' };
        }
    },

    toObject: (rows: { key: string; value: string }[]) => {
        const obj: Record<string, string> = {};
        rows.forEach((row) => {
            if (row.key.trim()) obj[row.key.trim()] = row.value;
        });
        return obj;
    },

    extractQueryRows: (url: string) => {
        const queryString = url.split('?')[1] || '';
        if (!queryString) return [{ key: '', value: '' }];
        const params = new URLSearchParams(queryString);
        const rows: { key: string; value: string }[] = [];
        params.forEach((v, k) => rows.push({ key: k, value: v }));
        return rows.length > 0 ? rows : [{ key: '', value: '' }];
    },

    extractPathRows: (url: string, existingPathParams: Record<string, string> = {}) => {
        // Support /:param, {param}, and {{param}} styles
        // We look for /: to avoid matching ports like :5173
        const regex = /\/:([a-zA-Z0-9_]+)|\{([a-zA-Z0-9_]+)\}|\{\{([a-zA-Z0-9_]+)\}\}/g;
        const matches = Array.from(url.matchAll(regex));
        const pathParams = matches.map(match => match[1] || match[2] || match[3]);

        // Filter unique params to avoid duplicates in the UI
        const uniqueParams = Array.from(new Set(pathParams));

        const rows = uniqueParams.map((param) => ({
            key: param,
            value: existingPathParams[param] || ''
        }));
        return rows.length > 0 ? rows : [{ key: '', value: '' }];
    },

    buildUrlFromRows: (baseUrl: string, queryRows: { key: string; value: string }[]) => {
        const [path] = baseUrl.split('?');
        const searchParams = new URLSearchParams();
        queryRows.forEach(row => {
            if (row.key.trim()) searchParams.append(row.key.trim(), row.value);
        });
        const queryStr = searchParams.toString();
        return queryStr ? `${path}?${queryStr}` : path;
    },

    beautifyJson: (jsonStr: string) => {
        try {
            const obj = JSON.parse(jsonStr);
            return JSON.stringify(obj, null, 2);
        } catch {
            return jsonStr;
        }
    }
};
