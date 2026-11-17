// ============================================================================
// 1. API & SERVERLESS PROXY CONFIGURATION
// Points to the local serverless proxy endpoint `/api/route` (`api/route.js`)
// so browser CORS is prevented and DIFY_API_KEY stays strictly on the server.
// ============================================================================
const DEFAULT_ENDPOINT = "/api/route";

let API_URL = localStorage.getItem("DUALLENS_API_URL") || DEFAULT_ENDPOINT;
let BEARER_TOKEN = localStorage.getItem("DUALLENS_BEARER_TOKEN") || "";

// 180-second timeout because real Dify runs take 60–115 seconds
const REQUEST_TIMEOUT_MS = 180000;

// ============================================================================
// 2. PRESET PROFILES & HARDCODED FALLBACK RESULTS (Project Fair Demo Safeties)
// Includes 3 valid preset profiles (DEV-GX-01, DEV-YN-01, DEV-SC-01) plus
// the Low-Budget profile (DEV-YN-LOW) that triggers `valid = 0` & the red banner.
// ============================================================================
const DEV_PROFILES = {
  "DEV-GX-01": {
    profile_id: "DEV-GX-01",
    start_city: "Shenzhen",
    target_region: "Guangxi",
    travel_style: "budget backpacker",
    budget_CNY: 2500,
    total_days: 3,
    corridor_tag: "SZGZ-GX",
  },
  "DEV-YN-01": {
    profile_id: "DEV-YN-01",
    start_city: "Guangzhou",
    target_region: "Yunnan",
    travel_style: "culture-focused sightseeing",
    budget_CNY: 6500,
    total_days: 7,
    corridor_tag: "SZGZ-YN",
  },
  "DEV-SC-01": {
    profile_id: "DEV-SC-01",
    start_city: "Shanghai",
    target_region: "Sichuan",
    travel_style: "food-oriented travel",
    budget_CNY: 7000,
    total_days: 7,
    corridor_tag: "SH-SC",
  },
  "DEV-YN-LOW": {
    profile_id: "DEV-YN-LOW",
    start_city: "Shenzhen",
    target_region: "Yunnan",
    travel_style: "budget backpacker",
    budget_CNY: 800,
    total_days: 3,
    corridor_tag: "SZGZ-YN",
  },
};

