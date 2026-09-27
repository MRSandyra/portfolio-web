/**
 * Single source of truth for projects.
 * Used by: /projects, /projects/[slug], the homepage teaser, and OG image generation.
 *
 * `evidence.status` is deliberate and must stay honest:
 *   'measured'   - the visual is drawn from numbers that exist in the project itself.
 *   'method'     - the visual explains a technique; it asserts no result.
 *   'structural' - no measured numbers exist, so the visual shows verifiable
 *                  structure (pipeline stages) and claims no metrics.
 * Never promote a 'structural' visual to a fake chart.
 *
 * `study.broke` is the incident record: what actually went wrong and how it was
 * fixed. It is a selling point, not an embarrassment - it is the difference
 * between someone who ran a notebook once and someone who operated a pipeline.
 */

export const CATEGORIES = [
  'Data Engineering',
  'Machine Learning & AI',
  'Applied Systems',
  'Analysis & Visualization',
];

export const projects = [
  // ══════════════════════════ DATA ENGINEERING ══════════════════════════
  {
    slug: 'panganwatch',
    title: 'PanganWatch — governed food price intelligence',
    shortTitle: 'PanganWatch',
    categories: ['Data Engineering'],
    featured: true,
    summary:
      'A governed data platform for Indonesian food prices. Three public APIs land in MongoDB as raw payloads with per-record lineage, flow through PostgreSQL into dbt marts guarded by 134 tests, and reach users in Tableau.',
    kpis: [
      { value: '134', label: 'dbt tests' },
      { value: '513', label: 'Regencies reconciled' },
      { value: '27', label: 'Quality rules' },
    ],
    stack: ['Airflow', 'Kafka (KRaft)', 'dbt', 'PostgreSQL', 'MongoDB', 'Pydantic', 'Plotly', 'Tableau', 'Docker Compose'],
    github: 'https://github.com/MRSandyra/panganwatch',
    demo: '',
    demoNote: 'Tableau dashboard — code only',
    evidence: {
      type: 'coverage',
      status: 'measured',
      stages: [
        { label: 'Three public APIs', detail: 'WFP · Open-Meteo · BPS' },
        { label: 'MongoDB bronze', detail: 'raw + lineage, 90d TTL' },
        { label: 'PostgreSQL', detail: 'reconciled to BPS codes' },
        { label: 'dbt marts', detail: '134 tests' },
        { label: 'Tableau', detail: 'published views' },
      ],
      branch: {
        label: 'Streaming validation',
        fromIndex: 0,
        stages: [
          { label: 'Kafka (KRaft)', detail: '7d retention' },
          { label: 'Pydantic contract', detail: 'schema gate' },
          { label: 'Dead-letter queue', detail: 'invalid payloads' },
        ],
      },
    },
    study: {
      problem:
        'Indonesian food price data is public but scattered across agencies that disagree with each other. Region names are spelled differently in every source, commodities appear and disappear without notice, and nothing tells you which numbers you can trust. A dashboard built straight on top of that looks authoritative and is quietly wrong.',
      data:
        'Three public APIs: WFP food prices via HDX, Open-Meteo for weather, and the BPS WebAPI for consumer price statistics. Everything lands first in MongoDB as the raw payload exactly as received, with lineage recorded per record, so any number in the final mart can be traced back to the response it came from.',
      approach: [
        'Airflow runs the batch side; a Kafka stream on KRaft validates live weather against a Pydantic data contract, and anything failing the contract goes to a dead-letter queue rather than into the warehouse.',
        'MongoDB holds bronze with a 90-day TTL, Kafka topics retain 7 days; nothing is kept indefinitely just because storage is cheap.',
        '27 quality rules covering the six DAMA dimensions run against the data, and 134 dbt tests guard the marts so a broken assumption fails the build instead of reaching Tableau.',
        '513 regencies and cities are reconciled to official BPS codes through a 2,565-row crosswalk, and 150 IHK cities are mapped to 38 provinces — 123 automatically, 27 by hand with the reason for each recorded.',
        'Correlation is reported with its sample size and p-value: Spearman rho = 0.206 at n = 354, p a little under 1e-04. It is never presented as causation.',
      ],
      result:
        'A platform where every published figure carries its lineage and has passed a named test. The correlation it surfaces is modest and reported as modest — the point is that the number comes with the evidence needed to judge it.',
      impact:
        'The governance layer is the product. Anyone can plot a price series; the useful thing is knowing which parts of that series are real, which regions are missing, and when a source stopped reporting.',
      broke: [
        'A single missing field sent every DQ rule into the exception handler, where it wrote fabricated failure results — the checks reported confidently on data they had never actually examined.',
        'One rule pointed at a column that had never existed, quarantining all 17,708 weather rows out of 17,708. A rule that rejects everything looks identical to a rule that works, until you read the count.',
        'A coverage rule passed vacuously because it counted rows rather than distinct provinces — plenty of rows, almost no geography.',
        'A stale airflow-webserver.pid killed the webserver on every container restart while the container carried on reporting itself healthy.',
        'The Kafka consumer held one Postgres connection for its entire lifetime with no reconnect, so a brief database blip ended ingestion silently.',
      ],
      limits: [
        '34 of 38 provinces are covered; the coverage rule is what found the gap.',
        'January 2026 carries only 8 provinces, and the dashboard flags it rather than averaging over it.',
        'Chili disappears from the source entirely after May 2024 — the series ends there instead of being interpolated.',
      ],
    },
  },
  {
    slug: 'fraud-transaction-risk-pipeline',
    title: 'Fraud and transaction risk monitoring pipeline',
    shortTitle: 'Fraud Pipeline',
    categories: ['Data Engineering'],
    featured: true,
    summary:
      'A streaming and batch platform for payment fraud monitoring. PaySim is replayed as an event stream through a 12-container stack: Kafka to Spark Structured Streaming to a MinIO lake, then ClickHouse, dbt and Superset.',
    kpis: [
      { value: '6.36M', label: 'Transactions processed' },
      { value: '0.13%', label: 'Fraud rate (8,213)' },
      { value: '12', label: 'Containers orchestrated' },
    ],
    stack: ['Kafka', 'Spark', 'MinIO', 'ClickHouse', 'dbt', 'Airflow', 'Superset', 'Docker'],
    github: 'https://github.com/MRSandyra/fraud-transaction-risk-pipeline',
    demo: '',
    demoNote: 'Superset dashboard — code only',
    evidence: {
      type: 'pipeline',
      status: 'measured',
      note: 'Every stage below is a running container in the stack; the figures in the tiles are counted from the replayed dataset.',
      stages: [
        { label: 'Kafka', detail: 'replayed stream' },
        { label: 'Spark Streaming', detail: 'structured' },
        { label: 'MinIO lake', detail: 'bronze/silver/gold' },
        { label: 'ClickHouse', detail: 'S3 table engine' },
        { label: 'dbt', detail: '14 tests' },
        { label: 'Superset', detail: 'dashboards' },
      ],
      branch: {
        label: 'Nightly batch',
        fromIndex: 2,
        stages: [
          { label: 'Airflow', detail: 'orchestration' },
          { label: 'Full rebuild', detail: 'restates history' },
        ],
      },
    },
    study: {
      problem:
        'Fraud monitoring has to answer two questions with different deadlines: what is happening right now, and what does the last month actually look like. A system built only for streaming cannot restate history; one built only for batch notices the incident the next morning.',
      data:
        'The PaySim synthetic payments dataset, replayed as a live event stream rather than read as a file — 6,360,000 transactions carrying 8,213 labelled frauds, a rate of 0.13%. That imbalance is the defining property: a model or a rule that calls everything legitimate is already 99.87% accurate and completely useless.',
      approach: [
        'Kafka ingests the replayed stream; Spark Structured Streaming writes into a MinIO data lake organised bronze, silver, gold.',
        'ClickHouse reads the gold Parquet directly through its S3 table engine, so the lake stays the single copy of the data rather than being duplicated into the warehouse.',
        'dbt builds the analytical models on top with 14 tests, and Superset serves the dashboards.',
        'Airflow orchestrates a nightly batch rebuild, so streaming answers "now" while batch restates the full history.',
        'Every image is pinned to a specific tag after an upstream image vanished mid-project.',
      ],
      result:
        'A 12-container stack that runs end to end on one machine, handling both the live path and the nightly restatement over the full 6.36 million transactions.',
      impact:
        'The lesson worth carrying is that the alerting surface is mostly a data quality problem. Most of what looked like fraud signal during development turned out to be pipeline artefacts, and the fixes below are what separated the two.',
      broke: [
        'A fraud rate spike that turned out to be a drop in legitimate volume, not an attack. The numerator never moved; the denominator did.',
        'A NULL merchant bucket topped the risk leaderboard — the highest-risk merchant in the system was the absence of a merchant.',
        'A fresh clone crashed because ClickHouse inferred its schema from an empty bucket, so the first run of the project was the only run that could not work.',
        'The MinIO image disappeared from Docker Hub mid-project. Every image is now pinned to a specific tag, and MinIO was moved to quay.io.',
      ],
    },
  },
  {
    slug: 'jakarta-air-quality-pipeline',
    title: 'Jakarta air quality pipeline',
    shortTitle: 'Jakarta Air Quality',
    categories: ['Data Engineering'],
    featured: false,
    summary:
      'An hourly ELT pipeline joining OpenAQ air quality with BMKG weather forecasts through dbt into Postgres and a Metabase dashboard, orchestrated by Airflow and running entirely on Docker Compose with no cloud account.',
    kpis: [
      { value: '11', label: 'dbt tests blocking' },
      { value: '10', label: 'DQ bugs fixed live' },
      { value: '2 / 27', label: 'Stations reporting' },
    ],
    stack: ['Airflow', 'dbt', 'PostgreSQL', 'Metabase', 'Docker Compose'],
    github: 'https://github.com/MRSandyra/portfolio',
    demo: '',
    demoNote: 'Local folder in portfolio repo',
    evidence: {
      type: 'pipeline',
      status: 'measured',
      note: 'Hourly ELT run; the tile figures are counted from the pipeline running in production.',
      stages: [
        { label: 'OpenAQ + BMKG', detail: 'hourly pull' },
        { label: 'Airflow', detail: 'orchestration' },
        { label: 'raw → staging', detail: 'dbt' },
        { label: 'marts', detail: '11 tests block' },
        { label: 'Metabase', detail: 'dashboard' },
      ],
    },
    study: {
      problem:
        'Air quality only means something next to the weather that moved it. Getting the two together hourly, from two agencies with different formats and different ideas of a timestamp, is the actual work.',
      data:
        'OpenAQ for air quality and BMKG for weather forecasts, pulled hourly. Of the 27 nearest OpenAQ stations, only 2 report genuine readings — a finding the pipeline surfaces rather than papers over, and one that limits what the dashboard can honestly claim.',
      approach: [
        'Airflow orchestrates an hourly ELT run with a 14-day historical backfill.',
        'dbt layers the warehouse bronze to silver to gold — raw, staging, marts — so each transformation is inspectable on its own.',
        '11 dbt tests block every run; a failing assumption stops the pipeline rather than quietly publishing.',
        'Metabase serves the dashboard, and the whole stack runs on Docker Compose without a cloud account.',
      ],
      result:
        'A pipeline that runs unattended hourly and has caught 10 distinct data quality bugs in production — each one a case where the numbers looked fine and were not.',
      impact:
        'Running it for real is what produced the value. None of those 10 bugs would have appeared in a single notebook execution; they needed the pipeline to run repeatedly against changing upstream data.',
      broke: [
        'Ten separate data quality bugs surfaced in production, each looking perfectly plausible in the dashboard until a test caught it.',
        'A silent dbt schema-naming quirk that changed where models landed without failing anything.',
        'A timezone bug shifted every weather join by 7 hours and went undetected — the rows matched, they were just matched to the wrong hour.',
      ],
    },
  },
  {
    slug: 'wikipedia-edit-stream-analytics',
    title: 'Wikipedia edit stream analytics',
    shortTitle: 'Wikipedia Stream',
    categories: ['Data Engineering'],
    featured: false,
    summary:
      "A real-time streaming pipeline that consumes Wikipedia's global edit firehose and scores every edit for vandalism risk with weighted heuristics — no cloud account, no API key, no dataset to download.",
    kpis: [
      { value: '6', label: 'Weighted heuristics' },
      { value: '0–100', label: 'Risk score range' },
      { value: '60s', label: 'Gold refresh cycle' },
    ],
    stack: ['Python', 'Redpanda', 'DuckDB', 'Pydantic', 'APScheduler', 'Streamlit', 'pytest'],
    github: 'https://github.com/MRSandyra/wikipedia-edit-stream-analytics',
    demo: '',
    demoNote: 'Streamlit app — run locally',
    evidence: {
      type: 'pipeline',
      status: 'measured',
      note: 'The scoring and retention figures in the tiles are properties of the running pipeline.',
      stages: [
        { label: 'EventStreams', detail: 'Wikimedia SSE' },
        { label: 'Redpanda', detail: 'broker' },
        { label: 'Consumer', detail: 'Pydantic + score' },
        { label: 'DuckDB', detail: 'bronze/silver, 3d' },
        { label: 'Aggregator', detail: '4 gold tables / 60s' },
        { label: 'Streamlit', detail: 'dashboard' },
      ],
    },
    study: {
      problem:
        'Wikipedia is edited continuously and publicly, which makes it one of the few genuinely unbounded free event streams. The interesting question is not storing it but deciding, as each edit arrives, whether it deserves a human look.',
      data:
        'The Wikimedia EventStreams firehose of global edits, consumed live. Bots are excluded from risk scoring — they would dominate it — but still tracked, because the bot-to-human ratio is itself a useful signal.',
      approach: [
        'EventStreams feeds Redpanda; a consumer validates each event against a Pydantic schema and writes bronze and silver into DuckDB.',
        'Six weighted heuristics score each edit from 0 to 100 for vandalism risk.',
        'An aggregator precomputes 4 gold tables every 60 seconds on APScheduler, so the Streamlit dashboard reads prepared tables instead of scanning raw events.',
        'Bronze is retained for 3 days, and a dedicated pytest suite covers the scoring logic.',
      ],
      result:
        'A streaming stack that runs start to finish on Docker Compose with no credentials of any kind, turning an unbounded public firehose into four small tables a dashboard can read instantly.',
      impact:
        'Scoring at ingestion rather than after storage is what keeps it cheap: the expensive judgement happens once per event, and everything downstream reads a number.',
      broke: [
        'A manually constructed httpx.Request silently dropped the User-Agent header — the request was well-formed and anonymous, which is exactly what the endpoint refuses.',
        'The schema was written for a CloudEvents envelope that the Wikimedia stream turns out never to send.',
        "DuckDB's single-writer lock quietly blocked the aggregator on every cycle; nothing errored, the gold tables just stopped moving.",
        'The first diagnosis was wrong: it concluded Wikimedia was blocking Docker containers. The real cause was the wrong request method for an SSE endpoint — a reminder that a confident diagnosis is not a correct one.',
      ],
    },
  },

  // ══════════════════════ MACHINE LEARNING & AI ══════════════════════
  {
    slug: 'lol-challenger-analytics',
    title: 'League of Legends Challenger match analytics and win prediction',
    shortTitle: 'LoL Analytics',
    categories: ['Machine Learning & AI'],
    featured: false,
    summary:
      'Three hundred Challenger-tier matches — about 311,000 in-game events — streamed out of a 10-million-event public dataset without ever loading it into memory, then carried through win prediction, model interpretation and anomaly detection.',
    kpis: [
      { value: '311K', label: 'In-game events' },
      { value: '300', label: 'Challenger matches' },
      { value: '10M', label: 'Source event pool' },
    ],
    stack: ['scikit-learn', 'XGBoost', 'SHAP', 'Plotly', 'NetworkX'],
    github: 'https://github.com/MRSandyra/portfolio',
    demo: '',
    demoNote: 'Local folder in portfolio repo',
    evidence: {
      type: 'pipeline',
      status: 'structural',
      note: 'SHAP values were not recorded, so no feature-importance chart is shown. The stages are what the code does; the event and match counts in the tiles are from the dataset itself.',
      stages: [
        { label: 'Stream events', detail: 'no full load' },
        { label: 'Feature engineering', detail: 'match level' },
        { label: 'Win prediction', detail: 'XGBoost' },
        { label: 'Leakage audit', detail: '+ patch check' },
        { label: 'SHAP', detail: 'interpretation' },
        { label: 'Archetypes', detail: 'K-Means + anomalies' },
      ],
    },
    study: {
      problem:
        'Match data at this scale does not fit the usual load-it-and-explore workflow, and high-elo games are the ones where the interesting decisions happen. The analytical trap is that anything recorded late in a match predicts the winner perfectly and teaches you nothing.',
      data:
        'A public dataset of roughly 10 million in-game events, from which 300 Challenger-tier matches — about 311,000 events — are streamed rather than loaded. The full dataset is never held in memory at once.',
      approach: [
        'Streaming ingestion reads the event pool incrementally, so memory stays flat regardless of the source size.',
        'Feature engineering builds match-level features, followed by win prediction with scikit-learn and XGBoost.',
        'A dedicated data-leakage audit checks that no feature encodes the outcome it is meant to predict, plus a patch-robustness check so the model is not just learning one game version.',
        'SHAP for model interpretation, K-Means for player archetypes, Isolation Forest for anomaly detection, and NetworkX for champion synergy mining.',
      ],
      result:
        'A full pipeline from streamed events through prediction to interpretation, with the leakage audit and patch-robustness check treated as part of the result rather than an afterthought.',
      impact:
        'The leakage audit is the part that matters. A win-prediction model on match data is trivially easy to make look excellent and almost as easy to make meaningless.',
    },
  },
  {
    slug: 'lung-disease-densenet169',
    title: 'Lung disease detection from chest X-rays',
    shortTitle: 'Lung Disease Detection',
    categories: ['Machine Learning & AI'],
    featured: false,
    summary:
      'DenseNet-169 across 11 thoracic conditions. Two-phase fine-tuning, CLAHE preprocessing, and Weighted Focal Loss to survive a 15:1 class imbalance.',
    kpis: [
      { value: '0.7586', label: 'AUC' },
      { value: '11', label: 'Thoracic classes' },
      { value: '15:1', label: 'Imbalance handled' },
    ],
    stack: ['Python', 'TensorFlow', 'Keras', 'DenseNet-169', 'CLAHE', 'Laravel'],
    github: 'https://github.com/MRSandyra/Lung-Diagnosis-Web',
    demo: '',
    demoNote: 'Demo coming soon',
    evidence: { type: 'roc', status: 'measured' },
    study: {
      problem:
        'Chest X-ray reading is slow and uneven. A radiologist screening for 11 different thoracic conditions has to hold every pattern in mind at once, and the rarest conditions are exactly the ones most easily missed — they appear in a fraction of the cases the common ones do.',
      data:
        'Chest radiographs labelled across 11 thoracic conditions. The label distribution is severely skewed: the most frequent class outnumbers the rarest by roughly 15 to 1. That imbalance, not model capacity, is the central obstacle — a network can score well on paper while never once predicting a rare class.',
      approach: [
        'DenseNet-169 as the backbone, chosen for dense connectivity that keeps gradients alive in a deep network trained on a modest dataset.',
        'CLAHE preprocessing to lift local contrast in the lung fields, so texture that separates conditions survives normalisation.',
        'Two-phase fine-tuning: the classifier head is trained against frozen convolutional features first, then upper blocks are unfrozen at a reduced learning rate so pretrained features are adapted rather than destroyed.',
        'Weighted Focal Loss instead of plain cross-entropy, which down-weights easy majority examples and forces gradient signal onto the rare classes.',
      ],
      result:
        'The model reaches an AUC of 0.7586 across the 11 conditions — usefully better than chance on a severely imbalanced multi-label task, and reported as that rather than dressed up.',
      impact:
        'The result matters as a triage signal rather than a leaderboard number: a model that ranks studies by likelihood across all 11 conditions lets scarce radiologist attention go to the cases most likely to need it. The honest reading is that 0.7586 is a working prototype, not a clinical instrument.',
    },
  },
  {
    slug: 'sentiment-analysis-tokopedia',
    title: 'Sentiment analysis on Tokopedia reviews',
    shortTitle: 'Sentiment Analysis',
    categories: ['Machine Learning & AI'],
    featured: false,
    summary:
      'An Indonesian-language NLP pipeline for product review classification: eight preprocessing steps into CountVectorizer and Multinomial Naive Bayes, reaching about 83% accuracy on a downsampled, balanced dataset.',
    kpis: [
      { value: '~83%', label: 'Accuracy (balanced)' },
      { value: '8', label: 'Preprocessing steps' },
      { value: 'MNB', label: 'Classifier' },
    ],
    stack: ['Python', 'Scikit-learn', 'NLP', 'Pandas', 'NLTK', 'CountVectorizer'],
    github: 'https://github.com/MRSandyra/portfolio/tree/main/Sentiment%20Analysis%20Tokopedia',
    demo: '',
    demoNote: 'Notebook in repository',
    evidence: {
      type: 'accuracy',
      status: 'measured',
      stages: [
        { label: 'Reviews', detail: 'informal ID' },
        { label: 'Preprocess', detail: '8 steps' },
        { label: 'Downsample', detail: 'balance classes' },
        { label: 'CountVectorizer', detail: 'token counts' },
        { label: 'Multinomial NB', detail: '~83% accuracy' },
      ],
    },
    study: {
      problem:
        'Product reviews arrive faster than anyone can read them, and the useful signal — whether sentiment is turning on a product — is spread across thousands of short, informal, Indonesian-language texts.',
      data:
        'Indonesian-language product reviews from Tokopedia, downsampled to balance the sentiment classes before training. Balancing first means the accuracy figure reflects the classifier rather than the majority class, which is the whole reason the number is quotable.',
      approach: [
        'An eight-step preprocessing chain adapted to informal Indonesian: the register is inconsistent, spelling varies, and abbreviations are everywhere.',
        'Stopword removal against an Indonesian list, since an English list removes nothing useful here.',
        'Stemming to collapse affix-heavy Indonesian morphology, where one root surfaces in many inflected forms and fragments the feature space.',
        'CountVectorizer for feature extraction, then a Multinomial Naive Bayes classifier — a pairing that suits sparse token counts.',
        'Downsampling to balance classes before training, so accuracy means something on this dataset.',
      ],
      result:
        'About 83% accuracy on the balanced dataset. The per-class breakdown was not recorded, so no confusion matrix is shown here — the headline figure is what exists, and it is presented alone rather than padded out.',
      impact:
        'The preprocessing chain is the transferable part. On informal Indonesian text most of the achievable gain is won before the classifier ever sees the data.',
    },
  },
  {
    slug: 'anime-recommendation-system',
    title: 'Anime recommendation system',
    shortTitle: 'Anime Recommender',
    categories: ['Machine Learning & AI'],
    featured: false,
    /* Weakest of the twelve: last in its category and rendered without an
       evidence visual, so it never stands level with PanganWatch. */
    minor: true,
    summary:
      'A hybrid recommender that weighs user preference alongside content attributes, so new titles degrade to content similarity instead of disappearing.',
    kpis: [
      { value: 'Hybrid', label: 'Recommender type' },
      { value: '2', label: 'Signals combined' },
      { value: 'Cold', label: 'Start addressed' },
    ],
    stack: ['Python', 'Machine Learning', 'Recommendation System'],
    github: 'https://github.com/MRSandyra/anime-recommender',
    demo: '',
    demoNote: 'Notebook in repository',
    evidence: {
      type: 'pipeline',
      status: 'structural',
      stages: [
        { label: 'Catalogue', detail: 'attributes' },
        { label: 'Content similarity', detail: 'cold start' },
        { label: 'Collaborative', detail: 'if history' },
        { label: 'Hybrid score', detail: 'blended' },
      ],
    },
    study: {
      problem:
        'Pure collaborative filtering recommends what similar users watched, which works until a title is new or a user is new.',
      data:
        'Anime catalogue metadata together with user preference signals, so content attributes and collaborative signal are both available to the model.',
      approach: [
        'Content-based similarity over catalogue attributes, giving the system something to say about a title with no ratings history.',
        'Collaborative signal from user preference patterns where that history exists.',
        'The two combined into a hybrid score, so cold-start items fall back to content similarity instead of vanishing.',
      ],
      result:
        'A recommender that still returns sensible suggestions for new titles and new users, where a collaborative-only model returns nothing useful.',
      impact:
        'The hybrid structure is a direct answer to the cold-start failure mode rather than an accuracy tweak on the warm case.',
    },
  },

  // ══════════════════════════ APPLIED SYSTEMS ══════════════════════════
  {
    slug: 'multi-vector-attack-detection',
    title: 'Multi-vector cyber attack detection',
    shortTitle: 'Attack Detection',
    categories: ['Applied Systems'],
    featured: false,
    summary:
      'Anomaly detection over Apache and Nginx logs. Regex pattern matching with URL decoding, plus behavioural IP profiling, across 11 attack categories.',
    kpis: [
      { value: '11', label: 'Attack classes' },
      { value: '>100', label: 'Req/IP = DoS flag' },
      { value: '>5', label: 'Fails = brute force' },
    ],
    stack: ['Python', 'Regex', 'Pandas', 'Log Analysis', 'Anomaly Detection'],
    github: 'https://github.com/MRSandyra/portfolio/tree/main/Cybersecurity%20Anomali%20Detection',
    demo: '',
    demoNote: 'Internal tooling — code only',
    evidence: { type: 'detection-logic', status: 'measured' },
    study: {
      problem:
        'A city government web server produces more log lines per day than anyone will ever read. Attacks are in there, but they are buried in ordinary traffic, and the payloads that matter are usually URL-encoded so a naive text search walks straight past them.',
      data:
        'Raw Apache and Nginx access logs. Each line carries a source IP, timestamp, request method, path, status code and user agent — enough to catch both payload-based attacks in the request path and behavioural attacks in the request pattern.',
      approach: [
        'A parsing layer that normalises both Apache and Nginx log formats into one structured table with Pandas.',
        'A URL-decoding pipeline applied before matching, so payloads hidden behind percent-encoding are tested in their decoded form rather than their disguised one.',
        'Regex signatures covering 11 attack categories, including SQL injection, cross-site scripting, path traversal and command injection.',
        'Behavioural profiling per source IP for attacks with no payload signature: more than 5 failed authentications flags brute force, more than 100 requests flags denial of service.',
        'Automated report generation producing structured CSV for the security team to take into forensic analysis.',
      ],
      result:
        'The pipeline runs end to end without manual steps, from raw log file to a categorised CSV report covering all 11 attack classes. Signature detection and behavioural detection are complementary: the first catches what a request contains, the second catches what an IP does.',
      impact:
        'It converts an unread log file into a reviewable, prioritised list. The decoding step is the part that earns its keep — it is the difference between catching an encoded injection attempt and silently missing it.',
    },
  },
  {
    slug: 'indostock-analyzer',
    title: 'IndoStock analyzer',
    shortTitle: 'IndoStock Analyzer',
    categories: ['Applied Systems'],
    featured: false,
    summary:
      'Automated analysis for IDX-listed stocks, combining news sentiment, fundamentals and technical indicators into a single per-ticker view.',
    kpis: [
      { value: '3', label: 'Signal sources' },
      { value: 'IDX', label: 'Market covered' },
      { value: 'Auto', label: 'Data collection' },
    ],
    stack: ['Python', 'Selenium', 'TextBlob', 'yfinance', 'Pandas', 'NumPy'],
    github: 'https://github.com/MRSandyra/portfolio/tree/main/IndoStock%20Analyzer',
    demo: '',
    demoNote: 'Notebook in repository',
    evidence: {
      type: 'pipeline',
      status: 'structural',
      stages: [
        { label: 'Scrape news', detail: 'Selenium' },
        { label: 'Sentiment', detail: 'TextBlob' },
        { label: 'Fundamentals', detail: 'ratios' },
        { label: 'Technicals', detail: 'yfinance' },
        { label: 'Combine', detail: 'per ticker' },
      ],
    },
    study: {
      problem:
        'Retail analysis of Indonesian stocks usually leans on one lens at a time — a chart, or a headline, or a ratio — and each lens on its own is easy to misread.',
      data:
        'Three streams joined per ticker: scraped Indonesian financial news, fundamental data, and historical price series pulled through yfinance for technical indicators.',
      approach: [
        'Selenium-driven collection for Indonesian financial news sources that offer no usable API.',
        'TextBlob sentiment scoring over the collected headlines and article text.',
        'Fundamental metrics and technical indicators computed from the price series with Pandas and NumPy.',
        'The three streams combined per ticker so agreement and disagreement between them stays visible rather than averaged away.',
      ],
      result:
        'A repeatable per-ticker analysis that produces all three views side by side instead of one in isolation.',
      impact:
        'Its real use is negative signal: when sentiment, fundamentals and technicals disagree, that disagreement is itself the finding. This is an analysis tool, not investment advice.',
    },
  },

  // ═══════════════════ ANALYSIS & VISUALIZATION ═══════════════════
  {
    slug: 'global-income-inequality',
    title: 'Global income inequality analysis',
    shortTitle: 'Income Inequality',
    categories: ['Analysis & Visualization'],
    featured: false,
    summary:
      'Gini coefficients and Lorenz curves across 2,400+ country-year records from World Bank data, with simulated subsidy and progressive-tax policies.',
    kpis: [
      { value: '2,400+', label: 'Country-year records' },
      { value: 'Gini', label: 'Primary measure' },
      { value: '2', label: 'Policies simulated' },
    ],
    stack: ['Python', 'Pandas', 'Matplotlib', 'Plotly', 'Statistics', 'World Bank API'],
    github:
      'https://github.com/MRSandyra/portfolio/tree/main/Global%20Income%20Inequality%20-%20Visualizing%20Lorenz%20Curves%20%26%20Gini%20Coefficients',
    demo: '',
    demoNote: 'Notebook in repository',
    evidence: { type: 'lorenz', status: 'method' },
    study: {
      problem:
        'Inequality gets argued about with single numbers, and a single number hides the shape of the thing. Two countries can share a Gini coefficient while having completely different distributions — one squeezed at the bottom, one stretched at the top.',
      data:
        'Over 2,400 country-year income distribution records pulled from the World Bank API, cleaned and reshaped into a consistent panel so countries remain comparable across years.',
      approach: [
        'Gini coefficients computed directly from the income share data rather than taken from a published column, so the method behind every number is known.',
        'Lorenz curves plotted per country, because the curve shows where inequality actually sits — the gap from the equality line is the story the scalar leaves out.',
        'Two redistribution policies simulated on the real distributions: a flat subsidy to the lower deciles, and a progressive tax on the upper deciles.',
        'Choropleth map and time series built in Plotly so the geography and the trajectory are both legible.',
      ],
      result:
        'A reproducible pipeline from API pull to Gini, Lorenz curve, and policy simulation, with the mechanical effect of each policy visible on the curve and the coefficient.',
      impact:
        'The value is in making the trade-off visible. A policy that moves the Gini coefficient by a small amount can reshape the bottom of the Lorenz curve substantially, and seeing both together is what makes the comparison honest.',
    },
  },
  {
    slug: 'flight-ticket-sales-analysis',
    title: 'Flight ticket sales analysis',
    shortTitle: 'Flight Ticket Analysis',
    categories: ['Analysis & Visualization'],
    featured: false,
    summary:
      'An end-to-end capstone analysis of flight ticket sales across price, airline, route, transit and date — cleaning, feature engineering and exploratory analysis through to a correlation heatmap.',
    kpis: [
      { value: 'Top 10', label: 'Airlines by sales' },
      { value: '5', label: 'Ticket dimensions' },
      { value: 'EDA', label: 'Method' },
    ],
    stack: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
    github: 'https://github.com/MRSandyra/portfolio',
    demo: '',
    demoNote: 'Local folder in portfolio repo',
    evidence: {
      type: 'pipeline',
      status: 'structural',
      stages: [
        { label: 'Clean', detail: '5 dimensions' },
        { label: 'Feature engineering', detail: 'derived fields' },
        { label: 'EDA', detail: 'top 10 airlines' },
        { label: 'Heatmap', detail: 'correlation' },
      ],
    },
    study: {
      problem:
        'Ticket sales data carries several interacting drivers at once — price, airline, route, transit and date — and reading any one of them alone gives a misleading picture of what sells.',
      data:
        'Flight ticket sales records spanning five dimensions: price, airline, route, transit and date.',
      approach: [
        'Cleaning to make the five dimensions consistent enough to compare.',
        'Feature engineering to derive the fields the raw records do not carry directly.',
        'Exploratory analysis ranking the top 10 airlines by sales and describing the distribution.',
        'A correlation heatmap to show which of the five dimensions actually move together.',
      ],
      result:
        'A ranked view of the top 10 airlines by sales alongside the distribution and correlation structure of the remaining dimensions.',
      impact:
        'A capstone that covers the full analytical path rather than a single chart — the deliberate point being the sequence from raw records to a defensible read.',
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
