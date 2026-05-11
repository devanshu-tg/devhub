/**
 * TigerGraph Track submissions from Devcation Delhi 2026.
 * Generated from `Outreach List for Hackathon - Sheet1.csv`,
 * deduped by team name (latest submission wins).
 */

export type DevcationProject = {
  id: string;
  team: string;
  leader: string;
  description: string;
  pptUrl: string | null;
  githubUrl: string | null;
  deployedUrl: string | null;
  demoUrl: string | null;
};

export const DEVCATION_PROJECTS: DevcationProject[] = [
  {
    id: `404-not-found`,
    team: `404 Not Found`,
    leader: `Vishad Srivastava`,
    description: `We integrated TigerGraph as the core real-time decision engine behind the dashboard.

- We model the disaster system as a graph with vertices like: \`Zone\`, \`DisasterEvent\`, \`Resource\` etc , connected with edges like \`affects\`, \`connects\`, \`serves\`, and \`assigned_to\`.
- Ingestion services (FIRMS, Sentinel, OSM) continuously upsert vertices/edges into TigerGraph, so the graph always reflects latest hazard, pollution, and road-passability state.
- The backend queries TigerGraph to power our api routes, and assignments, including blocked vs passable routes.
- The agent runs installed graph queries (affected zones, available resources, shortest passable route), then writes assignment updates back to TigerGraph.
- The React UI reads these API outputs, so every map color, blocked-road highlight, and dispatch record is graph-backed and near real-time.`,
    pptUrl: `https://canva.link/6ql5j3iowqei7ne`,
    githubUrl: `https://github.com/Vishad-byte/DisasterGraph`,
    deployedUrl: `https://disastergraph-dashboard.onrender.com/ui`,
    demoUrl: `https://www.loom.com/share/b82e99dbe75740ef9fcf139830a0c89b`,
  },
  {
    id: `aalu`,
    team: `aalu`,
    leader: `Shiven Kumar Shandil`,
    description: `We integrated TigerGraph as the core engine powering CHINTU’s knowledge graph and reasoning capabilities. All real-world data—events, entities, and topics—are modeled as vertices, while relationships such as involvement and causality are represented through edges, with INFLUENCES being the most critical for capturing event-to-event impact.

We built a data pipeline that processes GDELT event data and transforms it into a structured graph format, generating over 100K event nodes and tens of thousands of relationship edges. Custom logic was implemented to derive causal links between events based on shared entities, temporal proximity, and thematic similarity.

On top of this graph, we developed optimized GSQL queries for key operations like narrative tracing, causal propagation, and entity impact analysis. These queries are exposed through a Flask API, which acts as a controlled interface between the frontend and TigerGraph.

Overall, TigerGraph is not just used for storage—it is central to enabling fast multi-hop traversal, real-time reasoning, and scalable analysis of complex geopolitical event relationships.`,
    pptUrl: `https://canva.link/rfj7d8oou1ulfub`,
    githubUrl: `https://github.com/shvn22k/chintu`,
    deployedUrl: null,
    demoUrl: `https://youtu.be/qM3iMzK2wcE`,
  },
  {
    id: `aayush-goyal-ug22`,
    team: `aayush.goyal.ug22`,
    leader: `Aayush Goyal`,
    description: `We integrated TigerGraph as the core graph database to model and analyze relationships between entities involved in transactions. In our system, we convert transactional data into a graph structure where users, devices, and email domains are represented as nodes, and their interactions such as transactions or shared attributes are represented as edges.
Using TigerGraph’s APIs, our backend fetches and queries this graph data in real time. This allows us to identify hidden connections, such as shared devices or linked accounts, which are key indicators of fraud rings.
We then combine these graph insights with our AI-based risk scoring model to generate a fraud score, explanation, and recommendation for each transaction.`,
    pptUrl: `https://canva.link/bylsk128cps0mwo`,
    githubUrl: `https://github.com/Anushka2805/fraud-ring-project`,
    deployedUrl: null,
    demoUrl: `https://canva.link/00hz6im20f5cvb8`,
  },
  {
    id: `ai-avengers`,
    team: `AI Avengers`,
    leader: `Sanjayan Pratap Singh`,
    description: `We integrated TigerGraph as the core relationship engine of our solution to move beyond traditional tabular data and uncover complex, multi-hop patterns that relational databases often miss.

1. Graph Modeling & Schema Design
Instead of flat tables, we mapped our data into a highly connected schema. Entities such as Users, Accounts, Transactions, and Devices were defined as vertices, while their interactions—like fund transfers or shared IP addresses—were modeled as edges. This graph-first approach allowed us to maintain the context of every transaction in real-time.

2. Advanced Pattern Detection via GSQL
We utilized GSQL (TigerGraph’s query language) to execute "detective-style" queries across the network. This enabled the detection of sophisticated fraud signatures, including:

Circular Transfers: Identifying money laundering loops (A → B → C → A).

Fraud Rings: Mapping clusters of accounts that only interact within a closed group.

Synthetic Identities: Detecting multiple user accounts linked to a single hardware ID or fingerprint.

3. Seamless API Integration
Our backend communicates with the TigerGraph cloud instance via secure RESTful APIs. This ensures that as new data enters the system, we can trigger immediate graph traversals and receive risk insights without adding significant latency to the user experience.

4. Hybrid Intelligence Framework
TigerGraph serves as a critical feature engineering layer for our machine learning pipeline. By extracting "graph features"—such as PageRank scores or community detection metrics—and feeding them into our Isolation Forest model, we created a hybrid scoring system. This combination of relationship data and anomaly detection significantly reduces false positives and provides a more accurate overall risk profile.`,
    pptUrl: `https://docs.google.com/presentation/d/1LIiwpQoaan-e8liuakB5VUjj8FAMOf70/edit?usp=drivesdk&ouid=102376344559999889476&rtpof=true&sd=true`,
    githubUrl: `https://github.com/utgarg07-spec/Fraud-Detection.git`,
    deployedUrl: `https://fraud-detection-gules.vercel.app/`,
    demoUrl: `https://drive.google.com/file/d/1foNg4vDqb6FxrNsI8ovxGAkAMBjxh6L-/view?usp=sharing`,
  },
  {
    id: `apex-predators`,
    team: `Apex Predators`,
    leader: `Bharti Chandak`,
    description: `TigerGraph is used as a graph database to model and analyze relationships between log data. We use it for multi-hop traversal to detect hidden connections, anomalies, and suspicious patterns in real-time.`,
    pptUrl: `https://drive.google.com/file/d/18VLk04nYUZkgNz4YFyX4c4NggDeyK4II/view?usp=drivesdk`,
    githubUrl: `https://github.com/therajes/Project-Aegis`,
    deployedUrl: null,
    demoUrl: `https://screenrec.com/share/jwoXD79afn`,
  },
  {
    id: `aura`,
    team: `Aura`,
    leader: `Kirti Shukla`,
    description: `TigerGraph Integration in ProofFund:
Every time a user commits an idea to the Vault, we call tigergraphService.addIPAsset() which creates a vertex in the ProofFundGraph - storing the idea ID, title, type, and description as node properties.
The graph models relationships between ideas, creators, and funding activity - so when proposals get funded or voted on, edges are created connecting wallet addresses to IP assets. This powers the Network page, which visualizes the entire trust graph - showing which creators are connected, which ideas have backing, and how funding flows across the ecosystem.
Why TigerGraph specifically? Because unlike a regular SQL database, it lets us run graph traversal queries - answering questions like "show me all ideas connected to this wallet's trust network" or "which proposals share overlapping creator histories" - which is exactly the kind of relationship intelligence a DAO funding platform needs to detect reputation and catch fraud.
In short: IPFS stores the proof, blockchain stores the hash, TigerGraph stores the relationships.`,
    pptUrl: `https://canva.link/t2caij6ed1j8tha`,
    githubUrl: `https://github.com/kirtishukla9955/Aura`,
    deployedUrl: `https://aura-five-ashy.vercel.app/`,
    demoUrl: `https://youtu.be/D81CnMd5-6k`,
  },
  {
    id: `bella-ciao`,
    team: `Bella Ciao`,
    leader: `Fadel Ahmad`,
    description: `TigerGraph integration is built on a graph schema centered around core entities like User and Post, alongside auxiliary nodes like Hashtag, Device, IPBucket, and Campaign for richer signal detection. These are connected through engagement edges such as POSTED, LIKED, COMMENTED, SHARED, and CO_ENGAGED, enabling efficient multi-hop traversal of interaction patterns.

We implemented a suite of distributed GSQL queries that operate directly on this graph to detect fraud signals. For example, queries traverse patterns like:

User → POSTED → Post → LIKED/COMMENTED/SHARED → User

to identify repeat engagers, and further explore CO_ENGAGED relationships to uncover tightly connected engagement pods indicative of coordinated behavior. All heavy computation and graph traversal are executed inside TigerGraph, leveraging its parallel query engine for scalability.

On top of this, a FastAPI backend acts as a thin service layer invoking these pre installed queries via TigerGraph's RESTPP API using a helper function (call_tg_query()), then parsing and enriching the results with lightweight application logic such as risk classification and response formatting before returning structured JSON to clients.`,
    pptUrl: `https://canva.link/wpexfgr860f9zoe`,
    githubUrl: `https://github.com/FadelAhmad/FakeInfluencerRADAR`,
    deployedUrl: `https://fake-influencer-radar.vercel.app/`,
    demoUrl: `https://youtu.be/CHcEyTXWwVc`,
  },
  {
    id: `billauta-gang`,
    team: `Billauta Gang`,
    leader: `Vikrant`,
    description: `We integrated TigerGraph as the core intelligence layer of our solution. We modeled users, phone numbers, devices, bank accounts, and transactions as a graph, which allows us to detect hidden fraud relationships that are difficult to find in a traditional relational database. Using GSQL queries, we identify patterns such as shared devices, reused phone numbers, multi-hop suspicious connections, and circular money-transfer loops. Our FastAPI backend connects to TigerGraph through pyTigerGraph to fetch these graph signals in real time, and the frontend visualizes them as risk scores, fraud clusters, and interactive network graphs.`,
    pptUrl: `https://drive.google.com/file/d/1r7_CEesO6iEhULMqwNOK_yrwVQXFMLKf/view?usp=drive_link`,
    githubUrl: `https://github.com/luno141/GRAPHGUARD.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1HRIUXxjtzZUTSCVJzM7m7J1e6IWwysyl/view`,
  },
  {
    id: `binary-brains-2-0`,
    team: `Binary Brains 2.0`,
    leader: `Pragati`,
    description: `We integrated TigerGraph as the backbone of our system to handle talent data in a much smarter, connected way. Instead of storing everything in simple tables (like Excel), we represent employees, skills, and roles as a network of connections, where everything is linked based on how skills relate and overlap in real life.

TigerGraph enables us to perform low-latency, large-scale graph traversals, which are critical for identifying not just exact matches, but also adjacent skill pathways essentially discovering candidates who are near-fit rather than just perfect-fit. We leveraged its parallel processing and deep-link analytics capabilities to efficiently compute multi-hop relationships across the skill network.

Additionally, TigerGraph acts as the backbone for our real-time inference layer, allowing us to dynamically query and rank candidates based on contextual relevance and learning distance metrics. This makes the system both scalable and responsive, even with complex, interconnected talent data.`,
    pptUrl: `https://drive.google.com/file/d/1lb6bQvT1rhMjSrFmBW1vXWd0PE_nLkS1/view?usp=sharing`,
    githubUrl: `https://github.com/ssyy21/HireQube`,
    deployedUrl: `https://tiger-graph-deploy--sneha192btcseai.replit.app/`,
    demoUrl: `https://youtu.be/65cjGG-gUSU?si=kXAp_x_S1FJw-Rp3`,
  },
  {
    id: `brainbytes`,
    team: `BrainBytes`,
    leader: `Priyanshi Jain`,
    description: `We integrated TigerGraph to power the intelligent matching engine of our platform.
Government schemes and user profiles are highly interconnected:

Users → attributes (age, income, state, category)
Schemes → eligibility criteria
Relationships → complex and multi-layered

A traditional database struggles here, but TigerGraph excels at relationship-based queries.
Using TigerGraph’s graph queries:

We traverse connections between user → attributes → schemes
Calculate eligibility score based on matched nodes
Instantly return:
  Fully eligible schemes
 Partially eligible schemes`,
    pptUrl: `https://in.docworkspace.com/d/sbCaetEsSW0EFfiL_nc167od6v4h6zslqfs?sa=601.1037`,
    githubUrl: `https://github.com/ronaktodwal37/various-govt-scheme-finder-We`,
    deployedUrl: null,
    demoUrl: null,
  },
  {
    id: `bravo-x`,
    team: `Bravo X`,
    leader: `Ujjansh Sundram`,
    description: `We integrated TigerGraph by first parsing the Python codebase with AST and converting the extracted structure into graph-ready CSV files containing vertices and edges. Using \`pyTigerGraph\`, the system connects to the \`CodeGraph\` database and upserts \`CodeFile\` and \`CodeFunction\` nodes along with \`CONTAINS\`, \`CALLS\`, and \`IMPORTS\` relationships. During startup, the project also bootstraps the TigerGraph schema and installs required GSQL queries (\`impact_analysis\` and \`hop_detection\`) so query execution is ready automatically. When a user asks an impact question, the app resolves the target node, runs the installed TigerGraph query, and returns affected components to the CLI, API, and frontend for visualization and explanation.`,
    pptUrl: `https://canva.link/2riudwqi4yhzvqg`,
    githubUrl: `https://github.com/Ujjansh05/Code-Dependency-Impact-Analyzer-For-Large-Codebases-`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1OasZxS48ZddsXhKknd1T_wntP3vxm2jg?usp=sharing`,
  },
  {
    id: `btech-baddiess`,
    team: `Btech baddiess`,
    leader: `drishti saini`,
    description: `We defined the graph schema in schema.sql.
FastAPI connects to TigerGraph via pyTigerGraph in main.py.
Real Assam data is transformed in prepare_assam_data.py and loaded through load_data.py.
Routing/simulation APIs use this graph structure for shortest paths, blocked-route handling, and impact analysis.`,
    pptUrl: `https://www.canva.com/design/DAHGExuQ9Ew/fTKWdXgDwpnFbtjWcGujpw/edit`,
    githubUrl: `https://github.com/chhavic4004/flood-response`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1Atu71flEWLJn8iV2Fi2hozDtXJJ_7ofR/view?usp=sharing`,
  },
  {
    id: `byte-blaze`,
    team: `Byte Blaze`,
    leader: `Aryan Routela`,
    description: `We integrated TigerGraph as the core intelligence engine of our system to handle connected healthcare data efficiently.

1️⃣ Data Modeling:
All real-world entities like Patients, ASHA Workers, Visits, and Hospitals are stored as vertices, and their relationships (e.g., HAS_RISK, VISITED, ASSIGNED_TO) are stored as edges, forming a connected graph.

2️⃣ Query-Based Intelligence (GSQL):
We use GSQL queries to analyze the graph. For example, the highRiskPatients query identifies patients with anemia by traversing relationships in real time.

3️⃣ Multi-Factor Risk Scoring:
Using accumulators, we detect patterns like missed visits. For instance, patients missing multiple visits are flagged as high priority.

4️⃣ TigerGraph as API Layer:
All queries are deployed as REST APIs, enabling direct access to graph insights.

5️⃣ Backend Integration:
Our Node.js backend calls these APIs using HTTP (Axios), fetching real-time results without complex joins or ORM.

🔄 End-to-End Flow:
Frontend (ASHA App) → Backend API → TigerGraph Query → Graph Traversal → Risk Detection → Alerts 🚨`,
    pptUrl: `https://docs.google.com/presentation/d/1B4cZrnAgMU68hU6H8zmzua8hIQtr_zsI3e9clhi0bGs/edit?usp=sharing`,
    githubUrl: `https://github.com/Sundaram-Katare/Sehat-Dori`,
    deployedUrl: `https://moms-magic.vercel.app/`,
    demoUrl: `https://youtu.be/H2De1aEFknU?si=vLGnioUcqt1Di-MI`,
  },
  {
    id: `bytefours`,
    team: `ByteFours`,
    leader: `Ishvi Goyal`,
    description: `The integration of TigerGraph into HealthHack 2.0 transforms the application from a static tracker into a dynamic decision engine that performs real-time graph traversals to ensure user safety.
1. The Backend Bridge (Flask & REST API)
The solution uses a Python/Flask backend to act as a secure intermediary between the web frontend and the TigerGraph Cloud instance.
    ●Data Mapping: On startup, the backend loads local CSV files (like injuries.csv and exercise.csv) to map user-friendly names to specific internal Graph IDs.
     ●Endpoint Routing: When a user selects an injury, the frontend hits a Flask endpoint (/api/get_safe_workouts), which triggers the graph logic.

2. GSQL Query Execution
The core intelligence resides in a custom GSQL query named find_safe_workouts hosted on the TigerGraph engine.
      ●Parameterized Traversal: The Flask app sends the specific injury_id to this query via a RESTful GET request.
      ●Graph Logic: The engine traverses the relationships between Injuries, Muscles, and Exercises to identify which workout nodes are "safe" (not connected to aggravated muscle nodes) and which should be pruned.

3. Secure Authentication
To maintain data integrity and security, the integration utilizes GSQL-Secret authentication.
      ●The Flask backend includes an Authorization header containing a unique secret key for every request made to the TigerGraph RESTPP server.
      ●This ensures that the sensitive biological relationship data within the graph is only accessible by the authorized application.

4. Dynamic Frontend Consumption
Once TigerGraph returns the results, the solution processes the vertex data and updates the UI instantly.
      ●Safe Workout Display: The workouts.html page receives a list of safe exercise names and renders them as interactive cards.
      ●Biological Insights: The injuries.html page uses graph traversal insights to explain which specific muscle groups (e.g., Quadriceps or Deltoids) are currently under constraint based on the active injury.`,
    pptUrl: `https://canva.link/5gepeaq5h2nfrv4`,
    githubUrl: `https://github.com/Eesha0407/Health-Hack.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1BT20HcL1uT8NAB_SkL56Nv992p3LupjE/view?usp=sharing`,
  },
  {
    id: `cach3-me-out`,
    team: `Cach3 Me Out`,
    leader: `Harleen Kaur`,
    description: `We have used graph DB to store risk zone vertices as graph nodes and then calculate the safe path using djikstra algorithm through the Tigergraph DB`,
    pptUrl: `https://canva.link/mkauu9t9i1h3adx`,
    githubUrl: `https://github.com/meharkp7/TerrainGraph.io`,
    deployedUrl: `https://terrain-graph-io.vercel.app/`,
    demoUrl: `https://youtu.be/iIowUn3fXYk`,
  },
  {
    id: `cache-chai`,
    team: `Cache Chai`,
    leader: `Devanshi`,
    description: `FoodTrace keeps the existing physical labeling process completely unchanged. What changes is where the data lives and how it's verified.
Instead of label data existing only as a printed sticker that anyone can reprint, the same data is simultaneously locked on blockchain at the moment of label generation. The QR code on the product doesn't contain the data, it points to the blockchain record. So even if someone reprints the physical label, the blockchain record stays original and unchanged.
TigerGraph tracks the entire journey of every batch across every supply chain node,  manufacturer, importer, wholesaler, distributor, retailer. Any anomaly at any node gets flagged automatically.`,
    pptUrl: `https://drive.google.com/file/d/1prScG9WQE_7_gdkhmBFkkfLW9Xrh7xyu/view?usp=drive_link`,
    githubUrl: `https://github.com/KananSinghal/trueseal`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/103b7BHLmf9FumdmrH8XMyswDqbv_JLvF/view?usp=drive_link`,
  },
  {
    id: `cashe-chai`,
    team: `Cashe Chai`,
    leader: `Devanshi`,
    description: `FoodTrace keeps the existing physical labeling process completely unchanged. What changes is where the data lives and how it's verified.
Instead of label data existing only as a printed sticker that anyone can reprint, the same data is simultaneously locked on blockchain at the moment of label generation. The QR code on the product doesn't contain the data it points to the blockchain record. So even if someone reprints the physical label, the blockchain record stays original and unchanged.
TigerGraph tracks the entire journey of every batch across every supply chain node manufacturer, importer, wholesaler, distributor, retailer. Any anomaly at any node gets flagged automatically.`,
    pptUrl: `https://drive.google.com/file/d/1prScG9WQE_7_gdkhmBFkkfLW9Xrh7xyu/view?usp=drive_link`,
    githubUrl: `https://github.com/KananSinghal/trueseal`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1LYiFjjpQZ5Se0o6GiYjUpdtvB9VtiAgh/view`,
  },
  {
    id: `chakra`,
    team: `Chakra`,
    leader: `Surya Pal`,
    description: `In SafeWalk AI, we integrated TigerGraph to model the complex relationships between users, locations, incidents, and danger zones as a connected graph — enabling faster multi-hop queries like 'find all high-danger zones within 3km that were reported by verified users in the last 7 days.' This allowed our danger scoring engine to traverse location-incident-user relationships in real time, which traditional Firestore queries cannot do efficiently at scale."`,
    pptUrl: `https://drive.google.com/file/d/15dX-BL1mjohP-WTjz2U80XXEAja2pch6/view`,
    githubUrl: `https://github.com/sumithkumar2239-cyber/Safewalk`,
    deployedUrl: `https://studio--studio-1132221135-28f94.us-central1.hosted.app`,
    demoUrl: `https://drive.google.com/file/d/14oP-tccLv_6K80u5n8QinNHgDFALW1q6/view`,
  },
  {
    id: `charmander`,
    team: `Charmander`,
    leader: `Kushagra Goyal`,
    description: `TigerGraph is the core graph analytics engine powering Detectra AI's fraud detection. We deployed a TigerGraph-backed API on Render that our React frontend communicates with via a centralized SDK (fraudApi.js).

Data Ingestion: Transaction datasets (CSV) are ingested directly into TigerGraph as graph nodes (Accounts, Devices) and edges (Transactions) via the /analyze-dataset endpoint.

Graph-Powered Detection: We leverage TigerGraph's GSQL for multi-hop traversal queries that would be prohibitively slow in a relational DB:

/check-transaction — scores a single transaction by analyzing its local graph neighborhood (connected accounts, devices, patterns) and returns an ALLOW/REVIEW/BLOCK decision with confidence.
/detect-fraud-network — retrieves the full global transaction graph to visualize fraud syndicates as interactive node-edge networks.
/detect-pattern/{type} — runs 7 specialized GSQL algorithms (circular loops, chain laundering, velocity bursts, smurfing, device sharing, rapid movement, round tripping) to detect specific money-laundering topologies.
/detect-geo-anomaly — cross-references device and location attributes across the graph to flag impossible-travel scenarios.`,
    pptUrl: `https://drive.google.com/file/d/1bEj-G-sb7P-XKxJTsC2Zx1dN3KBcVbDX/view?usp=sharing`,
    githubUrl: `https://github.com/kushagrathegod/detectra_ai`,
    deployedUrl: `https://detectra-ai-delta.vercel.app/`,
    demoUrl: `https://drive.google.com/file/d/1MoOisVCPY0lN1gO-teGsEQexElPVlQi8/view?usp=sharing\\`,
  },
  {
    id: `chatur-coders`,
    team: `Chatur coders`,
    leader: `Deshna Jain`,
    description: `We integrated TigerGraph as an optional analytics layer:
1. User hydration logs are streamed into TigerGraph to build a graph of users, caregivers, and hydration events.
2. This allows advanced queries like “find all dependents at high risk today” or “community hydration trends.”
3. For demo, TigerGraph is not required, but the schema and connector are documented in backend/src/config/tigergraph.js.
This shows judges how HydrAlert can scale into graph‑based health insights.`,
    pptUrl: `https://canva.link/q306dd7k7ut3a3m`,
    githubUrl: `https://github.com/Acod01-hub/hydralert-web`,
    deployedUrl: null,
    demoUrl: `https://canva.link/blanwaie8k23a9r`,
  },
  {
    id: `cloudforce`,
    team: `CLOUDFORCE`,
    leader: `SATYAM MALL`,
    description: `No description provided.`,
    pptUrl: `https://raw.githubusercontent.com/satyamhub/cloudforce-fraud-ring/main/CLOUDFORCE_Fraud_Ring_Early_Warning.pptx`,
    githubUrl: `https://github.com/satyamhub/cloudforce-fraud-ring`,
    deployedUrl: `https://cloudforce.vercel.app/`,
    demoUrl: `https://cloudforce.vercel.app/demo.html`,
  },
  {
    id: `code-blooded`,
    team: `Code Blooded`,
    leader: `Vansh Harit`,
    description: `Integration of TigerGraph with SentinelGraph

Our primary database was TigerGraph Savanna, which we accessed using Python's pyTigerGraph. With about 10,000 transactions spread across 1,850 nodes, our graph schema represents UPI participants as four vertex types—UPI_User, UPI_Device, UPI_Merchant, and UPI_Location—connected by five connection edges, such as SENDS_MONEY and OWNS_DEVICE.

Four bespoke GSQL stored procedures that run server-side on TigerGraph's MPP engine were installed: detectCircularFlow, findDeviceAnomalies, calculateVelocity, and identifyMuleNetworks. Every incoming transaction uses runInstalledQuery() to initiate all four queries. The results are fed into our weighted FraudScorer class, which generates a risk score between 0 and 100 in less than a second.

The main benefit is that TigerGraph automatically detects a 4-hop circular money loop in a single graph traverse, whereas SQL takes five or more JOINs.`,
    pptUrl: `https://drive.google.com/drive/folders/12lTgo-jhfy3R7TfUFR0fNbd6cEnqGw7E?usp=sharing`,
    githubUrl: `https://github.com/Vansh-Harit/UPI-Fraud-Detection`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/12lTgo-jhfy3R7TfUFR0fNbd6cEnqGw7E?usp=sharing`,
  },
  {
    id: `code-minds`,
    team: `Code Minds`,
    leader: `Aastha`,
    description: `Our solution is built on a Graph-Ready Architecture. While the current MVP uses Gemini AI for immediate safety logic, we designed the backend to integrate TigerGraph as our 'Safety Web.By modeling the city as Nodes (Safe Havens vs. Risk Zones) and Edges (Streets), we use TigerGraph to identify Danger Clusters. This allows the app to calculate the 'Brightest Path' by analyzing how risks are connected across multiple blocks, ensuring users are steered away from high-risk zones before they even enter them.`,
    pptUrl: `https://drive.google.com/file/d/1rT5syRW-ebdKO1z0YiAbY7UpkAQSBq3K/view?usp=sharing`,
    githubUrl: `https://github.com/Aastha15Thakur/Vicinity`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1JEbxLupUOBoUtFN-n_9nBnRz5lrZid_A/view?usp=sharing`,
  },
  {
    id: `code-warriors`,
    team: `Code Warriors`,
    leader: `Annu Tiwari`,
    description: `“TigerGraph was integrated to model temporal transitions between EEG-derived cognitive states, enabling pattern recognition, adaptive decision-making, and improved robustness against noisy signals.”`,
    pptUrl: `https://drive.google.com/drive/folders/1kn0e5utpxC3wSdp0Cs4Fzli07EBqSXYW`,
    githubUrl: `https://github.com/annu-creator24t/CodeWarriors.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1kn0e5utpxC3wSdp0Cs4Fzli07EBqSXYW`,
  },
  {
    id: `code4cause`,
    team: `CODE4CAUSE`,
    leader: `Bhavisha Garg`,
    description: `We used Tiger Graph Savanna as our graph database to store and connect all the core entities in Aura — patients, caregivers, guardians, doctors, requests and medicines. Instead of a traditional database where everything sits in separate tables, Tiger Graph lets us map real relationships — like which patient sent which request, which caregiver responded, which doctor is treating who, and which medicines are being missed. This gives us a connected view of the patient's entire care network in one place, which is way more powerful for real-time health monitoring than a regular database.`,
    pptUrl: `https://canva.link/jgxg9tk6fg9bo0w`,
    githubUrl: `https://github.com/bhavisha-hub/hackathon-aura`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1vUouEH1s4HObPl6GBy4a_2ncJB6y3R2b/view?usp=drive_link`,
  },
  {
    id: `codebenders`,
    team: `Codebenders`,
    leader: `Kritika Rana`,
    description: `We Integrated tigergraph in graphs of user preference like diet chart and workout chart and also as database in signup/signin page.`,
    pptUrl: `https://canva.link/24w6wjvkffdo501`,
    githubUrl: `https://github.com/Kimish85/Fitcare_ai-`,
    deployedUrl: null,
    demoUrl: `https://canva.link/abjhavtvdenfxk4`,
  },
  {
    id: `codeclarity`,
    team: `CodeClarity`,
    leader: `Harshini P`,
    description: `TigerGraph is the brain of CodeCoach AI:

5 custom GSQL queries power all graph features
Real-time edge updates make the graph learn from every action
LangChain ReAct agent autonomously queries the graph
Multi-hop traversals find root causes SQL can't
PageRank + GNN-lite predict future struggles
Without TigerGraph, CodeCoach would just be another quiz app.
 With TigerGraph, it's a learning intelligence platform.`,
    pptUrl: `https://onedrive.live.com/:p:/g/personal/49BEDD38C6F457B7/IQB3fMWrWaLIS7GrwIFFBP3yAaozBnuOGmflzpQZBjVr1zQ?resid=49BEDD38C6F457B7!sabc57c77a2594bc8b1abc0814504fdf2&ithint=file%2Cpptx&e=HVxsMo&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3AvYy80OUJFREQzOEM2RjQ1N0I3L0lRQjNmTVdyV2FMSVM3R3J3SUZGQlAzeUFhb3pCbnVPR21mbHpwUVpCalZyMXpRP2U9SFZ4c01v`,
    githubUrl: `https://github.com/Anonyx-Byte/codecoach-studio`,
    deployedUrl: `https://main.d8cqzw6o7lffj.amplifyapp.com`,
    demoUrl: `https://drive.google.com/file/d/1U3Yp4q-VZXFQH5E0IQgotqddQTpBomhs/view?usp=sharing`,
  },
  {
    id: `codetrio`,
    team: `CodeTrio`,
    leader: `Jiah Bhola`,
    description: `Graph Schema:
Nodes: Citizens, Animals, NGOs, Shelters, Volunteers.
Edges: Reported, AssignedTo, LocatedAt, ConnectedWith.
Geocoding + Proximity Queries:
User-submitted addresses are converted to lat/lon coordinates.
TigerGraph GSQL queries calculate nearest shelters and volunteers to the reported location.
Queries also check for capacity, specialty, and current availability before assignment.
Assignment Workflow:
Citizen reports an animal and submits location/details.
Geocoding converts the address to latitude and longitude.
TigerGraph queries identify the nearest suitable volunteer and shelter.
Assignments are automatically updated in the graph and displayed on the Track Status dashboard.
Dashboard shows real-time updates on assignment, pickup, and shelter admission.
Real-Time Network Updates:
Any change in shelter availability or volunteer status is immediately reflected on the map and dashboard.
Ensures that the system always dispatches help from the most suitable source.`,
    pptUrl: `https://github.com/Jbchap11/RescueNet/blob/main/RescueNet-compressed.pdf`,
    githubUrl: `https://github.com/Jbchap11/RescueNet`,
    deployedUrl: `https://jbchap11.github.io/RescueNet/`,
    demoUrl: `https://youtu.be/0Xokkl8VqfE`,
  },
  {
    id: `codies`,
    team: `Codies`,
    leader: `Samarth Sharma`,
    description: `We integrated TigerGraph as the core graph database to model and analyze the railway cargo network. Stations are represented as nodes and routes between them as edges with attributes such as distance, travel time, congestion level, and track condition.

Custom graph queries are executed via TigerGraph’s REST API, which is connected to our FastAPI middleware. These queries power key functionalities such as shortest route computation, bottleneck detection, overload risk analysis, and identification of suspicious rerouting patterns.`,
    pptUrl: `https://docs.google.com/presentation/d/1mpt2NnXbFJ-KhIDtyS7PnVJNvO0vA-O5/edit?usp=sharing&ouid=110375682916989052835&rtpof=true&sd=true`,
    githubUrl: `https://github.com/sam120904/CargoGuardian`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1H85YiDtu9bHCLSOXkxkkDqHNgoCzrWXI/view?usp=sharing`,
  },
  {
    id: `cybersentinels`,
    team: `CyberSentinels`,
    leader: `PRATEEK CHATURVEDI (Solo Participant)`,
    description: `Tiger Graph has been integrated into our solution as the core engine for modeling and analyzing relationships within cyber attack data. Instead of treating the dataset as isolated records, we transform it into a graph structure where key entities such as attack types, campaigns, domains, networks, and regions are represented as vertices, and their relationships are defined as edges. This allows us to capture the multi-stage nature of cyber attacks in a connected format. Using Tiger Graph's GSQL, we implement multi-hop traversal queries that start from a selected attack type and explore its associated campaigns, domains, infrastructure (such as TOR or VPN), and targeted regions. This enables us to uncover hidden connections and reconstruct the complete attack chain. The insights generated through Tiger Graph are then integrated into our application, where they are further processed by an AI module to derive risk levels, patterns, and recommendations, and visualized through an interactive dashboard. In this way, Tiger Graph plays a crucial role not just as a storage system, but as an analytical backbone that allows us to move from simple data observation to meaningful investigation and understanding of attacker behavior`,
    pptUrl: `https://drive.google.com/file/d/15eJEzeE_XookIGVhxM3DziW09k2er9jH/view?usp=sharing`,
    githubUrl: `https://github.com/pk859/DARKGRAPH-AI.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1XavJQw1vo9KI3IVPcxLGWKUvMc29vozZ/view?usp=sharing`,
  },
  {
    id: `debug-squad`,
    team: `Debug Squad`,
    leader: `Sanchit Sharma`,
    description: `We integrated Tigergraph as the core graph database, where users and products are nodes and their interactions are edges. Using GSQL, we perform multi-hop traversal to generate deeper, real-time recommendations, which are fetched via a Node.js backend.`,
    pptUrl: `https://drive.google.com/file/d/1Pv4Es0PiPGi90Nwl3UEu37vlp1ju0WLE/view?usp=drivesdk`,
    githubUrl: `https://github.com/ritam4735/GraphSense`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1zcOhAvFypYA-bFKN9dOHV2wo-iQl_CS9`,
  },
  {
    id: `deeplydisturbed`,
    team: `DeeplyDisturbed`,
    leader: `Aayush Gupta`,
    description: `TigerGraph is used as the core intelligence layer where all detected security events are stored as a connected graph instead of isolated logs. We model relationships between users, attackers, websites, APIs, files, and attack events, allowing us to identify attack paths, detect coordinated threats, and calculate risk scores. This enables real-time correlation of phishing, API, and data leak incidents and provides a unified threat view in our dashboard.`,
    pptUrl: `https://canva.link/di3rcwp36unb7gj`,
    githubUrl: `https://github.com/manokamna25/Cyber`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1KYgpk-_kQWilcc0QaHP2Ubv-KQ-Tm8YD?usp=sharing`,
  },
  {
    id: `eunoia`,
    team: `Eunoia`,
    leader: `Aditya sharma`,
    description: `We used tiger graph in admin panel
To be used for drift analysis in backend.`,
    pptUrl: `https://docs.google.com/presentation/d/1TKon2x-m720RYvJPNwEjZzHOAIjO8umM5HEslCvh1aQ/edit?slide=id.g3ca2ebbc023_0_2933#slide=id.g3ca2ebbc023_0_2933`,
    githubUrl: `https://github.com/adithedev/Surfin`,
    deployedUrl: null,
    demoUrl: `https://www.youtube.com/watch?v=wCkGhC5crpw`,
  },
  {
    id: `finverse`,
    team: `FinVerse`,
    leader: `Deepak Jain`,
    description: `TigerGraph serves as the core detection engine for identifying cross-channel money mule patterns that traditional siloed fraud systems miss.

Graph Data Model
We model financial activity as a connected graph:

Vertices: Accounts, Transactions, Devices, Wallets, ATMs
Edges: Money flow (SENT/RECEIVED), device ownership (OWNS_DEVICE), wallet links (LINKED_WALLET, VIA_WALLET), ATM withdrawals (WITHDREW_AT)

Single-Query Cross-Channel Traversal
Traditional systems check each channel separately. TigerGraph traverses Mobile App → Wallet → ATM in one query, detecting the complete mule pattern in milliseconds.

Time-Window Pattern Detection
GSQL queries identify suspicious sequences occurring within 30 minutes—impossible with siloed rule engines.

Identity Linkage via Shared Devices
Graph traversal instantly reveals when multiple "unrelated" accounts share the same device, exposing coordinated mule rings.

Composite Risk Scoring
We accumulate risk signals across the graph (mobile deposits +20, ATM withdrawals +25, shared devices +30) to generate holistic fraud scores.`,
    pptUrl: `https://canva.link/98e2ukzo0hmm9b8`,
    githubUrl: `https://github.com/apurbaxx/mule-account-detect`,
    deployedUrl: `https://mule-account-detect.streamlit.app/`,
    demoUrl: `https://vimeo.com/1180485521?share=copy&fl=sv&fe=ci`,
  },
  {
    id: `forgefox`,
    team: `ForgeFox`,
    leader: `Divyansh Bhatt`,
    description: `TigerGraph has been integrated as a relational graph layer that complements the existing vector search (FAISS). While the vector engine handles semantic similarity, TigerGraph allows the system to trace complex dependencies and "bridge" skills.

How it is integrated:
Relational Modeling: I have modeled Skills and Jobs as vertices. The REQUIRES edge between them allows the engine to perform multi-hop queries (e.g., "What other jobs share 80% of the skills required for this role?").
Automated Schema Management: A dedicated TigerGraphService handles the GSQL schema definition, so the graph is automatically structured with the correct attributes (id, name, weight) upon initialization.
Intelligent Data Ingestion: The transition from flat data to a graph is handled by an ingestion pipeline that maps the 2,277 jobs in job_title_des.csv into the graph, linking them to a standardized skill taxonomy.
Graph-Based Matching Scores: Instead of relying solely on text embeddings, the integration enables calculates "skill-overlap" scores that are far more accurate for career-pathing than traditional keyword or vector search alone.`,
    pptUrl: `https://app.presentations.ai/view/juMSggYl0o`,
    githubUrl: `https://github.com/sashwatpuri/AI-Adaptive-Onboarding-engine.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1C-jBawRMe63wbNA-qElVHgQEMbbxojO2`,
  },
  {
    id: `gitkaro`,
    team: `Gitkaro`,
    leader: `Kartik Guleria`,
    description: `In RailQuick, we have integrated TigerGraph to build a real-time, intelligent logistics and delivery network for train-based services.
1. Graph-Based Network Modeling
We model the entire railway ecosystem as a graph:
Nodes → Stations, trains, vendors, passengers, seats/berths
Edges → Train routes, vendor proximity, delivery paths, passenger orders
This allows us to dynamically understand relationships and shortest delivery paths in real time.
2. Smart Vendor Allocation
When a passenger places an order:
TigerGraph instantly analyzes:
Nearby vendors at upcoming stations
Train speed, stoppage time, and route
Seat/coach location`,
    pptUrl: `https://drive.google.com/file/d/1DdoH2YeGowHkcdETCZgve0K4Yn-RDhTU/view?usp=sharing`,
    githubUrl: `https://github.com/kartik098ki/Railquick-app`,
    deployedUrl: null,
    demoUrl: `https://youtu.be/zfJdxcohhH4`,
  },
  {
    id: `graph-sorcerers`,
    team: `Graph Sorcerers`,
    leader: `Khushi Bidhuri`,
    description: `We integrate TigerGraph to analyze relationships between entities such as domains, wallets, and user reports. This allows us to detect scam ecosystems by identifying connections that are not visible through traditional analysis.This helps users in crypto trading  security and learning .`,
    pptUrl: `https://www.canva.com/design/DAHF5s7jymI/wyXVaYShS9MMKxyIxdUH4g/edit`,
    githubUrl: `https://github.com/BhoomiShri/CryptoShield`,
    deployedUrl: `https://crypto-shield-beta.vercel.app/`,
    demoUrl: `https://www.canva.com/design/DAHGF84yK9U/YlJ2USOjqea9wmzjwxqD7g/edit`,
  },
  {
    id: `graphguardians`,
    team: `GraphGuardians`,
    leader: `Dev Varshney`,
    description: `GraphGuardians uses TigerGraph as its core graph database to store and traverse the entire dependency relationship graph of a scanned GitHub repository.

Schema: We defined three vertex types — Dependency (package name as PRIMARY_ID), Vulnerability (CVE ID, severity, description), and Repo (MongoDB repoId). Three directed edges connect them — DEPENDS_ON (Dependency→Dependency), HAS_DEPENDENCY (Repo→Dependency), and HAS_VULNERABILITY (Dependency→Vulnerability).

Data Ingestion: When a user scans a repository, we parse the package-lock.json to extract 4,000+ dependency nodes with their parent-child relationships. We then call our insertDependencyChain GSQL query for every parent→child edge, storing 2,793 DEPENDS_ON edges in TigerGraph. Vulnerabilities found via OSV.dev API are linked using insertDynamicData GSQL query.

Chain Traversal: Our getDependencyChain GSQL query traverses all DEPENDS_ON edges using SetAccum to collect the complete graph in one pass. This data powers our Chain Graph feature — which visually shows the exact propagation path from any root dependency to a vulnerability. For example: express → serve-static → send → ms → GHSA-w9mr-4mfr [CRITICAL, 4 hops].

Why TigerGraph: Traditional SQL databases cannot efficiently perform multi-hop graph traversals across 4,000+ nodes. TigerGraph's native graph storage and GSQL made it possible to find 1,049 unique vulnerability chains including paths up to 9 hops deep — something impossible with relational databases.`,
    pptUrl: `https://1drv.ms/p/c/a5f6dbdf706b2c3d/IQA7HlLK8JBzQ5cvuHP5OaM0ASA8vUjz5thMq6_NpipDx0g?e=gMpedP`,
    githubUrl: `https://github.com/GraphGuardians`,
    deployedUrl: `https://git-graph-zeta.vercel.app/`,
    demoUrl: `https://drive.google.com/file/d/1QJBNoEcdxjohO44JZctz57B6oBL5Gst5/view?usp=drivesdk`,
  },
  {
    id: `graphites`,
    team: `Graphites`,
    leader: `Gauri Aggarwal`,
    description: `Graph Database Core:
TigerGraph Savanna (cloud-hosted) serves as the intelligence backbone. The data is modeled as a property graph with 7 vertex types (Voter, Address, Booth, Constituency, PinCode, Device, Phone) and 10 edge types capturing real-world relationships like REGISTERED_AT, FAMILY_OF, DUPLICATE_OF, etc.
GSQL Detection Queries:
8 custom GSQL queries power all fraud detection : detect_overcrowded_addresses, detect_duplicate_voters, detect_impossible_families, detect_temporal_fraud, detect_multi_booth, full_constituency_scan, detect_cross_constituency_network, and get_timeline_data. The full_constituency_scan is the master query that runs all signals in sequence and writes risk_score back onto Voter vertices.
Built-in Graph Algorithms:
Rather than implementing algorithms from scratch, the solution leverages TigerGraph's Graph Data Science library : PageRank on Address nodes to find hub addresses, Louvain community detection for ghost factory clusters, WCC to isolate disconnected fraud rings, and Betweenness Centrality to find human agents bridging multiple clusters.
REST++ Integration:
The FastAPI backend communicates with TigerGraph via REST++ API using Bearer token auth, with a 12-second timeout. Voters are upserted in batches of 1,000 using idempotent upsert semantics.`,
    pptUrl: `https://drive.google.com/drive/folders/1iq1a9TwMoFPZ1puq6qFCp6YWvu3pSkjr?usp=sharing`,
    githubUrl: `https://github.com/AnushreeJ13/NetraVote`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1iq1a9TwMoFPZ1puq6qFCp6YWvu3pSkjr?usp=sharing`,
  },
  {
    id: `gridsentinals`,
    team: `GridSentinals`,
    leader: `Unknown`,
    description: `We integrated TigerGraph as the core reasoning engine of our Smart City Command Center, moving beyond traditional relational databases to natively map the complex, interconnected dependencies of metropolitan infrastructure.

Rather than relying on pre-written, static queries, we implemented a dynamic Agentic Graph Retrieval system.

Here is how the integration works under the hood:

The Bridge (pyTigerGraph + LangChain): We utilized the pyTigerGraph SDK wrapped inside a secure, custom LangChain tool (execute_dynamic_python). This allows our Multi-Agent LLM architecture (powered by Groq) to maintain an active connection to the TigerGraph cloud instance.

Autonomous Querying: When an operator submits a natural language emergency scenario (e.g., a blackout or flood), our specialized sub-agents (the Power Grid Agent and Logistics Agent) autonomously write and execute raw Python scripts to traverse the graph schema in real-time.

Deep-Link Traversal: We heavily utilized TigerGraph’s edge traversal capabilities to simulate real-world physics and logistics. The AI queries POWERS and PROVIDES_SIGNAL edges to calculate the true cascading "blast radius" of a substation failure, and queries INTERSECTS edges to map physical road routes to affected hospitals.

Real-Time Analytics: We leveraged the graph database for instant vulnerability scanning. By counting outbound dependencies across all nodes simultaneously, TigerGraph allows our system to identify the city's Single Point of Failure (SPOF) in milliseconds.

Why TigerGraph? Standard SQL databases struggle with deep, multi-hop queries (e.g., finding a road, connected to a hospital, relying on a telecom tower, powered by a specific substation). TigerGraph allowed us to perform these complex dependency calculations instantly, enabling a true, real-time emergency simulation that dynamically updates our frontend PyDeck map.`,
    pptUrl: `https://1drv.ms/p/c/4c176851a8207764/IQBYASu0NSfbQJdaKSyqMRc4AZ-Nva2thC9dFCpxhn1s31Y?e=VeZrLV`,
    githubUrl: `https://github.com/sundaramkasera/Resilience.AI`,
    deployedUrl: null,
    demoUrl: `https://www.loom.com/share/3206ea5ca5f5417eb984c0b71958ab9c`,
  },
  {
    id: `hackherz`,
    team: `HackHerz`,
    leader: `Mehak Kansal`,
    description: `TigerGraph was integrated as the core graph database to model relationships between skills, career paths, and learning courses. The project uses vertices such as Skill, Career, and Course, and edges like REQUIRES and TEACHES to represent connections between them. CSV files were uploaded into TigerGraph to populate the graph structure. A custom GSQL query (getRecommendationBySkill) was created to retrieve relevant career paths and recommended courses based on the selected skill. This query is accessed through a REST API and connected to the Streamlit frontend, allowing users to select a skill and receive personalized career and course recommendations dynamically.`,
    pptUrl: `https://docs.google.com/presentation/d/1pv6I2604ul3Zr7m3Ywma9mvmvQionIOm/edit?usp=sharing&ouid=104122638066104839299&rtpof=true&sd=true`,
    githubUrl: `https://github.com/Mehak-Kansal12/AI-Career-Recommendation-System`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/14Or-_YNuuQPZw8FlGxpVdJqrk4VQQvdR/view?usp=sharing`,
  },
  {
    id: `helios`,
    team: `HeliOS`,
    leader: `Kushagra Saxena`,
    description: `We have used TigerGraph as the core database layer of the solution. It models global supply chains as a network of nodes (countries, industries, products) and edges (trade relationships, dependencies). When a shock event (like supply disruption) is triggered, TigerGraph enables real-time traversal and multi-hop analysis to quickly identify cascading impacts across connected nodes. Its built-in graph algorithms help compute impact spread, risk propagation, and alternative supply paths, which are then visualized in the system’s dashboard for decision-making.`,
    pptUrl: `https://drive.google.com/file/d/1K30zFVjSUHVJPFByq3NObzxPi9h3k3Xc/view?usp=sharing`,
    githubUrl: `https://github.com/AryanBoro/flux-hackathon.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/13wEWKhjCSvX55ubyqb7HU4cjmOYvevzw/view?usp=sharing`,
  },
  {
    id: `horizon`,
    team: `Horizon`,
    leader: `Saurya Tripathi`,
    description: `We use TigerGraph as the core intelligence engine, integrated via pyTigerGraph and a FastAPI backend:

1.Native Advanced Algorithms: We utilize built-in GSQL algorithms like PageRank for dynamic risk scoring and Betweenness Centrality to identify critical "bridge nodes" within criminal networks, powering our Network Disruption Simulator.
2.Temporal Multi-Hop Traversal: Our schema design uses time-stamped edges, allowing complex, time-constrained GSQL queries to track financial layering and communication anomalies across multiple hops.
3.GraphRAG Pipeline: The backend bridges our React dashboard to TigerGraph, where an LLM translates natural language queries directly into executable GSQL, democratizing complex graph analysis.`,
    pptUrl: `https://drive.google.com/file/d/15ySMraqNt37ApkgmC1MKNIPBfJJdi5N7/view?usp=drive_link`,
    githubUrl: `https://github.com/TechnicalVishalJi/Predictive-Criminal-Graph-Intelligence`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1iYuOsyktshRxs21MsKNbo8icIrLYD6zY/view?usp=sharing`,
  },
  {
    id: `hypernova`,
    team: `HyperNova`,
    leader: `Divyansh Patel`,
    description: `We are integrating TigerGraph as the core knowledge graph to enhance our AI-powered agriculture assistant, CropWise Copilot.

Our system follows a Retrieval-Augmented Generation (RAG) architecture where TigerGraph stores structured relationships between key agricultural entities such as farmers, crops, soil types, weather conditions, fertilizers, and diseases.

The integration works as follows:

User queries are received through the frontend interface.
The backend processes the query and uses an LLM (like GPT/Gemini) to interpret user intent.
Relevant graph queries are generated and executed on TigerGraph using its Python SDK (pyTigerGraph).
The graph database returns context-aware results based on relationships (e.g., soil → suitable crops, crop → diseases).
The LLM then combines this structured data with natural language generation to provide accurate, explainable recommendations.

This approach enables:

Context-aware crop recommendations
Disease and fertilizer suggestions based on real relationships
Reduced AI hallucination through grounded data

Overall, TigerGraph allows us to move from generic AI responses to a data-driven, relationship-aware intelligent farming assistant.`,
    pptUrl: `https://docs.google.com/presentation/d/1OjOQoxp1Z9_pUvtxOxNR30GOOrbUAY6T/edit?usp=drive_link&ouid=101542235375453887305&rtpof=true&sd=true`,
    githubUrl: `https://github.com/atulkushwaha0112-py/HyperNova.git`,
    deployedUrl: `https://kisanai-2k60.onrender.com/`,
    demoUrl: `https://drive.google.com/file/d/1TquzIT4hYwvBchEZB8nd-RVobwvfdoT8/view`,
  },
  {
    id: `imharshita30`,
    team: `imharshita30`,
    leader: `Harshita Tyagi`,
    description: `Core Function (The Relational Brain): TigerGraph replaces traditional SQL databases to map a candidate's technical skills as a dynamic, interconnected network (Knowledge Graph) rather than a static list.

Custom Graph Schema: * Vertices (Nodes): CandidateNode (user profiles), SkillNode (technical competencies like React, Node.js), and InterviewNode (session metrics and scores).

Edges (Relationships): CANDIDATE_HAS_SKILL (connects candidates to their verified skills) and GAVE_INTERVIEW (links candidates to their performance history).

High-Speed API Integration: The Node.js backend connects to TigerGraph Cloud using RESTPP endpoints. We use direct HTTP/Axios requests to fetch candidate-skill edges, bypassing traditional dashboard limitations and RDBMS bottlenecks.

Real-Time Skill-Gap Analytics: The system performs multi-hop graph traversals to calculate the exact "logical distance" between a student’s current skill nodes and the required nodes for a specific job role.

Live UI Synchronization: The relational data fetched from TigerGraph is fed directly into the React frontend to render an interactive 2D Force-Directed Graph, allowing candidates to visually explore their strengths and missing skills.

Dynamic Updating: As soon as an AI interview concludes, the candidate's performance data and newly validated skills are instantly pushed back to TigerGraph to update their live "Neural Map."`,
    pptUrl: `https://docs.google.com/presentation/d/1iry1iW1zrbDIgJaDVz9tYpyzoY6ESHz5/edit?usp=drivesdk&ouid=111381693410609023530&rtpof=true&sd=true`,
    githubUrl: `https://github.com/Saksham-Chaudhary-03/ecobite-ai-interviewer`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1wyqeOGXWEanKRrKBQG5SqdwgngLONdgQ/view?usp=sharing`,
  },
  {
    id: `kill-bill`,
    team: `Kill Bill`,
    leader: `Raja pandey`,
    description: `We integrated **Tiger Graph** as our primary graph database to move from "Point-to-Point" security to "Network-Wide" intelligence.

**1. Native Parallel Graph (NPG) Architecture**
Unlike traditional SQL databases that struggle with "Table Joins," Tiger Graph’s architecture allows Ledger Shield to perform **Deep Link Traversal**. We can analyze 6+ degrees of separation (User → Device → IP → Transaction → Merchant) in milliseconds to uncover hidden fraud paths that are invisible to relational systems.

**2. GDS Library (Graph Data Science) for Pattern Recognition**
We leveraged the **Tiger Graph GDS Library** to run advanced algorithms directly on the data:
* **Louvain Community Detection:** Used to automatically cluster seemingly unrelated accounts into "Fraud Rings" based on shared digital fingerprints (e.g., hardware IDs or IP addresses).
* **PageRank for Risk Scoring:** We treat every entity as a node. High-risk "flow" is calculated using PageRank logic; if a clean account is heavily connected to a known fraudulent device, its risk score is automatically elevated.

**3. Real-Time GSQL Logic**
We wrote custom **GSQL queries** to act as our "Digital CCTV." These queries monitor for specific fraudulent patterns, such as:
* **Synthetic Identity Detection:** Identifying clusters of accounts that share a single physical address or phone number.
* **Internal Ledger Surveillance:** Detecting "backdated" or "manual reversal" edges that deviate from standard employee behavioral patterns.

**4. Seamless API Integration**
The Tiger Graph database is connected to our **Node.js backend** via REST APIs. This allows the **D3.js-powered frontend** to fetch real-time graph updates, providing managers with an interactive, force-directed map of detected threats.`,
    pptUrl: `https://1drv.ms/p/c/b9a50fb7c9936413/IQCVsaJVZ5jMR6DO-ZjVuI_GAaEWyFmlbUsDSM6P1pNihPs?e=j5qqNh`,
    githubUrl: `https://github.com/Manjari-2005/Ledgershield-Digital-cctv`,
    deployedUrl: `https://ledgershield-digital-cctv.onrender.com`,
    demoUrl: `https://canva.link/md8if1r3ndaadp2`,
  },
  {
    id: `killers-of-threats`,
    team: `killers_of_threats`,
    leader: `Ruturaj Tushar Pandit`,
    description: `We have integrated 4 vertices, 'Pattern', 'Stock', 'Transaction' and 'Message' each possessing almost 10k connections with integrated datasets. Each vertex, loaded with dataset. In our monetary fraud detection system, LangGraph is our primary backbone for state transfer, score generation and detecting fraudulent patterns.  The state from fraud analysis node is bifurcated into 4 parts, wherein each part goes towards each of the vertex(each is an individual DB from within). Graph analysis via comparing the states with the DB values take place, generating insights and a graph score which is passed in the further pipeline, each of the vertex contributing mathematically for generating the score.`,
    pptUrl: `https://docs.google.com/presentation/d/1xDbm7CnqLN2FT2tve3pv9oeXKHfLUslb/edit?usp=sharing&ouid=111168720743665272169&rtpof=true&sd=true`,
    githubUrl: `https://github.com/RJDEVMAN/FinGuard_IIT_Hackathon`,
    deployedUrl: `https://finguardiithackathon-mzkcmrbcyglhhesizdrt5e.streamlit.app/`,
    demoUrl: `https://www.youtube.com/watch?v=w__DSKoYtUs`,
  },
  {
    id: `kingbhadawar0`,
    team: `kingbhadawar0`,
    leader: `Ayush Singh Bhadoria`,
    description: `attendance pattern analysis / proxy detection graph

1. TigerGraph Client
Token management, REST++ calls, vertex/edge upsert, query runner
Auto mock-mode

2. TigerGraph Graph Schema
Vertices: Student, Class, Faculty, Department
Edges: ATTENDED (face_confidence, gps_distance), ABSENT_FROM, TEACHES, ENROLLED_IN
4 GSQL queries pre-installed: proxy detection, attendance pattern, low attendance, consecutive absences

3. TigerGraph Service 
syncStudent, syncClass, syncAttendancePresent, syncAttendanceAbsent
bulkSyncClassAttendance — full class sync
detectProxyCandidates, getAttendancePattern, getLowAttendanceStudents

4. TigerGraph Controller + Routes
GET health — TigerGraph connection check
GET proxy-detection: class_id — Proxy suspects
GET attendance-pattern:student_id — Graph pattern analysis
GET low-attendance?batch=X&threshold=75 — At-risk students
GET consecutive-absences:student_id
POST sync class:class_id — Manual sync

5. Auto-sync — Jab bhi student attendance mark hoti hai (OTP verify), TigerGraph mein automatically sync hoti hai.`,
    pptUrl: `https://drive.google.com/drive/folders/173sCoGnOan-xfFim6fadszvhaScXKTbU?usp=sharing`,
    githubUrl: `https://github.com/byteforge-765/NO-PROXY-ATTENDANCE-SYSTEM.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/173sCoGnOan-xfFim6fadszvhaScXKTbU?usp=sharing`,
  },
  {
    id: `lakshay-tyagi`,
    team: `Lakshay Tyagi`,
    leader: `Nandini`,
    description: `Our choice of using TigerGraph as the backbone for our fraud detection solution lies in the fact that our solution depends entirely on relationship-based analysis rather than the individual data points.

Whereas conventional data solutions rely on tabular data storage, we have opted for a graph database format. As such, information like phone numbers, UPI IDs, banking accounts, device IDs, and even social media handles are stored as nodes, while the connections between them, such as transactions, device sharing, and account links, are stored as edges.

Once new data is collected from the backend (built with FastAPI), it is added to TigerGraph, which automatically associates it with relevant nodes.`,
    pptUrl: `https://1drv.ms/p/c/0e748c230d4cbab0/IQBdurUKpuIESaQhpay0KQYmAWK1mkZSOBcqxcpYVb6fbBs?e=qHPx1x`,
    githubUrl: `https://github.com/Sanidhya-Sehgal/fraud-multiverse`,
    deployedUrl: null,
    demoUrl: null,
  },
  {
    id: `lassi`,
    team: `Lassi`,
    leader: `Krishna Mudgal`,
    description: `TigerGraph is integrated as the core graph database that stores all bank assets, vulnerabilities, threat actors, incidents, and their relationships as interconnected vertices and edges. All five AI agents (Predictor, Remediator, RCA, Red Team, and Pathfinder) query TigerGraph in real-time using GSQL queries to fetch attack paths, unpatched vulnerabilities, network topology, and threat actor mappings before generating predictions, playbooks, or simulation results. This graph-based approach allows the system to find multi-hop attack paths from any entry point to critical crown jewels in milliseconds, something traditional SQL databases cannot do efficiently.`,
    pptUrl: `https://canva.link/pkagskrvvsrulot`,
    githubUrl: `https://github.com/MrVoracious/cyberSecHackathon`,
    deployedUrl: `https://cybersechackathon.netlify.app/`,
    demoUrl: `https://www.youtube.com/watch?v=A89GXIgeCLU`,
  },
  {
    id: `logic-legends`,
    team: `Logic Legends`,
    leader: `Mohd Fawah Khan`,
    description: `TigerGraph powers the relationship engine that connects:

Car ownership chains (who owned what, when)

Service center networks (detecting collusion between mechanics)

Insurance claim patterns (linking accident history across policies)

Mileage anomalies (finding impossible timelines across the entire network)

Instead of checking one car in isolation, TigerGraph reveals fraud patterns across thousands of vehicles. If 50 cars from the same dealer all show identical mileage jumps, TigerGraph catches the conspiracy.`,
    pptUrl: `https://docs.google.com/presentation/d/1azVXPsVcO-46eew1Efx0McjgHo_hWu3r/edit?usp=drive_link&ouid=117730388071677064536&rtpof=true&sd=true`,
    githubUrl: `https://github.com/fawahkhan/OdoShield.git`,
    deployedUrl: `https://github.com/fawahkhan/OdoShield.git`,
    demoUrl: `https://github.com/fawahkhan/OdoShield.git`,
  },
  {
    id: `mayank-mishra`,
    team: `MAYANK MISHRA`,
    leader: `Mayank Mishra`,
    description: `In our solution, we have used TigerGraph to detect healthcare insurance fraud by treating it as a relationship‑based problem instead of a simple data problem. We modeled important healthcare entities such as patients, doctors, hospitals, and insurance claims as nodes, and their interactions like treatments, claim filing, and payments as edges in a graph. Using TigerGraph’s GSQL queries, we performed multi‑hop traversals to find hidden connections, such as a single doctor being linked to many high‑value claims or multiple patients sharing similar patterns. This approach helps in identifying fraud rings that are difficult to detect using traditional databases. TigerGraph also allows fast processing and makes the results explainable by clearly showing the relationship paths that led to a claim being marked as suspicious.`,
    pptUrl: `https://abes365-my.sharepoint.com/:p:/g/personal/mayank_25b15310216_abes_ac_in/IQAaSf3oogsNTpPVBBf6G349AeG7JSKCsx8AAhCMVk3fC0Y?e=D6gdze`,
    githubUrl: `https://github.com/jasleen17-code/AIML-1_JS.git`,
    deployedUrl: null,
    demoUrl: `https://gemini.google.com/share/47f71c487c8d`,
  },
  {
    id: `medi-minds`,
    team: `Medi Minds`,
    leader: `Gaurav Karakoti`,
    description: `The application dynamically builds the graph by fetching transaction history and risk levels from different apis... determining the risk level, then upserting this data into TigerGraph.

This is done via POST requests to the /restpp/graph/ChainTrustGraph endpoint, structuring the payload with Wallet vertices and TRANSACTION edges.

The app relies on custom installed GSQL queries accessed via the /restpp/query/ REST API endpoints.`,
    pptUrl: `https://canva.link/04oj5lhvtnsqkbt`,
    githubUrl: `https://github.com/GauravKarakoti/ChainTrust`,
    deployedUrl: `https://chain-trust-psi.vercel.app`,
    demoUrl: `https://youtu.be/ion56Wb7fZ4?si=K92KMnA6vIyLZPs5`,
  },
  {
    id: `naveen-bunkar`,
    team: `Naveen Bunkar`,
    leader: `Tech Orbit`,
    description: `TigerGraph is used as the core database to model and analyze relationships in our system.

We designed a healthcare knowledge graph with nodes such as Patient, Symptom, Disease, and Treatment, and edges representing their relationships.
Using GSQL queries, we implemented multi-hop traversal (Patient → Symptom → Disease) to identify possible diseases based on symptoms.
The backend connects to TigerGraph via APIs to execute queries in real time and fetch predictions.
TigerGraph enables fast, scalable graph processing, allowing us to uncover hidden patterns and provide accurate, relationship-driven insights.`,
    pptUrl: `https://drive.google.com/drive/folders/1vfrgSytj7AtWiY8uCQn0ZfGlP0EoGZKF?usp=sharing`,
    githubUrl: `https://github.com/naveenbunkar-iitj/healthcare-graph-ai-tigergraph`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1vfrgSytj7AtWiY8uCQn0ZfGlP0EoGZKF?usp=sharing`,
  },
  {
    id: `neuroverse`,
    team: `NeuroVerse`,
    leader: `Umang Kumar Arora`,
    description: `We’ve integrated TigerGraph as the core intelligence layer of Oraya OS.
Instead of using traditional databases, we model the entire city as a graph — where nodes represent entities like citizens, locations, incidents, and services, and edges represent relationships between them.

This allows us to process complex connections in real time. For example, in our safety system, incidents are linked to specific locations and nearby infrastructure, forming clusters of high-risk zones.

Using TigerGraph’s graph queries, we analyze these relationships to dynamically identify safer routes by avoiding high-risk areas.

Additionally, verified incidents are propagated through the graph to notify relevant police stations instantly and assist in optimizing patrol routes.

So essentially, TigerGraph enables us to move from static data storage to real-time, relationship-driven intelligence.`,
    pptUrl: `https://drive.google.com/drive/folders/1QUHp_dymNrqGydpksV0bLVhfepEjjLy3?usp=sharing`,
    githubUrl: `https://github.com/umang24-cyber/SmartCity.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1o9KMS1eGnhRfh0lXy1SGqo2mFKc5dwWS/view?usp=drivesdk`,
  },
  {
    id: `oblivion`,
    team: `Oblivion`,
    leader: `Aarya Shresth Kapoor`,
    description: `We use TigerGraph to model the grid as a hierarchical graph and query relationships in real time, enabling fast anomaly tracing from poles to transformers and powerplants`,
    pptUrl: `https://drive.google.com/file/d/1unDsm962-I6bRGQo5zANmFN3GLyarzGv/view?usp=sharing`,
    githubUrl: `https://github.com/warrior221/watt_watch/`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1PeTQ5YfAi5LT2O5zXtm7W8Ln2tJbs5Yv/view?usp=sharing`,
  },
  {
    id: `omegax`,
    team: `OmegaX`,
    leader: `Shriram Nema`,
    description: `TigerGraph is a graph database — it would be a natural fit for MediAI's disease-symptom-treatment relationship network. Potential integration points:

Symptom → Disease graph traversal — Replace the current brute-force array-matching in symptomMatcher.js with a TigerGraph query that traverses Symptom → linked_to → Disease edges, leveraging native graph algorithms for faster and more accurate multi-hop matching.

Comorbidity & related-condition discovery — Model Disease → co_occurs_with → Disease edges to surface related conditions (e.g., Diabetes ↔ CKD ↔ Hypertension), which the current flat MongoDB schema cannot represent efficiently.

Treatment pathway recommendations — Build Disease → treated_by → Treatment → prevents → Disease paths for richer recommendation logic.`,
    pptUrl: `https://docs.google.com/presentation/d/1kq6MGeIo0Mv4KClaqfl8wz-WtgoAjPKq/edit?usp=drive_link&ouid=112151771790645374951&rtpof=true&sd=true`,
    githubUrl: `https://github.com/Shrii-max/mediAI_project`,
    deployedUrl: `https://playful-choux-2f4138.netlify.app/`,
    demoUrl: `https://drive.google.com/file/d/1txmJWw8rwrBgHfTbdMRYKFmqyB3odoXt/view?usp=drive_link`,
  },
  {
    id: `pied-piper`,
    team: `Pied Piper`,
    leader: `Muaaz Shaikh`,
    description: `Graphene is built with TigerGraph as its core, not as a database, but as the intelligence engine. We modeled a convergence graph with 11 vertex types and 13+ edge types that connects cyber entities (IPs, devices, attack alerts) directly to financial entities (accounts, transactions, beneficiaries) and identity data (users, KYC docs, sanctions lists), all in one traversable schema.

The real power shows up in our queries. We wrote 8 custom GSQL queries including a 6-hop cross-domain traversal that traces a cyber alert all the way to sanctioned shell companies. In SQL this would need 6+ JOINs and would be painfully slow at scale. TigerGraph does it in milliseconds. We also run PageRank for threat propagation scoring, Louvain community detection to find fraud rings, shortest path for attack chain reconstruction, and temporal pattern matching to catch coordinated transaction bursts.

Our AI investigation agent calls these TigerGraph queries as tools during its reasoning loop. It doesn't just read data, it actively traverses the graph, expands neighborhoods, runs analytics, and builds evidence chains. The ML pipeline extracts 20 graph-derived features (centrality, clustering coefficient, community membership, hop-distance to known threats) from TigerGraph to train our anomaly detection ensemble.

Basically, remove TigerGraph and the entire product collapses. The cross-domain connections, the real-time traversals, the graph algorithms, the agent's investigative capability, none of it works without a graph database, and TigerGraph's parallel processing is what makes it fast enough for live demos.`,
    pptUrl: `https://www.figma.com/deck/AyCN4ToMpFSfL9OtvZ0HlL`,
    githubUrl: `https://github.com/MuaazSM/Graphene`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1iftB5P47SNEuHLeOBmFl7ro1UmejzkyW?usp=sharing`,
  },
  {
    id: `pinkblue`,
    team: `PinkBlue`,
    leader: `Kiranpreet Kaur`,
    description: `We have built a platform to centralise the node-to-node communication in small businesses  & MSMEs chains. Tigergraph is implemented to build : 

1. A worker recommendation system using TigerGraph that suggests the best workers
for a task based on location, past collaborations, and owner preferences.

2. A delay detection system to identify bottlenecks in production chains and workers who consistently cause delays.

3. A fraud detection system using TigerGraph to identify workers who consistently deliver incomplete goods or poor quality.

4.Build a transporter recommendation system similar to worker recommendations,
optimized for delivery logistics.`,
    pptUrl: `https://canva.link/f6qdn1v0y83mwsj`,
    githubUrl: `https://github.com/Kkkiiiirran/Pylot-Frontend-Web`,
    deployedUrl: null,
    demoUrl: `https://canva.link/b09hlc33smm1dxr`,
  },
  {
    id: `pps`,
    team: `PPs`,
    leader: `Palak Rao`,
    description: `Tiger Graph is used as the core graph database to store and analyze relationships between customers, accounts, devices, and transactions. The data is modeled as a graph where nodes represent entities and edges represent connections like transfers or device usage. Using GSQL queries, the system detects fraud patterns such as transaction loops, shared devices, and multi-hop connections in real time. The backend (Fast API) communicates with Tiger Graph to send queries and fetch results, which are then displayed on the frontend dashboard for visualization and alerts.`,
    pptUrl: `https://drive.google.com/drive/folders/1W2MKHsl8kjBcmGHNMSflPg7CK5RWeVol?usp=sharing`,
    githubUrl: `https://github.com/palak-rao/FruadShield-Tiger-Graph-.html`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1YCqOPM_MKSBrdOXOqH2PRQGc80OuCrin?usp=sharing`,
  },
  {
    id: `quantum-quads`,
    team: `Quantum Quads`,
    leader: `Krish sharma`,
    description: `We have integrated TigerGraph into our solution by using it as a graph database to store and manage relationships between diseases and drugs.
After the machine learning model predicts a disease based on user symptoms, the backend sends this predicted disease as a query to TigerGraph using its REST API. TigerGraph then processes the query and retrieves all the drugs connected to that disease through predefined relationships in the graph.
The backend receives this data and sends it to the frontend, where it is displayed to the user along with the predicted disease.
In this way, TigerGraph is used to efficiently fetch related treatment information based on the prediction generated by the machine learning model.`,
    pptUrl: `https://docs.google.com/presentation/d/1077UsgBrboftrI9oxScG0tPpIn25VkZ0/edit?usp=sharing&ouid=104724530380491898189&rtpof=true&sd=true`,
    githubUrl: `https://github.com/krishsharma1159-1159/healthcare-project/tree/main`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1UklfMcQeoCYs3eTy2VAoWjXQfB7x5WP6/view?usp=sharing`,
  },
  {
    id: `rakshak`,
    team: `Rakshak`,
    leader: `Devansh Singh`,
    description: `yes i have done that`,
    pptUrl: `https://in.docs.wps.com/module/common/loadPlatform/?lg=en-US&sa=601.1245&ps=1&fn=....pdf&sid=sbCaeoT9XJHrw0xH_ur8t6j0x6b012bsxyb&v=v2`,
    githubUrl: `https://github.com/anushka-999-code/RAKSHAK-AI-TOOL`,
    deployedUrl: `https://rakshak-ai-tool.vercel.app`,
    demoUrl: `https://drive.google.com/file/d/1PzWLQYjWvpoFE5xJYwyxuMX1xehRl9Y5/view`,
  },
  {
    id: `riptide`,
    team: `Riptide`,
    leader: `Aviral Singh`,
    description: `Our integration focuses on two distinct graph domains:

1. Dual Graph Architecture
We maintain two specialized graphs to power the main platform features:

DepGraph (Technical Ecosystem): Models the structure of your codebases.
Vertices: FileNode (source files) and LibNode (packages/libraries).
Edges: IMPORTS, CALLS, and LIB_DEPENDS_ON.

PersonGraph (Professional Network): Models social and professional connectivity.
Vertices: Person (LinkedIn profiles).
Edges: CONNECTED_TO (representing shared connections or direct links).

2. Core Feature: Dependency Blast Radius
The most critical integration point is the Blast Radius Analysis. When you provide a GitHub username:

Ingestion: The backend parses your repositories and upserts the entire import/dependency tree into the DepGraph.
GSQL Traversal: We trigger a custom GSQL query (blastRadius.gsql) that performs a multi-hop traversal.
Impact Calculation: It identifies exactly which files and modules are downstream "victims" of a specific library change. This allows RAVEN to calculate a Migration Effort Score by seeing how deep the "blast" travels through your architecture.

3. Professional Pathfinding
For the networking module, we use TigerGraph’s built-in pathfinding capabilities (via shortest_path.gsql) to calculate the "Degrees of Separation" between a candidate and a target recruiter. This goes beyond simple SQL joins by traversing complex connection chains in sub-millisecond time.

4. Technical Implementation
Driver: We use the pyTigerGraph SDK for all communication.
Automated Schema: The TigerGraphClient service automatically handles the lifecycle of the database, including compiling GSQL queries and installing schemas directly from the tigergraph/ directory in our codebase.
Performance: Data is pushed in optimized batches (500 nodes/edges per call) to ensure the "Analyze" phase remains responsive even for users with dozens of repositories.
By moving these "reachability" problems to Tiger Graph, RAVEN can provide real-time insights into code maintainability and networking strength that would be computationally expensive in a traditional relational database.`,
    pptUrl: `https://drive.google.com/file/d/1ndhQURanrvHHpc5s8wZWKsKbYSf-MtJ7/view?usp=sharing`,
    githubUrl: `https://github.com/Av1ralS1ngh/RAVEN`,
    deployedUrl: `https://raven-1620.vercel.app/`,
    demoUrl: `https://drive.google.com/drive/folders/1XS31x6kOyToKiYqiPoC7ERRBvmBp8d6J`,
  },
  {
    id: `risinglion`,
    team: `RISINGLION`,
    leader: `Rishan Jain`,
    description: `It uses schema which matches manufacturer to buyer creditors and potential markets and acts as a AI powered recommendation system`,
    pptUrl: `https://canva.link/v26fal9lcp0twlo`,
    githubUrl: `https://github.com/Rishanjain/Exportbridge`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1eqCQwLFNUqQ1UmlcNYHdQ4prI4QpghBJ/view?usp=drivesdk`,
  },
  {
    id: `runtime-terror`,
    team: `Runtime Terror`,
    leader: `naisha mittal`,
    description: `We integrated Tiger Graph to efficiently model and analyse relationships between users, hashtags, and posts in a graph structure. This allows us to identify emerging trends by detecting highly connected and rapidly growing nodes (hashtags/topics). Using graph-based queries, we analyse how information spreads across the network, enabling faster trend detection and impact analysis compared to traditional methods`,
    pptUrl: `https://canva.link/pit48woryo3njk9`,
    githubUrl: `https://github.com/yashasingh2222-max/viral-content-predictor`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1y0ZpHeCTD_1FykdtS88Y3BTiLNffcSG5/view?usp=drivesdk`,
  },
  {
    id: `s-y-s-d`,
    team: `S.Y.S.D`,
    leader: `Shreya Kalra`,
    description: `We integrated TigerGraph as the core matching engine by mapping user identities as living subgraphs. A central User vertex connects to Interest, Vibe, and Personality nodes via edges that carry specific weights, like passion scores.

To find a match, our custom GSQL query runs a 2-hop traversal to instantly shortlist candidates who share these core nodes. The graph then calculates a multi-dimensional compatibility score in parallel, completely bypassing the slow performance of traditional database JOINs. We save this detailed mathematical breakdown in a CompatScore vertex to provide users with transparent, explainable match results.`,
    pptUrl: `https://canva.link/amez1o0u4er1r3v`,
    githubUrl: `https://github.com/shreyaakalra/Weave`,
    deployedUrl: `https://weave-amber.vercel.app`,
    demoUrl: `https://youtu.be/HXJYaqkuWcQ`,
  },
  {
    id: `sangam-fusion`,
    team: `Sangam_Fusion`,
    leader: `Shivam Mishra`,
    description: `In our solution, we integrated TigerGraph to enhance analytics and relationship-based insights within the platform.

Graph Modeling of Social Data
We modeled users, posts, hashtags, and platforms as nodes, and their interactions (likes, shares, engagement) as edges. This allowed us to represent complex social media relationships efficiently.

Advanced Analytics & Insights
TigerGraph enabled us to analyze connections between content and audience behavior, helping identify:

Trending hashtags

High-performing content patterns

Influencer or engagement clusters

Recommendation Engine
Using graph traversal queries, we generated smarter recommendations for:

Optimal hashtags

Best posting times

Content suggestions based on similar user behavior

Real-Time Performance Tracking
Its high-speed graph processing allowed near real-time analytics for engagement tracking across multiple platforms.

Although the current prototype (as shown in the architecture diagram on page 10) primarily uses MySQL 

, TigerGraph is integrated as an advanced analytics layer to scale future features like AI-driven recommendations and network analysis.`,
    pptUrl: `https://drive.google.com/file/d/15v6c2985yzgd90MQMHHwumPZ2_2rgyFw/view?usp=drive_link`,
    githubUrl: `https://github.com/shivammishra044/sangampost`,
    deployedUrl: `https://drive.google.com/drive/folders/13LcX0Rbq3TfKJQSJtxcK0GBVX1YKrPzS?usp=drive_link`,
    demoUrl: `https://drive.google.com/drive/folders/13LcX0Rbq3TfKJQSJtxcK0GBVX1YKrPzS?usp=drive_link`,
  },
  {
    id: `sejlyn2006`,
    team: `sejlyn2006`,
    leader: `Sejal Joshi`,
    description: `We integrated TigerGraph as the core graph database to model and analyze supply chain relationships.

First, we transformed our preprocessed dataset into a graph structure with two main vertex types—Supplier and Customer—and a Transaction edge connecting them. Each edge carries attributes like risk_score and other fraud indicators generated using our Isolation Forest model.

We then used TigerGraph to:

store and manage these relationships efficiently
perform graph traversal to explore connections between entities
identify suspicious patterns such as clusters of high-risk transactions

On top of this, we integrated an LLM layer that dynamically generates GSQL queries based on user input, which are executed on TigerGraph. The results are then visualized in the frontend for investigation.`,
    pptUrl: `https://docs.google.com/presentation/d/1zg9k4LH1Dgtgntqz3LUnd8Ss7TxACYrX/edit?usp=sharing&ouid=107696501991847193609&rtpof=true&sd=true`,
    githubUrl: `https://github.com/personal-opposite987/Fraud_Detection`,
    deployedUrl: null,
    demoUrl: null,
  },
  {
    id: `shubh-jain`,
    team: `Shubh Jain`,
    leader: `Shubh Jain`,
    description: `Viewed resume.py:1-66

TigerGraph is integrated as the primary data store, modeling users, jobs, and skills as vertices with semantic relationships. We leverage custom Python wrappers to perform high-performance GSQL traversals for real-time skill matching and social connection suggestions, exposing graph-driven insights through a robust FastAPI and Pydantic-validated backend.`,
    pptUrl: `https://docs.google.com/presentation/d/1LcNjQJmyl6XOdOOMzKTu8ZQg2zVjdu4u7zTMfuzs7-s/edit?usp=sharing`,
    githubUrl: `https://github.com/jShubh-AD/graph_hire`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1ejoadGUTHj2QsZIaCSlFfioo-LvKf9Fw/view?usp=drive_link`,
  },
  {
    id: `sigmoid`,
    team: `SIGMOID`,
    leader: `Krishna Agarwal`,
    description: `We used TigerGraph to model and visualize relationships between different entities involved in fraud cases.

In our system, we created a graph with three main nodes:

Company
UPI ID
Complaint

These nodes are connected using edges such as:

Company → UPI (indicating which payment ID is linked to a company)
Complaint → Company (which company is mentioned in a complaint)
Complaint → UPI (which payment ID is reported in a complaint)

This structure helps us represent fraud data as a network, where connections between entities can be easily analyzed.

Using TigerGraph’s visualization tools, we can:

Identify suspicious patterns (e.g., one UPI linked to multiple complaints)
Trace relationships between companies and payment IDs
Clearly demonstrate scam networks during the project demo

For the hackathon implementation, TigerGraph is primarily used for:

Graph modeling
Data visualization
Demonstrating fraud relationships

The core logic in the backend simulates these relationships, while TigerGraph provides a powerful visual representation that makes the system more intuitive and impactful.`,
    pptUrl: `https://docs.google.com/presentation/d/1hpY4Zg82TIIk4LDtgOmbuDdrPyCYqEvZ/edit?usp=sharing&ouid=112875345172797884230&rtpof=true&sd=true`,
    githubUrl: `https://github.com/PrakharGoel8320/OpportunityTrust`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1xWOmdxuVr6GTdwtz6c39KKz6E-g29Iv0/view?usp=sharing`,
  },
  {
    id: `signalsolver`,
    team: `SignalSolver`,
    leader: `Om Agarwal`,
    description: `We did not directly implement TigerGraph in our current prototype, but we designed our system in a way that supports graph-based integration in future.

TigerGraph can be used to model relationships between zones, crowd movement paths, and network nodes. For example, zones can be treated as nodes and movement between zones as edges, allowing us to analyze crowd flow patterns and detect potential congestion paths.

Using graph analytics, we can perform real-time traversal queries to identify high-risk routes, predict crowd buildup, and optimize resource allocation across zones. This would significantly enhance decision-making in large-scale environments.`,
    pptUrl: `https://canva.link/rpr3pvxc0p1z4ji`,
    githubUrl: `https://github.com/om1305/crowdMonitoring`,
    deployedUrl: `https://crowd-frontend-zwg1.onrender.com/`,
    demoUrl: `https://drive.google.com/file/d/151bnlVPN_GBgRpGwJBDDPEnicG6_j26f/view?usp=sharing`,
  },
  {
    id: `skill-seekers`,
    team: `Skill Seekers`,
    leader: `Richa Anand`,
    description: `TigerGraph is integrated as the core database in CyberSentinel to model the company network as a graph. Devices like laptops, servers, and databases are stored as nodes, and their connections as edges. When a user selects a starting point, the backend sends queries to TigerGraph, which performs fast multi-hop traversal to find all possible attack paths. These results are returned to the application and visualized on the frontend, helping users quickly identify risky paths and potential vulnerabilities in the system.`,
    pptUrl: `https://canva.link/ys56k8c1w0vgwkk`,
    githubUrl: `https://github.com/pulkita2007/cyber-sentinal-first.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1jjIa7rCJvJYG72JQQU9-_brNTyWPUvD7/view?usp=sharing`,
  },
  {
    id: `spirit`,
    team: `Spirit`,
    leader: `Nimish Gupta`,
    description: `We integrated TigerGraph as the core database to model financial data as a graph, where accounts are represented as nodes and transactions as edges.
We designed the schema and wrote GSQL queries to perform multi-hop traversal, enabling detection of suspicious patterns such as circular transactions and indirect relationships.
The backend, built using FastAPI, communicates with TigerGraph by executing these queries through API calls and fetching the results. These results are then sent to the frontend, where they are visualized as an interactive graph for analysis.`,
    pptUrl: `https://docs.google.com/presentation/d/1dVbhbcrLhhyqqbM9rARmw5mUlaNSeu4L/edit?usp=drive_link&ouid=103069823738886097417&rtpof=true&sd=true`,
    githubUrl: `https://github.com/nimish-g29/Fraudgraph`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/10c_ubOg84xWFileYtI9UznkO5nQgIJiN/view?usp=drive_link`,
  },
  {
    id: `syntax-buster`,
    team: `SYNTAX BUSTER`,
    leader: `Kumar Atharv`,
    description: `We integrated TigerGraph into our project by first connecting mcp with antigravity code editor then  designing a graph schema consisting of nodes like users, movies, actors, and genres, and relationships such as likes, acted_in, and belongs_to. After setting up the database, we loaded our dataset into TigerGraph using GSQL loading jobs. We then wrote GSQL queries to generate recommendations based on actor similarity, genre, and user preferences. Our backend (Node.js/Python) connects to TigerGraph using REST APIs to execute these queries. When a user searches for a movie, the backend sends a request to TigerGraph and retrieves relevant recommendations. These results are finally displayed on the frontend, enabling a fast and efficient graph-based recommendation system.`,
    pptUrl: `https://docs.google.com/presentation/d/10JJglVUn0lESTlGFynOk8Mn6ZcNrxhB7/edit?usp=drivesdk&ouid=115359106121631451426&rtpof=true&sd=true`,
    githubUrl: `https://github.com/prateeksharmacoder-sys/cinematch-engine`,
    deployedUrl: `https://cinematch-engine-frontend.onrender.com`,
    demoUrl: `https://drive.google.com/file/d/1RDEIDooF2JmNuL86nW6DmbfBp4RCPTRI/view?usp=drivesdk`,
  },
  {
    id: `syntax-sages`,
    team: `Syntax_Sages`,
    leader: `Sheikh Mohammad Abdullah`,
    description: `In SentinelGraph, TigerGraph serves as the core intelligence engine for real-time financial threat detection. We integrated a TigerGraph Cloud instance with our Node.js backend using the native REST++ API. Raw transactional data (transfers) and entities (accounts) are ingested as edges and vertices, mapping the entire financial network into a high-performance graph structure.

Instead of relying on slow relational database table joins, we utilize TigerGraph's Graph Data Science (GDS) library. Specifically, our backend triggers the Weighted Community Detection algorithm (tg_wcc_account_with_weights) to execute deep, multi-hop traversals in milliseconds. This allows the system to autonomously identify high-density money laundering clusters and synthetic identity rings.

Furthermore, the integration is bi-directional and supports real-time database mutations. Features like our "War Games" simulation and "Enterprise Kill Switch" send direct API commands to TigerGraph to instantly insert threat vectors or quarantine compromised nodes, ensuring the active graph schema remains perfectly synced with our React frontend command center.`,
    pptUrl: `https://canva.link/pbbw807yfm1ljbr`,
    githubUrl: `https://github.com/mohammadaves2025-dotcom/SentinelGraph`,
    deployedUrl: `https://sentinel-graph-szgt.vercel.app/`,
    demoUrl: `https://drive.google.com/file/d/1uiMn8_158nCr9ZGRY2XwcfPk-0WwtmLE/view?usp=drive_link`,
  },
  {
    id: `syntax-squad`,
    team: `Syntax_Squad`,
    leader: `Dhairya Bhatnagar`,
    description: `TigerGraph has been integrated into our solution as the relationship intelligence layer of the platform. It helps us model and analyze the complex connections between farmers, crops, soil types, weather conditions, locations, risks, and advisory actions. In our system, each important entity such as a farmer, farm plot, district, crop, weather event, soil condition, disease risk, and government scheme is stored as a node, while their dependencies are stored as edges.

Using this graph structure, we can quickly trace how one factor affects another. For example, if a region is facing low rainfall and high temperature, TigerGraph helps us identify which crops in that region are most vulnerable, which farmers may be affected, and what advisory or insurance support should be recommended. This is much more efficient than using traditional tables when relationships are highly connected and dynamic.

We use TigerGraph to run graph queries for:

crop suitability mapping based on region, soil, and climate
climate risk propagation across nearby areas
linking farmers to the most relevant advisories and schemes
identifying patterns between past weather events and crop outcomes`,
    pptUrl: `https://docs.google.com/presentation/d/1xinbt3z2HI7uQ2ZxPKmnYk-Xq6UJP-ZP/edit?usp=drivesdk&ouid=113931369789073057781&rtpof=true&sd=true`,
    githubUrl: `https://github.com/dhairyabh/VrikshVera`,
    deployedUrl: `https://vrikshvera-2.onrender.com/index.html`,
    demoUrl: `https://jumpshare.com/folder/PCqFp0TRjGXwSgon8GS7`,
  },
  {
    id: `team-neural-naan`,
    team: `Team Neural Naan`,
    leader: `Akritah Sahu`,
    description: `TigerGraph is the core engine of our system, and we have deployed it using TigerGraph Cloud (Savanna) to ensure scalability and real-time access. We model the financial ecosystem as a graph where banks are vertices and relationships such as interbank transfers and shared signals are edges, allowing us to capture the full network structure rather than isolated events.

We implemented multiple GSQL queries to perform graph-native computations. For example, we use graph traversals to detect overlapping signals across institutions, compute a Systemic Fragility Index (SFI) using metrics like connectivity and influence (similar to centrality/PageRank), identify communities or clusters of tightly connected banks, and run cascade simulations to predict how risk would propagate if a particular bank fails. These operations rely on TigerGraph’s strength in multi-hop traversal and real-time graph analytics, which would be inefficient in traditional databases.

Our backend, built with FastAPI, connects to the TigerGraph Cloud instance via REST APIs and triggers these queries dynamically. The results are streamed to the frontend, where they are visualized as a live network, showing risk levels, clusters, and propagation paths.

Additionally, we use TigerGraph to support dynamic data ingestion, where incoming signals and transactions update the graph continuously, enabling real-time recomputation of risk and immediate insights.

Overall, TigerGraph allows us to move from static, isolated analysis to real-time, network-level intelligence and prediction, which is the core innovation of our solution.`,
    pptUrl: `https://drive.google.com/drive/folders/1negV-hhPyXkkgED9F9b2meqLKeAp-kTz?usp=sharing`,
    githubUrl: `https://github.com/akritah/FreezeChain-`,
    deployedUrl: `https://freezechaintigergraph.vercel.app/`,
    demoUrl: `https://drive.google.com/file/d/1Foyb5KQK9oFrHzBOdRTfiNHouBDuGhqO/view?usp=drivesdk`,
  },
  {
    id: `team-reverence`,
    team: `Team Reverence`,
    leader: `Mayank Gaur`,
    description: `Proposed "Wow" Features :

1. The "Welfare Roadmap" (Documentation Chain) 🗺️
Concept: Visualizing how one scheme or document unlocks another.

Graph Power: Finds multi-hop paths between a user's current status and high-value schemes.
Example: "Getting your Income Certificate (Level 1) unlocks Post-Matric Scholarship (Level 2), which provides ₹20,000/year."
Implementation: Model Scheme nodes and Document nodes with REQUIRES and PROVES edges.
2. Multi-Agent Family Optimizer 👨‍👩‍👧‍👦
Concept: Finding the "Global Maximum" benefit for an entire household.

Graph Power: GSQL query that resolves mutual exclusions across family nodes.
Example: "If the grandmother applies for the Old Age Pension, the family income threshold stays low, allowing the son to remain eligible for the Student Scholarship. Total family gain: ₹2,500/month."
Implementation: Model Person nodes connected to a Family vertex.`,
    pptUrl: `https://drive.google.com/drive/folders/16kewcOCxZ8ZO9RZ_x0hNdpAockN-7_Oj?usp=drive_link`,
    githubUrl: `https://github.com/HarshitD0501/Adhikaar`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1ydL8hmq9LXqxAIWFOEjEbgf6v1HYPXZj?usp=sharing`,
  },
  {
    id: `teamoxygen`,
    team: `TeamOxygen`,
    leader: `Krrish Batra`,
    description: `The Goal: It stops duplicate bug reporting. If a broken Navigation Bar is on 100 pages, TigerGraph flags it as 1 root issue that affects 100 pages, rather than 100 separate bugs.
The Connection (tigergraph_repository.py): We use the Python pyTigerGraph SDK to connect securely to your TigerGraph Cloud instance using background, non-blocking threads so it never slows down the scanner.

The Data Pipeline: When the accessibility scanner finds an error, it hashes the broken HTML snippet and pushes it to TigerGraph. TigerGraph automatically maps it: Page -> Contains -> Component -> Triggers -> Violation.

The UI Display (api.py): The React frontend pulls data strictly from TigerGraph. It uses this graph data to render the visual Node/Edge topology in the Dashboard and calculates the exact "Blast Radius" metrics shown in the Graph Insights page.`,
    pptUrl: `https://docs.google.com/presentation/d/12WHnol09YIyT9s7RP5cCohae1Y4TeDef/edit?usp=sharing&ouid=104097112078819198021&rtpof=true&sd=true`,
    githubUrl: `https://github.com/Srijato-05/Web_Accessibility_Auditor`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1JxGJSnVo_vbxzYpOQMyhoMEfKPk35lnW?usp=sharing`,
  },
  {
    id: `tech-stackers`,
    team: `Tech Stackers`,
    leader: `Manish Srivastav`,
    description: `We integrated TigerGraph to build a healthcare knowledge graph that models relationships between symptoms, diseases, and treatments, enabling real-time multi-hop analysis and more accurate, context-aware predictions.`,
    pptUrl: `https://canva.link/2fa3xhgbtpro2xz`,
    githubUrl: `https://github.com/ParthhMahajann/Arogya-AI---Intelligence-for-Better-Health`,
    deployedUrl: `https://arogya-ai-intelligence-for-better-h.vercel.app`,
    demoUrl: `https://youtu.be/kyG_HO0c3lY`,
  },
  {
    id: `techfire`,
    team: `TechFIRE`,
    leader: `ASHUTOSH`,
    description: `We implemented TigerGraph Cloud as our primary Graph Intelligence Engine to replace legacy relational databases for transaction monitoring.

We mapped the banking data as vertices and edges and engineered a custom GSQL algorithm (Detect_4Hop_Cycle_Final) utilizing memory accumulators.

This architecture allows our system to physically traverse relationships and detect complex 4-hop circular money laundering loops in milliseconds without crashing.

Once a hidden network is found, TigerGraph instantly extracts that localized subgraph and routes the JSON payload to our Generative AI layer for reporting.`,
    pptUrl: `https://drive.google.com/file/d/1U_zvVb2bSpd3N3diqfD-by7NuFqhCusy/view?usp=sharing`,
    githubUrl: `https://github.com/Ashutosh-cm/SAR_NARRATIVE`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1zZKsoO2ChFLutec_1f0HluSsuy0yuodA/view?usp=sharing`,
  },
  {
    id: `terminal-thrivers`,
    team: `Terminal Thrivers`,
    leader: `Aditya Singh`,
    description: `We integrated TigerGraph Cloud as the core graph engine for NexusGuard to model complex, multi-hop financial transactions. Using the pyTigerGraph library in our FastAPI backend, we mapped user accounts as vertices and wire transfers as edges. This graph topology allows us to instantly query network features and feed them into our machine learning and Gemini LLM pipeline to detect layered money-laundering patterns in real time.`,
    pptUrl: `https://canva.link/xan3ug4d8ptrbdj`,
    githubUrl: `https://github.com/Alien6093/Nexus-Guard`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/drive/folders/1-kjV5C_K7qJF1fdM6oKW1FpjfaWZVoj6?usp=share_link`,
  },
  {
    id: `the-visionaries`,
    team: `The Visionaries`,
    leader: `Lakshita Deopura`,
    description: `In our solution, we integrated TigerGraph as the core graph database to power real-time, relationship-driven fraud detection. Instead of treating transactions as isolated records, we modeled the entire financial ecosystem as a graph, where entities such as users, accounts, transactions, devices, and IP addresses are represented as nodes, and their interactions are captured as edges. Using TigerGraph’s GSQL query language, we implemented multi-hop traversal queries to detect complex fraud patterns like circular transaction loops, shared device fraud, burst transactions, and money mule networks. These queries run in real time whenever new transactions are ingested, allowing the system to analyze deep connections across multiple hops and uncover hidden fraud rings. Additionally, TigerGraph enables risk propagation, where suspicion associated with one entity spreads across its connected nodes, helping identify broader fraud networks rather than isolated anomalies. The backend services (Node.js and Python) interact with TigerGraph to execute queries, compute risk scores, and generate alerts, which are then pushed to the frontend dashboard. This integration makes TigerGraph the central intelligence layer of the system, enabling scalable, low-latency, and highly accurate fraud detection.`,
    pptUrl: `https://docs.google.com/presentation/d/1cilWEzj753Fem-zSNfVI4BtefeMg3Vk7/edit?usp=sharing&ouid=116319523974649085345&rtpof=true&sd=true`,
    githubUrl: `https://github.com/kunalbubna263/Devcation-26.git`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1EM-6c-ORH521B3z8ioSWZXopgPAt5DFH/view?usp=sharing`,
  },
  {
    id: `the-void`,
    team: `The Void`,
    leader: `The Void`,
    description: `I haven't used Tiger Graph. I have used Graph Database using React.`,
    pptUrl: `https://gamma.app/docs/MedLink-uuhgz7frgqj9kfw`,
    githubUrl: `https://github.com/Adityakumarbhagat/medlink`,
    deployedUrl: `https://medlink-coral.vercel.app/`,
    demoUrl: `https://medlink-coral.vercel.app/`,
  },
  {
    id: `trac`,
    team: `TRACर्कस`,
    leader: `Sahil Raj`,
    description: `I have integrated TigerGraph as the core analytical "brain" of the ShadowFlow solution, specifically designed to bridge the "Visibility Gap" in financial crime.

1. Schema Architecture 
Instead of a standard relational model, I implemented a high-performance graph schema:

Vertices: Account (financial endpoints) and Identity (resolved personas).
Edges: SENT_TO (directional transaction flows) and RESOLVED_AS (identity linkages). This allows for sub-second traversal across millions of transaction hops, which is impossible with traditional SQL JOINs.
2. GSQL Intelligence Engine 
I wrote custom GSQL algorithms to detect patterns characteristic of money laundering:

Circular Loop Detection: A multi-hop traversal query (depth 5+) that flags funds returning to the source via complex intermediary paths—a classic "layering" indicator.
Temporal Velocity Analysis: GSQL aggregations that monitor the speed of fund dispersion. If an account moves funds across multiple continents in a short "high-velocity window," it is automatically flagged for an audit.
3. Next.js Dashboard Integration
The frontend communicates with TigerGraph via REST APIs. When a forensic operator clicks on a node in the Transaction Canvas, the dashboard triggers these GSQL queries in real-time, pulling deep-link insights directly into the Subject Dossier for immediate analysis.`,
    pptUrl: `https://docs.google.com/presentation/d/1Yix70cDq2K4X4SwV4_eGEb-BMqG9SxUo/edit?usp=sharing&ouid=114598214257271647067&rtpof=true&sd=true`,
    githubUrl: `https://github.com/sahilrajpq-create/ShadowFlow-Intelligence`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1Nz-HVvABzsoKi09dpzLRtdXbSptt8yq5/view?usp=drive_link`,
  },
  {
    id: `trial-error`,
    team: `Trial&Error`,
    leader: `Debjit Chowdhury`,
    description: `TigerGraph is used as the core graph database to model the network as nodes (devices, vulnerabilities, attackers) and edges (connections, exploits). Custom GSQL queries are used to detect attack paths and calculate risk. These queries are accessed via REST APIs from the FastAPI backend, which processes the results and sends them to the frontend for visualization and analysis.`,
    pptUrl: `https://1drv.ms/p/c/74a6d886defc4d1e/IQArePC5-vQFRYHmG3iDKHkyASCFemz7hQhlwQopfimSY5E?e=ok4uxx`,
    githubUrl: `https://github.com/designershubh1208-pixel/IntrusionX`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1OySYNz-XAtJhnJEDL9tBZOljVkm91qeS/view?usp=drivesdk`,
  },
  {
    id: `wehavetowin`,
    team: `WeHaveToWin`,
    leader: `Kajal Kaushik`,
    description: `We integrated TigerGraph as the core graph database to model and analyze fraud as a connected network. All entities such as users, bank accounts, phones, devices, IP addresses, and transactions are stored as vertices, while their relationships (like USES_DEVICE, OWNS_ACCOUNT, SENDS, RECEIVES) are stored as edges.

Using TigerGraph’s GSQL queries and graph traversal, we fetch a user’s complete connected network to detect hidden fraud links. We also apply graph-based analysis like connected components to identify fraud rings (clusters) and compute a risk score by measuring how many suspicious connections a user shares.

Finally, the backend communicates with TigerGraph using its REST API, allowing the frontend dashboard to display fraud rings, shortest fraud paths, and real-time risk insights through interactive graph visualizations.`,
    pptUrl: `https://canva.link/71x9hyhre5u01jh`,
    githubUrl: `https://github.com/Kajal-kaushik/tigergraph_fraud_detection`,
    deployedUrl: `https://tigergraph-fraud-detection.vercel.app/`,
    demoUrl: `https://drive.google.com/file/d/1V8qgNNkD1lQG5jyub0rO5Ves5D5i71xM/view?usp=sharing`,
  },
  {
    id: `www-parthtiwari`,
    team: `www.parthtiwari`,
    leader: `Prasoon Sharma`,
    description: `I have integrated tigergraph to connect the data across multiple cloud accounts of AWS or GCP of client and find the biling spikes and zombie resources costing unnecessary bills which is not possible with normal sql or MongoDB`,
    pptUrl: `https://canva.link/s8xuy7fii7p7ix9`,
    githubUrl: `https://github.com/Parthtiw710/Finguard`,
    deployedUrl: null,
    demoUrl: `https://drive.google.com/file/d/1QSAbkXFYYAyTbgnxlNxKYZuwOyw-nKnW/view?usp=drivesdk`,
  },
  {
    id: `zackers`,
    team: `Zackers`,
    leader: `Manya Madaan`,
    description: `TigerGraph is the map of the company.
Every time a prompt enters our system, we draw it on the map — who received it, which AI employee (agent) picked it up, which tool they used, what action they tried to take, and which system they were about to touch.
Our GSQL query then looks at this map and asks — "if this prompt is malicious, how far can the damage spread?" It traces the full path and calculates the total risk across every connected component.
Our /should_execute endpoint is the security guard at the door — no agent can take a real action without asking us first. We check the map, calculate the propagated risk, and respond with allow, warn, or block.
So TigerGraph in our project is not just a database — it's the memory of every attack attempt and the brain behind every block decision.`,
    pptUrl: `https://docs.google.com/presentation/d/1NN6Djd7nN_OVcFbX4ihyssqpES89klFQ/edit?usp=sharing&ouid=112846220416543211888&rtpof=true&sd=true`,
    githubUrl: `https://github.com/mj-does/ai-agent-risk-platform`,
    deployedUrl: null,
    demoUrl: `https://canva.link/rp27w903qkp75ej`,
  },
  {
    id: `zenith`,
    team: `Zenith`,
    leader: `Harsh Raj`,
    description: `We are integrating TigerGraph as the core graph database to model relationships between Patients, Doctors, Specializations, Locations, and Appointments as interconnected graph nodes. This enables efficient multi-hop queries such as "find available cardiologists near a patient's location" — which are complex in relational databases but natural in graph traversal. TigerGraph powers our doctor recommendation engine, helping users find the most relevant doctor based on specialization, proximity, and appointment availability in real time.`,
    pptUrl: `https://drive.google.com/file/d/17chG1IYDf5A24lMxpNL9KNL2RB4f2sb7/view?usp=sharing`,
    githubUrl: `https://github.com/Amresh-01/HealhcareAi-frontend`,
    deployedUrl: `https://healhcare-ai.vercel.app/`,
    demoUrl: `https://youtu.be/rxDtxQUoFe4`,
  },
  {
    id: `zerolatency`,
    team: `ZeroLatency`,
    leader: `Pulkit Singh`,
    description: `We used TigerGraph as the backend database to manage and utilize the relationship between the buyer and seller instead of relying on fixed or hardcoded values.

First, we designed a graph where we created nodes like Buyer and Seller, and connected them using an edge (HISTORY) to represent past interactions between them.

Then, we created a query that traverses from the Buyer to the Seller through this relationship and fetches relevant data like the seller’s price.

After that, our backend makes an API call to TigerGraph and retrieves this data dynamically during each step of negotiation.

Finally, the frontend displays this data in real time, so every negotiation round is influenced by actual graph-based information rather than random values.

In simple terms, TigerGraph helps us make the system more realistic by using relationships and stored data to guide negotiation decisions.`,
    pptUrl: `https://drive.google.com/file/d/1yW08bFjSqB9Qtmlt9w8rbo0vdd4E-Pbz/view?usp=sharing`,
    githubUrl: `https://github.com/pulkit300405/MULTI-AGENTS-NEGOTIATION`,
    deployedUrl: `https://effective-guide-5gw4w9r46x5wfvv4q-3002.app.github.dev`,
    demoUrl: `https://drive.google.com/file/d/1L3rp0ZAVEv211WgaqLQ0dXmsw8KC6nry/view?usp=sharing`,
  },
];
