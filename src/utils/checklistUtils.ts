// Checklist utility functions for managing user progress
export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
}

export const CHECKLIST_ITEMS = {
    SET_PASSWORD: 'set_password',
    GET_RESOURCES: 'get_resources',
    JOIN_WEBINAR: 'join_webinar',
    WATCH_VIDEO: 'watch_video'
};

// Get checklist state from localStorage
export const getChecklistState = (): boolean[] => {
    const saved = localStorage.getItem('welcomeCompletedItems');
    return saved ? JSON.parse(saved) : [true, false, false, false];
};

// Update checklist state in localStorage
export const updateChecklistState = (index: number, completed: boolean): void => {
    const currentState = getChecklistState();
    const newState = [...currentState];
    newState[index] = completed;
    localStorage.setItem('welcomeCompletedItems', JSON.stringify(newState));
};

// Mark specific checklist items as completed
export const markChecklistItemCompleted = (itemId: string): void => {
    switch (itemId) {
        case CHECKLIST_ITEMS.SET_PASSWORD:
            updateChecklistState(0, true);
            break;
        case CHECKLIST_ITEMS.GET_RESOURCES:
            updateChecklistState(1, true);
            break;
        case CHECKLIST_ITEMS.JOIN_WEBINAR:
            updateChecklistState(2, true);
            break;
        case CHECKLIST_ITEMS.WATCH_VIDEO:
            updateChecklistState(3, true);
            break;
    }
};

// Check if a specific item is completed
export const isChecklistItemCompleted = (itemId: string): boolean => {
    const state = getChecklistState();
    switch (itemId) {
        case CHECKLIST_ITEMS.SET_PASSWORD:
            return state[0];
        case CHECKLIST_ITEMS.GET_RESOURCES:
            return state[1];
        case CHECKLIST_ITEMS.JOIN_WEBINAR:
            return state[2];
        case CHECKLIST_ITEMS.WATCH_VIDEO:
            return state[3];
        default:
            return false;
    }
};