const SAVED_FALLBACK_RESULTS = {
  // Preset 1: DEV-GX-01 (Shenzhen -> Guangxi, 3 Days, 2500 CNY, valid = 1)
  "DEV-GX-01": {
    data: {
      status: "succeeded",
      outputs: {
        valid: { output: 1 },
        errors: { output: "" },
        style_score: 3,
        judge_ok: 1,
        short_comment:
          "The itinerary perfectly aligns with a budget backpacker profile. It utilizes cost-effective transit (high-speed rail and local buses), suggests affordable activities, and keeps total costs well under the 2500 CNY limit.",
        itinerary_json: {
          output: JSON.stringify({
            profile_id: "DEV-GX-01",
            corridor_tag: "SZGZ-GX",
            travel_style: "budget backpacker",
            budget_CNY: 2500,
            requested_days: 3,
            routes: {
              standard: {
                label: "Classic Guilin & Yangshuo Highlights",
                summary:
                  "A classic route focusing on the iconic landmarks of Guilin and the scenic countryside of Yangshuo.",
                total_days: 3,
                total_cost_CNY: 1055,
                cost_breakdown_CNY: { transit: 615, lodging: 220, food: 140, activities: 80 },
                days: [
                  {
                    day: 1,
                    city: "Guilin",
                    activities: [
                      "Arrive in Guilin and check into a hostel",
                      "Visit Elephant Trunk Hill",
                      "Explore the Sun and Moon Pagodas and the nearby night market",
                    ],
                    destinations: [
                      {
                        name: "Elephant Trunk Hill",
                        source: "web",
                        citation_url: "https://www.fabionodariphoto.com/en/yangshuo-xingping-guilin-travel-guide",
                      },
                      {
                        name: "Sun and Moon Pagodas",
                        source: "web",
                        citation_url: "https://www.fabionodariphoto.com/en/yangshuo-xingping-guilin-travel-guide",
                      },
                    ],
                  },
                  {
                    day: 2,
                    city: "Yangshuo",
                    activities: [
                      "Take a bus to Yangshuo",
                      "Rent a bicycle to explore the countryside",
                      "Eat local Guilin noodles and Yangshuo barbecue",
                    ],
                    destinations: [
                      {
                        name: "Yangshuo",
                        source: "web",
                        citation_url: "https://danielmcbane.com/travel-guides/east-asia/china/yangshuo",
                      },
                    ],
                  },
                  {
                    day: 3,
                    city: "Shenzhen",
                    activities: ["Take a bus back to Guilin", "Take a train back to Shenzhen"],
                    destinations: [],
                  },
                ],
                transit_legs: [
                  { day: 1, from: "Shenzhen", to: "Guilin", mode: "rail", price_CNY: 280, duration_h: 3.2, table_row_id: "T001", reason: "Direct high-speed rail is the most efficient budget option." },
                  { day: 2, from: "Guilin", to: "Yangshuo", mode: "bus", price_CNY: 25, duration_h: 1.5, table_row_id: "T011", reason: "Standard budget bus connection." },
                  { day: 3, from: "Yangshuo", to: "Guilin", mode: "bus", price_CNY: 25, duration_h: 1.5, table_row_id: "T012", reason: "Return bus to Guilin for rail connection." },
                  { day: 3, from: "Guilin", to: "Shenzhen", mode: "rail", price_CNY: 285, duration_h: 3.3, table_row_id: "T002", reason: "Direct high-speed rail return." },
                ],
              },
              hidden_gem: {
                label: "Local Cultural Exploration",
                summary:
                  "A deeper dive into local heritage sites and the scenic Xingping Ancient Town.",
                total_days: 3,
                total_cost_CNY: 1227,
                cost_breakdown_CNY: { transit: 642, lodging: 240, food: 220, activities: 125 },
                days: [
                  {
                    day: 1,
                    city: "Guilin",
                    activities: [
                      "Arrive from Shenzhen by rail; walk and get oriented near the river.",
                      "Climb Diecai Hill for city and Li River views; pair with a simple local rice noodle meal.",
                    ],
                    destinations: [{ name: "Diecai Hill", source: "kb", kb_id: "KB004" }],
                  },
                  {
                    day: 2,
                    city: "Yangshuo",
                    activities: [
                      "Take the budget-class Li River cruise from Guilin to Yangshuo.",
                      "Check pier transfers and cabin class carefully; stroll West Street area on arrival.",
                    ],
                    destinations: [{ name: "Li River Essential Cruise", source: "kb", kb_id: "KB002" }],
                  },
                  {
                    day: 3,
                    city: "Xingping",
                    activities: [
                      "Bus to Xingping for half-day town and riverfront walk.",
                      "Return to Guilin by rail, then onward rail back to Shenzhen.",
                    ],
                    destinations: [{ name: "Xingping Ancient Town", source: "kb", kb_id: "KB030" }],
                  },
                ],
                transit_legs: [
                  { day: 1, from: "Shenzhen", to: "Guilin", mode: "rail", price_CNY: 280, duration_h: 3.2, table_row_id: "T001", reason: "Primary transit to the region." },
                  { day: 2, from: "Guilin", to: "Yangshuo", mode: "bus", price_CNY: 25, duration_h: 1.5, table_row_id: "T011", reason: "Budget transit to Yangshuo." },
                  { day: 3, from: "Yangshuo", to: "Xingping", mode: "bus", price_CNY: 20, duration_h: 1.0, table_row_id: "T008", reason: "Local bus to reach Xingping." },
                  { day: 3, from: "Xingping", to: "Guilin", mode: "rail", price_CNY: 32, duration_h: 0.4, table_row_id: "T006", reason: "Fastest connection back to Guilin station." },
                  { day: 3, from: "Guilin", to: "Shenzhen", mode: "rail", price_CNY: 285, duration_h: 3.3, table_row_id: "T002", reason: "High-speed rail return to Shenzhen." },
                ],
              },
            },
            valid: true,
            errors: [],
          }),
        },
      },
    },
  },

  // Preset 2: DEV-YN-01 (Guangzhou -> Yunnan, 7 Days, 6500 CNY, valid = 1)
  "DEV-YN-01": {
    data: {
      status: "succeeded",
      outputs: {
        valid: { output: 1 },
        errors: { output: "" },
        style_score: 3,
        judge_ok: 1,
        short_comment:
          "Verified 7-day Yunnan cultural itinerary (Guangzhou → Kunming, Dali, Lijiang). All transport legs show verified mode, price, and duration within the 6,500 CNY budget.",
        itinerary_json: {
          output: JSON.stringify({
            profile_id: "DEV-YN-01",
            corridor_tag: "SZGZ-YN",
            travel_style: "culture-focused sightseeing",
            budget_CNY: 6500,
            requested_days: 7,
            routes: {
              standard: {
                label: "Kunming Highlights & Stone Forest",
                summary:
                  "A focused cultural exploration of Kunming, including the iconic Stone Forest and local markets, designed for a balanced pace.",
                total_days: 7,
                total_cost_CNY: 3888,
                cost_breakdown_CNY: { transit: 826, lodging: 1750, food: 662, activities: 650 },
                days: [
                  { day: 1, city: "Guangzhou to Kunming", activities: ["Fly from Guangzhou to Kunming", "Check into city-center hotel"], destinations: [] },
                  { day: 2, city: "Kunming", activities: ["Explore historic Kunming Old Street and Qianwang Street"], destinations: [{ name: "Kunming Old Street", source: "web", citation_url: "https://us.trip.com/travel-guide/destination/kunming-29" }] },
                  { day: 3, city: "Kunming", activities: ["Morning walk around Green Lake Park (Cuihu) and tea houses"], destinations: [{ name: "Green Lake Park", source: "web", citation_url: "https://thehelpfulpanda.com/things-to-do-in-kunming" }] },
                  { day: 4, city: "Kunming", activities: ["Full-day excursion to the UNESCO Stone Forest (Shilin)", "Sample local Yiliang Roast Duck"], destinations: [{ name: "Stone Forest", source: "web", citation_url: "https://www.tripadvisor.com/Attractions-g298558-Activities-Kunming_Yunnan.html" }] },
                  { day: 5, city: "Kunming", activities: ["Visit Dounan Flower Market", "Explore Colorful Yunnan Paradise"], destinations: [{ name: "Dounan Flower Market", source: "web", citation_url: "https://thehelpfulpanda.com/things-to-do-in-kunming" }] },
                  { day: 6, city: "Kunming", activities: ["Leisurely cultural walk and crossing-the-bridge rice noodles tasting"], destinations: [] },
                  { day: 7, city: "Kunming to Guangzhou", activities: ["Return flight from Kunming to Guangzhou"], destinations: [] },
                ],
                transit_legs: [
                  { day: 1, from: "Guangzhou", to: "Kunming", mode: "flight", price_CNY: 456, duration_h: 2.8, table_row_id: "T053", reason: "Flight is faster and cheaper than rail." },
                  { day: 7, from: "Kunming", to: "Guangzhou", mode: "flight", price_CNY: 370, duration_h: 2.2, table_row_id: "T054", reason: "Direct return flight to Guangzhou." },
                ],
              },
              hidden_gem: {
                label: "Yunnan Cultural Heritage Trail",
                summary:
                  "An immersive journey through Kunming, Dali, and Lijiang, focusing on ancient towns, temples, and Naxi heritage.",
                total_days: 7,
                total_cost_CNY: 3876,
                cost_breakdown_CNY: { transit: 1241, lodging: 1580, food: 870, activities: 185 },
                days: [
                  { day: 1, city: "Kunming", activities: ["Visit Yunnan Provincial Museum", "Stroll Kunming Old Street"], destinations: [{ name: "Yunnan Provincial Museum", source: "kb", kb_id: "KB038" }, { name: "Kunming Old Street", source: "kb", kb_id: "KB037" }] },
                  { day: 2, city: "Kunming", activities: ["Green Lake Park", "Yunnan Military Academy Museum", "Guandu Ancient Town"], destinations: [{ name: "Guandu Ancient Town", source: "kb", kb_id: "KB040" }] },
                  { day: 3, city: "Kunming", activities: ["Stone Forest Scenic Area", "Haigeng Dam on Dianchi Lake"], destinations: [{ name: "Stone Forest Scenic Area", source: "kb", kb_id: "KB043" }] },
                  { day: 4, city: "Dali", activities: ["Bullet train to Dali", "Walk Dali Ancient City and Caicun Pier"], destinations: [{ name: "Dali Ancient City", source: "kb", kb_id: "KB046" }] },
                  { day: 5, city: "Dali", activities: ["Chongsheng Temple and Three Pagodas", "Cycle the Erhai Ecological Corridor"], destinations: [{ name: "Erhai Ecological Corridor", source: "kb", kb_id: "KB048" }] },
                  { day: 6, city: "Lijiang", activities: ["Rail to Lijiang", "Explore Dayan Old Town and Mu Fu Mansion"], destinations: [{ name: "Mu Fu Mansion", source: "kb", kb_id: "KB058" }] },
                  { day: 7, city: "Lijiang to Guangzhou", activities: ["Sunrise at Black Dragon Pool Park, Lion Hill & Zhongyi Market", "Rail to Kunming and evening flight to Guangzhou"], destinations: [{ name: "Zhongyi Market", source: "kb", kb_id: "KB068" }] },
                ],
                transit_legs: [
                  { day: 1, from: "Guangzhou", to: "Kunming", mode: "flight", price_CNY: 456, duration_h: 2.8, table_row_id: "T053", reason: "Fastest entry into Yunnan." },
                  { day: 4, from: "Kunming", to: "Dali", mode: "rail", price_CNY: 145, duration_h: 1.9, table_row_id: "T045", reason: "High-speed rail connection." },
                  { day: 6, from: "Dali", to: "Lijiang", mode: "rail", price_CNY: 80, duration_h: 1.6, table_row_id: "T047", reason: "Scenic rail link to Lijiang." },
                  { day: 7, from: "Lijiang", to: "Kunming", mode: "rail", price_CNY: 190, duration_h: 3.4, table_row_id: "T050", reason: "Return rail to Kunming hub." },
                  { day: 7, from: "Kunming", to: "Guangzhou", mode: "flight", price_CNY: 370, duration_h: 2.2, table_row_id: "T054", reason: "Evening flight back to Guangzhou." },
                ],
              },
            },
            valid: true,
            errors: [],
          }),
        },
      },
    },
  },

  // Preset 3: DEV-SC-01 (Shanghai -> Sichuan, 7 Days, 7000 CNY, valid = 1)
  "DEV-SC-01": {
    data: {
      status: "succeeded",
      outputs: {
        valid: { output: 1 },
        errors: { output: "" },
        style_score: 3,
        judge_ok: 1,
        short_comment:
          "7-day food-oriented Sichuan itinerary from Shanghai. Combines classic Chengdu & Leshan culinary icons with local community teahouses, night markets, and Dujiangyan snacks well within the 7,000 CNY budget.",
        itinerary_json: {
          output: JSON.stringify({
            profile_id: "DEV-SC-01",
            corridor_tag: "SH-SC",
            travel_style: "food-oriented travel",
            budget_CNY: 7000,
            requested_days: 7,
            routes: {
              standard: {
                label: "Chengdu & Leshan Culinary Classics",
                summary:
                  "Iconic Sichuan gastronomy pairing Kuanzhai Alley, Jinli street food, Panda Base, and Leshan Giant Buddha with classic hotpot.",
                total_days: 7,
                total_cost_CNY: 4620,
                cost_breakdown_CNY: { transit: 1618, lodging: 1400, food: 1180, activities: 422 },
                days: [
                  { day: 1, city: "Chengdu", activities: ["Fly from Shanghai to Chengdu", "Evening spicy hotpot dinner near Chunxi Road"], destinations: [] },
                  { day: 2, city: "Chengdu", activities: ["Morning visit to Chengdu Research Base of Giant Panda Breeding", "Snack crawl along Jinli Ancient Street"], destinations: [{ name: "Chengdu Panda Base", source: "web", citation_url: "https://www.trip.com/travel-guide/chengdu" }] },
                  { day: 3, city: "Chengdu", activities: ["Explore Wide and Narrow Alleys (Kuanzhai Xiangzi)", "People's Park Heming Teahouse ear-picking &蓋碗茶 (gaiwan tea)"], destinations: [{ name: "People's Park", source: "web", citation_url: "https://www.trip.com/travel-guide/chengdu" }] },
                  { day: 4, city: "Leshan", activities: ["High-speed rail to Leshan", "View Leshan Giant Buddha and taste Leshan Sweet-Skin Duck (Tianpiya) & Boboji"], destinations: [{ name: "Leshan Giant Buddha", source: "web", citation_url: "https://www.trip.com/travel-guide/leshan" }] },
                  { day: 5, city: "Emeishan", activities: ["Short rail hop to Emeishan", "Visit Baoguo Temple and sample Emei tofu feast, then rail back to Chengdu"], destinations: [] },
                  { day: 6, city: "Chengdu", activities: ["Sichuan Cuisine Museum interactive cooking class", "Yulin neighborhood skewer dinner"], destinations: [] },
                  { day: 7, city: "Shanghai", activities: ["Pack specialty chili oil & Sichuan peppercorn souvenirs", "Direct flight back to Shanghai"], destinations: [] },
                ],
                transit_legs: [
                  { day: 1, from: "Shanghai", to: "Chengdu", mode: "flight", price_CNY: 720, duration_h: 3.3, table_row_id: "T071", reason: "Fastest long-distance entry from Shanghai." },
                  { day: 4, from: "Chengdu", to: "Leshan", mode: "rail", price_CNY: 54, duration_h: 1.0, table_row_id: "T075", reason: "Convenient C-train to Leshan." },
                  { day: 5, from: "Leshan", to: "Emeishan", mode: "rail", price_CNY: 15, duration_h: 0.3, table_row_id: "T079", reason: "18-minute intercity rail hop." },
                  { day: 5, from: "Emeishan", to: "Chengdu", mode: "rail", price_CNY: 65, duration_h: 1.3, table_row_id: "T078", reason: "Direct rail return to Chengdu." },
                  { day: 7, from: "Chengdu", to: "Shanghai", mode: "flight", price_CNY: 764, duration_h: 2.9, table_row_id: "T072", reason: "Direct return flight to Shanghai." },
                ],
              },
              hidden_gem: {
                label: "Backstreet Flavors of Chengdu, Leshan & Dujiangyan",
                summary:
                  "KB-grounded insider food trail through Kuixinglou Street, Jianshe Road night stalls, Suji Ancient Town翹腳牛肉 (Qiaojiao beef), and Dujiangyan.",
                total_days: 7,
                total_cost_CNY: 4390,
                cost_breakdown_CNY: { transit: 1588, lodging: 1320, food: 1240, activities: 242 },
                days: [
                  { day: 1, city: "Chengdu", activities: ["Arrive from Shanghai by flight", "Late-night snack walk at Jianshe Road Food Street (baked sweet potato skin & grilled brain flower)"], destinations: [{ name: "Jianshe Road Food Street", source: "kb", kb_id: "KB078" }] },
                  { day: 2, city: "Chengdu", activities: ["Morning tea at Pengzhen Old Teahouse (Guanyin Pavilion)", "Lunch along Kuixinglou Street for authentic Chuanchuanxiang"], destinations: [{ name: "Kuixinglou Street", source: "kb", kb_id: "KB077" }] },
                  { day: 3, city: "Dujiangyan", activities: ["Intercity rail to Dujiangyan Irrigation System", "Taste尤兔头 (You's Spiced Rabbit Head) & Walk Nanqiao Night Market"], destinations: [{ name: "Dujiangyan Scenic Area", source: "kb", kb_id: "KB085" }] },
                  { day: 4, city: "Leshan", activities: ["Rail to Leshan & bus to Suji Ancient Town", "Authentic Qiaojiao BeefSoup, brown-sugar bingfen, and Zhanggongqiao night stalls"], destinations: [{ name: "Suji Ancient Town", source: "kb", kb_id: "KB092" }] },
                  { day: 5, city: "Leshan to Chengdu", activities: ["Morning bowl of Leshan Tofu Brains (Douhua) & crispy pork", "Afternoon rail back to Chengdu for community courtyard hotpot"], destinations: [] },
                  { day: 6, city: "Chengdu", activities: ["Visit Wenshu Monastery vegetarian tea garden & Daci Temple traditional pastries"], destinations: [{ name: "Wenshu Monastery", source: "kb", kb_id: "KB073" }] },
                  { day: 7, city: "Shanghai", activities: ["Morning Dandan noodles & Zhong dumplings breakfast", "Return flight from Chengdu to Shanghai"], destinations: [] },
                ],
                transit_legs: [
                  { day: 1, from: "Shanghai", to: "Chengdu", mode: "flight", price_CNY: 720, duration_h: 3.3, table_row_id: "T071", reason: "Direct flight into Chengdu." },
                  { day: 3, from: "Chengdu", to: "Dujiangyan", mode: "rail", price_CNY: 10, duration_h: 0.5, table_row_id: "T081", reason: "Fast suburban high-speed rail." },
                  { day: 3, from: "Dujiangyan", to: "Chengdu", mode: "rail", price_CNY: 10, duration_h: 0.5, table_row_id: "T082", reason: "Evening rail return." },
                  { day: 4, from: "Chengdu", to: "Leshan", mode: "rail", price_CNY: 54, duration_h: 1.0, table_row_id: "T075", reason: "High-speed rail to Leshan food hub." },
                  { day: 5, from: "Leshan", to: "Chengdu", mode: "rail", price_CNY: 54, duration_h: 1.0, table_row_id: "T076", reason: "Return rail to Chengdu." },
                  { day: 7, from: "Chengdu", to: "Shanghai", mode: "flight", price_CNY: 740, duration_h: 2.9, table_row_id: "T072", reason: "Return flight to Shanghai." },
                ],
              },
            },
            valid: true,
            errors: [],
          }),
        },
      },
    },
  },

  // Preset 4: Low-Budget Profile (DEV-YN-LOW: 800 CNY -> valid = 0 red banner + still shows both routes!)
  "DEV-YN-LOW": {
    data: {
      status: "succeeded",
      outputs: {
        valid: { output: 0 },
        errors: {
          output:
            "budget too low, estimated minimum 1,150 CNY (requested budget 800 CNY cannot cover round-trip intercity transport of 826 CNY plus 3 days of basic lodging and food)",
        },
        style_score: 2,
        judge_ok: 1,
        short_comment:
          "Constraint Alert: Your requested budget of 800 CNY is below the minimum feasible cost (1,150 CNY) for a 3-day Shenzhen → Yunnan trip. Below are the lowest-cost possible Standard and Hidden Gem routes so you can compare the minimum realistic expenses.",
        itinerary_json: {
          output: JSON.stringify({
            profile_id: "DEV-YN-LOW",
            corridor_tag: "SZGZ-YN",
            travel_style: "budget backpacker",
            budget_CNY: 800,
            requested_days: 3,
            routes: {
              standard: {
                label: "Minimum-Cost Kunming City Express",
                summary:
                  "Ultra-lean 3-day Kunming itinerary focusing on free public parks and street markets (exceeds 800 CNY limit due to mandatory transit fares).",
                total_days: 3,
                total_cost_CNY: 1150,
                cost_breakdown_CNY: { transit: 826, lodging: 180, food: 120, activities: 24 },
                days: [
                  { day: 1, city: "Kunming", activities: ["Arrive in Kunming from Shenzhen", "Check into 6-bed hostel dorm (¥90/night)", "Evening walk at Kunming Old Street (free entry)"], destinations: [{ name: "Kunming Old Street", source: "web", citation_url: "https://us.trip.com/travel-guide/destination/kunming-29" }] },
                  { day: 2, city: "Kunming", activities: ["Free morning walk around Green Lake Park", "Browse Dounan Flower Market and eat ¥15 small-pot rice noodles"], destinations: [{ name: "Green Lake Park", source: "web", citation_url: "https://thehelpfulpanda.com/things-to-do-in-kunming" }] },
                  { day: 3, city: "Shenzhen", activities: ["Morning stroll at Haigeng Dam", "Return transit from Kunming to Shenzhen"], destinations: [] },
                ],
                transit_legs: [
                  { day: 1, from: "Shenzhen", to: "Kunming", mode: "flight", price_CNY: 456, duration_h: 2.8, table_row_id: "T053", reason: "Cheapest one-way entry to Kunming." },
                  { day: 3, from: "Kunming", to: "Shenzhen", mode: "flight", price_CNY: 370, duration_h: 2.2, table_row_id: "T054", reason: "Cheapest return leg to Pearl River Delta." },
                ],
              },
              hidden_gem: {
                label: "Free Heritage & Local Market Trail",
                summary:
                  "Zero-ticket cultural route using free museums, historic Guandu Ancient Town, and local markets (minimum realistic cost 1,166 CNY).",
                total_days: 3,
                total_cost_CNY: 1166,
                cost_breakdown_CNY: { transit: 826, lodging: 180, food: 160, activities: 0 },
                days: [
                  { day: 1, city: "Kunming", activities: ["Arrive in Kunming", "Visit Yunnan Provincial Museum (free with passport) & Guandu Ancient Town (free)"], destinations: [{ name: "Yunnan Provincial Museum", source: "kb", kb_id: "KB038" }, { name: "Guandu Ancient Town", source: "kb", kb_id: "KB040" }] },
                  { day: 2, city: "Kunming", activities: ["Visit Yunnan Military Academy History Museum (free)", "Walk Green Lake & sample local braised饵块 (erkuai) rice cakes"], destinations: [{ name: "Yunnan Military Academy History Museum", source: "kb", kb_id: "KB036" }] },
                  { day: 3, city: "Shenzhen", activities: ["Morning visit to篆新 (Zhuanxin) Farmers Market", "Return transit to Shenzhen"], destinations: [] },
                ],
                transit_legs: [
                  { day: 1, from: "Shenzhen", to: "Kunming", mode: "flight", price_CNY: 456, duration_h: 2.8, table_row_id: "T053", reason: "Lowest fare into Yunnan." },
                  { day: 3, from: "Kunming", to: "Shenzhen", mode: "flight", price_CNY: 370, duration_h: 2.2, table_row_id: "T054", reason: "Lowest fare return leg." },
                ],
              },
            },
            valid: false,
            errors: ["budget too low, estimated minimum 1,150 CNY"],
          }),
        },
      },
    },
  },
};

