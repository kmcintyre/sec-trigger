import { connectToMongoDB } from '@/lib/db';
import { Ticker } from '@/lib/models/ticker';

export async function generateStaticParams() {
  await connectToMongoDB();
  const tickers = await Ticker.find()
  return tickers.map(ticker => { return { ticker: ticker.ticker }});
}

export default async function TickerPage({ params, }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params
  await connectToMongoDB();
  const findOne = await Ticker.findOne({ ticker: ticker });
  const data = findOne.toObject();

  return <>
    <div className='flex'>
      <div>Ticker</div><div>{data.ticker}</div>
    </div>    
    <div className='flex'>
      <div>Company</div><div>{data.company}</div>
    </div>    
    <div className='flex'>
      <div>Industry</div><div>{data.industry}</div>
    </div>    
    <div className='flex'>
      <div>CIK</div><div>{data?.cik}</div>
    </div>    
    <div className='flex'>
      <div>Exchange</div><div>{data?.exchange}</div>
    </div>    
  </>;
}
