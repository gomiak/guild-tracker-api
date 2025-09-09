import NodeCache from 'node-cache';

// Cache para dados da API externa (muda menos frequentemente)
export const tibiaDataCache = new NodeCache({ stdTTL: 60 });

// Cache para análise (muda mais frequentemente, especialmente com exitados)
export const analysisCache = new NodeCache({ stdTTL: 15 });