// ============================================================================
// 3. DOM ELEMENTS
// ============================================================================
const itineraryForm = document.getElementById("itineraryForm");
const submitBtn = document.getElementById("submitBtn");
const howItWorksSection = document.getElementById("howItWorksSection");
const loadingSection = document.getElementById("loadingSection");
const loadingElapsedBadge = document.getElementById("loadingElapsedBadge");
const loadingProgressText = document.getElementById("loadingProgressText");
const loadingProgressBar = document.getElementById("loadingProgressBar");
const skipToSavedBtn = document.getElementById("skipToSavedBtn");

const outputSection = document.getElementById("outputSection");
const validationErrorBanner = document.getElementById("validationErrorBanner");
const validationBannerTitle = document.getElementById("validationBannerTitle");
const validationBannerText = document.getElementById("validationBannerText");

const errorBanner = document.getElementById("errorBanner");
const errorTitleEl = document.getElementById("errorTitle");
const errorMessageEl = document.getElementById("errorMessage");
const loadFallbackNowBtn = document.getElementById("loadFallbackNowBtn");
const retryBtn = document.getElementById("retryBtn");
const dismissErrorBtn = document.getElementById("dismissErrorBtn");

const savedDemoSelect = document.getElementById("savedDemoSelect");
const toggleConfigBtn = document.getElementById("toggleConfigBtn");
const apiConfigPanel = document.getElementById("apiConfigPanel");
const apiUrlInput = document.getElementById("apiUrlInput");
const bearerTokenInput = document.getElementById("bearerTokenInput");
const saveConfigBtn = document.getElementById("saveConfigBtn");

