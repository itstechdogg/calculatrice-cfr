/* ============================================================================
   Données des programmes de récompenses de recharge à domicile (RCP / CFR)
   Source : extraction factuelle (taux, bornes, coûts) — liens tronqués avant
   la chaîne de requête (pas de '?' ni de paramètres de parrainage/affiliation).
   Date de capture : 2026-10-12.

   ⚠️  DONNÉES DE DÉPART (à remplacer par les données vérifiées de l'AVEQ).
   Structure identique à conserver pour brancher le moteur de recommandation.

   Modèle : tauxParPalier.defaut = 17 taux en ¢/kWh, un par palier de PALIERS,
   croissant avec le volume. typePalier : "Annuel" (palier = kWh de l'année) ou
   "Viager" (palier = kWh cumulé à vie).
   ========================================================================== */
(function () {
  // Remplit un tableau de 17 paliers avec une valeur constante.
  const r = v => Array(17).fill(v);

  // Table d'overrides par Province|Borne, partagée par les 3 programmes
  // « Club Roulez Électrique ». Reproduit fidèlement les valeurs captées :
  // [taux de base, taux Sigenergy, taux FractalEV] par province.
  const ROULEZ_OVERRIDES = (function () {
    const specs = {
      "Alberta": [8, 10, 8],
      "Colombie-Britannique": [13, 18, 15],
      "Île-du-Prince-Édouard": [12, 18, 15],
      "Manitoba": [13, 18, 15],
      "Nouveau-Brunswick": [10, 13, 12],
      "Nouvelle-Écosse": [6, 12, 7],
      "Nunavut": [4, 3, 4],
      "Ontario": [13, 18, 15],
      "Québec": [13, 18, 15],
      "Saskatchewan": [6, 8, 6],
      "Terre-Neuve-et-Labrador": [13, 18, 15],
      "Territoires du Nord-Ouest": [11, 13, 12],
      "Yukon": [12, 14, 14]
    };
    const bornes = ["Tesla", "Wallbox", "Autel", "EVDuty", "Sigenergy",
                    "FractalEV", "IYILO", "TuroGize", "VariableGrid", "Autre borne OCPP"];
    const out = {};
    for (const prov in specs) {
      const [base, sig, frac] = specs[prov];
      for (const b of bornes) {
        out[prov + "|" + b] = r(b === "Sigenergy" ? sig : b === "FractalEV" ? frac : base);
      }
    }
    return out;
  })();

  const ROULEZ_BORNES = ["Tesla", "Wallbox", "Autel", "EVDuty", "Sigenergy",
                         "FractalEV", "IYILO", "TuroGize", "VariableGrid", "Autre borne OCPP"];

  const PALIERS = [
    { min: 0, max: 1000 }, { min: 1001, max: 1500 }, { min: 1501, max: 2000 },
    { min: 2001, max: 3000 }, { min: 3001, max: 4000 }, { min: 4001, max: 5000 },
    { min: 5001, max: 6000 }, { min: 6001, max: 7000 }, { min: 7001, max: 10000 },
    { min: 10001, max: 12000 }, { min: 12001, max: 15000 }, { min: 15001, max: 18000 },
    { min: 18001, max: 20000 }, { min: 20001, max: 25000 }, { min: 25001, max: 30000 },
    { min: 30001, max: 35000 }, { min: 35001, max: null }
  ];

  const BORNES = ["N'importe laquelle qui est fournie", "Tesla", "Wallbox", "Autel",
    "Grizzl-E", "ChargePoint", "FLO", "EVDuty", "TechnoVE", "Pion Power", "Lite-On",
    "Joint Tech", "Keni", "Siemens", "Sigenergy", "FractalEV", "IYILO", "TuroGize",
    "VariableGrid", "Autre borne OCPP"];

  const PROGRAMS = [
    {
      id: "grizzle_club_essentiel", nom: "Grizzl-e Club Essentiel",
      provinces: ["Toutes"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: true, achatBorneRequis: false, prixBorne: 0, coutAdhesion: 0, depot: 100,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://club.grizzl-e.com/",
      versement: { frequence: "Mensuel", type: "Virement Interac", moment: "Solde minimum 10$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "Gagnez 1 ¢/kWh supplémentaire sur toutes les recharges effectuées par les membres que vous parrainez" }
    },
    {
      id: "grizzle_club_premium", nom: "Grizzl-e Club Premium",
      provinces: ["Toutes"], bornesCompatibles: ["Grizzl-E"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 500, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://club.grizzl-e.com/",
      versement: { frequence: "Mensuel", type: "Virement Interac", moment: "Solde minimum 10$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [10, 10, 10, 10, 10, 10, 11, 11, 11, 12, 12, 13, 13, 14, 15, 15, 15], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "Gagnez 1 ¢/kWh supplémentaire sur toutes les recharges effectuées par les membres que vous parrainez" }
    },
    {
      id: "chargelab", nom: "ChargeLab Rewards",
      provinces: ["Toutes"], bornesCompatibles: ["Autel", "Siemens", "Wallbox", "SWTCH", "Autre borne OCPP"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 600, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://chargelab.co/home-charging-rewards-canada",
      versement: { frequence: "Trimestriel", type: "Carte cadeau numérique", moment: "Solde minimum 5$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(10), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 25, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "$25 par personne référée" }
    },
    {
      id: "road_to_ev", nom: "RoadtoEV Carbon Credit Program",
      provinces: ["Toutes"], bornesCompatibles: ["Tesla"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 760, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.roadtoev.com/carbon-credits-program",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde minimum de 20$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(10), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 20, centsParKwhFilleul: 0, centsBonusGroupe: 1, tailleGroupe: 5, maxFilleulsBonifies: 25, lienParrainage: "", notes: "" }
    },
    {
      id: "swtch", nom: "SWTCH Home Charging Program",
      provinces: ["Toutes"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 0, coutAdhesion: 0, depot: 300,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://shop.swtchenergy.com/pages/the-swtch-home-charging-program",
      versement: { frequence: "", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [3, 3, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "club_roulez_electrique_ambassadeur_or", nom: "Club Roulez Électrique - Ambassadeur Or",
      provinces: ["Toutes"], bornesCompatibles: ROULEZ_BORNES.slice(),
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 800, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://roulezelectrique.club/r/QBUPV5VP",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde mimimum de 20$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(13), parProvinceEtBorne: ROULEZ_OVERRIDES },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 2, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "2 ¢/kWh sur la recharge de vos invités" }
    },
    {
      id: "club_roulez_electrique_ambassadeur", nom: "Club Roulez Électrique - Ambassadeur",
      provinces: ["Toutes"], bornesCompatibles: ROULEZ_BORNES.slice(),
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 800, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://roulezelectrique.club/r/QBUPV5VP",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde mimimum de 20$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(13), parProvinceEtBorne: ROULEZ_OVERRIDES },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "1 ¢/kWh sur la recharge de vos invités" }
    },
    {
      id: "club_roulez_electrique", nom: "Club Roulez Électrique",
      provinces: ["Toutes"], bornesCompatibles: ROULEZ_BORNES.slice(),
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 800, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://roulezelectrique.club/r/QBUPV5VP",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde mimimum de 20$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(13), parProvinceEtBorne: ROULEZ_OVERRIDES },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "honey-badger", nom: "HoneyBadger - Programme de dividendes de recharge à domicile",
      provinces: ["Colombie-Britannique"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 799, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.badgercharging.ca/home-charging",
      versement: { frequence: "Trimestriel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(4), parProvinceEtBorne: { "Colombie-Britannique|N'importe laquelle qui est fournie": r(4) } },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "clearshot_labs", nom: "Clearshot Labs Free Charger Program",
      provinces: ["Toutes"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 0, coutAdhesion: 0, depot: 300,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.clearshotlabs.com/free-charger-program",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(3), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "chargy", nom: "Chargy - Programme de récompenses de recharge",
      provinces: ["Colombie-Britannique", "Manitoba", "Ontario", "Québec", "Terre-Neuve-et-Labrador", "Île-du-Prince-Édouard"],
      bornesCompatibles: ["Wallbox", "Autel", "EVDuty", "Grizzl-E", "Lite-On", "Joint Tech", "Autre borne OCPP"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 600, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.chargy.ca/get-paid-to-charge",
      versement: { frequence: "Mensuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(10), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 25, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "watts_app", nom: "WattsApp Home Charging Program",
      provinces: ["Toutes"], bornesCompatibles: ["Tesla"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 760, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://wattsapp.ca/invite/Y3HR-U7NL",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(21), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 10, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "100 points par personne référée." }
    },
    {
      id: "iceberg_ev", nom: "Remise de recharge Iceberg EV",
      provinces: ["Terre-Neuve-et-Labrador"], bornesCompatibles: ["Autel"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 599, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://icebergev.ca/",
      versement: { frequence: "Trimestriel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(12), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 1, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "hypercharge_home_club", nom: "Hypercharge Home Club",
      provinces: ["Toutes"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 0, coutAdhesion: 0, depot: 299,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://store.hypercharge.com/products/joinclub",
      potentielParrainage: "",
      versement: { frequence: "Mensuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [3, 3, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "unico_power", nom: "Unico Power - Récompenses Listo",
      provinces: ["Toutes"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 1495, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.unicopower.com/listo",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(2), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "ecoWatt", nom: "EcoWatt",
      provinces: ["Toutes"], bornesCompatibles: ["TechnoVE"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 899, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://novyrasolution.ca/adhesion-ecowatt",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(12), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "ecocharge", nom: "EcoCharge Rewards",
      provinces: ["Colombie-Britannique"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 0, coutAdhesion: 0, depot: 199,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://ecochargebc.ca/homeowners.html",
      versement: { frequence: "", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "pion_power_greenmiles", nom: "Pion Power GreenMiles",
      provinces: ["Toutes"], bornesCompatibles: ["Pion Power"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 340, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.pionpowertech.com/green-miles",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(10), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 20, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "metroEV", nom: "metroEV Rewards",
      provinces: ["Toutes"], bornesCompatibles: ["Autre borne OCPP"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 600, coutAdhesion: 0, depot: 199,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.metroev.ca/rewards",
      versement: { frequence: "", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(10), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "dash_sharing", nom: "DashSharing - Programme de recharge à domicile",
      provinces: ["Toutes"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 0, coutAdhesion: 0, depot: 450,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://dashsharing.ca/fr",
      versement: { frequence: "Mensuel", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [3, 3, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "variable_grid_plus", nom: "Variablegrid Plus",
      provinces: ["Toutes"], bornesCompatibles: ["VariableGrid"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 950, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.variablegrid.com/",
      versement: { frequence: "", type: "Virement Interac", moment: "Solde minimum de 50$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(10), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "electric_avenue", nom: "Electric Avenue Home Charging Rewards",
      provinces: ["Toutes"], bornesCompatibles: ["Autre borne OCPP"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 600, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://goelectricave.com/blogs/news/electric-avenue-launches-program-paying-homeowners-13-cents-for-every-kwh-charged",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Viager",
      tauxParPalier: { defaut: r(13), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 0, lienParrainage: "", notes: "" }
    },
    {
      id: "charging_right_freenium", nom: "Charging Right - Freenium",
      provinces: ["Ontario"], bornesCompatibles: ["Autre borne OCPP"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 600, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.chargingright.com/get-started",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [3, 4, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "charging_right_premium", nom: "Charging Right - Premium",
      provinces: ["Ontario"], bornesCompatibles: ["Autre borne OCPP"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 600, coutAdhesion: 99, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.chargingright.com/get-started",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [10, 11, 11, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "charging_right_premium_plus", nom: "Charging Right - Premium Plus",
      provinces: ["Ontario"], bornesCompatibles: ["N'importe laquelle qui est fournie"],
      accepteBorneExistante: false, achatBorneRequis: true, prixBorne: 300, coutAdhesion: 149, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.chargingright.com/get-started",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Viager",
      tauxParPalier: { defaut: [13, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 1, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    },
    {
      id: "telemiq", nom: "Telemiq Rewards",
      provinces: ["Toutes"], bornesCompatibles: ["Tesla"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 760, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://www.telemiq.io/fr/login/register",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "Solde minimum de 100$" },
      typePalier: "Annuel",
      tauxParPalier: { defaut: [5, 5, 5, 5, 7, 7, 7, 9.5, 9.5, 9.5, 12, 12, 14.5, 14.5, 14.5, 14.5, 14.5], parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 10, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, multiplicateurTaux: [{ min: 0, max: 0, x: 1 }, { min: 1, max: 2, x: 1.05 }, { min: 3, max: 5, x: 1.15 }, { min: 6, max: 9, x: 1.25 }, { min: 10, max: 14, x: 1.35 }, { min: 15, max: null, x: 1.5 }], lienParrainage: "", notes: "" }
    },
    {
      id: "club_privilege_keni", nom: "Club Privilège KENI",
      provinces: ["Toutes"], bornesCompatibles: ["Keni"],
      accepteBorneExistante: true, achatBorneRequis: true, prixBorne: 610, coutAdhesion: 0, depot: 0,
      dateMAJ: "2026-10-12", lienSiteWeb: "https://kenirecharge.ca/fr",
      versement: { frequence: "Annuel", type: "Virement Interac", moment: "" },
      typePalier: "Annuel",
      tauxParPalier: { defaut: r(13), parProvinceEtBorne: {} },
      parrainage: { montantParPersonne: 0, centsParKwhFilleul: 0, centsBonusGroupe: 0, tailleGroupe: 0, maxFilleulsBonifies: 99999, lienParrainage: "", notes: "" }
    }
  ];

  window.PROGRAMMES_DATA = { PALIERS, BORNES, PROGRAMS };
})();
