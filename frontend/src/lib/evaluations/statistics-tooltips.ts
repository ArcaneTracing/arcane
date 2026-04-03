
export const STATISTICS_TOOLTIPS = {

  STATISTICS_CARD:
  "Summary statistics for each score across your dataset or experiments. Metrics depend on the score type (numeric, ordinal, or nominal).",


  NUMERIC_SECTION:
  "Continuous scores (e.g. 0–1). Mean, median, and standard deviation describe the distribution.",
  ORDINAL_SECTION:
  "Ordered categories (e.g. Poor → Good → Excellent). Median and percentiles show central tendency.",
  NOMINAL_SECTION:
  "Unordered categories (e.g. labels). Mode and entropy describe the distribution.",


  COLUMN_SCORE: "The evaluation metric being measured.",
  COLUMN_EXPERIMENT:
  "Statistics for this experiment (mean for numeric, median/mode for ordinal/nominal).",
  COLUMN_MEAN:
  "Average value across all scored rows. Use as the primary summary for numeric scores.",
  COLUMN_CI95:
  "Shows the plausible range for the mean. Helps you judge whether a score is reliably good or bad and whether you need more data (wider CI = more uncertainty).",
  COLUMN_MEDIAN:
  "Middle value (50th percentile). Less sensitive to outliers than the mean.",
  COLUMN_STD_DEV:
  "Standard deviation – measures spread. Higher values mean more variability.",
  COLUMN_SCORED:
  "Number of rows with a score vs total rows (e.g. 45/50 means 45 scored, 5 missing).",
  P10_P90: "10th and 90th percentile values. Show the range of the distribution.",
  VARIANCE: "Square of standard deviation. Measures spread in squared units.",


  COLUMN_ORDINAL_SUMMARY:
  "Typical category (median) and most common category (mode). Helps you see both central tendency and what the model outputs most often.",
  COLUMN_MEDIAN_ORDINAL:
  "Typical category (50th percentile). Shows central tendency for ordered categories.",
  COLUMN_MODE:
  "Most common category. Shows what the model outputs most often.",
  COLUMN_PERCENTILES:
  "p10 and p90 – 10th and 90th percentile categories. Show the range of responses.",
  COLUMN_ENTROPY:
  "Measures diversity of responses. Higher entropy = more spread across categories.",
  COLUMN_CATEGORIES:
  "Number of distinct ordinal levels (e.g. 5 for a 1–5 scale).",


  COLUMN_NOMINAL_SUMMARY:
  "Mode (most frequent category) and count of categories.",
  COLUMN_MODE_NOMINAL:
  "Most frequent category. Shows the dominant label in the distribution.",
  COLUMN_CATEGORIES_NOMINAL:
  "Number of distinct categories (labels).",


  EVALUATION_TYPE: "Type of evaluation run.",
  EVALUATION_SCOPE:
  "DATASET = evaluated on a dataset; EXPERIMENT = evaluated on experiment results.",
  SECTION_SCORES:
  "LLM-based or RAGAS metrics used to evaluate outputs. Scores without a prompt are manual scores; enter results in the evaluation detailed view.",
  MANUAL_SCORE:
  "Scores without a prompt are manual scores. Enter results in the evaluation screen's Detailed view.",
  SECTION_DATASET: "The dataset rows used for this evaluation.",
  SECTION_EXPERIMENTS: "Experiments whose results were evaluated."
} as const;