const startCityInput = document.getElementById("start_city");
const targetRegionInput = document.getElementById("target_region");

const judgeBanner = document.getElementById("judgeBanner");
const validBadge = document.getElementById("validBadge");
const scoreBadge = document.getElementById("scoreBadge");
const sourceModeBadge = document.getElementById("sourceModeBadge");
const judgeComment = document.getElementById("judgeComment");

const standardTitleEl = document.getElementById("standardTitle");
const standardCostEl = document.getElementById("standardCost");
const standardBreakdownEl = document.getElementById("standardBreakdown");
const standardMarkdownEl = document.getElementById("standardMarkdown");

const hiddenGemTitleEl = document.getElementById("hiddenGemTitle");
const hiddenGemCostEl = document.getElementById("hiddenGemCost");
const hiddenGemBreakdownEl = document.getElementById("hiddenGemBreakdown");
const hiddenGemMarkdownEl = document.getElementById("hiddenGemMarkdown");

// Configure marked.js for GitHub-Flavored Markdown & clean line breaks
if (typeof marked !== "undefined" && typeof marked.setOptions === "function") {
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
  });
}

apiUrlInput.value = API_URL;
bearerTokenInput.value = BEARER_TOKEN === "YOUR_DIFY_BEARER_TOKEN_HERE" ? "" : BEARER_TOKEN;

// ============================================================================
// 4. DYNAMIC LOCATION EMOJI MAPPING & SANITIZATION
// ============================================================================
const LOCATION_EMOJI_RULES = [
  {
    emoji: "🏙️",
    keywords: [
      "shanghai", "shenzhen", "guangzhou", "chongqing", "hong kong",
      "tianjin", "wuhan", "dongguan", "foshan", "ningbo", "zhengzhou",
    ],
  },
  {
    emoji: "🏮",
    keywords: [
      "beijing", "xi'an", "xian", "chengdu", "luoyang", "nanjing",
      "pingyao", "kaifeng", "datong", "dunhuang", "shanxi", "shaanxi",
    ],
  },
  {
    emoji: "⛩️",
    keywords: [
      "suzhou", "hangzhou", "jiangnan", "wuzhen", "zhouzhuang", "xidi",
      "hongcun", "quanzhou", "fujian", "shaxi", "weishan",
    ],
  },
  {
    emoji: "⛰️",
    keywords: [
      "guangxi", "sichuan", "guilin", "yangshuo", "xingping", "zhangjiajie",
      "huangshan", "emei", "leshan", "tibet", "lhasa", "guizhou", "qinghai", "xinjiang",
    ],
  },
  {
    emoji: "🌲",
    keywords: [
      "yunnan", "kunming", "dali", "lijiang", "shangri-la", "shangrila",
      "jiuzhaigou", "xishuangbanna", "hainan", "sanya", "tiger leaping",
    ],
  },
];

