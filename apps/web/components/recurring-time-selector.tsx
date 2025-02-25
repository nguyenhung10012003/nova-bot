'use client';

import { Badge } from '@nova/ui/components/ui/badge';
import { Checkbox } from '@nova/ui/components/ui/checkbox';
import { Label } from '@nova/ui/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@nova/ui/components/ui/radio-group';
import { cn } from '@nova/ui/lib/utils';
import React, { useReducer } from 'react';
import { TimePicker } from './time-picker';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0'),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, '0'),
);
const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

type RecurrenceState = {
  recurrenceType: 'daily' | 'weekly' | 'monthly';
  selectedTime: { hour: string; minute: string };
  selectedDaysOfWeek: string[];
  selectedDaysOfMonth: number[];
};

type RecurrenceAction =
  | { type: 'SET_RECURRENCE'; payload: 'daily' | 'weekly' | 'monthly' }
  | { type: 'SET_TIME'; payload: { hour?: string; minute?: string } }
  | { type: 'TOGGLE_DAY_OF_WEEK'; payload: string }
  | { type: 'TOGGLE_DAY_OF_MONTH'; payload: number };

const initialState = {
  recurrenceType: 'daily' as const,
  selectedTime: { hour: '00', minute: '00' },
  selectedDaysOfWeek: [],
  selectedDaysOfMonth: [],
};

function reducer(
  state: RecurrenceState,
  action: RecurrenceAction,
): RecurrenceState {
  switch (action.type) {
    case 'SET_RECURRENCE':
      return { ...state, recurrenceType: action.payload };
    case 'SET_TIME':
      return {
        ...state,
        selectedTime: { ...state.selectedTime, ...action.payload },
      };
    case 'TOGGLE_DAY_OF_WEEK':
      return {
        ...state,
        selectedDaysOfWeek: state.selectedDaysOfWeek.includes(action.payload)
          ? state.selectedDaysOfWeek.filter((day) => day !== action.payload)
          : [...state.selectedDaysOfWeek, action.payload],
      };
    case 'TOGGLE_DAY_OF_MONTH':
      return {
        ...state,
        selectedDaysOfMonth: state.selectedDaysOfMonth.includes(action.payload)
          ? state.selectedDaysOfMonth.filter((day) => day !== action.payload)
          : [...state.selectedDaysOfMonth, action.payload],
      };
    default:
      return state;
  }
}

type RecurringTimeSelectorProps = {
  value?: RecurrenceState;
  onChange?: (value: RecurrenceState) => void;
} & Omit<React.ComponentProps<'div'>, 'onChange'>;

export default function RecurringTimeSelector({
  className,
  value,
  onChange,
}: RecurringTimeSelectorProps) {
  const [state, dispatch] = useReducer(reducer, value || initialState);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label>Recurrence</Label>
        <RadioGroup
          defaultValue="daily"
          onValueChange={(value) =>
            dispatch({
              type: 'SET_RECURRENCE',
              payload: value as 'daily' | 'weekly' | 'monthly',
            })
          }
          className="flex flex-col space-y-2"
        >
          {['daily', 'weekly', 'monthly'].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={type} />
              <Label htmlFor={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {state.recurrenceType === 'daily' && (
        <div className="space-x-2">
          <Label>Time</Label>
          <TimePicker is12HoursFormat />
        </div>
      )}

      {state.recurrenceType === 'weekly' && (
        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Badge
                key={day}
                role="checkbox"
                aria-checked={state.selectedDaysOfWeek.includes(day)}
                tabIndex={0}
                variant={
                  state.selectedDaysOfWeek.includes(day) ? 'default' : 'outline'
                }
                className="cursor-pointer hover:opacity-80 transition-all"
                onClick={() =>
                  dispatch({ type: 'TOGGLE_DAY_OF_WEEK', payload: day })
                }
              >
                {day}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {state.recurrenceType === 'monthly' && (
        <div className="space-y-2">
          <Label>Days of Month</Label>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_MONTH.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={state.selectedDaysOfMonth.includes(day)}
                  onCheckedChange={() =>
                    dispatch({ type: 'TOGGLE_DAY_OF_MONTH', payload: day })
                  }
                />
                <Label htmlFor={`day-${day}`} className="w-6">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t text-sm text-muted-foreground">
        {state.recurrenceType === 'daily' && (
          <p>
            Occurs daily at {state.selectedTime.hour}:
            {state.selectedTime.minute}
          </p>
        )}
        {state.recurrenceType === 'weekly' &&
          state.selectedDaysOfWeek.length > 0 && (
            <p>Occurs weekly on {state.selectedDaysOfWeek.join(', ')}</p>
          )}
        {state.recurrenceType === 'monthly' &&
          state.selectedDaysOfMonth.length > 0 && (
            <p>
              Occurs monthly on day
              {state.selectedDaysOfMonth.length > 1 ? 's' : ''}{' '}
              {state.selectedDaysOfMonth.sort((a, b) => a - b).join(', ')}
            </p>
          )}
      </div>
    </div>
  );
}
