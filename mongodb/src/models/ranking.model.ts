import { Schema, model } from 'mongoose';
import { createdAt, requiredNumber, requiredString } from '../schemas';

export type RatingFieldWithOverall =
  | 'overall'
  | 'grading'
  | 'content'
  | 'difficulty'
  | 'teaching';

export type RankEntry = {
  _id: string;
  val: Schema.Types.Mixed;
};

export type Ranking = {
  _id: string;
  ranks: RankEntry[];
  createdAt: number;
};

const RankEntry = new Schema<RankEntry>(
  {
    _id: requiredString,
    val: requiredNumber,
  },
  {
    _id: false,
    versionKey: false,
  }
);

const rankingSchema = new Schema<Ranking>(
  {
    _id: requiredString,
    ranks: {
      type: [RankEntry],
      required: true,
    },
    createdAt: createdAt,
  },
  {
    _id: false,
    timestamps: false,
    versionKey: false,
  }
);

const RankingModel = model<Ranking>('Ranking', rankingSchema);

export default RankingModel;
