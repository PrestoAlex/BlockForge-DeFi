import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function BitcoinPrice() {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        console.log('Fetching BTC price...');
        
        // Try multiple APIs with CORS proxy
        const apis = [
          // CORS proxy for CoinGecko
          'https://api.allorigins.win/raw?url=https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
          // Direct CoinGecko
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
          // Binance API
          'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
          // Kraken API
          'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
          // CoinCap API
          'https://api.coincap.io/v2/assets/bitcoin',
          // CryptoCompare API
          'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD',
        ];
        
        let data = null;
        let lastError = null;
        
        for (const apiUrl of apis) {
          try {
            console.log('Trying API:', apiUrl);
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const rawData = await response.json();
            console.log('Raw data from', apiUrl, ':', rawData);
            
            // Handle different API formats
            if (rawData.bitcoin) {
              // CoinGecko format
              data = {
                price: rawData.bitcoin.usd,
                change: rawData.bitcoin.usd_24h_change,
              };
              break;
            } else if (rawData.price) {
              // Binance format
              data = {
                price: parseFloat(rawData.price),
                change: null, // Binance doesn't provide 24h change in this endpoint
              };
              break;
            } else if (rawData.result && rawData.result.XBTUSD) {
              // Kraken format
              data = {
                price: parseFloat(rawData.result.XBTUSD.c[0]),
                change: null,
              };
              break;
            } else if (rawData.data && rawData.data.priceUsd) {
              // CoinCap format
              data = {
                price: parseFloat(rawData.data.priceUsd),
                change: rawData.data.changePercent24Hr ? parseFloat(rawData.data.changePercent24Hr) : null,
              };
              break;
            } else if (rawData.USD) {
              // CryptoCompare format
              data = {
                price: parseFloat(rawData.USD),
                change: null,
              };
              break;
            }
          } catch (err) {
            console.warn(`API ${apiUrl} failed:`, err.message);
            lastError = err;
            continue;
          }
        }
        
        if (data) {
          setPrice(data.price);
          setChange(data.change);
          setError(null);
        } else {
          throw lastError || new Error('All APIs failed');
        }
      } catch (err) {
        console.error('Error fetching BTC price:', err);
        setError('Price unavailable');
        // Set fallback price to current market value (around $97,000 as of March 2026)
        setPrice(97000);
        setChange(2.1);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Update every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return '';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-btc-border bg-btc-surface">
        <div className="w-2 h-2 rounded-full bg-btc-orange animate-pulse" />
        <span className="text-xs font-mono text-gray-500">Loading BTC...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-btc-border bg-btc-surface">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs font-mono text-gray-500">{error}</span>
      </div>
    );
  }

  const isPositive = change >= 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-btc-border bg-btc-surface">
      <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-neon-green' : 'bg-red-500'} animate-pulse`} />
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono text-white font-bold">{formatPrice(price)}</span>
        {change !== null && change !== undefined && (
          <div className={`flex items-center gap-0.5 ${isPositive ? 'text-neon-green' : 'text-red-500'}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-mono">{formatChange(change)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
