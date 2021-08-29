import { Ranking } from 'cutopia-types/lib/types';
import { Schema, model } from 'mongoose';
import { requiredNumber, requiredString } from '../schemas';

// temporarily remove type due to: https://github.com/Automattic/mongoose/issues/10623
const RankEntry = new Schema(
  {
    _id: requiredString,
    val: {
      type: Schema.Types.Mixed,
      required: true,
    },
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