export const COMPARISON_TOOLTIPS = {

  COMPARISON_CARD:
  "Compare two experiments head-to-head on the same score. Select Experiment A, Experiment B, and a score. Metrics and charts depend on the score type (numeric, ordinal, or nominal).",


  SELECTOR_EXPERIMENT_A:
  "Baseline experiment (reference). Metrics are compared as B vs A.",
  SELECTOR_EXPERIMENT_B:
  "Treatment experiment. Delta and Win/Tie/Loss show how B performs relative to A.",
  SELECTOR_SCORE:
  "The evaluation metric to compare. Must have scored results in both experiments.",


  COMPARISON_MEAN_A: "Mean score for Experiment A across paired rows.",
  COMPARISON_MEAN_B: "Mean score for Experiment B across paired rows.",
  COMPARISON_MEAN_DELTA:
  "Difference in means: B minus A. Positive = B scores higher on average.",
  COMPARISON_CI95_DELTA:
  "95% confidence interval for the mean delta (t-based). If it excludes 0, the difference is statistically significant.",
  COMPARISON_P_VALUE:
  "Answers: 'Is this difference real or just noise?' Below 0.05 = likely a real difference; above = could be random chance. Use with effect size to judge whether it matters in practice.",
  COMPARISON_COHENS_DZ:
  "Measures how large the difference is in practice, not just whether it's statistically significant. Small (~0.2) = modest change; moderate (~0.5) = substantial; large (~0.8) = strong. Use this to judge whether the improvement from B over A is meaningful for your use case.",
  COMPARISON_WIN_RATE:
  "Proportion of rows where Experiment B scores higher than A.",
  COMPARISON_TIE_RATE:
  "Proportion of rows where both experiments have the same score.",
  COMPARISON_LOSS_RATE:
  "Proportion of rows where Experiment B scores lower than A.",
  COMPARISON_N_PAIRED:
  "Number of dataset rows with scores for both experiments (used for comparison).",


  COMPARISON_CRAMERS_V:
  "How strongly does the experiment affect which category appears? 0 = no link; 1 = experiment strongly predicts category. Helps you see if A and B produce different label distributions.",
  COMPARISON_CHI_SQUARED_P:
  "Answers: 'Do A and B produce different category distributions?' Below 0.05 = likely different; above = could be chance.",
  COMPARISON_BOWKER_P:
  "Bowker's test for paired nominal data. Answers: 'Do A and B produce different category distributions?' Below 0.05 = likely different; above = could be chance. Uses the change table (how pairs moved between categories).",
  COMPARISON_WILCOXON_SIGNED_RANK_P:
  "Wilcoxon signed-rank test for paired ordinal data. Answers: 'Does B tend to score higher than A?' Below 0.05 = likely a systematic shift; above = could be chance. Uses ranked differences within each pair.",
  COMPARISON_ENTROPY_DIFF:
  "How much more or less varied are B's responses? Positive = B uses more categories; negative = B is more concentrated. Helps you decide if B is more or less diverse.",
  COMPARISON_DISTRIBUTION:
  "How often each category appears in A vs B. Delta shows the change per category; CI shows whether that change is reliable.",


  COMPARISON_MEDIAN:
  "The middle category for each experiment. Helps you see the typical response level for A vs B.",
  COMPARISON_CLIFFS_DELTA:
  "How much better or worse is B than A for ordered categories? Positive = B tends to score higher; negative = B tends to score lower. Range [-1, 1]. Like Cohen's dz but for ordinal data.",
  COMPARISON_PROB_SUPERIORITY:
  "What share of rows does B score higher than A? Direct answer to 'how often does B beat A?'",
  COMPARISON_PASS_RATE:
  "What share of results meet your quality bar? Compare A vs B to see which experiment passes more often.",
  COMPARISON_TAIL_RISK:
  "What share of results fall in the worst categories? Lower is better. Compare A vs B to see which experiment has fewer bad outcomes.",


  CHART_DELTA_CI:
  "Mean delta (B - A) with 95% t-based CI. Bar shows point estimate; confidence interval shows uncertainty.",
  CHART_WIN_TIE_LOSS:
  "Pie breakdown for each row: B scores higher (win), same (tie), or lower (loss).",
  CHART_PAIRED_SCATTER:
  "Each point is one dataset row: x = Experiment A score, y = Experiment B score. Use it to see how paired scores cluster and disperse—where points group (e.g. upper-right = both high), how spread they are, and whether one experiment tends to score higher (points above the diagonal = B > A, below = A > B). The diagonal line marks equal scores.",
  CHART_DISTRIBUTION_OVERLAY:
  "Histogram of scores for each experiment. Compare shape and spread.",
  CHART_NOMINAL_DISTRIBUTION:
  "Side-by-side category proportions. Compare how often each label appears in A vs B.",
  CHART_CATEGORY_DELTA:
  "Change in proportion per category (B - A). Error bars show confidence intervals.",
  CHART_ORDINAL_DISTRIBUTION:
  "Category proportions sorted by rank. Shows how the distribution shifts between experiments.",
  CHART_PASS_RATE:
  "Proportion of results in acceptable categories for each experiment.",
  CHART_TAIL_RISK:
  "Proportion of results below a threshold rank."
} as const;