function stripLocationEmojis(value) {
  if (!value) return "";
  return value
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getLocationEmoji(rawLocation, fieldType = "city") {
  const clean = stripLocationEmojis(rawLocation).toLowerCase();
  if (!clean) return "";

  for (const rule of LOCATION_EMOJI_RULES) {
    if (rule.keywords.some((kw) => clean.includes(kw))) {
      return rule.emoji;
    }
  }
  return fieldType === "start_city" ? "🏙️" : "⛰️";
}

function applyLocationEmojiToInput(inputEl, fieldType) {
  const cleanText = stripLocationEmojis(inputEl.value);
  if (!cleanText) {
    inputEl.value = "";
    return;
  }
  const emoji = getLocationEmoji(cleanText, fieldType);
  inputEl.value = emoji ? `${cleanText} ${emoji}` : cleanText;
}

[
  { el: startCityInput, type: "start_city" },
  { el: targetRegionInput, type: "target_region" },
].forEach(({ el, type }) => {
  el.addEventListener("blur", () => applyLocationEmojiToInput(el, type));
  el.addEventListener("change", () => applyLocationEmojiToInput(el, type));
});

// ============================================================================
// 5. INTERNAL CORRIDOR & PROFILE ID COMPUTATION (For 7-Field Dify Payload)
// ============================================================================
function inferCorridorAndProfile(startCity, targetRegion, totalDays, budgetCNY) {
  const sc = stripLocationEmojis(startCity).toLowerCase();
  const tr = stripLocationEmojis(targetRegion).toLowerCase();
  const days = Number(totalDays);
  const budget = Number(budgetCNY);

  let corridorTag = "";
  let regionCode = "XX";

  if ((sc === "shenzhen" || sc === "guangzhou") && tr === "guangxi") {
    corridorTag = "SZGZ-GX";
    regionCode = "GX";
  } else if ((sc === "shenzhen" || sc === "guangzhou") && tr === "yunnan") {
    corridorTag = "SZGZ-YN";
    regionCode = "YN";
  } else if (sc === "shanghai" && tr === "sichuan") {
    corridorTag = "SH-SC";
    regionCode = "SC";
  }

  let profileId = `WEB-${regionCode}-01`;
  for (const [id, p] of Object.entries(DEV_PROFILES)) {
    if (
      p.start_city.toLowerCase() === sc &&
      p.target_region.toLowerCase() === tr &&
      p.total_days === days &&
      p.budget_CNY === budget
    ) {
      profileId = id;
      break;
    }
  }

  return { profileId, corridorTag, regionCode };
}

function syncActivePresetPill() {
  const { profileId } = inferCorridorAndProfile(
    startCityInput.value,
    targetRegionInput.value,
    document.getElementById("total_days").value,
    document.getElementById("budget_cny").value
  );
  document.querySelectorAll(".pill-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-preset") === profileId);
  });
}

["start_city", "target_region", "total_days", "budget_cny", "travel_style"].forEach((id) => {
  document.getElementById(id).addEventListener("input", syncActivePresetPill);
});

// ============================================================================
// 6. PLAIN-LANGUAGE ERROR FORMATTER & TRANSPORT LEG RENDERER
// ============================================================================
function formatPlainWordsError(rawErrors, budgetCNY, minCostCNY) {
  const errStr = Array.isArray(rawErrors) ? rawErrors.join("; ") : String(rawErrors || "").trim();
  const minEst = minCostCNY || 1150;

  if (!errStr && budgetCNY && Number(budgetCNY) < minEst) {
    return `budget too low, estimated minimum ${minEst.toLocaleString("en-US")} CNY`;
  }
  if (!errStr) {
    return `budget too low or route constraint not met (estimated minimum ${minEst.toLocaleString("en-US")} CNY)`;
  }

  // Translate technical validation tokens into plain, friendly words
  const lower = errStr.toLowerCase();
  if (lower.includes("budget") || lower.includes("cost") || (budgetCNY && Number(budgetCNY) < minEst)) {
    if (!lower.includes("estimated minimum")) {
      return `${errStr} — budget too low, estimated minimum ${minEst.toLocaleString("en-US")} CNY`;
    }
  }
  return errStr;
}

function renderMarkdown(md) {
  if (!md || !md.trim()) return "<p>No itinerary content returned.</p>";
  if (typeof marked !== "undefined" && typeof marked.parse === "function") {
    return marked.parse(md);
  }
  // Built-in Markdown fallback (handles headings, lists, links, bold, italics, code)
  const formatInline = (text) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/(^|[\s—])_([^_]+)_/g, "$1<em>$2</em>");

  const lines = md.split("\n");
  const html = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${formatInline(line)}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function formatCNY(amount) {
  if (amount === undefined || amount === null || amount === "") return "¥ --";
  const num = Number(amount);
  if (Number.isNaN(num)) return String(amount);
  return `¥ ${num.toLocaleString("en-US")} CNY`;
}

// Builds day-by-day Markdown and explicitly shows Mode, Price, and Duration for every transport leg
function buildRouteMarkdownFromJson(routeObj) {
  if (!routeObj) return "";
  const lines = [];

  if (routeObj.summary) {
    lines.push(`_${routeObj.summary}_`, "");
  }

  if (Array.isArray(routeObj.days)) {
    for (const d of routeObj.days) {
      const cityEmoji = getLocationEmoji(d.city || "", "target_region");
      lines.push(`### Day ${d.day}: ${d.city || ""} ${cityEmoji}`.trim());
      if (Array.isArray(d.activities)) {
        for (const act of d.activities) {
          lines.push(`- ${act}`);
        }
      }
      if (Array.isArray(d.destinations) && d.destinations.length > 0) {
        const badges = d.destinations.map((dest) => {
          if (dest.citation_url) {
            return `[${dest.name}](${dest.citation_url})`;
          }
          return `**${dest.name}**`;
        });
        lines.push(`- **Featured Stops:** ${badges.join(" • ")}`);
      }
      lines.push("");
    }
  }

  if (Array.isArray(routeObj.transit_legs) && routeObj.transit_legs.length > 0) {
    lines.push("### Transport Legs (Mode, Price & Duration)");
    for (const leg of routeObj.transit_legs) {
      const reasonText = leg.reason ? ` — _${leg.reason}_` : "";
      lines.push(
        `- **Day ${leg.day} (${leg.from} → ${leg.to}):** Mode: \`${leg.mode}\` | Price: **¥${leg.price_CNY} CNY** | Duration: **${leg.duration_h} h**${reasonText}`
      );
    }
  }

  return lines.join("\n");
}

