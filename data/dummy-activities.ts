import { Activity } from "@/types"

export const dummyData: Activity[] = [
  {
    id: 0,
    title: 'Work',
    time_start: '9:00',
    time_end: '13:00',
    checkboxes: [
      {
        id: 1,
        activityId: 1,
        description: 'Coffee',
        complete: true,
      },
      {
        id: 2,
        activityId: 1,
        description: 'Printed presentation',
        complete: true,
      },
    ],
  },
  {
    id: 1,
    title: 'College',
    time_start: '14:00',
    time_end: '17:00',
    checkboxes: [
      {
        id: 1,
        activityId: 2,
        description: 'Laptop and charger',
        complete: false,
      },
      {
        id: 2,
        activityId: 2,
        description: 'Backpack',
        complete: true,
      },
      {
        id: 3,
        activityId: 2,
        description: 'Lunch',
        complete: false,
      }
    ],
  },
  {
    id: 2,
    title: 'Gym',
    time_start: '17:00',
    time_end: '18:00',
    checkboxes: [
      {
        id: 1,
        activityId: 3,
        description: 'Water bottle',
        complete: true,
      },
      {
        id: 2,
        activityId: 3,
        description: 'Towel',
        complete: false,
      },
      {
        id: 3,
        activityId: 3,
        description: 'Locker key',
        complete: true,
      }
    ],
  }
]