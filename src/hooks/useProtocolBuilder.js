import { useState, useCallback, useMemo } from 'react';
import { MODULES, getModuleById, getDepositPipeline, getWithdrawPipeline } from '../data/modules';

/**
 * Core state management hook for the Protocol Builder.
 * Manages selected modules, their configurations, and generates deployment config.
 */
export function useProtocolBuilder() {
  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleConfigs, setModuleConfigs] = useState({});
  const [protocolName, setProtocolName] = useState('My DeFi Protocol');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('My DeFi Protocol');

  // Toggle module on/off
  const toggleModule = useCallback((moduleId) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      }
      return [...prev, moduleId];
    });

    // Initialize config with defaults when module is first selected
    setModuleConfigs((prev) => {
      if (prev[moduleId]) return prev;
      const moduleDef = getModuleById(moduleId);
      if (!moduleDef) return prev;
      const defaults = {};
      moduleDef.configFields.forEach((field) => {
        defaults[field.key] = field.default;
      });
      return { ...prev, [moduleId]: defaults };
    });
  }, []);

  // Update a single config field for a module
  const updateConfig = useCallback((moduleId, key, value) => {
    setModuleConfigs((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [key]: value,
      },
    }));
  }, []);

  // Computed pipelines
  const depositPipeline = useMemo(
    () => getDepositPipeline(selectedModules),
    [selectedModules]
  );

  const withdrawPipeline = useMemo(
    () => getWithdrawPipeline(selectedModules),
    [selectedModules]
  );

  // Generate deployment config object
  const deploymentConfig = useMemo(() => {
    const modules = selectedModules.map((id) => {
      const mod = getModuleById(id);
      return mod ? mod.name : id;
    });

    const params = {};
    selectedModules.forEach((id) => {
      const config = moduleConfigs[id];
      if (config) {
        Object.entries(config).forEach(([key, value]) => {
          if (value !== '' && value !== undefined) {
            params[key] = value;
          }
        });
      }
    });

    return {
      name: protocolName,
      modules,
      params,
      pipeline: {
        deposit: depositPipeline.map((id) => getModuleById(id)?.name),
        withdraw: withdrawPipeline.map((id) => getModuleById(id)?.name),
      },
      timestamp: new Date().toISOString(),
    };
  }, [selectedModules, moduleConfigs, protocolName, depositPipeline, withdrawPipeline]);

  // Check if build is valid (at least Vault selected)
  const isValid = useMemo(
    () => selectedModules.includes('vault'),
    [selectedModules]
  );

  const reset = useCallback(() => {
    setSelectedModules([]);
    setModuleConfigs({});
    setProtocolName('My DeFi Protocol');
    setEditing(false);
    setDraft('My DeFi Protocol');
  }, []);

  const handleSave = useCallback(() => {
    setProtocolName(draft.trim() || 'My DeFi Protocol');
    setEditing(false);
  }, [draft]);

  return {
    selectedModules,
    moduleConfigs,
    protocolName,
    setProtocolName,
    editing,
    setEditing,
    draft,
    setDraft,
    handleSave,
    toggleModule,
    updateConfig,
    depositPipeline,
    withdrawPipeline,
    deploymentConfig,
    isValid,
    reset,
  };
}