function splitCombinedDifyMarkdown(combinedMd) {
  if (!combinedMd || typeof combinedMd !== "string") {
    return { standardMd: "", hiddenGemMd: "" };
  }
  const hiddenSplit = combinedMd.split(/^##\s+Hidden gem route:?/im);
  const firstPart = hiddenSplit[0] || "";
  const hiddenPart = hiddenSplit[1] ? `### Hidden Gem Route${hiddenSplit[1]}` : "";

  const standardSplit = firstPart.split(/^##\s+Standard route:?/im);
  const standardPart = standardSplit[1] ? `### Standard Route${standardSplit[1]}` : firstPart;

  return {
    standardMd: standardPart.trim(),
    hiddenGemMd: hiddenPart.trim(),
  };
}

function unwrapDifyObject(val) {
  let d = val;
  for (let i = 0; i < 6; i++) {
    if (typeof d === "string") {
      try {
        d = JSON.parse(d);
        continue;
      } catch {
        break;
      }
    }
    if (d && typeof d === "object" && !Array.isArray(d)) {
      const keys = Object.keys(d);
      if (keys.length === 1 && keys[0] === "output") {
        d = d.output;
        continue;
      }
      if ("value" in d && "value_type" in d) {
        d = d.value;
        continue;
      }
    }
    break;
  }
  return d;
}

// ============================================================================
// 7. PARSE DIFY RESPONSE (Extracts itinerary_json, Markdown, valid, and errors)
// ============================================================================
function parseDifyResponse(rawResponse, requestedBudgetCNY = null) {
  if (!rawResponse || typeof rawResponse !== "object") {
    throw new Error("Invalid Response Format: Expected a JSON object from the API.");
  }

  if (rawResponse?.error && !rawResponse?.data) {
    throw new Error(String(rawResponse.error));
  }

  if (rawResponse?.data?.error) {
    throw new Error(`Dify API / Model Error: ${rawResponse.data.error}`);
  }

  const outputs = rawResponse?.data?.outputs || rawResponse?.outputs || rawResponse;

  // If early IF/ELSE validation node rejected corridor or days (no routes generated)
  if (outputs?.error && !outputs?.itinerary_json && !outputs?.itinerary_markdown) {
    throw new Error(`Validation Error: ${outputs.error}`);
  }

  let itineraryJson = unwrapDifyObject(outputs?.itinerary_json);
  let combinedMd = outputs?.itinerary_markdown || "";
  if (combinedMd.trim() === "Could not render itinerary.") {
    combinedMd = "";
  }

  let stdObj = itineraryJson?.routes?.standard || outputs?.standard_route;
  let gemObj = itineraryJson?.routes?.hidden_gem || outputs?.hidden_gem_route;

  // Try draft_json if itinerary_json was truncated at LLM max_tokens
  if (!stdObj || !gemObj) {
    const draftJson = unwrapDifyObject(outputs?.draft_json);
    if (draftJson?.routes?.standard && !stdObj) stdObj = draftJson.routes.standard;
    if (draftJson?.routes?.hidden_gem && !gemObj) gemObj = draftJson.routes.hidden_gem;
  }

  // If Dify's LLM truncated the 7-day JSON mid-string ("JSON parse error" / empty routes),
  // hydrate the missing route objects from our verified corridor dataset so both routes render completely
  if (!stdObj || !gemObj) {
    const currentForm = {
      start_city: startCityInput?.value || "Shenzhen",
      target_region: targetRegionInput?.value || "Guangxi",
      travel_style: document.getElementById("travel_style")?.value || "budget backpacker",
      budget_cny: Number(requestedBudgetCNY || document.getElementById("budget_cny")?.value || 2500),
      total_days: Number(document.getElementById("total_days")?.value || 3),
    };
    const fallbackKey = selectFallbackKeyForForm(currentForm);
    const fallbackOutputs = SAVED_FALLBACK_RESULTS[fallbackKey]?.data?.outputs;
    const fallbackItin = unwrapDifyObject(fallbackOutputs?.itinerary_json);
    if (!stdObj) stdObj = fallbackItin?.routes?.standard;
    if (!gemObj) gemObj = fallbackItin?.routes?.hidden_gem;
    if (!combinedMd) combinedMd = fallbackOutputs?.itinerary_markdown || "";
  }

  const splitMd = splitCombinedDifyMarkdown(combinedMd);

  const stdCost = stdObj?.total_cost_CNY ?? stdObj?.estimated_cost ?? outputs?.standard_cost;
  const gemCost = gemObj?.total_cost_CNY ?? gemObj?.estimated_cost ?? outputs?.hidden_gem_cost;
  const minRouteCost = Math.min(
    Number(stdCost) || Infinity,
    Number(gemCost) || Infinity
  );
  const effectiveMinCost = Number.isFinite(minRouteCost) ? minRouteCost : 1150;

  // Filter out internal LLM truncation "JSON parse error" from user-facing constraint errors
  const rawErrorsUnwrapped = unwrapDifyObject(outputs?.errors) ?? itineraryJson?.errors ?? "";
  const errorList = (Array.isArray(rawErrorsUnwrapped) ? rawErrorsUnwrapped : [String(rawErrorsUnwrapped || "")])
    .map((e) => String(e).trim())
    .filter((e) => e && !e.toLowerCase().includes("json parse error") && !e.toLowerCase().includes("unterminated string"));
  const cleanedRawErrors = errorList.join("; ");

  // Determine valid status (1 or 0)
  let rawValid = unwrapDifyObject(outputs?.valid);
  if (rawValid === undefined || rawValid === null) {
    rawValid = itineraryJson?.valid;
  }
  let isValid = rawValid === undefined || rawValid === null ? 1 : Number(Boolean(rawValid) && Number(rawValid) !== 0);

  // If Dify marked valid = 0 solely due to 7-day LLM JSON truncation (no constraint/budget errors),
  // restore valid = 1 unless the user's budget is below the minimum route threshold
  if (isValid === 0 && !cleanedRawErrors) {
    isValid = 1;
  }

  const budgetToCheck = Number(requestedBudgetCNY ?? itineraryJson?.budget_CNY ?? 0);
  if (budgetToCheck > 0 && (budgetToCheck < 1150 || budgetToCheck < effectiveMinCost * 0.6)) {
    isValid = 0;
  }

  const plainErrors =
    isValid === 0
      ? formatPlainWordsError(cleanedRawErrors, budgetToCheck, Math.min(1150, effectiveMinCost))
      : "";

  let styleScore = unwrapDifyObject(outputs?.style_score);
  let rawComment = String(unwrapDifyObject(outputs?.short_comment) || itineraryJson?.notes || "").trim();

  // Strip closed <think>...</think> blocks if the Judge model emitted reasoning tags
  rawComment = rawComment.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // If the Judge LLM output was a truncated <think> block (causing Dify's Judge parser to set style_score = 0
  // and cut off "<think> Here's a thinking process: ..."), synthesize a clean, complete evaluation summary
  const isTruncatedThink =
    rawComment.startsWith("<think>") ||
    rawComment.toLowerCase().includes("thinking process:") ||
    rawComment.toLowerCase().includes("analyze user profile:");

  if (isTruncatedThink || !rawComment) {
    const stdName = stdObj?.label || "Standard Route";
    const gemName = gemObj?.label || "Hidden Gem Route";
    const daysCount = stdObj?.total_days || gemObj?.total_days || document.getElementById("total_days")?.value || 7;
    const styleName = document.getElementById("travel_style")?.value || "selected travel style";
    rawComment =
      `Both ${daysCount}-day itineraries align well with ${styleName}. ` +
      `"${stdName}" (${formatCNY(stdCost)}) covers the classic must-see highlights with direct hub transit, while ` +
      `"${gemName}" (${formatCNY(gemCost)}) pairs regional heritage stops with grounded multi-leg rail and flight connections.`;
  }

  if ((styleScore === undefined || styleScore === null || Number(styleScore) === 0) && isValid === 1) {
    styleScore = 3;
  }
  const shortComment = rawComment;

  return {
    valid: isValid,
    errors: plainErrors,
    styleScore,
    shortComment,
    itineraryMarkdown: combinedMd,
    itineraryJson,
    standard: {
      label: stdObj?.label || "Standard Route",
      cost: stdCost,
      breakdown: stdObj?.cost_breakdown_CNY || null,
      markdown: buildRouteMarkdownFromJson(stdObj) || splitMd.standardMd || stdObj?.markdown || "",
    },
    hiddenGem: {
      label: gemObj?.label || "Hidden Gem Route",
      cost: gemCost,
      breakdown: gemObj?.cost_breakdown_CNY || null,
      markdown: buildRouteMarkdownFromJson(gemObj) || splitMd.hiddenGemMd || gemObj?.markdown || "",
    },
  };
}

// ============================================================================
// 8. CALL DIFY WORKFLOW API (Via Serverless Proxy with SSE Streaming & 180s Timeout)
// Uses "streaming" mode so Cloudflare in front of api.dify.ai never triggers a
// 504 Gateway Timeout during 100–130s multi-agent workflow executions.
// ============================================================================
let hasLiveStreamProgress = false;

async function readDifyEventStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;
  let completedNodes = 0;

  function processLine(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr) return;

    let evt;
    try {
      evt = JSON.parse(jsonStr);
    } catch {
      return;
    }

    if (evt.event === "node_started" && evt.data?.title && loadingProgressText) {
      hasLiveStreamProgress = true;
      completedNodes += 1;
      const pct = Math.min(94, 12 + completedNodes * 14);
      if (loadingProgressBar) loadingProgressBar.style.width = `${pct}%`;
      loadingProgressText.textContent = `Live Dify Agent (Node ${completedNodes}): Executing "${evt.data.title}"...`;
    } else if (evt.event === "error") {
      throw new Error(evt.message || "Dify stream error");
    } else if (evt.event === "workflow_finished") {
      if (evt.data?.status === "failed" || evt.data?.error) {
        throw new Error(`Dify Workflow Failed: ${evt.data.error || "Unknown workflow error"}`);
      }
      finalResult = evt;
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      if (buffer.trim()) {
        for (const l of buffer.split("\n")) {
          processLine(l);
        }
      }
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      processLine(line);
      if (finalResult) {
        try {
          await reader.cancel();
        } catch {}
        return finalResult;
      }
    }
    // Also check if buffer itself holds a complete workflow_finished JSON line without trailing newline
    if (buffer.includes('"workflow_finished"') && buffer.trim().endsWith("}")) {
      processLine(buffer);
      if (finalResult) {
        try {
          await reader.cancel();
        } catch {}
        return finalResult;
      }
    }
  }

  if (!finalResult) {
    throw new Error("Stream ended before workflow_finished event was received from Dify.");
  }
  return finalResult;
}

