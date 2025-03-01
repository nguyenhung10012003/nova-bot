export type RecurrenceState = {
  recurrenceType: 'daily' | 'weekly' | 'monthly';
  selectedTime: { hour: string; minute: string };
  selectedDaysOfWeek: number[];
  selectedDaysOfMonth: number[];
};

export function generateCronString(recurrence: RecurrenceState | null): string {
  if (!recurrence) {
    return '';
  }
  const { recurrenceType, selectedTime, selectedDaysOfWeek, selectedDaysOfMonth } = recurrence;
  const { hour, minute } = selectedTime;
  
  switch (recurrenceType) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    
    case 'weekly':
      const weekDays = selectedDaysOfWeek.join(',');
      return `${minute} ${hour} * * ${weekDays || '*'}`;
    
    case 'monthly':
      const monthDays = selectedDaysOfMonth.join(',') || '*';
      return `${minute} ${hour} ${monthDays} * *`;
    
    default:
      throw new Error('Invalid recurrence type');
  }
}

export function parseCronString(cron: string): RecurrenceState | null {
  if (!cron) {
    return null;
  }
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
      selectedDaysOfWeek: dayOfWeek?.split(',').map(num => Number(num)) ?? [],
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

