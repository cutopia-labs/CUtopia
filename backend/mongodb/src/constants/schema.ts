export const requiredNumber = {
  type: Number,
  required: true,
};

export const requiredString = {
  type: String,
  required: true,
};

export const createdAt = {
  type: Number,
  default: () => +new Date(),
};
