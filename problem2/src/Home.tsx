'use client'

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Select, { components } from "react-select";

interface Token {
  label: string
  value: number
  icon?: string,
}

export default function CurrencySwap() {
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://interview.switcheo.com/prices.json')
        if (!response.ok) {
          throw new Error('Failed to fetch prices')
        }
        const data = await response.json()
        console.log("🚀 ~ fetchPrices ~ data:", data, typeof (data))
        const dataConvert = Object.keys(data).map((key) => ({
          label: data[key].currency,
          value: data[key].price,
          icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${data[key].currency}.svg`
        })).filter((item) => item.value > 0)

        setTokens(dataConvert)
        setError(null)
      } catch (err) {
        setError('Failed to fetch prices. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()

  }, [])


  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return null
    return toToken.value / fromToken.value
  }, [fromToken, toToken])

  const toAmount = useMemo(() => {
    if (!exchangeRate || !fromAmount) return ''
    return (parseFloat(fromAmount) * exchangeRate).toFixed(6)
  }, [fromAmount, exchangeRate])

  const handleSwapTokens = useCallback(() => {
    setFromToken(toToken)
    setToToken(fromToken)
  }, [fromToken, toToken])

  const Option = (props: any) => {
    return <components.Option {...props}>
      <div className='flex flex-row'>
        <img src={props.data.icon} alt="logo" className="w-6 h-6 mr-2" />
        <div>{props.data.label} - ${props.data.value.toFixed(2)}</div>
      </div>
    </components.Option>
  }


  const SingleValue = ({ children, ...props }: any) => (
    <components.SingleValue {...props}>
      <img src={props.data.icon} alt="s-logo" className="w-6 h-6 mr-2" />
      {children}
    </components.SingleValue>
  );


  const TokenSelector = ({
    value,
    onChange,
  }: {
    value: Token | null
    onChange: (token: Token) => void
  }) => (
    <div className="relative">
      <Select
        value={value}
        options={tokens}
        getOptionValue={(option: any) => option.value}
        onChange={(value) => onChange(value as Token)}
        styles={{
          singleValue: (base) => ({
            ...base,
            display: "flex",
            alignItems: "center"
          })
        }}
        components={{
          Option,
          SingleValue
        }}
      />
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="space-y-2">
              <TokenSelector
                value={fromToken}
                onChange={setFromToken}
              />
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                disabled={!fromToken}
                className="w-full px-4 py-2 text-2xl bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="relative flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-white rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={handleSwapTokens}
              disabled={!fromToken || !toToken}
            >
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
            </motion.button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="space-y-2">
              <TokenSelector
                value={toToken}
                // onChange={setToToken}
                onChange={(value) => setToToken(value)}

              />
              <input
                type="number"
                placeholder="0.00"
                value={toAmount}
                disabled
                className="w-full px-4 py-2 text-2xl bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {exchangeRate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm text-gray-500"
            >
              1 {fromToken?.label} = {exchangeRate.toFixed(6)} {toToken?.label}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${!fromToken || !toToken || !fromAmount || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          disabled={!fromToken || !toToken || !fromAmount || isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : !fromToken || !toToken ? (
            'Select tokens'
          ) : !fromAmount ? (
            'Enter amount'
          ) : (
            'Swap'
          )}
        </button>
      </div>
    </div>
  )
}