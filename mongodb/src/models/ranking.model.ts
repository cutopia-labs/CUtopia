import { Schema, model } from 'mongoose';
import { requiredNumber, requiredString } from '../schemas';

export type RatingFieldWithOverall =
  | 'overall'
  | 'grading'
  | 'content'
  | 'difficulty'
  | 'teaching';

export type RankEntry = {
  _id: string; // courseId
  val: Schema.Types.Mixed;
};

export type Ranking = {
  _id: string; // ranking field, e.g. latest, grading
  ranks: RankEntry[];
  updatedAt: number;
};

// temporarily remove type due to: https://github.com/Automattic/mongoose/issues/10623
const RankEntry = new Schema(
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
    updatedAt: requiredNumber,
  },
  {
    _id: false,
    timestamps: false,
    versionKey: false,
  }
);

const RankingModel = model<Ranking>('Ranking', rankingSchema);

export default RankingModel;
