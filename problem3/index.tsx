interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  //should change blockchain:any to blockchain:string
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }
  //  balancePriority never used && incorrect Filter Logic if (lhsPriority > -99) is incorrect because lhsPriority is not defined in the scope of the filter callback. Additionally, the logic for filtering balances with amount <= 0 is inside the wrong block.
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority;
      });
  }, [balances]);


  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    //prices[balance.currency] is cannot undefined
    // const usdValue = prices[balance.currency] * balance.amount;
    const usdValue = prices[balance.currency] ? prices[balance.currency] * balance.amount : 0;

    //shoud change  key = index into key = balance.currency
    return (
      <WalletRow
        className={classes.row}
        // key={index}
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })


  return (
    //Unnecessary Spread of Props
    // {/* <div {...rest}>
    //   {rows}
    // </div> */}
    <div>
      {rows}
    </div >
  )
}