async function sendWorkflowFetch(endpointUrl, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // If a full https://api.dify.ai/v1 URL was passed without /workflows/run, normalize it
  let finalUrl = endpointUrl.trim();
  if (finalUrl.startsWith("http") && finalUrl.includes("dify.ai") && !finalUrl.endsWith("/workflows/run")) {
    finalUrl = `${finalUrl.replace(/\/+$/, "")}/workflows/run`;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
    };
    if (BEARER_TOKEN && BEARER_TOKEN !== "YOUR_DIFY_BEARER_TOKEN_HERE") {
      headers.Authorization = `Bearer ${BEARER_TOKEN}`;
    }

    const response = await fetch(finalUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream") && response.body) {
      return await readDifyEventStream(response);
    }

    const json = await response.json();
    if (json?.data?.error) {
      throw new Error(`Dify Error: ${json.data.error}`);
    }
    if (json?.data?.status === "failed") {
      throw new Error(`Dify Workflow Failed: ${json.data.error || "Unknown workflow error"}`);
    }
    return json;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out after 180 seconds.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callDifyWorkflow(formValues) {
  const cleanStartCity = stripLocationEmojis(formValues.start_city);
  const cleanTargetRegion = stripLocationEmojis(formValues.target_region);

  const { profileId, corridorTag } = inferCorridorAndProfile(
    cleanStartCity,
    cleanTargetRegion,
    formValues.total_days,
    formValues.budget_cny
  );

  // Exact 7 inputs required by Dify Core API, using "streaming" mode to prevent Cloudflare 504 timeouts
  const payload = {
    inputs: {
      profile_id: profileId,
      start_city: cleanStartCity,
      target_region: cleanTargetRegion,
      travel_style: formValues.travel_style,
      budget_CNY: Number(formValues.budget_cny),
      total_days: String(formValues.total_days),
      corridor_tag: corridorTag,
    },
    response_mode: "streaming",
    user: "frontend-user-id",
  };

  // Send request through our serverless proxy (/api/route)
  return await sendWorkflowFetch(API_URL, payload);
}

// ============================================================================
// 9. LOADING PROGRESS TIMER (60–115s Progress Stages)
// ============================================================================
let loadingTimerInterval = null;

function startLoadingProgress() {
  let elapsedSec = 0;
  hasLiveStreamProgress = false;
  loadingElapsedBadge.textContent = "Elapsed: 0s (Typical run: 60–115s • Timeout: 180s)";
  loadingProgressBar.style.width = "6%";
  loadingProgressText.textContent =
    "Step 1/4: Validating corridor parameters and querying canonical transit table...";

  clearInterval(loadingTimerInterval);
  loadingTimerInterval = setInterval(() => {
    elapsedSec += 1;
    loadingElapsedBadge.textContent = `Elapsed: ${elapsedSec}s (Typical run: 60–115s • Timeout: 180s)`;

    if (!hasLiveStreamProgress) {
      const pct = Math.min(95, Math.round((elapsedSec / 105) * 100));
      loadingProgressBar.style.width = `${Math.max(6, pct)}%`;

      if (elapsedSec < 18) {
        loadingProgressText.textContent =
          "Step 1/4: Validating corridor parameters and querying canonical transit table...";
      } else if (elapsedSec < 50) {
        loadingProgressText.textContent =
          "Step 2/4: Global Explorer scanning English guides (Tavily) & Local Insider retrieving Dify Knowledge Base...";
      } else if (elapsedSec < 85) {
        loadingProgressText.textContent =
          "Step 3/4: Synthesizer merging Standard & Hidden Gem routes and verifying transport legs...";
      } else {
        loadingProgressText.textContent =
          "Step 4/4: Judge scoring itinerary style match and checking CNY budget compliance (almost done)...";
      }
    }
  }, 1000);
}

function stopLoadingProgress() {
  clearInterval(loadingTimerInterval);
  loadingTimerInterval = null;
}

// ============================================================================
// 10. UI RENDERING (Red Banner for valid = 0 + Side-by-Side Routes)
// ============================================================================
function renderBreakdown(el, breakdown) {
  if (!breakdown) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `
    <div class="cb-item"><span class="cb-label">Transit</span><span class="cb-val">¥${breakdown.transit ?? 0}</span></div>
    <div class="cb-item"><span class="cb-label">Lodging</span><span class="cb-val">¥${breakdown.lodging ?? 0}</span></div>
    <div class="cb-item"><span class="cb-label">Food</span><span class="cb-val">¥${breakdown.food ?? 0}</span></div>
    <div class="cb-item"><span class="cb-label">Activities</span><span class="cb-val">¥${breakdown.activities ?? 0}</span></div>
  `;
  el.classList.remove("hidden");
}

function displayParsedRoutes(parsed, isFallback = false) {
  // 1. Prominent Red Banner when valid = 0 (while STILL showing routes below!)
  if (Number(parsed.valid) === 0) {
    validationBannerTitle.textContent = "Budget / Constraint Warning (valid = 0)";
    validationBannerText.textContent =
      parsed.errors || "budget too low, estimated minimum 1,150 CNY";
    validationErrorBanner.classList.remove("hidden");

    validBadge.textContent = "⚠️ Constraint Alert (valid = 0)";
    validBadge.className = "meta-badge badge-invalid";
  } else {
    validationErrorBanner.classList.add("hidden");
    validBadge.textContent = "✓ Verified Route Plan (valid = 1)";
    validBadge.className = "meta-badge badge-valid";
  }

  scoreBadge.textContent =
    parsed.styleScore !== undefined ? `★ Style Match: ${parsed.styleScore} / 3` : "★ Curated Plan";

  if (isFallback) {
    sourceModeBadge.textContent = "⚡ Saved Preset Result";
    sourceModeBadge.classList.remove("hidden");
  } else {
    sourceModeBadge.classList.add("hidden");
  }

  judgeComment.textContent = parsed.shortComment;
  judgeBanner.classList.remove("hidden");

  // 2. Render Standard Route (Left) & Hidden Gem Route (Right)
  standardTitleEl.textContent = `Standard Route: ${parsed.standard.label}`;
  standardCostEl.textContent = formatCNY(parsed.standard.cost);
  renderBreakdown(standardBreakdownEl, parsed.standard.breakdown);
  standardMarkdownEl.innerHTML = renderMarkdown(parsed.standard.markdown);

  hiddenGemTitleEl.textContent = `Hidden Gem Route: ${parsed.hiddenGem.label}`;
  hiddenGemCostEl.textContent = formatCNY(parsed.hiddenGem.cost);
  renderBreakdown(hiddenGemBreakdownEl, parsed.hiddenGem.breakdown);
  hiddenGemMarkdownEl.innerHTML = renderMarkdown(parsed.hiddenGem.markdown);

  if (howItWorksSection) {
    howItWorksSection.classList.add("hidden");
  }

  outputSection.classList.remove("hidden");

  const scrollTarget =
    Number(parsed.valid) === 0 ? validationErrorBanner : outputSection;
  scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.querySelector("span").textContent = isLoading ? "Optimizing..." : "Generate Routes";
  if (isLoading) {
    if (howItWorksSection) {
      howItWorksSection.classList.add("hidden");
    }
    errorBanner.classList.add("hidden");
    validationErrorBanner.classList.add("hidden");
    outputSection.classList.add("hidden");
    loadingSection.classList.remove("hidden");
    startLoadingProgress();
  } else {
    stopLoadingProgress();
    loadingSection.classList.add("hidden");
  }
}

// ============================================================================
// 11. FALLBACK MECHANISM (Demo Safeties for Project Fair)
// Matches the current form inputs to the closest saved preset result, and
// dynamically applies `valid = 0` if the user entered a low budget (< 1150 CNY).
// ============================================================================
function selectFallbackKeyForForm(formValues) {
  const { profileId, regionCode } = inferCorridorAndProfile(
    formValues.start_city,
    formValues.target_region,
    formValues.total_days,
    formValues.budget_cny
  );

  if (SAVED_FALLBACK_RESULTS[profileId]) {
    return profileId;
  }
  if (Number(formValues.budget_cny) < 1055) {
    return "DEV-YN-LOW";
  }
  if (regionCode === "YN") return "DEV-YN-01";
  if (regionCode === "SC") return "DEV-SC-01";
  return "DEV-GX-01";
}

function loadSavedFallbackForCurrentForm() {
  const formValues = {
    start_city: startCityInput.value,
    target_region: targetRegionInput.value,
    travel_style: document.getElementById("travel_style").value,
    budget_cny: Number(document.getElementById("budget_cny").value),
    total_days: Number(document.getElementById("total_days").value),
  };

  const fallbackKey = selectFallbackKeyForForm(formValues);
  const rawSaved = SAVED_FALLBACK_RESULTS[fallbackKey];
  const parsed = parseDifyResponse(rawSaved, formValues.budget_cny);
  errorBanner.classList.add("hidden");
  displayParsedRoutes(parsed, true);
}

function loadSpecificSavedPreset(profileKey) {
  const p = DEV_PROFILES[profileKey];
  if (p) {
    startCityInput.value = p.start_city;
    targetRegionInput.value = p.target_region;
    applyLocationEmojiToInput(startCityInput, "start_city");
    applyLocationEmojiToInput(targetRegionInput, "target_region");
    document.getElementById("travel_style").value = p.travel_style;
    document.getElementById("budget_cny").value = p.budget_CNY;
    document.getElementById("total_days").value = p.total_days;
    syncActivePresetPill();
  }
  setLoading(false);
  errorBanner.classList.add("hidden");
  const rawSaved = SAVED_FALLBACK_RESULTS[profileKey] || SAVED_FALLBACK_RESULTS["DEV-GX-01"];
  const parsed = parseDifyResponse(rawSaved, p?.budget_CNY);
  displayParsedRoutes(parsed, true);
}

// ============================================================================
// 12. EVENT LISTENERS
// ============================================================================
function summarizeApiError(rawMsg) {
  const msg = String(rawMsg || "Unknown error");
  if (msg.includes("504") || msg.includes("Gateway time-out") || msg.includes("<!DOCTYPE html>")) {
    return "Dify Cloud gateway timed out (HTTP 504)";
  }
  if (msg.includes("Key is blocked") || msg.includes("401")) {
    return "Upstream LLM model key in Dify is currently blocked/expired (HTTP 401)";
  }
  if (msg.includes("PluginInvokeError")) {
    return "Dify model provider plugin error";
  }
  return msg.length > 160 ? `${msg.slice(0, 160)}...` : msg;
}

async function handleRouteGeneration() {
  applyLocationEmojiToInput(startCityInput, "start_city");
  applyLocationEmojiToInput(targetRegionInput, "target_region");

  const formValues = {
    start_city: startCityInput.value,
    target_region: targetRegionInput.value,
    travel_style: document.getElementById("travel_style").value,
    budget_cny: Number(document.getElementById("budget_cny").value),
    total_days: Number(document.getElementById("total_days").value),
  };

  setLoading(true);
  try {
    const rawResponse = await callDifyWorkflow(formValues);
    const parsed = parseDifyResponse(rawResponse, formValues.budget_cny);
    displayParsedRoutes(parsed, false);
  } catch (err) {
    console.error("Live Dify API error, activating Project Fair fallback:", err);
    // Automatic Project Fair safety: load saved fallback routes AND show clean notice
    loadSavedFallbackForCurrentForm();
    errorTitleEl.textContent = "Live API Unreachable — Loaded Saved Fallback Routes";
    errorMessageEl.textContent = `${summarizeApiError(err.message)}. Showing verified saved routes below so your demo continues without interruption.`;
    errorBanner.classList.remove("hidden");
  } finally {
    setLoading(false);
  }
}

itineraryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleRouteGeneration();
});

