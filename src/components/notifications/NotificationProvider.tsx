[
	{
		"react": "interface Notification {\n  id: string;\n  message: string;\n  type: 'success' | 'error' | 'warning' | 'info';\n  timestamp: Date;"
	},
	{
		"showNotification": "message: string",
		"type?": "success' | 'error' | 'warning",
		"info": "void;\n  showTimeNotification: () => void;\n  clearNotifications: () => void;\n  notifications: Notification[];"
	},
	{
		"children": "React.ReactNode"
	},
	{
		"message": "string",
		"type": "success' | 'error' | 'warning' | 'info",
		"info": {
			"newNotification": "Notification = {\n      id: Date.now().toString()",
			"timestamp": "new Date()"
		},
		"hour": "2-digit",
		"minute": "2-digit",
		"second": "2-digit"
	},
	{
		"info": ""
	},
	{
		"gap-2": {
			"success'\n                ? 'bg-green-500 text-white": "notification.type === 'error'\n                ? 'bg-red-500 text-white'\n                : notification.type === 'warning'\n                ? 'bg-yellow-500 text-white'\n                : 'bg-blue-500 text-white'"
		},
		"className=\"font-medium": {
			"mt-1": {}
		}
	}
]