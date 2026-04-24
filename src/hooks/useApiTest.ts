import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import type { FormInstance } from 'antd';
import type { ActionDefinition } from '@/interfaces';

export function useApiTest(actionDraft: Partial<ActionDefinition>, configForm?: FormInstance) {
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
        let rawConfig = typeof currentDraft.configurations_json === 'string' 
            ? JSON.parse(currentDraft.configurations_json) 
            : (currentDraft.configurations_json || {});
            
        if (configForm) {
            // Aggressively merge the current raw form values to ensure 
            // any un-synced visual states are included.
            const formValues = configForm.getFieldsValue(true);
            rawConfig = { ...rawConfig, ...formValues };
        }
            



        if (!rawConfig.url || !rawConfig.method) {
            message.error("URL and Method are required in the configuration form to run a test.");
            setTestState('error');
            setTestResponse({
                status: 'Validation Error',
                statusText: 'Missing URL or Method',
                data: 'Please ensure that you have entered a valid URL and selected an HTTP Method in the Action Configuration step before testing.',
                headers: {},
                latency: 0
            });
            setTestInputPayload({ url: rawConfig.url || 'Missing', method: rawConfig.method || 'Missing' });
            setIsTestPopupOpen(true);
            return;
        }

        setTestState('loading');
        setTestResponse(null);
        setTestInputPayload(null);
        
        const startTime = Date.now();

        try {
            // ── Path Param Resolution ──
            let resolvedUrl = String(rawConfig.url);
            let pathParams = rawConfig.path_params || {};
            
            // Normalize pathParams to entries
            const pathEntries = Array.isArray(pathParams) 
                ? pathParams 
                : Object.entries(pathParams).map(([key, value]) => ({ key, value: String(value) }));
            
            pathEntries.forEach((param: any) => {
                if (param?.key && param?.value) {
                    const escapedKey = param.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    // Support both :key and {key}
                    const regex = new RegExp(`(:${escapedKey}|\\{${escapedKey}\\})(?=/|\\?|$)`, 'g');
                    resolvedUrl = resolvedUrl.replace(regex, param.value);
                }
            });

            // ── Header Assembly ──
            let headerParams = rawConfig.header_params || {};
            const headerEntries = Array.isArray(headerParams)
                ? headerParams
                : Object.entries(headerParams).map(([key, value]) => ({ key, value: String(value) }));
                
            const headers: Record<string, string> = {
                'Accept': 'application/json'
            };
            
            headerEntries.forEach((param: any) => {
                if (param?.key && param?.value) headers[param.key] = param.value;
            });

            // ── Body Serialization ──
            let jsonBody = undefined;
            const method = String(rawConfig.method).toUpperCase();
            const bodyType = rawConfig.body_params_type || 'form-data';

            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                if (bodyType === 'raw' && rawConfig.body_params_raw) {
                    try {
                        jsonBody = JSON.parse(rawConfig.body_params_raw);
                    } catch (e) {
                        // If it's not valid JSON, send as raw string
                        jsonBody = rawConfig.body_params_raw;
                    }
                } else if (bodyType === 'form-data') {
                    let bodyParams = rawConfig.body_params || {};
                    const bodyEntries = Array.isArray(bodyParams)
                        ? bodyParams
                        : Object.entries(bodyParams).map(([key, value]) => ({ key, value }));
                        
                    const bodyObj: Record<string, any> = {};
                    bodyEntries.forEach((param: any) => {
                        if (param?.key) bodyObj[param.key] = param.value;
                    });
                    
                    if (Object.keys(bodyObj).length > 0) {
                        jsonBody = bodyObj;
                    }
                }

                if (jsonBody !== undefined && !headers['Content-Type'] && !headers['content-type']) {
                    headers['Content-Type'] = 'application/json';
                }
            }
            
            const reqConfig: any = { 
                method: rawConfig.method.toLowerCase(), 
                url: resolvedUrl, 
                headers 
            };
            if (jsonBody) reqConfig.data = jsonBody;

            // Log for debugging
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
            setIsTestPopupOpen(true);
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
            setIsTestPopupOpen(true);
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