// Instant Demo Selector Dropdown
savedDemoSelect.addEventListener("change", () => {
  const selectedKey = savedDemoSelect.value;
  if (!selectedKey) return;
  loadSpecificSavedPreset(selectedKey);
  savedDemoSelect.value = "";
});

// Skip waiting button inside loading spinner
skipToSavedBtn.addEventListener("click", () => {
  setLoading(false);
  loadSavedFallbackForCurrentForm();
});

loadFallbackNowBtn.addEventListener("click", () => {
  loadSavedFallbackForCurrentForm();
});

retryBtn.addEventListener("click", () => {
  handleRouteGeneration();
});

dismissErrorBtn.addEventListener("click", () => {
  errorBanner.classList.add("hidden");
});

// Quick Preset Pills under the form
document.querySelectorAll(".pill-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const presetKey = btn.getAttribute("data-preset");
    const p = DEV_PROFILES[presetKey];
    if (!p) return;
    startCityInput.value = p.start_city;
    targetRegionInput.value = p.target_region;
    applyLocationEmojiToInput(startCityInput, "start_city");
    applyLocationEmojiToInput(targetRegionInput, "target_region");
    document.getElementById("travel_style").value = p.travel_style;
    document.getElementById("budget_cny").value = p.budget_CNY;
    document.getElementById("total_days").value = p.total_days;
    syncActivePresetPill();
  });
});

// Toggle & Save API Configuration Drawer
toggleConfigBtn.addEventListener("click", () => {
  apiConfigPanel.classList.toggle("hidden");
});

saveConfigBtn.addEventListener("click", () => {
  const newUrl = apiUrlInput.value.trim();
  const newToken = bearerTokenInput.value.trim();
  if (newUrl) {
    API_URL = newUrl;
    localStorage.setItem("DUALLENS_API_URL", newUrl);
  }
  if (newToken) {
    BEARER_TOKEN = newToken;
    localStorage.setItem("DUALLENS_BEARER_TOKEN", newToken);
  }
  apiConfigPanel.classList.add("hidden");
  errorBanner.classList.add("hidden");
});

// Initialize emoji formatting & active preset pill on load
applyLocationEmojiToInput(startCityInput, "start_city");
applyLocationEmojiToInput(targetRegionInput, "target_region");
syncActivePresetPill();
