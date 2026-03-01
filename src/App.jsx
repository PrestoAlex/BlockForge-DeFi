import React, { useState } from 'react';
import { useProtocolBuilder } from './hooks/useProtocolBuilder';
import { useOPNetWallet } from './hooks/useOPNetWallet';
import { useBlockForgeContract } from './hooks/useBlockForgeContract';
import Header from './components/Header';
import ModuleSelector from './components/ModuleSelector';
import PipelineVisualizer from './components/PipelineVisualizer';
import ConfigPanel from './components/ConfigPanel';
import DeploymentOutput from './components/DeploymentOutput';
import ProtocolDashboard from './components/ProtocolDashboard';
import Footer from './components/Footer';
import LegoRainBackground from './components/LegoRainBackground';
import Guide from './components/Guide';
import { RotateCcw, Edit3, Check, BookOpen } from 'lucide-react';

export default function App() {
  const builder = useProtocolBuilder();
  const wallet = useOPNetWallet();
  const contract = useBlockForgeContract();
  const [showOutput, setShowOutput] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [activeView, setActiveView] = useState('builder');
  const [showGuide, setShowGuide] = useState(false);
  const [guideLanguage, setGuideLanguage] = useState('en');

  const handleBuild = async () => {
    if (!builder.isValid) return;
    let walletAddress = wallet.wallet.address;

    if (!wallet.wallet.connected) {
      const connectRes = await wallet.connect();
      if (!connectRes.ok) {
        alert('Please connect your OP_NET wallet first.');
        return;
      }
      walletAddress = connectRes.wallet?.address || walletAddress;
    }

    if (!walletAddress) {
      alert('Wallet connected, but address is missing. Please reconnect.');
      return;
    }

    const result = await contract.deployProtocol(
      {
        selectedModules: builder.selectedModules,
        moduleConfigs: builder.moduleConfigs,
        depositPipeline: builder.depositPipeline,
        withdrawPipeline: builder.withdrawPipeline,
      },
      walletAddress
    );

    if (result.ok) {
      setDeployResult(result.results);
      setShowOutput(true);
      setActiveView('dashboard');
    } else {
      alert(`Deployment failed: ${result.error}`);
    }
  };

  const handleClose = () => {
    setShowOutput(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Custom Background with Scroll Effect */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/images/background.png")',
          zIndex: 0,
          animation: 'scrollUp 30s linear infinite',
          backgroundSize: 'cover'
        }}
      />
      
      <LegoRainBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          protocolName={builder.protocolName}
          setProtocolName={builder.setProtocolName}
          wallet={wallet.wallet}
          walletLoading={wallet.loading}
          onConnectWallet={wallet.connect}
          onDisconnectWallet={wallet.disconnect}
          onGoToDashboard={() => setActiveView('dashboard')}
          onShowGuide={() => setShowGuide(true)}
          activeView={activeView}
        />

        {/* Protocol Name Input */}
        <div className="flex justify-center py-4">
          <div className="glass rounded-xl px-6 py-3 border border-btc-border">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-400">Protocol Name:</span>
              {builder.editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={builder.draft}
                    onChange={(e) => builder.setDraft(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && builder.handleSave()}
                    className="px-3 py-1 rounded-lg bg-btc-surface border border-btc-border text-white text-sm font-mono focus:outline-none focus:border-btc-orange"
                    placeholder="My DeFi Protocol"
                    autoFocus
                  />
                  <button
                    onClick={builder.handleSave}
                    className="p-1.5 rounded-lg bg-btc-orange hover:bg-btc-gold text-btc-darker transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">{builder.protocolName}</span>
                  <button 
                    onClick={() => { builder.setDraft(builder.protocolName); builder.setEditing(true); }} 
                    className="p-1.5 rounded-lg hover:bg-btc-surface text-gray-500 hover:text-btc-orange transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {activeView === 'builder' ? (
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Three-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel — Module Selector */}
            <div className="lg:col-span-3">
              <ModuleSelector
                selectedModules={builder.selectedModules}
                onToggle={builder.toggleModule}
              />
            </div>

            {/* Center — Pipeline Visualizer */}
            <div className="lg:col-span-5">
              <PipelineVisualizer
                depositPipeline={builder.depositPipeline}
                withdrawPipeline={builder.withdrawPipeline}
                selectedModules={builder.selectedModules}
              />

              {/* Build Button */}
              <div className="mt-6 flex flex-col items-center gap-6">
                <button
                  onClick={handleBuild}
                  disabled={!builder.isValid || contract.deploying}
                  className={`
                    relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
                    ${builder.isValid && !contract.deploying
                      ? 'bg-gradient-to-r from-btc-orange to-btc-gold text-btc-darker hover:shadow-glow hover:scale-105 active:scale-95'
                      : 'bg-btc-border text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {contract.deploying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-btc-darker border-t-transparent rounded-full animate-spin" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <span>🧱</span>
                        <span>Build My DeFi Protocol</span>
                      </>
                    )}
                  </span>
                  {!builder.isValid && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                      Select at least the Vault module
                    </span>
                  )}
                </button>

                {/* Reset Button */}
                <button
                  onClick={builder.reset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-btc-orange hover:bg-btc-gold text-xs font-mono text-btc-darker hover:text-btc-darker transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Right Panel — Config */}
            <div className="lg:col-span-4">
              <ConfigPanel
                selectedModules={builder.selectedModules}
                moduleConfigs={builder.moduleConfigs}
                onUpdateConfig={builder.updateConfig}
              />
            </div>
          </div>
        </main>
      ) : (
        <ProtocolDashboard
          protocolName={builder.protocolName}
          wallet={wallet.wallet}
          onConnectWallet={wallet.connect}
          contract={contract}
          onBackToBuilder={() => setActiveView('builder')}
        />
      )}

      {/* Deployment Output Modal */}
      {showOutput && (
        <DeploymentOutput
          config={builder.deploymentConfig}
          txs={deployResult}
          onClose={handleClose}
        />
      )}

      {showGuide && (
        <Guide
          onClose={() => setShowGuide(false)}
          language={guideLanguage}
          onLanguageChange={setGuideLanguage}
        />
      )}
      <Footer onReset={builder.reset} />
      </div>
    </div>
  );
}
