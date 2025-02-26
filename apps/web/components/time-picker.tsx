'use client';

import { Button } from '@nova/ui/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nova/ui/components/ui/popover';
import { ScrollArea } from '@nova/ui/components/ui/scroll-area';
import { cn } from '@nova/ui/lib/utils';
import { Clock } from 'lucide-react';
import * as React from 'react';

interface TimePickerProps {
  className?: string;
  is12HoursFormat?: boolean;
  onChange?: (value: {hour: string, minute: string}) => void;
}

export function TimePicker({
  className,
  is12HoursFormat = false,
  onChange,
}: TimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<{
    hour: string;
    minute: string;
    period: 'AM' | 'PM';
  }>({
    hour: '12',
    minute: '00',
    period: 'AM',
  });
  const [open, setOpen] = React.useState(false);

  // Generate hours based on format
  const hours = React.useMemo(() => {
    if (is12HoursFormat) {
      return Array.from({ length: 12 }, (_, i) =>
        String(i + 1).padStart(2, '0'),
      );
    }
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  }, [is12HoursFormat]);

  // Generate minutes (00-59)
  const minutes = React.useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
    [],
  );

  const periods = ['AM', 'PM'];

  // Format time for display
  const formatTime = React.useCallback(() => {
    const { hour, minute, period } = selectedTime;
    if (is12HoursFormat) {
      return `${hour}:${minute} ${period}`;
    }
    let hour24 = hour;
    if (period === 'PM' && hour !== '12') {
      hour24 = String(Number(hour) + 12).padStart(2, '0');
    } else if (period === 'AM' && hour === '12') {
      hour24 = '00';
    }
    return `${hour24}:${minute}`;
  }, [selectedTime, is12HoursFormat]);

  // Update parent when time changes
  React.useEffect(() => {
    if (onChange) {
      let hour24 = selectedTime.hour;
      if (is12HoursFormat) {
        if (selectedTime.period === 'PM' && selectedTime.hour !== '12') {
          hour24 = String(Number(selectedTime.hour) + 12);
        } else if (selectedTime.period === 'AM' && selectedTime.hour === '12') {
          hour24 = '00';
        }
      }
      onChange({hour: hour24, minute: selectedTime.minute});
    }
  }, [selectedTime, is12HoursFormat, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full min-w-[120px] max-w-[150px] justify-start text-left font-normal',
            !selectedTime && 'text-muted-foreground',
            className,
          )}
        >
          <Clock className="mr-2 size-4" />
          {formatTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] min-w-[150px] p-0">
        <div className="flex h-[300px] border-t">
          {/* Hours */}
          <div className="flex flex-col w-[60px]">
            <div className="flex items-center justify-center border-b py-2 font-medium">
              Hr
            </div>
            <ScrollArea className="h-[244px]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    'cursor-pointer px-3 py-2 rounded-sm text-center hover:bg-muted',
                    selectedTime.hour === hour &&
                      'bg-muted text-muted-foreground',
                  )}
                  onClick={() => {
                    setSelectedTime((prev) => ({ ...prev, hour }));
                  }}
                >
                  {hour}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Minutes */}
          <div className="flex flex-col border-l w-[60px]">
            <div className="flex items-center justify-center border-b py-2 font-medium">
              Min
            </div>
            <ScrollArea className="h-[244px]">
              {minutes.map((minute) => (
                <div
                  key={minute}
                  className={cn(
                    'cursor-pointer px-3 py-2 rounded-md text-center hover:bg-muted',
                    selectedTime.minute === minute &&
                      'bg-muted text-muted-foreground',
                  )}
                  onClick={() => {
                    setSelectedTime((prev) => ({ ...prev, minute }));
                  }}
                >
                  {minute}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* AM/PM */}
          {is12HoursFormat && (
            <div className="flex flex-col border-l w-[120px]">
              <div className="flex items-center justify-center border-b py-2 font-medium">
                &nbsp;
              </div>
              <div className="flex h-[244px] items-start">
                {periods.map((period) => (
                  <div
                    key={period}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center justify-center hover:bg-muted py-2 rounded-md',
                      selectedTime.period === period &&
                        'bg-muted text-muted-foreground',
                    )}
                    onClick={() => {
                      setSelectedTime((prev) => ({
                        ...prev,
                        period: period as 'AM' | 'PM',
                      }));
                    }}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
