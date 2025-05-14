
/**
 * Common diseases with pre-written responses for fallback when APIs are unavailable
 */
export const CommonDiseases = [
  {
    name: "Malaria",
    alternateNames: ["paludism", "marsh fever"],
    content: `
1. DISEASE DESCRIPTION
• Malaria is a life-threatening disease caused by Plasmodium parasites transmitted to humans through the bites of infected female Anopheles mosquitoes
• Caused by five parasite species that affect humans: P. falciparum, P. vivax, P. malariae, P. ovale and P. knowlesi
• Affects approximately 229 million people worldwide annually, primarily in tropical and subtropical regions of Africa, South Asia, and parts of South America

2. DRUG RECOMMENDATIONS 
• First-line treatment for uncomplicated P. falciparum malaria: Artemisinin-based combination therapies (ACTs) like artemether-lumefantrine (20/120 mg, twice daily for 3 days)
• For P. vivax: Chloroquine (600mg base, followed by 300mg base at 6, 24, and 48 hours) plus primaquine (0.25-0.5 mg/kg daily for 14 days)
• Severe malaria requires intravenous or intramuscular artesunate (2.4 mg/kg per dose at 0, 12, 24 hours, then daily)

3. SIDE EFFECTS & INDICATIONS
• Common ACT side effects: Nausea, vomiting, loss of appetite, dizziness
• Chloroquine side effects: Headache, dizziness, gastrointestinal disturbances, and rarely retinopathy with long-term use
• Primaquine can cause severe hemolytic anemia in patients with G6PD deficiency

4. CONTRAINDICATIONS & INTERACTIONS
• Primaquine is contraindicated in pregnancy and patients with G6PD deficiency
• Mefloquine shouldn't be used in patients with psychiatric disorders or seizure history
• Halofantrine can cause cardiac conduction abnormalities and shouldn't be used with drugs that prolong QT interval

5. HERBAL MEDICINE ALTERNATIVES
• Artemisia annua (sweet wormwood) contains artemisinin, the precursor to modern antimalarial drugs
• Cinchona bark (source of quinine) has traditional use but standardized pharmaceutical preparations are preferred
• Neem (Azadirachta indica) shows some antimalarial properties in laboratory studies but lacks clinical evidence

6. FOOD-BASED TREATMENTS
• No food-based treatments can cure malaria; medical treatment is essential
• Ginger, cinnamon, and honey may help alleviate symptoms but should not replace medical treatment
• Adequate hydration and nutritious diet support recovery during treatment

Medical Disclaimer: This information is provided for educational purposes only and is not a substitute for professional medical advice. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.`
  },
  {
    name: "Diabetes",
    alternateNames: ["diabetes mellitus", "type 2 diabetes", "type 1 diabetes", "T2D", "T1D"],
    content: `
1. DISEASE DESCRIPTION
• Diabetes is a chronic metabolic disorder characterized by elevated blood glucose levels due to insufficient insulin production or ineffective insulin use
• Type 1 diabetes is an autoimmune condition where the pancreas produces little or no insulin, while Type 2 results from insulin resistance
• Affects over 460 million people worldwide with increasing prevalence, primarily Type 2 diabetes (90-95% of cases)

2. DRUG RECOMMENDATIONS 
• First-line for Type 2: Metformin (starting at 500mg once/twice daily with meals, increasing to 1000mg twice daily as tolerated)
• For Type 1: Multiple daily insulin injections or continuous subcutaneous insulin infusion with insulin pumps
• Additional Type 2 options: SGLT-2 inhibitors, GLP-1 receptor agonists, DPP-4 inhibitors based on comorbidities and patient factors

3. SIDE EFFECTS & INDICATIONS
• Metformin: Gastrointestinal effects (nausea, diarrhea), vitamin B12 deficiency with long-term use, rare lactic acidosis
• Sulfonylureas: Hypoglycemia, weight gain, potential cardiovascular risks
• Insulin: Hypoglycemia, weight gain, injection site reactions, lipodystrophy

4. CONTRAINDICATIONS & INTERACTIONS
• Metformin contraindicated in severe renal impairment (eGFR <30 mL/min) and acute conditions that may affect kidney function
• SGLT-2 inhibitors not recommended for Type 1 diabetes due to increased risk of diabetic ketoacidosis
• Numerous drug-drug interactions including beta-blockers masking hypoglycemia symptoms and corticosteroids increasing blood glucose

5. HERBAL MEDICINE ALTERNATIVES
• Cinnamon may modestly improve insulin sensitivity and lower blood glucose in Type 2 diabetes
• Bitter melon (Momordica charantia) shows hypoglycemic properties in preliminary studies
• Alpha-lipoic acid may help with diabetic neuropathy symptoms as an antioxidant supplement

6. FOOD-BASED TREATMENTS
• Low glycemic index diet emphasizing non-starchy vegetables, whole grains, lean proteins, and healthy fats
• Regular meal timing with consistent carbohydrate distribution throughout the day
• Recommended foods include leafy greens, berries, fatty fish, nuts, beans, and whole grains

Medical Disclaimer: This information is provided for educational purposes only and is not a substitute for professional medical advice. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.`
  },
  {
    name: "Hypertension",
    alternateNames: ["high blood pressure", "HTN"],
    content: `
1. DISEASE DESCRIPTION
• Hypertension is a chronic medical condition characterized by persistently elevated blood pressure in the arteries
• Defined as systolic blood pressure ≥130 mmHg or diastolic blood pressure ≥80 mmHg based on current guidelines
• Affects approximately 1.28 billion adults worldwide, with prevalence increasing with age and contributing to heart disease and stroke

2. DRUG RECOMMENDATIONS 
• First-line medications include thiazide diuretics (e.g., hydrochlorothiazide 12.5-25 mg daily)
• ACE inhibitors (e.g., lisinopril 10-40 mg daily) or ARBs (e.g., losartan 25-100 mg daily)
• Calcium channel blockers (e.g., amlodipine 2.5-10 mg daily) are often prescribed as mono or combination therapy

3. SIDE EFFECTS & INDICATIONS
• ACE inhibitors: Dry cough, angioedema, hyperkalemia, headache, dizziness 
• Thiazide diuretics: Electrolyte imbalances, increased blood glucose, photosensitivity
• Calcium channel blockers: Peripheral edema, flushing, constipation, headache

4. CONTRAINDICATIONS & INTERACTIONS
• ACE inhibitors and ARBs contraindicated during pregnancy due to fetal harm
• Beta-blockers may mask hypoglycemia in diabetic patients and exacerbate asthma
• NSAIDs can decrease the effectiveness of antihypertensive medications and worsen kidney function

5. HERBAL MEDICINE ALTERNATIVES
• Garlic preparations may provide modest blood pressure reduction in some patients
• Hibiscus tea has shown mild antihypertensive effects in several small studies
• Hawthorn extract may have cardiac benefits and mild blood pressure-lowering effects

6. FOOD-BASED TREATMENTS
• DASH (Dietary Approaches to Stop Hypertension) diet emphasizing fruits, vegetables, low-fat dairy, whole grains
• Sodium restriction to less than 2,300 mg/day; ideally less than 1,500 mg/day
• Potassium-rich foods including bananas, potatoes, avocados, and leafy greens may help lower blood pressure

Medical Disclaimer: This information is provided for educational purposes only and is not a substitute for professional medical advice. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.`
  }
];
