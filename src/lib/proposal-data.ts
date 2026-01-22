export type WorkPlanBullet = {
  text: string;
  highlightColor?: string;
};

export type WorkPlanBlock = {
  number: number;
  heading?: string;
  leadText?: string;
  bullets: WorkPlanBullet[];
};

export type PricingPackage = {
  name: string;
  price: string;
  points: string[];
};

export type ProposalData = {
  hero: {
    title: string;
    subtitle: string;
    introduction: string;
  };
  visionHtml: string;
  goals: string[];
  workPlan: WorkPlanBlock[];
  pricing: PricingPackage[];
  notesHtml: string;
};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");

const stringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => stringValue(item)) : [];

const bulletArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => ({
        text: stringValue(item?.text),
        highlightColor: stringValue(item?.highlightColor) || undefined
      }))
    : [];

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

export const emptyProposalData = (): ProposalData => ({
  hero: { title: "", subtitle: "", introduction: "" },
  visionHtml: "",
  goals: [""],
  workPlan: Array.from({ length: 6 }, (_, index) => ({
    number: index + 1,
    heading: "",
    leadText: "",
    bullets: [{ text: "", highlightColor: undefined }]
  })),
  pricing: Array.from({ length: 3 }, () => ({
    name: "",
    price: "",
    points: [""]
  })),
  notesHtml: ""
});

export const normalizeProposalData = (input: unknown): ProposalData => {
  const base = emptyProposalData();
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

  const data = payload as Partial<ProposalData>;

  const hero = {
    title: stringValue(data.hero?.title),
    subtitle: stringValue(data.hero?.subtitle),
    introduction: stringValue(data.hero?.introduction)
  };

  const goals = stringArray(data.goals);
  const normalizedGoals = hasOwn(data, "goals") ? goals : base.goals;

  const hasWorkPlan = hasOwn(data, "workPlan") && Array.isArray(data.workPlan);
  const workPlanSource = hasWorkPlan ? (data.workPlan as unknown[]) : base.workPlan;
  const workPlan = workPlanSource.map((incoming, index) => {
    const block = typeof incoming === "object" && incoming !== null ? (incoming as Record<string, unknown>) : {};
    return {
      number: index + 1,
      heading: stringValue(block.heading),
      leadText: stringValue(block.leadText),
      bullets: bulletArray(block.bullets)
    };
  });

  const pricingInput = Array.isArray(data.pricing) ? data.pricing : [];
  const pricing = base.pricing.map((pkg, index) => {
    const incoming = pricingInput[index] ?? {};
    const hasPoints = typeof incoming === "object" && incoming !== null && hasOwn(incoming, "points");
    const points = hasPoints ? stringArray((incoming as { points?: unknown }).points) : pkg.points;
    return {
      name: stringValue(incoming?.name),
      price: stringValue(incoming?.price),
      points
    };
  });

  return {
    hero,
    visionHtml: stringValue(data.visionHtml),
    goals: normalizedGoals,
    workPlan,
    pricing,
    notesHtml: stringValue(data.notesHtml)
  };
};

export const isLanguageAvailable = (data: ProposalData | null | undefined) =>
  Boolean(data?.hero?.title?.trim());
