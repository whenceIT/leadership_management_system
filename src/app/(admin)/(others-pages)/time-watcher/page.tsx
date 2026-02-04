'use client';

import { useState } from 'react';
import { timeWatcher, TimeWatcherEvent } from '@/services/TimeWatcher';
import Button from '@/components/ui/button/Button';

export default function TimeWatcherPage() {
  const [isRunning, setIsRunning] = useState(timeWatcher.isActive());
  const [eventLog, setEventLog] = useState<TimeWatcherEvent[]>([]);
  const [config, setConfig] = useState(timeWatcher.getConfig());

  const handleStart = () => {
    timeWatcher.start();
    setIsRunning(true);
  };

  const handleStop = () => {
    timeWatcher.stop();
    setIsRunning(false);
  };

  const handleTriggerNow = () => {
    timeWatcher.triggerNow();
  };

  const handleUpdateConfig = () => {
    timeWatcher.updateConfig({
      interval: config.interval,
      message: config.message,
      title: config.title,
      enabled: config.enabled,
    });
  };

  const handleAddListener = () => {
    const listener = (event: TimeWatcherEvent) => {
      setEventLog((prev) => [...prev.slice(-9), event]);
    };
    timeWatcher.addListener(listener);
  };

  const handleClearLog = () => {
    setEventLog([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            TimeWatcher Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time notification service with toastr integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              isRunning
                ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Control Panel
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleStart}
            disabled={isRunning}
            variant="primary"
          >
            Start TimeWatcher
          </Button>
          <Button
            onClick={handleStop}
            disabled={!isRunning}
            variant="secondary"
          >
            Stop TimeWatcher
          </Button>
          <Button
            onClick={handleTriggerNow}
            variant="outline"
          >
            Trigger Now
          </Button>
          <Button
            onClick={handleAddListener}
            variant="outline"
          >
            Add Event Listener
          </Button>
          <Button
            onClick={handleClearLog}
            variant="outline"
          >
            Clear Log
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Configuration
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Interval (ms)
            </label>
            <input
              type="number"
              value={config.interval}
              onChange={(e) =>
                setConfig({ ...config, interval: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) =>
                setConfig({ ...config, title: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <input
              type="text"
              value={config.message}
              onChange={(e) =>
                setConfig({ ...config, message: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={config.enabled}
              onChange={(e) =>
                setConfig({ ...config, enabled: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <label
              htmlFor="enabled"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enabled
            </label>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleUpdateConfig}
              variant="primary"
              className="w-full"
            >
              Update Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Event Log
        </h2>
        {eventLog.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No events logged yet. Click "Add Event Listener" and wait for events.
          </p>
        ) : (
          <div className="space-y-2">
            {eventLog.map((event, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          About TimeWatcher
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          The TimeWatcher service sends periodic toast notifications using toastr
          with a bounceIn animation. By default, it triggers every 5 seconds with
          the message "follow up on your clients" and displays the current time.
          You can customize the interval, title, and message using the configuration
          panel above.
        </p>
      </div>
    </div>
  );
}
