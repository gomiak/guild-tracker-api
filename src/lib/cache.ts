import NodeCache from 'node-cache';

export const tibiaDataCache = new NodeCache({ stdTTL: 30 });
export const analysisCache = new NodeCache({ stdTTL: 30 });
