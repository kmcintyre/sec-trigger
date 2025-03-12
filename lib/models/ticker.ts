import { Schema, model, models } from 'mongoose';

export interface ITicker {
    ticker: string;
    company: string;
    industry: string;
    cik?: string;
    exchange?: string;
}

const tickerSchema = new Schema<ITicker>({
    ticker: {
        type: String, required: true,
        unique: true,
        index: true
    },
    company: { type: String, required: true },
    industry: { type: String, required: true },
    cik: { type: String },
    exchange: { type: String },
});

export const Ticker = models.Ticker || model('Ticker', tickerSchema);