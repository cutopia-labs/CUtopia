import { Ranking } from 'cutopia-types';
import { Schema, model } from 'mongoose';

import { requiredNumber, requiredString } from '../constants/schema';

const rankEntry = {
  _id: requiredString,
  val: {
    type: Schema.Types.Mixed,
    required: true,
  },
};

const rankingSchema = new Schema<Ranking>(
  {
    _id: requiredString,
    ranks: {
      type: [rankEntry],
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
