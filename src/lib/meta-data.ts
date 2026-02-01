export type MetaResults = {
  reach: string;
  messages: string;
  campaigns: string;
  followers: string;
  amountSpent: string;
  timeDays: string;
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
  results: {
    reach: "",
    messages: "",
    campaigns: "",
    followers: "",
    amountSpent: "",
    timeDays: ""
  },
  plan: {
    title: "",
    points: [""],
  }
});

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

  const results = {
    reach: stringValue(data.results?.reach),
    messages: stringValue(data.results?.messages),
    campaigns: stringValue(data.results?.campaigns),
    followers: stringValue(data.results?.followers),
    amountSpent: stringValue(data.results?.amountSpent),
    timeDays: stringValue(data.results?.timeDays)
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
    results,
    plan
  };
};

export const isMetaAvailable = (data: MetaData | null | undefined) =>
  Boolean(data?.client?.name?.trim());
