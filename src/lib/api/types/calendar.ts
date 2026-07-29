export type CalendarRecurrenceType = 'weekly' | 'monthly' | 'custom_period';

export interface CalendarEvent {
  event_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_recurring: boolean;
  recurrence_type: CalendarRecurrenceType | null;
  recurrence_interval: number;
  notes: string | null;
  timestamp: string;
  updated_at: string;
}

export interface PaginatedCalendarEvents {
  data: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface CalendarEventModel {
  id: string;
  eventName: string;
  eventDate: Date;
  eventTime: string;
  location: string;
  isRecurring: boolean;
  recurrenceType: CalendarRecurrenceType | null;
  recurrenceInterval: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCalendarEventPayload {
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_recurring?: boolean;
  recurrence_type?: CalendarRecurrenceType | null;
  recurrence_interval?: number;
  notes?: string;
}

export interface UpdateCalendarEventPayload {
  event_name?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  is_recurring?: boolean;
  recurrence_type?: CalendarRecurrenceType | null;
  recurrence_interval?: number;
  notes?: string | null;
}
