/** Геолокация: расстояние и время пешком (шаговая доступность = ядро LOVII) */

/** Расстояние по формуле гаверсинуса, метры */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Пешеходная скорость в центре города ~80 м/мин + надбавка на переходы */
function walkingMinutes(meters) {
  return Math.max(1, Math.round((meters / 80) * 1.1));
}

/** 840 -> «840 м», 1250 -> «1,2 км» */
function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} м`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} км`;
}

/** Человекочитаемая близость */
function proximityLabel(minutes) {
  if (minutes <= 5) return 'в 5 минутах';
  if (minutes <= 10) return 'в 10 минутах';
  if (minutes <= 15) return 'в 15 минутах';
  if (minutes <= 25) return 'в 25 минутах';
  return 'рядом';
}

/** Открыта ли точка сейчас (учитываем переход через полночь, напр. 11:00-00:00) */
function isOpenNow(hours, now = new Date()) {
  const [from, to] = hours.split('-');
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = fh * 60 + fm;
  let end = th * 60 + tm;
  if (end === 0) end = 24 * 60; // «00:00» = полночь следующего дня
  return start <= mins && mins < end;
}
