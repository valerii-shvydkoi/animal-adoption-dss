export const calculateCR = (val1, val2) => {
  if (!val1 || !val2) return 0.0;
  val1 = Math.max(Number(val1), 1.0);
  val2 = Math.max(Number(val2), 1.0);
  const v13 = val1 * val2;
  const matrix = [
    [1, val1, v13],
    [1 / val1, 1, val2],
    [1 / v13, 1 / val2, 1],
  ];
  const colSums = [
    matrix[0][0] + matrix[1][0] + matrix[2][0],
    matrix[0][1] + matrix[1][1] + matrix[2][1],
    matrix[0][2] + matrix[1][2] + matrix[2][2],
  ];
  const weights = [
    (matrix[0][0] / colSums[0] + matrix[0][1] / colSums[1] + matrix[0][2] / colSums[2]) / 3,
    (matrix[1][0] / colSums[0] + matrix[1][1] / colSums[1] + matrix[1][2] / colSums[2]) / 3,
    (matrix[2][0] / colSums[0] + matrix[2][1] / colSums[1] + matrix[2][2] / colSums[2]) / 3,
  ];
  const lambdaMax = colSums[0] * weights[0] + colSums[1] * weights[1] + colSums[2] * weights[2];
  const n = 3;
  const CI = (lambdaMax - n) / (n - 1);
  const RI = 0.58;
  const CR = CI / RI;
  return Math.abs(CR);
};
export const analyzePetMatch = (userProfile, pet) => {
  const advantages = [];
  const recommendations = [];
  if (!userProfile || !pet)
    return {
      advantages,
      recommendations,
    };
  if (userProfile.has_children) {
    if (String(pet.good_with_children).toUpperCase() === 'YES' || pet.good_with_children === true) {
      advantages.push(
        'Тварина чудово ладнає з дітьми та має підтверджений доброзичливий характер.'
      );
    } else if (
      String(pet.good_with_children).toUpperCase() === 'NO' ||
      pet.good_with_children === false
    ) {
      recommendations.push(
        'Оскільки у вас є діти, зауважте: ця тварина потребує контролю або окремого простору, бо вона не звикла до дітей.'
      );
    } else {
      recommendations.push(
        'Поведінка з дітьми невідома. Знайомте тварину з дітьми поступово та під наглядом.'
      );
    }
  }
  if (userProfile.has_cats) {
    if (String(pet.good_with_cats).toUpperCase() === 'YES' || pet.good_with_cats === true) {
      advantages.push('Хвостик має успішний досвід проживання або контакту з котами.');
    } else if (String(pet.good_with_cats).toUpperCase() === 'NO' || pet.good_with_cats === false) {
      recommendations.push(
        'У тварини сильно виражений мисливський інстинкт. Проживання з котами може бути небезпечним.'
      );
    }
  }
  if (userProfile.has_dogs) {
    if (String(pet.good_with_dogs).toUpperCase() === 'YES' || pet.good_with_dogs === true) {
      advantages.push('Тварина повністю соціалізована до інших собак, легко увійде в зграю.');
    } else if (String(pet.good_with_dogs).toUpperCase() === 'NO' || pet.good_with_dogs === false) {
      recommendations.push(
        'Виявляє домінантну поведінку до собак. Знадобиться робота з кінологом для адаптації.'
      );
    }
  }
  const isHighFloor = Number(userProfile.floor) > 4;
  if (isHighFloor && !userProfile.has_elevator) {
    if (Number(pet.weight) > 20) {
      recommendations.push(
        `Вага тварини (${pet.weight} кг) є великою для підйому пішки на ${userProfile.floor} поверх. Подумайте про навантаження, якщо тварина захворіє.`
      );
    } else {
      advantages.push(
        'Невелика вага улюбленця дозволить вам легко транспортувати його в руках по сходах без ліфта.'
      );
    }
  }
  if (Number(pet.activity_level) >= 4) {
    if (userProfile.has_car) {
      advantages.push(
        'Висока активність тварини компенсується наявністю авто для поїздок на природу чи за місто.'
      );
    } else {
      recommendations.push(
        'Цей хвостик дуже енергійний. Буде чудово, якщо ви організуєте регулярні тривалі прогулянки (від 1.5 години на день).'
      );
    }
  } else if (Number(pet.activity_level) <= 2) {
    advantages.push(
      'Спокійний рівень енергії тварини ідеально підійде для розміреного життя в квартирі.'
    );
  }
  if (!userProfile.has_shelter) {
    if (Number(pet.stress_resistance) <= 2) {
      recommendations.push(
        "Тварина чутлива до стресу та гучних звуків. Подбайте про наявність заспокійливих засобів та безпечного 'куточка' вдома."
      );
    }
  } else {
    if (Number(pet.stress_resistance) >= 4) {
      advantages.push(
        'Висока стресостійкість тварини допоможе їй швидко адаптуватися у вашому сховищі під час тривог.'
      );
    }
  }
  const isSterilized = String(pet.is_sterilized).toLowerCase() === 'true';
  const isNotSterilized = String(pet.is_sterilized).toLowerCase() === 'false';
  if (isSterilized) {
    advantages.push(
      'Тварина вже стерилізована, що вберігає вас від додаткових медичних витрат та гормональних криз.'
    );
  } else if (isNotSterilized) {
    recommendations.push(
      'Тварина не стерилізована. Заплануйте візит до ветеринара для проведення планової операції після адаптації.'
    );
  }
  if (advantages.length === 0) {
    advantages.push('Параметри тварини відповідають базовим критеріям вашої житлової площі.');
  }
  return {
    advantages,
    recommendations,
  };
};
