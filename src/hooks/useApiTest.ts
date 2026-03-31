import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import type { ActionDefinition } from '@/interfaces';

export function useApiTest(actionDraft: Partial<ActionDefinition>) {
    const [isTestPopupOpen, setIsTestPopupOpen] = useState(false);
    const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testResponse, setTestResponse] = useState<any>(null);
    const [testInputPayload, setTestInputPayload] = useState<any>(null);

    // Use a ref to always have the absolute latest draft data available for the async call
    const draftRef = useRef(actionDraft);
    useEffect(() => {
        draftRef.current = actionDraft;
    }, [actionDraft]);

    const handleTestApi = async () => {
        const currentDraft = draftRef.current;
        const rawConfig = currentDraft.configurations_json || {};
        
        if (!rawConfig.url || !rawConfig.method) {
            message.error("URL and Method are required in the configuration form to run a test.");
            return;
        }

        setIsTestPopupOpen(true);
        setTestState('loading');
        setTestResponse(null);
        setTestInputPayload(null);
        
        const startTime = Date.now();

        try {
            // ── Path Param Resolution ──
            let resolvedUrl = String(rawConfig.url);
            const pathParams = rawConfig.path_params || [];
            
            pathParams.forEach((param: any) => {
                if (param?.key && param?.value) {
                    const escapedKey = param.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    // Look for :key followed by /, ?, or end-of-string
                    // This handles /:id?query, /:id/, and /:id cases
                    const regex = new RegExp(`:${escapedKey}(?=/|\\?|$)`, 'g');
                    resolvedUrl = resolvedUrl.replace(regex, param.value);
                }
            });

            // ── Header Assembly ──
            const headerParams = rawConfig.header_params || [];
            const headers: Record<string, string> = {};
            headerParams.forEach((param: any) => {
                if (param?.key && param?.value) headers[param.key] = param.value;
            });

            // ── Body Serialization ──
            const bodyParams = rawConfig.body_params || [];
            let jsonBody = undefined;
            if (['POST', 'PUT', 'PATCH'].includes(rawConfig.method.toUpperCase())) {
                const bodyObj: Record<string, any> = {};
                bodyParams.forEach((param: any) => {
                    if (param?.key) bodyObj[param.key] = param.value;
                });
                if (Object.keys(bodyObj).length > 0) {
                    jsonBody = bodyObj;
                    if (!headers['Content-Type'] && !headers['content-type']) {
                        headers['Content-Type'] = 'application/json';
                    }
                }
            }
            
            const reqConfig: any = { 
                method: rawConfig.method.toLowerCase(), 
                url: resolvedUrl, 
                headers 
            };
            if (jsonBody) reqConfig.data = jsonBody;

            // Log for debugging
            console.log('[API Test] Final Request Config:', reqConfig);
            setTestInputPayload(reqConfig);

            const response = await axios.request(reqConfig);
            const latency = Date.now() - startTime;

            setTestResponse({ 
                status: response.status, 
                statusText: response.statusText, 
                headers: response.headers, 
                data: response.data, 
                latency 
            });
            setTestState('success');
        } catch (error: any) {
            const latency = Date.now() - startTime;
            let errorData = error.message;
            let status = 0;
            let statusText = 'Network/CORS Error';
            let formattedHeaders = {};

            if (error.response) {
                errorData = error.response.data;
                status = error.response.status;
                statusText = error.response.statusText;
                formattedHeaders = error.response.headers;
            }
            
            setTestResponse({ status, statusText, headers: formattedHeaders, data: errorData, latency });
            setTestState('error');
        }
    };

    return {
        isTestPopupOpen,
        setIsTestPopupOpen,
        testState,
        testResponse,
        testInputPayload,
        handleTestApi
    };
}
