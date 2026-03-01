import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, Settings, TrendingUp, Shield, Clock, Users, ChevronRight, Globe } from 'lucide-react';

export default function Guide({ onClose, language, onLanguageChange }) {
  const [activeSection, setActiveSection] = useState('overview');

  const content = {
    ua: {
      title: 'BlockForge Посібник',
      sections: {
        overview: {
          title: 'Огляд',
          icon: BookOpen,
          content: {
            description: 'BlockForge - це конструктор DeFi протоколів на Bitcoin L1 (OP_NET). Створюйте власні фінансові протоколи з готових модулів.',
            features: [
              '🏗️ Візуальний конструктор протоколів',
              '📦 6 готових модулів (Vault, Staking, Yield, TimeLock, Escrow, NFT Position)',
              '🔗 Pipeline execution для deposit/withdraw',
              '💰 Робота з реальним Bitcoin',
              '📊 Моніторинг стану протоколу',
              '🔐 Escrow approval для безпеки',
              '🎨 NFT позиції для унікальності'
            ]
          }
        },
        quickstart: {
          title: 'Швидкий старт',
          icon: TrendingUp,
          content: {
            steps: [
              {
                title: 'Крок 1: Виберіть модулі',
                description: 'У лівій панелі виберіть потрібні модулі для вашого протоколу. Кожен модуль має унікальну функцію.'
              },
              {
                title: 'Крок 2: Налаштуйте параметри',
                description: 'У правій панелі налаштуйте параметри кожного модуля: APY, ліміти, час блокування тощо.'
              },
              {
                title: 'Крок 3: Збережіть назву',
                description: 'Дайте вашому протоколу унікальну назву.'
              },
              {
                title: 'Крок 4: Build Protocol',
                description: 'Натисніть "Build My DeFi Protocol" для створення смарт-контрактів.'
              },
              {
                title: 'Крок 5: Перейдіть в Dashboard',
                description: 'Після деплою перейдіть в Dashboard для використання протоколу.'
              }
            ]
          }
        },
        modules: {
          title: 'Модулі',
          icon: Settings,
          content: {
            modules: [
              {
                name: 'Vault',
                description: 'Сховище для коштів користувачів',
                features: ['Max Deposit ліміт', 'Балансування', 'Безпека'],
                color: 'text-orange-500'
              },
              {
                name: 'Staking',
                description: 'Стейкінг з APY та auto-compound',
                features: ['APY налаштування', 'Auto-compound', 'Min Stake'],
                color: 'text-green-500'
              },
              {
                name: 'Yield',
                description: 'Генерація винагород',
                features: ['Reward Rate', 'Payout період', 'Reward Token'],
                color: 'text-yellow-500'
              },
              {
                name: 'TimeLock',
                description: 'Блокування коштів на час',
                features: ['Lock Duration', 'Early Withdraw Penalty', 'Безпека'],
                color: 'text-purple-500'
              },
              {
                name: 'Escrow',
                description: 'Контроль виведення коштів',
                features: ['Controller Approval', 'Безпека', 'Multisig'],
                color: 'text-blue-500'
              }
            ]
          }
        },
        examples: {
          title: 'Приклади протоколів',
          icon: Lightbulb,
          content: {
            protocols: [
              {
                name: 'Simple Staking',
                modules: ['Vault', 'Staking'],
                description: 'Базовий стейкінг протокол з APY 12%',
                useCase: 'Для початківців та простого заробітку'
              },
              {
                name: 'Time-Locked Staking',
                modules: ['Vault', 'Staking', 'TimeLock'],
                description: 'Стейкінг з блокуванням на 1000 блоків',
                useCase: 'Для довгострокових інвестицій'
              },
              {
                name: 'Yield Farming',
                modules: ['Vault', 'Staking', 'Yield'],
                description: 'Стейкінг з додатковими винагородами',
                useCase: 'Для максимальної доходності'
              },
              {
                name: 'Secure Protocol',
                modules: ['Vault', 'Staking', 'TimeLock', 'Escrow'],
                description: 'Повний протокол з максимальною безпекою',
                useCase: 'Для інституційних клієнтів'
              },
              {
                name: 'Full DeFi Protocol',
                modules: ['Vault', 'Staking', 'Yield', 'TimeLock', 'Escrow'],
                description: 'Комплексний протокол з всіма функціями',
                useCase: 'Для професійних DeFi сервісів'
              },
              {
                name: 'NFT Staking Protocol',
                modules: ['Vault', 'Staking', 'NFT Position'],
                description: 'Стейкінг з NFT позиціями',
                useCase: 'Для гейміфікації та унікальних токенів'
              }
            ]
          }
        },
        dashboard: {
          title: 'Dashboard',
          icon: Globe,
          content: {
            features: [
              {
                title: 'Deposit',
                description: 'Депозит BTC в протокол з лімітом 100 sats',
                details: 'Вводьте суму та натискайте Deposit BTC'
              },
              {
                title: 'Withdraw',
                description: 'Виведення BTC з TimeLock блокуванням',
                details: 'Зачекайте 1000 блоків або використайте Escrow approval'
              },
              {
                title: 'Escrow Control',
                description: 'Approval для виведення коштів',
                details: 'Натисніть Approve Withdrawal для розблокування'
              },
              {
                title: 'Transaction History',
                description: 'Історія транзакцій з OPScan посиланнями',
                details: 'Клікайте на OPScan для перегляду детальної інформації'
              },
              {
                title: 'Protocol State',
                description: 'Реальний стан протоколу',
                details: 'Module Count, Total Deposits, Pipelines'
              }
            ]
          }
        },
        faq: {
          title: 'FAQ',
          icon: Users,
          content: {
            questions: [
              {
                question: 'Що таке BlockForge?',
                answer: 'BlockForge - це візуальний конструктор DeFi протоколів на Bitcoin L1, який дозволяє створювати власні фінансові протоколи з готових модулів.'
              },
              {
                question: 'Скільки коштує використання?',
                answer: 'BlockForge безкоштовний для використання. Платите лише gas fees за транзакції в OP_NET мережі.'
              },
              {
                question: 'Які ліміти на депозити?',
                answer: 'Максимальний депозит - 100 sats для тестування. У production версії ліміти будуть більші.'
              },
              {
                question: 'Що таке TimeLock?',
                answer: 'TimeLock блокує кошти на 1000 блоків (~17 хвилин) для безпеки та запобігання швидкому виведенню.'
              },
              {
                question: 'Як працює Escrow?',
                answer: 'Escrow вимагає approval від controller для виведення коштів, що забезпечує додатковий рівень безпеки.'
              },
              {
                question: 'Де можна побачити транзакції?',
                answer: 'У Transaction History в Dashboard. Кожна транзакція має посилання на OPScan для детального перегляду.'
              }
            ]
          }
        }
      }
    },
    en: {
      title: 'BlockForge Guide',
      sections: {
        overview: {
          title: 'Overview',
          icon: BookOpen,
          content: {
            description: 'BlockForge is a DeFi protocol builder on Bitcoin L1 (OP_NET). Create your own financial protocols from ready-made modules.',
            features: [
              '🏗️ Visual protocol builder',
              '📦 6 ready modules (Vault, Staking, Yield, TimeLock, Escrow, NFT Position)',
              '🔗 Pipeline execution for deposit/withdraw',
              '💰 Real Bitcoin integration',
              '📊 Protocol state monitoring',
              '🔐 Escrow approval for security',
              '🎨 NFT positions for uniqueness'
            ]
          }
        },
        quickstart: {
          title: 'Quick Start',
          icon: TrendingUp,
          content: {
            steps: [
              {
                title: 'Step 1: Select Modules',
                description: 'In the left panel, select the modules you need for your protocol. Each module has a unique function.'
              },
              {
                title: 'Step 2: Configure Parameters',
                description: 'In the right panel, configure parameters for each module: APY, limits, lock time, etc.'
              },
              {
                title: 'Step 3: Save Name',
                description: 'Give your protocol a unique name.'
              },
              {
                title: 'Step 4: Build Protocol',
                description: 'Click "Build My DeFi Protocol" to create smart contracts.'
              },
              {
                title: 'Step 5: Go to Dashboard',
                description: 'After deployment, go to Dashboard to use your protocol.'
              }
            ]
          }
        },
        modules: {
          title: 'Modules',
          icon: Settings,
          content: {
            modules: [
              {
                name: 'Vault',
                description: 'Storage for user funds',
                features: ['Max Deposit limit', 'Balancing', 'Security'],
                color: 'text-orange-500'
              },
              {
                name: 'Staking',
                description: 'Staking with APY and auto-compound',
                features: ['APY settings', 'Auto-compound', 'Min Stake'],
                color: 'text-green-500'
              },
              {
                name: 'Yield',
                description: 'Reward generation',
                features: ['Reward Rate', 'Payout period', 'Reward Token'],
                color: 'text-yellow-500'
              },
              {
                name: 'TimeLock',
                description: 'Time-locked funds',
                features: ['Lock Duration', 'Early Withdraw Penalty', 'Security'],
                color: 'text-purple-500'
              },
              {
                name: 'Escrow',
                description: 'Withdrawal control',
                features: ['Controller Approval', 'Security', 'Multisig'],
                color: 'text-blue-500'
              },
              {
                name: 'NFT Position',
                description: 'NFT-based position tracking',
                features: ['NFT Minting', 'Position Tokens', 'Transferable', 'Metadata'],
                color: 'text-pink-500'
              }
            ]
          }
        },
        examples: {
          title: 'Protocol Examples',
          icon: Lightbulb,
          content: {
            protocols: [
              {
                name: 'Simple Staking',
                modules: ['Vault', 'Staking'],
                description: 'Basic staking protocol with 12% APY',
                useCase: 'For beginners and simple earnings'
              },
              {
                name: 'Time-Locked Staking',
                modules: ['Vault', 'Staking', 'TimeLock'],
                description: 'Staking with 1000 blocks lock',
                useCase: 'For long-term investments'
              },
              {
                name: 'Yield Farming',
                modules: ['Vault', 'Staking', 'Yield'],
                description: 'Staking with additional rewards',
                useCase: 'For maximum returns'
              },
              {
                name: 'Secure Protocol',
                modules: ['Vault', 'Staking', 'TimeLock', 'Escrow'],
                description: 'Full protocol with maximum security',
                useCase: 'For institutional clients'
              },
              {
                name: 'Full DeFi Protocol',
                modules: ['Vault', 'Staking', 'Yield', 'TimeLock', 'Escrow'],
                description: 'Comprehensive protocol with all features',
                useCase: 'For professional DeFi services'
              },
              {
                name: 'NFT Staking Protocol',
                modules: ['Vault', 'Staking', 'NFT Position'],
                description: 'Staking with NFT positions',
                useCase: 'For gamification and unique tokens'
              }
            ]
          }
        },
        dashboard: {
          title: 'Dashboard',
          icon: Globe,
          content: {
            features: [
              {
                title: 'Deposit',
                description: 'Deposit BTC to protocol with 100 sats limit',
                details: 'Enter amount and click Deposit BTC'
              },
              {
                title: 'Withdraw',
                description: 'Withdraw BTC with TimeLock',
                details: 'Wait 1000 blocks or use Escrow approval'
              },
              {
                title: 'Escrow Control',
                description: 'Approval for withdrawals',
                details: 'Click Approve Withdrawal to unlock'
              },
              {
                title: 'Transaction History',
                description: 'Transaction history with OPScan links',
                details: 'Click OPScan for detailed information'
              },
              {
                title: 'Protocol State',
                description: 'Real protocol state',
                details: 'Module Count, Total Deposits, Pipelines'
              }
            ]
          }
        },
        faq: {
          title: 'FAQ',
          icon: Users,
          content: {
            questions: [
              {
                question: 'What is BlockForge?',
                answer: 'BlockForge is a visual DeFi protocol builder on Bitcoin L1 that allows you to create your own financial protocols from ready-made modules.'
              },
              {
                question: 'How much does it cost to use?',
                answer: 'BlockForge is free to use. You only pay gas fees for transactions in the OP_NET network.'
              },
              {
                question: 'What are the deposit limits?',
                answer: 'Maximum deposit is 100 sats for testing. Production version will have higher limits.'
              },
              {
                question: 'What is TimeLock?',
                answer: 'TimeLock locks funds for 1000 blocks (~17 minutes) for security and to prevent rapid withdrawals.'
              },
              {
                question: 'How does Escrow work?',
                answer: 'Escrow requires controller approval for withdrawals, providing an additional layer of security.'
              },
              {
                question: 'Where can I see transactions?',
                answer: 'In Transaction History in Dashboard. Each transaction has an OPScan link for detailed viewing.'
              }
            ]
          }
        }
      }
    }
  };

  const currentContent = content[language];
  const section = currentContent.sections[activeSection];
  const SectionIcon = section.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-btc-darker rounded-2xl border border-btc-border w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-btc-border">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-neon-blue" />
            <h2 className="text-2xl font-bold text-white">{currentContent.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-btc-surface border border-btc-border">
              <button
                onClick={() => onLanguageChange('ua')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  language === 'ua' 
                    ? 'bg-btc-orange text-btc-darker' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                УКР
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  language === 'en' 
                    ? 'bg-btc-orange text-btc-darker' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-btc-surface transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Sidebar */}
          <div className="w-64 bg-btc-surface/50 border-r border-btc-border p-4">
            <div className="space-y-1">
              {Object.entries(currentContent.sections).map(([key, sec]) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === key
                        ? 'bg-btc-orange/20 text-btc-orange border border-btc-orange/30'
                        : 'text-gray-400 hover:text-white hover:bg-btc-surface/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{sec.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon className="w-6 h-6 text-neon-blue" />
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              </div>

              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed">
                    {section.content.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.content.features.map((feature, index) => (
                      <div key={index} className="p-3 rounded-lg bg-btc-surface/50 border border-btc-border/50">
                        <p className="text-sm text-gray-300">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Start Section */}
              {activeSection === 'quickstart' && (
                <div className="space-y-6">
                  {section.content.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-btc-orange text-btc-darker flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                        <p className="text-gray-300">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modules Section */}
              {activeSection === 'modules' && (
                <div className="space-y-4">
                  {section.content.modules.map((module, index) => (
                    <div key={index} className="p-4 rounded-lg bg-btc-surface/50 border border-btc-border/50">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-btc-surface border border-btc-border flex items-center justify-center`}>
                          <Settings className={`w-5 h-5 ${module.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">{module.name}</h4>
                          <p className="text-gray-300 mb-3">{module.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {module.features.map((feature, idx) => (
                              <span key={idx} className="px-2 py-1 rounded-md bg-btc-surface border border-btc-border/50 text-xs text-gray-400">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Examples Section */}
              {activeSection === 'examples' && (
                <div className="space-y-4">
                  {section.content.protocols.map((protocol, index) => (
                    <div key={index} className="p-4 rounded-lg bg-btc-surface/50 border border-btc-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">{protocol.name}</h4>
                          <p className="text-gray-300 mb-2">{protocol.description}</p>
                          <p className="text-sm text-gray-400">
                            <span className="text-neon-blue">Use Case:</span> {protocol.useCase}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {protocol.modules.map((module, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-md bg-btc-orange/20 text-btc-orange text-xs font-mono">
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dashboard Section */}
              {activeSection === 'dashboard' && (
                <div className="space-y-4">
                  {section.content.features.map((feature, index) => (
                    <div key={index} className="p-4 rounded-lg bg-btc-surface/50 border border-btc-border/50">
                      <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                      <p className="text-gray-300 mb-2">{feature.description}</p>
                      <p className="text-sm text-gray-400">{feature.details}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQ Section */}
              {activeSection === 'faq' && (
                <div className="space-y-4">
                  {section.content.questions.map((qa, index) => (
                    <div key={index} className="p-4 rounded-lg bg-btc-surface/50 border border-btc-border/50">
                      <h4 className="text-lg font-semibold text-white mb-3">{qa.question}</h4>
                      <p className="text-gray-300">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
