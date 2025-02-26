type RecurrenceState = {
  recurrenceType: 'daily' | 'weekly' | 'monthly';
  selectedTime: { hour: string; minute: string };
  selectedDaysOfWeek: string[];
  selectedDaysOfMonth: number[];
};

export function generateCronString(recurrence: RecurrenceState): string {
  const { recurrenceType, selectedTime, selectedDaysOfWeek, selectedDaysOfMonth } = recurrence;
  const { hour, minute } = selectedTime;
  
  switch (recurrenceType) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    
    case 'weekly':
      const weekDays = selectedDaysOfWeek.map(day => convertDayToCron(day)).join(',');
      return `${minute} ${hour} * * ${weekDays || '*'}`;
    
    case 'monthly':
      const monthDays = selectedDaysOfMonth.join(',') || '*';
      return `${minute} ${hour} ${monthDays} * *`;
    
    default:
      throw new Error('Invalid recurrence type');
  }
}

export function convertDayToCron(day: string): number {
  const daysMap: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  return daysMap[day.toLowerCase()] ?? -1;
}

export function parseCronString(cron: string): RecurrenceState {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cron.split(' ');

  if (dayOfMonth !== '*' && dayOfWeek === '*') {
    return {
      recurrenceType: 'monthly',
      selectedTime: { hour: hour || "00", minute: minute || "00" },
      selectedDaysOfWeek: [],
      selectedDaysOfMonth: dayOfMonth?.split(',').map(Number) ?? [],
    };
  }
  
  if (dayOfWeek !== '*' && dayOfMonth === '*') {
    return {
      recurrenceType: 'weekly',
      selectedTime: { hour: hour || "00", minute: minute || "00" },
      selectedDaysOfWeek: dayOfWeek?.split(',').map(num => convertCronToDay(Number(num))) ?? [],
      selectedDaysOfMonth: []
    };
  }
  
  return {
    recurrenceType: 'daily',
    selectedTime: { hour: hour || "00", minute: minute || "00" },
    selectedDaysOfWeek: [],
    selectedDaysOfMonth: []
  };
}

export function convertCronToDay(num: number): string {
  const daysMap: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  return daysMap[num] ?? 'unknown';
}
