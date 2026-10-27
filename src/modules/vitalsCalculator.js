// Student Health Vitals & Lifestyle Calculators Module
// Gender-Calibrated for Collegiate Adults (18-28 yrs)

export function initVitalsCalculator() {
  setupBmiCalculator();
  setupHydrationCalculator();
}

function setupBmiCalculator() {
  const bmiForm = document.getElementById('bmi-calculator-form');
  const bmiResultDiv = document.getElementById('bmi-result-display');
  const bmiScoreVal = document.getElementById('bmi-score-number');
  const bmiCategoryBadge = document.getElementById('bmi-category-badge');
  const bmiGuidance = document.getElementById('bmi-advice-text');
  const bmiIdealRange = document.getElementById('bmi-ideal-weight-range');
  const bmiIdealMid = document.getElementById('bmi-ideal-midpoint');
  const bmiBodyFat = document.getElementById('bmi-bodyfat-est');
  const bmiBodyFatCat = document.getElementById('bmi-bodyfat-category');
  const bmiBmr = document.getElementById('bmi-bmr-est');
  const gaugeMarker = document.getElementById('bmi-gauge-marker');
  const genderInput = document.getElementById('bmi-gender-input');

  const maleBtn = document.getElementById('btn-gender-male');
  const femaleBtn = document.getElementById('btn-gender-female');
  const heightInput = document.getElementById('bmi-height-input');
  const weightInput = document.getElementById('bmi-weight-input');

  const labelUnder = document.getElementById('label-under-val');
  const labelNormal = document.getElementById('label-normal-val');
  const labelOver = document.getElementById('label-over-val');
  const labelObese = document.getElementById('label-obese-val');

  // Gender Switchers
  if (maleBtn && femaleBtn && genderInput) {
    maleBtn.addEventListener('click', () => {
      maleBtn.classList.add('active');
      femaleBtn.classList.remove('active');
      genderInput.value = 'male';

      // Update gauge range labels
      if (labelUnder) labelUnder.textContent = 'Under (<19.5)';
      if (labelNormal) labelNormal.textContent = 'Healthy (19.5-24.9)';
      if (labelOver) labelOver.textContent = 'Over (25-30)';
      if (labelObese) labelObese.textContent = 'Obese (30+)';

      // Set representative collegiate defaults if user hasn't heavily customized
      if (heightInput && (heightInput.value === '163' || !heightInput.value)) heightInput.value = '175';
      if (weightInput && (weightInput.value === '56' || !weightInput.value)) weightInput.value = '70';

      // Auto recalculate if result is currently open
      if (bmiResultDiv && bmiResultDiv.style.display !== 'none') {
        calculateBmi();
      }
    });

    femaleBtn.addEventListener('click', () => {
      femaleBtn.classList.add('active');
      maleBtn.classList.remove('active');
      genderInput.value = 'female';

      // Update gauge range labels
      if (labelUnder) labelUnder.textContent = 'Under (<18.5)';
      if (labelNormal) labelNormal.textContent = 'Healthy (18.5-23.9)';
      if (labelOver) labelOver.textContent = 'Over (24-29)';
      if (labelObese) labelObese.textContent = 'Obese (29+)';

      // Set representative collegiate defaults if user hasn't heavily customized
      if (heightInput && (heightInput.value === '175' || !heightInput.value)) heightInput.value = '163';
      if (weightInput && (weightInput.value === '70' || !weightInput.value)) weightInput.value = '56';

      // Auto recalculate if result is currently open
      if (bmiResultDiv && bmiResultDiv.style.display !== 'none') {
        calculateBmi();
      }
    });
  }

  function calculateBmi() {
    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);
    const gender = genderInput ? genderInput.value : 'male';
    const age = parseFloat(document.getElementById('bmi-age-input')?.value) || 21;
    const frame = document.getElementById('bmi-frame-select')?.value || 'medium';

    if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) return;

    const heightM = heightCm / 100;
    const bmiRaw = weightKg / (heightM * heightM);
    const bmi = bmiRaw.toFixed(1);

    let category = '';
    let badgeClass = '';
    let advice = '';
    let minHealthyWeight = 0;
    let maxHealthyWeight = 0;
    let idealDevine = 0;

    // Frame adjustment factor: small frame -5%, large frame +5%
    const frameMultiplier = frame === 'small' ? 0.95 : (frame === 'large' ? 1.05 : 1.0);

    // 1. Gender-Calibrated BMI Categories & Ideal Weight Ranges
    if (gender === 'male') {
      // Males carry ~10-15% higher skeletal & muscle mass
      minHealthyWeight = (19.5 * heightM * heightM);
      maxHealthyWeight = (24.9 * heightM * heightM);

      // Devine Formula for Male: 50kg + 2.3kg per inch over 5ft (152.4 cm)
      const inchesOver5ft = Math.max(0, (heightCm - 152.4) / 2.54);
      idealDevine = (50.0 + (2.3 * inchesOver5ft)) * frameMultiplier;

      if (bmiRaw < 19.5) {
        category = 'Underweight (Male)';
        badgeClass = 'badge-yellow';
        advice = 'For collegiate males, a BMI below 19.5 often indicates low lean muscle mass or caloric deficit. Consider nutrient-dense dining hall meals, healthy fats, and a strength conditioning routine at the Campus Rec Center.';
      } else if (bmiRaw <= 24.9) {
        category = 'Healthy Weight (Male)';
        badgeClass = 'badge-green';
        advice = 'Optimal healthy range for collegiate males! Your muscle mass and body weight support peak cognitive stamina and physical vitality. Maintain balanced meals and active daily habits.';
      } else if (bmiRaw <= 29.9) {
        category = 'Overweight Range (Male)';
        badgeClass = 'badge-orange';
        advice = 'Slightly elevated for collegiate males. Note: If you participate in collegiate athletics or weight training, higher BMI can reflect dense muscle rather than fat. Otherwise, 30–40 mins of daily brisk cardio will optimize cardiovascular health.';
      } else {
        category = 'Obesity Category (Male)';
        badgeClass = 'badge-red';
        advice = 'Elevated metabolic and cardiovascular risk tier. We recommend a complimentary wellness checkup with Dr. Jenkins at the Health Center for a lipid panel, blood pressure check, and tailored wellness guidance.';
      }
    } else {
      // Females naturally possess higher essential adipose tissue (10-13% vs 2-5%) and different bone density
      minHealthyWeight = (18.5 * heightM * heightM);
      maxHealthyWeight = (23.9 * heightM * heightM);

      // Devine Formula for Female: 45.5kg + 2.3kg per inch over 5ft (152.4 cm)
      const inchesOver5ft = Math.max(0, (heightCm - 152.4) / 2.54);
      idealDevine = (45.5 + (2.3 * inchesOver5ft)) * frameMultiplier;

      if (bmiRaw < 18.5) {
        category = 'Underweight (Female)';
        badgeClass = 'badge-yellow';
        advice = 'For collegiate females, a BMI below 18.5 can impact hormonal equilibrium, menstrual regularity, bone mineral density, and immune defense. Consider wholesome nutrient-rich meals and consult our Women’s Clinic in Suite 108.';
      } else if (bmiRaw <= 23.9) {
        category = 'Healthy Weight (Female)';
        badgeClass = 'badge-green';
        advice = 'Excellent! Your weight and height ratio is within the optimal healthy reference range for collegiate females. Continue regular physical activity, iron-rich nutrition, proper hydration, and restful sleep.';
      } else if (bmiRaw <= 28.9) {
        category = 'Overweight Range (Female)';
        badgeClass = 'badge-orange';
        advice = 'Moderately above the optimal reference range for collegiate females. Incorporating 30 minutes of aerobic movement, mindful dining choices, and stress management will protect metabolic wellness.';
      } else {
        category = 'Obesity Category (Female)';
        badgeClass = 'badge-red';
        advice = 'Elevated risk tier. We recommend scheduling a confidential consultation at the Campus Health Center to review vitals, blood pressure, and tailor an individualized lifestyle strategy.';
      }
    }

    // 2. Clinical Body Fat % Estimation (Deurenberg Formula)
    // BF% = 1.20 * BMI + 0.23 * Age - 10.8 * sex - 5.4 (sex = 1 for male, 0 for female)
    const sexVal = gender === 'male' ? 1 : 0;
    let estBodyFat = (1.20 * bmiRaw) + (0.23 * age) - (10.8 * sexVal) - 5.4;
    estBodyFat = Math.max(3, Math.min(60, estBodyFat));

    let bodyFatCat = '';
    if (gender === 'male') {
      if (estBodyFat < 6) bodyFatCat = 'Essential Fat';
      else if (estBodyFat < 14) bodyFatCat = 'Athletic Tier';
      else if (estBodyFat < 18) bodyFatCat = 'Fitness Tier';
      else if (estBodyFat < 25) bodyFatCat = 'Acceptable Tier';
      else bodyFatCat = 'High Body Fat';
    } else {
      if (estBodyFat < 14) bodyFatCat = 'Essential Fat';
      else if (estBodyFat < 21) bodyFatCat = 'Athletic Tier';
      else if (estBodyFat < 25) bodyFatCat = 'Fitness Tier';
      else if (estBodyFat < 32) bodyFatCat = 'Acceptable Tier';
      else bodyFatCat = 'High Body Fat';
    }

    // 3. Basal Metabolic Rate (Mifflin-St Jeor)
    // Male: 10*W + 6.25*H - 5*Age + 5
    // Female: 10*W + 6.25*H - 5*Age - 161
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    bmr = gender === 'male' ? Math.round(bmr + 5) : Math.round(bmr - 161);

    // 4. Update UI Elements
    if (bmiScoreVal) bmiScoreVal.textContent = bmi;
    if (bmiCategoryBadge) {
      bmiCategoryBadge.textContent = category;
      bmiCategoryBadge.className = `score-tier-badge ${badgeClass}`;
    }
    if (bmiGuidance) bmiGuidance.textContent = advice;

    if (bmiIdealRange) {
      bmiIdealRange.textContent = `${minHealthyWeight.toFixed(1)} – ${maxHealthyWeight.toFixed(1)} kg`;
    }
    if (bmiIdealMid) {
      bmiIdealMid.textContent = `Devine Target: ~${idealDevine.toFixed(1)} kg`;
    }
    if (bmiBodyFat) {
      bmiBodyFat.textContent = `~${estBodyFat.toFixed(1)}%`;
    }
    if (bmiBodyFatCat) {
      bmiBodyFatCat.textContent = bodyFatCat;
    }
    if (bmiBmr) {
      bmiBmr.textContent = `${bmr.toLocaleString()} kcal/day`;
    }

    // 5. Gauge Position Calculation (0% to 100%)
    if (gaugeMarker) {
      let markerPercent = 0;
      if (gender === 'male') {
        if (bmiRaw < 19.5) {
          // Underweight 15 - 19.5 maps to 2% - 22%
          markerPercent = 2 + ((bmiRaw - 15) / 4.5) * 20;
        } else if (bmiRaw <= 24.9) {
          // Healthy 19.5 - 24.9 maps to 22% - 60%
          markerPercent = 22 + ((bmiRaw - 19.5) / 5.4) * 38;
        } else if (bmiRaw <= 29.9) {
          // Overweight 25 - 29.9 maps to 60% - 82%
          markerPercent = 60 + ((bmiRaw - 25.0) / 4.9) * 22;
        } else {
          // Obese 30 - 38 maps to 82% - 98%
          markerPercent = 82 + Math.min(16, ((bmiRaw - 30.0) / 8.0) * 16);
        }
      } else {
        if (bmiRaw < 18.5) {
          // Underweight 14 - 18.5 maps to 2% - 22%
          markerPercent = 2 + ((bmiRaw - 14) / 4.5) * 20;
        } else if (bmiRaw <= 23.9) {
          // Healthy 18.5 - 23.9 maps to 22% - 60%
          markerPercent = 22 + ((bmiRaw - 18.5) / 5.4) * 38;
        } else if (bmiRaw <= 28.9) {
          // Overweight 24 - 28.9 maps to 60% - 82%
          markerPercent = 60 + ((bmiRaw - 24.0) / 4.9) * 22;
        } else {
          // Obese 29 - 37 maps to 82% - 98%
          markerPercent = 82 + Math.min(16, ((bmiRaw - 29.0) / 8.0) * 16);
        }
      }
      markerPercent = Math.max(3, Math.min(97, markerPercent));
      gaugeMarker.style.left = `${markerPercent}%`;
    }

    if (bmiResultDiv) bmiResultDiv.style.display = 'block';
  }

  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateBmi();
    });
  }
}

