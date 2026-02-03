export type MetaAdMetrics = {
  reach: string;
  messages: string;
  followers: string;
  amountSpent: string;
  timeDays: string;
};

export type MetaAd = {
  name: string;
  metrics: MetaAdMetrics;
};

export type MetaAdSet = {
  name: string;
  ads: MetaAd[];
};

export type MetaCampaign = {
  name: string;
  adSets: MetaAdSet[];
};

export type MetaResults = {
  reach: string;
  messages: string;
  campaigns: string;
  followers: string;
  amountSpent: string;
  timeDays: string;
  amountSpentUpdatedAt: string;
  mediaUrl: string;
  mediaLabel: string;
  linkUrl: string;
  linkLabel: string;
  campaignItems: MetaCampaign[];
};

export type MetaPlan = {
  title: string;
  points: string[];
};

export type MetaData = {
  client: {
    name: string;
    description: string;
  };
  walletBalance: string;
  walletUpdatedAt: string;
  results: MetaResults;
  plan: MetaPlan;
};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");
const stringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => stringValue(item)) : [];

const hasOwn = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

export const emptyMetaData = (): MetaData => ({
  client: { name: "", description: "" },
  walletBalance: "",
  walletUpdatedAt: "",
  results: {
    reach: "",
    messages: "",
    campaigns: "",
    followers: "",
    amountSpent: "",
    timeDays: "",
    amountSpentUpdatedAt: "",
    mediaUrl: "",
    mediaLabel: "",
    linkUrl: "",
    linkLabel: "",
    campaignItems: []
  },
  plan: {
    title: "",
    points: [""]
  }
});

const normalizeAdMetrics = (input: unknown): MetaAdMetrics => {
  if (!input || typeof input !== "object") {
    return {
      reach: "",
      messages: "",
      followers: "",
      amountSpent: "",
      timeDays: ""
    };
  }
  const metrics = input as Partial<MetaAdMetrics>;
  return {
    reach: stringValue(metrics.reach),
    messages: stringValue(metrics.messages),
    followers: stringValue(metrics.followers),
    amountSpent: stringValue(metrics.amountSpent),
    timeDays: stringValue(metrics.timeDays)
  };
};

const normalizeAd = (input: unknown): MetaAd => {
  if (!input || typeof input !== "object") {
    return { name: "", metrics: normalizeAdMetrics(null) };
  }
  const ad = input as Partial<MetaAd>;
  return {
    name: stringValue(ad.name),
    metrics: normalizeAdMetrics((ad as MetaAd).metrics ?? ad)
  };
};

const normalizeAdSet = (input: unknown): MetaAdSet => {
  if (!input || typeof input !== "object") {
    return { name: "", ads: [] };
  }
  const adSet = input as Partial<MetaAdSet>;
  const ads = Array.isArray(adSet.ads) ? adSet.ads.map(normalizeAd) : [];
  return {
    name: stringValue(adSet.name),
    ads
  };
};

const normalizeCampaign = (input: unknown): MetaCampaign => {
  if (!input || typeof input !== "object") {
    return { name: "", adSets: [] };
  }
  const campaign = input as Partial<MetaCampaign>;
  const adSets = Array.isArray(campaign.adSets) ? campaign.adSets.map(normalizeAdSet) : [];
  return {
    name: stringValue(campaign.name),
    adSets
  };
};

export const normalizeMetaData = (input: unknown): MetaData => {
  const base = emptyMetaData();
  if (!input) {
    return base;
  }

  let payload: unknown = input;
  if (typeof input === "string") {
    try {
      payload = JSON.parse(input);
    } catch {
      return base;
    }
  }

  if (!payload || typeof payload !== "object") {
    return base;
  }

  const data = payload as Partial<MetaData>;

  const client = {
    name: stringValue(data.client?.name),
    description: stringValue(data.client?.description)
  };

  const walletBalance = stringValue((data as MetaData).walletBalance);
  const walletUpdatedAt = stringValue((data as MetaData).walletUpdatedAt);

  const results = {
    reach: stringValue(data.results?.reach),
    messages: stringValue(data.results?.messages),
    campaigns: stringValue(data.results?.campaigns),
    followers: stringValue(data.results?.followers),
    amountSpent: stringValue(data.results?.amountSpent),
    timeDays: stringValue(data.results?.timeDays),
    amountSpentUpdatedAt: stringValue(data.results?.amountSpentUpdatedAt),
    mediaUrl: stringValue(data.results?.mediaUrl),
    mediaLabel: stringValue(data.results?.mediaLabel),
    linkUrl: stringValue(data.results?.linkUrl),
    linkLabel: stringValue(data.results?.linkLabel),
    campaignItems: Array.isArray(data.results?.campaignItems)
      ? data.results?.campaignItems.map(normalizeCampaign)
      : base.results.campaignItems
  };

  const plan = {
    title: stringValue(data.plan?.title),
    points: hasOwn(data.plan ?? {}, "points")
      ? stringArray(data.plan?.points)
      : base.plan.points
  };

  return {
    client,
    walletBalance,
    walletUpdatedAt,
    results,
    plan
  };
};

export const isMetaAvailable = (data: MetaData | null | undefined) =>
  Boolean(data?.client?.name?.trim());
