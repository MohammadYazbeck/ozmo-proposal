export type ProgressPoint = {
  text: string;
  done: boolean;
};

export type ProgressCalendarItem = {
  date: string;
  time?: string;
  title?: string;
  points: string[];
};

export type ProgressPaymentEntry = {
  amount: string;
  description: string;
  date?: string;
};

export type ProgressData = {
  client: {
    name: string;
    description: string;
  };
  workPlan: {
    brief: string;
    points: ProgressPoint[];
  };
  calendar: ProgressCalendarItem[];
  assetsUrl: string;
  payments: {
    agreedPrice: string;
    entries: ProgressPaymentEntry[];
    metaAdsBalance: string;
  };
};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");
const booleanValue = (value: unknown) => Boolean(value);
const stringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => stringValue(item)) : [];

const progressPoints = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => ({
        text: stringValue(item?.text),
        done: booleanValue(item?.done)
      }))
    : [];

const calendarItems = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => ({
        date: stringValue(item?.date),
        time: stringValue(item?.time) || undefined,
        title: stringValue(item?.title),
        points: stringArray(item?.points)
      }))
    : [];

const paymentEntries = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => ({
        amount: stringValue(item?.amount),
        description: stringValue(item?.description),
        date: stringValue(item?.date) || undefined
      }))
    : [];

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

export const emptyProgressData = (): ProgressData => ({
  client: { name: "", description: "" },
  workPlan: {
    brief: "",
    points: [{ text: "", done: false }]
  },
  calendar: [],
  assetsUrl: "",
  payments: {
    agreedPrice: "",
    entries: [{ amount: "", description: "", date: "" }],
    metaAdsBalance: ""
  }
});

export const normalizeProgressData = (input: unknown): ProgressData => {
  const base = emptyProgressData();
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

  const data = payload as Partial<ProgressData>;
  const client = {
    name: stringValue(data.client?.name),
    description: stringValue(data.client?.description)
  };

  const workPlan = {
    brief: stringValue(data.workPlan?.brief),
    points: hasOwn(data.workPlan ?? {}, "points")
      ? progressPoints(data.workPlan?.points)
      : base.workPlan.points
  };

  const calendar = hasOwn(data, "calendar") ? calendarItems(data.calendar) : base.calendar;
  const assetsUrl = stringValue(data.assetsUrl);

  const payments = {
    agreedPrice: stringValue(data.payments?.agreedPrice),
    entries: hasOwn(data.payments ?? {}, "entries")
      ? paymentEntries(data.payments?.entries)
      : base.payments.entries,
    metaAdsBalance: stringValue(data.payments?.metaAdsBalance)
  };

  return {
    client,
    workPlan,
    calendar,
    assetsUrl,
    payments
  };
};

export const isProgressAvailable = (data: ProgressData | null | undefined) =>
  Boolean(data?.client?.name?.trim());