function setupHydrationCalculator() {
  const hydrationForm = document.getElementById('hydration-calculator-form');
  const hydrationResult = document.getElementById('hydration-result-display');
  const targetLitres = document.getElementById('hydration-target-litres');
  const targetGlasses = document.getElementById('hydration-target-glasses');
  const genderTip = document.getElementById('hydration-gender-tip');
  const genderInput = document.getElementById('hydration-gender-input');

  const maleBtn = document.getElementById('btn-hydration-male');
  const femaleBtn = document.getElementById('btn-hydration-female');
  const weightInput = document.getElementById('hydration-weight');

  if (maleBtn && femaleBtn && genderInput) {
    maleBtn.addEventListener('click', () => {
      maleBtn.classList.add('active');
      femaleBtn.classList.remove('active');
      genderInput.value = 'male';
      if (weightInput && (weightInput.value === '56' || !weightInput.value)) weightInput.value = '70';
      if (hydrationResult && hydrationResult.style.display !== 'none') calculateHydration();
    });

    femaleBtn.addEventListener('click', () => {
      femaleBtn.classList.add('active');
      maleBtn.classList.remove('active');
      genderInput.value = 'female';
      if (weightInput && (weightInput.value === '70' || !weightInput.value)) weightInput.value = '56';
      if (hydrationResult && hydrationResult.style.display !== 'none') calculateHydration();
    });
  }

  function calculateHydration() {
    const gender = genderInput ? genderInput.value : 'male';
    const weightKg = parseFloat(weightInput?.value) || (gender === 'male' ? 70 : 56);
    const activityMins = parseFloat(document.getElementById('hydration-activity')?.value) || 30;
    const studyHours = parseFloat(document.getElementById('hydration-study')?.value) || 5;

    // Physiological baseline:
    // Males: ~35ml/kg baseline + 14ml per min of workout + 60ml per study hour (air-conditioned library)
    // Females: ~31ml/kg baseline + 12ml per min of workout + 50ml per study hour
    let totalMl = 0;
    if (gender === 'male') {
      totalMl = (weightKg * 35) + (activityMins * 14) + (studyHours * 60);
    } else {
      totalMl = (weightKg * 31) + (activityMins * 12) + (studyHours * 50);
    }

    const litres = (totalMl / 1000).toFixed(1);
    const glasses = Math.round(totalMl / 250);

    if (targetLitres) targetLitres.textContent = `${litres} Litres / Day`;
    if (targetGlasses) {
      targetGlasses.textContent = `~${glasses} Glasses (Free refills at all campus water kiosks)`;
    }

    if (genderTip) {
      if (gender === 'male') {
        genderTip.innerHTML = `<strong>👨 Male Physiology Calibration:</strong> Men have higher average total body water (~60%) and greater skeletal muscle mass, requiring steady fluid replacement to prevent muscle cramping and workout fatigue.`;
      } else {
        genderTip.innerHTML = `<strong>👩 Female Physiology Calibration:</strong> Women have slightly lower natural body water (~50–55%) and unique hormonal fluid shifts; maintaining steady electrolytes prevents fatigue and exam tension.`;
      }
    }

    if (hydrationResult) hydrationResult.style.display = 'block';
  }

  if (hydrationForm) {
    hydrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateHydration();
    });
  }
}
