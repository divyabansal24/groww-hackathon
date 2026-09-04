export const ATTENTION_LEVELS = {
  MAJOR_MOVE: 'MAJOR_MOVE',
  MODERATE_GAIN: 'MODERATE_GAIN',
  MODERATE_DIP: 'MODERATE_DIP',
  STEADY: 'STEADY',
  NO_DATA: 'NO_DATA'
};

export const ATTENTION_CONFIG = {
  [ATTENTION_LEVELS.MAJOR_MOVE]: {
    label: 'Major Move',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: '🚀',
    requiresAttention: true
  },
  [ATTENTION_LEVELS.MODERATE_GAIN]: {
    label: 'Moderate Gain',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: '📈',
    requiresAttention: false
  },
  [ATTENTION_LEVELS.MODERATE_DIP]: {
    label: 'Moderate Dip',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    icon: '📉',
    requiresAttention: false
  },
  [ATTENTION_LEVELS.STEADY]: {
    label: 'Steady',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: '🟢',
    requiresAttention: false
  },
  [ATTENTION_LEVELS.NO_DATA]: {
    label: 'No Data',
    badgeClass: 'bg-slate-800 text-slate-500 border-slate-700',
    icon: '⚪',
    requiresAttention: false
  }
};

/**
 * Calculate delta & classify attention status for a stock quote compared to snapshot.
 */
export function calculateStockDelta(quote, snapshotEntry) {
  if (!quote || typeof quote.price !== 'number' || isNaN(quote.price)) {
    return {
      currentPrice: null,
      snapshotPrice: snapshotEntry?.price ?? null,
      diff: null,
      deltaPercent: null,
      attentionLevel: ATTENTION_LEVELS.NO_DATA,
      explanation: 'Live price data unavailable',
      requiresAttention: false
    };
  }

  const currentPrice = quote.price;
  const snapshotPrice = snapshotEntry?.price;

  if (snapshotPrice === undefined || snapshotPrice === null || typeof snapshotPrice !== 'number' || isNaN(snapshotPrice) || snapshotPrice === 0) {
    return {
      currentPrice,
      snapshotPrice: null,
      diff: null,
      deltaPercent: null,
      attentionLevel: ATTENTION_LEVELS.STEADY,
      explanation: 'Initial tracking started (no prior check price)',
      requiresAttention: false
    };
  }

  const diff = currentPrice - snapshotPrice;
  const deltaPercent = ((currentPrice - snapshotPrice) / snapshotPrice) * 100;
  const absDeltaPercent = Math.abs(deltaPercent);

  let attentionLevel = ATTENTION_LEVELS.STEADY;
  let explanation = 'No meaningful change since your last check';
  let requiresAttention = false;

  const formattedAbsPct = absDeltaPercent.toFixed(1);

  if (absDeltaPercent >= 2.0) {
    attentionLevel = ATTENTION_LEVELS.MAJOR_MOVE;
    requiresAttention = true;
    explanation = deltaPercent > 0
      ? `Up ${formattedAbsPct}% since your last check`
      : `Down ${formattedAbsPct}% since your last check`;
  } else if (deltaPercent >= 0.75) {
    attentionLevel = ATTENTION_LEVELS.MODERATE_GAIN;
    explanation = `Up ${formattedAbsPct}% since your last check`;
  } else if (deltaPercent <= -0.75) {
    attentionLevel = ATTENTION_LEVELS.MODERATE_DIP;
    explanation = `Down ${formattedAbsPct}% since your last check`;
  } else {
    attentionLevel = ATTENTION_LEVELS.STEADY;
    explanation = 'No meaningful change since your last check';
  }

  return {
    currentPrice,
    snapshotPrice,
    diff: roundTwo(diff),
    deltaPercent: roundTwo(deltaPercent),
    attentionLevel,
    explanation,
    requiresAttention
  };
}

/**
 * Compare all quotes against stored snapshot state.
 * Returns array of enriched stock items with delta analysis.
 */
export function analyzeWatchlistDeltas(watchlistSymbols, quotes = {}, snapshot = {}) {
  let attentionCount = 0;
  let topMover = null;

  const items = watchlistSymbols.map(symbol => {
    const quote = quotes[symbol] || { symbol };
    const snap = snapshot[symbol] || null;
    const delta = calculateStockDelta(quote, snap);

    if (delta.requiresAttention) {
      attentionCount++;
    }

    if (delta.deltaPercent !== null) {
      if (!topMover || Math.abs(delta.deltaPercent) > Math.abs(topMover.deltaPercent)) {
        topMover = {
          symbol,
          name: quote.name || symbol,
          deltaPercent: delta.deltaPercent
        };
      }
    }

    return {
      symbol,
      name: quote.name || symbol,
      quote,
      snapshot: snap,
      delta
    };
  });

  return {
    items,
    totalCount: watchlistSymbols.length,
    attentionCount,
    topMover
  };
}

function roundTwo(num) {
  if (num === null || num === undefined || isNaN(num)) return null;
  return Math.round(num * 100) / 100;
}
