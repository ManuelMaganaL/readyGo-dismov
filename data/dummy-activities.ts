import { Activity } from "@/types"

export const dummyData: Activity[] = [
  {
    id: 1,
    title: 'All',
    time_start: '9:00',
    end_time: '18:00',
    checkboxes: [
      {
        id: 1,
        activityId: 2,
        description: 'Coffee',
        complete: true,
      },
      {
        id: 2,
        activityId: 2,
        description: 'Printed presentation',
        complete: true,
      },
      {
        id: 3,
        activityId: 1,
        description: '...',
        complete: false,
      }
    ],
    complete: false,
  },
  {
    id: 2,
    title: 'Work',
    time_start: '9:00',
    end_time: '13:00',
    checkboxes: [
      {
        id: 1,
        activityId: 2,
        description: 'Coffee',
        complete: true,
      },
      {
        id: 2,
        activityId: 2,
        description: 'Printed presentation',
        complete: true,
      },
    ],
    complete: true,
  },
  {
    id: 3,
    title: 'College',
    time_start: '14:00',
    end_time: '17:00',
    checkboxes: [
      {
        id: 1,
        activityId: 3,
        description: 'Laptop and charger',
        complete: false,
      },
      {
        id: 2,
        activityId: 3,
        description: 'Backpack',
        complete: true,
      },
      {
        id: 3,
        activityId: 3,
        description: 'Lunch',
        complete: false,
      }
    ],
    complete: false,
  },
  {
    id: 4,
    title: 'Gym',
    time_start: '17:00',
    end_time: '18:00',
    checkboxes: [
      {
        id: 1,
        activityId: 4,
        description: 'Water bottle',
        complete: true,
      },
      {
        id: 2,
        activityId: 4,
        description: 'Towel',
        complete: false,
      },
      {
        id: 3,
        activityId: 4,
        description: 'Locker key',
        complete: true,
      }
    ],
    complete: false,
  }
]