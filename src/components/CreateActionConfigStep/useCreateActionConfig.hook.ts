import { useRef, useEffect, useState, useCallback } from 'react';
import { Form } from 'antd';
import { UrlUtils } from './CreateActionConfigStep.constants';

export function useCreateActionConfig(draft: any, setDraft: (val: any | ((prev: any) => any)) => void, externalForm?: any) {
    const [internalForm] = Form.useForm();
    const form = externalForm || internalForm;
    const [urlError, setUrlError] = useState<string>('');
    const debounceTimeout = useRef<any>(null);

    // Watchers for tab indicators
    const watchedUrl = Form.useWatch('url', form);
    const queryList = Form.useWatch('query_params_list', form);
    const headerList = Form.useWatch('header_params_list', form);
    const pathList = Form.useWatch('path_params_list', form);
    const bodyList = Form.useWatch('body_params_list', form);
    const bodyRaw = Form.useWatch('body_params_raw', form);
    const inputKeys = Form.useWatch('input_keys', form);

    const config = draft.configurations_json || {};

    // Initial Hydration
    useEffect(() => {
        const currentConfig = draft.configurations_json || {};
        const formValues: any = { ...currentConfig };
        const paramTypes = ['query_params', 'header_params', 'body_params', 'path_params'];

        paramTypes.forEach((key) => {
            const listName = `${key}_list`;
            const obj = (currentConfig as any)[key] || {};
            formValues[listName] = Object.entries(obj).map(([k, v]) => ({ key: k, value: v }));
            if (formValues[listName].length === 0) formValues[listName] = [{ key: '', value: '' }];
        });

        if (currentConfig.input_keys && Array.isArray(currentConfig.input_keys)) {
            formValues.input_keys = currentConfig.input_keys.map((k: any) => typeof k === 'string' ? { label: k, key: k, type: 'string', value: '' } : k);
        } else if (currentConfig.input_keys && typeof currentConfig.input_keys === 'string') {
            formValues.input_keys = currentConfig.input_keys.split(',').filter((k: string) => k.trim()).map((k: string) => ({ label: k.trim(), key: k.trim(), type: 'string', value: '' }));
        }

        form.setFieldsValue(formValues);
    }, [draft.id, form]);

    const handleValuesChange = (changed: any, allValues: any) => {
        const updatedConfig = { ...config, ...allValues };
        const changedKey = Object.keys(changed)[0];

        // URL <-> Query/Path Sync Logic
        if (changedKey === 'url') {
            const newUrl = changed.url || '';
            const queryRows = UrlUtils.extractQueryRows(newUrl);
            const currentQueryStr = UrlUtils.buildUrlFromRows('', allValues.query_params_list || []).split('?')[1] || '';
            const newQueryStr = UrlUtils.parse(newUrl).query;

            if (newQueryStr !== currentQueryStr) {
                updatedConfig.query_params_list = queryRows;
                updatedConfig.query_params = UrlUtils.toObject(queryRows);
                form.setFieldsValue({ query_params_list: queryRows });
            }

            const pathRows = UrlUtils.extractPathRows(newUrl, updatedConfig.path_params || {});
            updatedConfig.path_params_list = pathRows;
            updatedConfig.path_params = UrlUtils.toObject(pathRows);
            form.setFieldsValue({ path_params_list: pathRows });
        }

        if (changedKey === 'query_params_list') {
            const newUrl = UrlUtils.buildUrlFromRows(allValues.url || '', allValues.query_params_list);
            if (newUrl !== (allValues.url || '')) {
                form.setFieldsValue({ url: newUrl });
                updatedConfig.url = newUrl;
            }
        }

        // Data Serialization for other lists
        ['query_params', 'header_params', 'body_params', 'path_params'].forEach((key) => {
            const listName = `${key}_list`;
            if (allValues[listName] && changedKey === listName) {
                (updatedConfig as any)[key] = UrlUtils.toObject(allValues[listName]);
            }
        });

        // Debounced Parent Update
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        const isTypingField = changedKey === 'body_params_raw' || changedKey === 'url' || changedKey === 'fallback_message' || (changedKey?.endsWith('_list')) || changedKey === 'input_keys';

        const updateParent = () => setDraft((prev: any) => ({ ...prev, configurations_json: updatedConfig }));

        if (isTypingField) {
            debounceTimeout.current = setTimeout(updateParent, 300);
        } else {
            updateParent();
        }
    };

    // Final Sync on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
                const currentValues = form.getFieldsValue();
                const latestConfig = { ...currentValues };
                
                ['query_params', 'header_params', 'body_params', 'path_params'].forEach((key) => {
                    const listName = `${key}_list`;
                    if (currentValues[listName]) {
                        (latestConfig as any)[key] = UrlUtils.toObject(currentValues[listName]);
                    }
                });
                
                setDraft((prev: any) => ({ 
                    ...prev, 
                    configurations_json: { ...(prev.configurations_json || {}), ...latestConfig } 
                }));
            }
        };
    }, [form, setDraft]);

    const hasItems = useCallback((key: string) => {
        const savedObj = (config as any)[key] || {};
        const hasSavedData = Object.keys(savedObj).length > 0 && Object.keys(savedObj).some(k => k.trim().length > 0);

        if (key === 'body_params') {
            const hasListItems = bodyList?.some((p: any) => p?.key?.trim() || p?.value?.trim());
            const hasRawContent = bodyRaw && bodyRaw.trim().length > 0;
            return !!(hasListItems || hasRawContent || hasSavedData);
        }

        if (key === 'input_variables') {
            return !!(inputKeys?.some((p: any) => p?.key?.trim() || p?.label?.trim()));
        }

        let list: any[] = [];
        if (key === 'query_params') list = queryList;
        if (key === 'header_params') list = headerList;
        if (key === 'path_params') list = pathList;

        const hasLiveItems = !!(list?.some((p: any) => p?.key?.trim() || p?.value?.trim()));
        return hasLiveItems || hasSavedData;
    }, [config, queryList, headerList, pathList, bodyList, bodyRaw, inputKeys]);

    return {
        form,
        config,
        watchedUrl,
        handleValuesChange,
        hasItems
    };
}
